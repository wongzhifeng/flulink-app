import supertest from 'supertest';
import { performance } from 'perf_hooks';
import app from '../app';
import { User } from '../models';
import redisService from '../services/redisService';

const request = supertest(app);

interface BenchmarkResult {
  endpoint: string;
  method: string;
  avgResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  successRate: number;
  throughput: number; // requests per second
  errorCount: number;
  totalRequests: number;
}

class APIBenchmark {
  private results: BenchmarkResult[] = [];
  private authToken: string = '';

  async setup() {
    // 清理测试数据
    await User.deleteMany({ phone: /^139\d{8}$/ });
    await redisService.flushdb();

    // 创建测试用户
    const registerResponse = await request
      .post('/api/auth/register')
      .send({
        phone: '13900139001',
        password: 'password123',
        nickname: '基准测试用户',
        tags: ['测试', '性能']
      });

    this.authToken = registerResponse.body.data.token;
    console.log('基准测试环境设置完成');
  }

  async cleanup() {
    await User.deleteMany({ phone: /^139\d{8}$/ });
    await redisService.flushdb();
    console.log('基准测试环境清理完成');
  }

  async benchmarkEndpoint(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data: any = null,
    iterations: number = 100,
    concurrency: number = 10
  ): Promise<BenchmarkResult> {
    const responseTimes: number[] = [];
    const errors: number[] = [];
    const startTime = performance.now();

    console.log(`开始基准测试: ${method} ${endpoint} (${iterations}次请求, 并发${concurrency})`);

    // 创建并发请求
    const batches = Math.ceil(iterations / concurrency);
    
    for (let batch = 0; batch < batches; batch++) {
      const batchSize = Math.min(concurrency, iterations - batch * concurrency);
      const promises: Promise<any>[] = [];

      for (let i = 0; i < batchSize; i++) {
        const requestStart = performance.now();
        
        let promise;
        const headers: any = {};
        
        if (this.authToken && endpoint !== '/api/auth/register' && endpoint !== '/api/auth/login') {
          headers['Authorization'] = `Bearer ${this.authToken}`;
        }

        switch (method) {
          case 'GET':
            promise = request.get(endpoint).set(headers);
            break;
          case 'POST':
            promise = request.post(endpoint).set(headers).send(data);
            break;
          case 'PUT':
            promise = request.put(endpoint).set(headers).send(data);
            break;
          case 'DELETE':
            promise = request.delete(endpoint).set(headers);
            break;
        }

        promises.push(
          promise.then(response => {
            const requestEnd = performance.now();
            const responseTime = requestEnd - requestStart;
            responseTimes.push(responseTime);
            
            if (response.status >= 400) {
              errors.push(response.status);
            }
            
            return response;
          }).catch(error => {
            const requestEnd = performance.now();
            const responseTime = requestEnd - requestStart;
            responseTimes.push(responseTime);
            errors.push(500);
            return { status: 500, error };
          })
        );
      }

      await Promise.all(promises);
      
      // 添加延迟避免过载
      if (batch < batches - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const throughput = (iterations / totalTime) * 1000; // requests per second

    // 计算统计指标
    responseTimes.sort((a, b) => a - b);
    const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    const minResponseTime = responseTimes[0];
    const maxResponseTime = responseTimes[responseTimes.length - 1];
    const p95ResponseTime = responseTimes[Math.floor(responseTimes.length * 0.95)];
    const p99ResponseTime = responseTimes[Math.floor(responseTimes.length * 0.99)];
    const successRate = (iterations - errors.length) / iterations;

    const result: BenchmarkResult = {
      endpoint,
      method,
      avgResponseTime,
      minResponseTime,
      maxResponseTime,
      p95ResponseTime,
      p99ResponseTime,
      successRate,
      throughput,
      errorCount: errors.length,
      totalRequests: iterations
    };

    this.results.push(result);
    return result;
  }

  async runComprehensiveBenchmark() {
    console.log('开始全面API基准测试...');

    // 健康检查
    await this.benchmarkEndpoint('/api/health', 'GET', null, 200, 20);

    // 用户认证
    await this.benchmarkEndpoint('/api/auth/register', 'POST', {
      phone: '13900139002',
      password: 'password123',
      nickname: '测试用户'
    }, 50, 5);

    await this.benchmarkEndpoint('/api/auth/login', 'POST', {
      phone: '13900139001',
      password: 'password123'
    }, 100, 10);

    // 星种管理
    await this.benchmarkEndpoint('/api/starseeds', 'GET', null, 100, 10);
    
    await this.benchmarkEndpoint('/api/starseeds/publish', 'POST', {
      content: '基准测试星种内容',
      spectrum: ['测试', '性能']
    }, 50, 5);

    // 星团管理
    await this.benchmarkEndpoint('/api/clusters', 'GET', null, 50, 5);
    
    await this.benchmarkEndpoint('/api/clusters/generate', 'POST', null, 20, 2);

    // 性能监控
    await this.benchmarkEndpoint('/api/performance/health', 'GET', null, 100, 10);
    
    await this.benchmarkEndpoint('/api/performance/report', 'GET', null, 50, 5);

    console.log('全面API基准测试完成');
  }

  generateReport(): string {
    let report = '\n=== API性能基准测试报告 ===\n\n';
    
    report += '总体统计:\n';
    report += `总测试端点: ${this.results.length}\n`;
    report += `总请求数: ${this.results.reduce((sum, r) => sum + r.totalRequests, 0)}\n`;
    report += `总错误数: ${this.results.reduce((sum, r) => sum + r.errorCount, 0)}\n`;
    report += `平均成功率: ${(this.results.reduce((sum, r) => sum + r.successRate, 0) / this.results.length * 100).toFixed(2)}%\n\n`;

    report += '详细结果:\n';
    report += '端点\t\t\t方法\t平均响应时间(ms)\tP95(ms)\tP99(ms)\t成功率(%)\t吞吐量(rps)\n';
    report += '─'.repeat(120) + '\n';

    this.results.forEach(result => {
      report += `${result.endpoint.padEnd(30)}\t${result.method}\t`;
      report += `${result.avgResponseTime.toFixed(2).padStart(12)}\t`;
      report += `${result.p95ResponseTime.toFixed(2).padStart(8)}\t`;
      report += `${result.p99ResponseTime.toFixed(2).padStart(8)}\t`;
      report += `${(result.successRate * 100).toFixed(2).padStart(8)}\t`;
      report += `${result.throughput.toFixed(2).padStart(10)}\n`;
    });

    report += '\n性能分析:\n';
    
    // 找出最慢的端点
    const slowestEndpoint = this.results.reduce((slowest, current) => 
      current.avgResponseTime > slowest.avgResponseTime ? current : slowest
    );
    report += `最慢端点: ${slowestEndpoint.endpoint} (${slowestEndpoint.avgResponseTime.toFixed(2)}ms)\n`;

    // 找出最快的端点
    const fastestEndpoint = this.results.reduce((fastest, current) => 
      current.avgResponseTime < fastest.avgResponseTime ? current : fastest
    );
    report += `最快端点: ${fastestEndpoint.endpoint} (${fastestEndpoint.avgResponseTime.toFixed(2)}ms)\n`;

    // 找出吞吐量最高的端点
    const highestThroughput = this.results.reduce((highest, current) => 
      current.throughput > highest.throughput ? current : highest
    );
    report += `最高吞吐量: ${highestThroughput.endpoint} (${highestThroughput.throughput.toFixed(2)} rps)\n`;

    // 找出成功率最低的端点
    const lowestSuccessRate = this.results.reduce((lowest, current) => 
      current.successRate < lowest.successRate ? current : lowest
    );
    report += `最低成功率: ${lowestSuccessRate.endpoint} (${(lowestSuccessRate.successRate * 100).toFixed(2)}%)\n`;

    report += '\n性能建议:\n';
    this.results.forEach(result => {
      if (result.avgResponseTime > 1000) {
        report += `⚠️  ${result.endpoint} 响应时间过长 (${result.avgResponseTime.toFixed(2)}ms)，建议优化\n`;
      }
      if (result.successRate < 0.95) {
        report += `⚠️  ${result.endpoint} 成功率较低 (${(result.successRate * 100).toFixed(2)}%)，建议检查错误处理\n`;
      }
      if (result.throughput < 10) {
        report += `⚠️  ${result.endpoint} 吞吐量较低 (${result.throughput.toFixed(2)} rps)，建议优化性能\n`;
      }
    });

    return report;
  }

  async runLoadTest(endpoint: string, duration: number = 60000) {
    console.log(`开始负载测试: ${endpoint} (持续${duration/1000}秒)`);
    
    const startTime = Date.now();
    const responseTimes: number[] = [];
    const errors: number[] = [];
    let requestCount = 0;

    const testInterval = setInterval(async () => {
      const requestStart = performance.now();
      
      try {
        const response = await request.get(endpoint);
        const requestEnd = performance.now();
        const responseTime = requestEnd - requestStart;
        
        responseTimes.push(responseTime);
        requestCount++;
        
        if (response.status >= 400) {
          errors.push(response.status);
        }
      } catch (error) {
        const requestEnd = performance.now();
        const responseTime = requestEnd - requestStart;
        responseTimes.push(responseTime);
        errors.push(500);
        requestCount++;
      }
    }, 100); // 每100ms发送一个请求

    // 等待测试完成
    await new Promise(resolve => setTimeout(resolve, duration));
    clearInterval(testInterval);

    const endTime = Date.now();
    const totalTime = endTime - startTime;
    const throughput = (requestCount / totalTime) * 1000;

    console.log(`负载测试完成: ${endpoint}`);
    console.log(`总请求数: ${requestCount}`);
    console.log(`总错误数: ${errors.length}`);
    console.log(`平均吞吐量: ${throughput.toFixed(2)} rps`);
    console.log(`平均响应时间: ${(responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length).toFixed(2)}ms`);
  }
}

// 运行基准测试
async function runBenchmark() {
  const benchmark = new APIBenchmark();
  
  try {
    await benchmark.setup();
    await benchmark.runComprehensiveBenchmark();
    
    const report = benchmark.generateReport();
    console.log(report);
    
    // 保存报告到文件
    const fs = require('fs');
    const path = require('path');
    const reportPath = path.join(__dirname, '../reports/benchmark-report.txt');
    
    // 确保reports目录存在
    const reportsDir = path.dirname(reportPath);
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, report);
    console.log(`基准测试报告已保存到: ${reportPath}`);
    
  } catch (error) {
    console.error('基准测试失败:', error);
  } finally {
    await benchmark.cleanup();
  }
}

export { APIBenchmark, runBenchmark };
