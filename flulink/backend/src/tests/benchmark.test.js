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
  memoryUsage: {
    before: number;
    after: number;
    increase: number;
  };
  cpuUsage: {
    before: number;
    after: number;
    increase: number;
  };
  cacheHitRate?: number;
  databaseQueryTime?: number;
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

  async runAdvancedBenchmark() {
    console.log('开始高级API基准测试...');

    // 内存使用测试
    await this.benchmarkMemoryUsage();

    // 并发连接测试
    await this.benchmarkConcurrentConnections();

    // 大数据量测试
    await this.benchmarkLargeDataHandling();

    // 缓存性能测试
    await this.benchmarkCachePerformance();

    // 数据库查询性能测试
    await this.benchmarkDatabaseQueries();

    console.log('高级API基准测试完成');
  }

  async benchmarkMemoryUsage() {
    console.log('开始内存使用基准测试...');
    
    const initialMemory = process.memoryUsage();
    const memorySnapshots: NodeJS.MemoryUsage[] = [];
    
    // 执行大量请求并监控内存使用
    for (let i = 0; i < 100; i++) {
      await request.get('/api/starseeds').set('Authorization', `Bearer ${this.authToken}`);
      
      if (i % 10 === 0) {
        memorySnapshots.push(process.memoryUsage());
      }
    }
    
    const finalMemory = process.memoryUsage();
    const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
    
    console.log(`内存使用测试完成:`);
    console.log(`初始内存: ${(initialMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`);
    console.log(`最终内存: ${(finalMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`);
    console.log(`内存增长: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
    
    // 检查内存泄漏
    const memoryGrowthRate = memoryIncrease / 100; // 每个请求的平均内存增长
    if (memoryGrowthRate > 1024) { // 超过1KB
      console.log('⚠️  检测到潜在内存泄漏');
    }
  }

  async benchmarkConcurrentConnections() {
    console.log('开始并发连接基准测试...');
    
    const concurrencyLevels = [1, 5, 10, 20, 50];
    const results: any[] = [];
    
    for (const concurrency of concurrencyLevels) {
      const startTime = performance.now();
      const promises: Promise<any>[] = [];
      
      for (let i = 0; i < concurrency; i++) {
        promises.push(
          request.get('/api/starseeds').set('Authorization', `Bearer ${this.authToken}`)
        );
      }
      
      await Promise.all(promises);
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      results.push({
        concurrency,
        totalTime,
        avgTimePerRequest: totalTime / concurrency,
        requestsPerSecond: (concurrency / totalTime) * 1000
      });
    }
    
    console.log('并发连接测试结果:');
    results.forEach(result => {
      console.log(`并发${result.concurrency}: ${result.avgTimePerRequest.toFixed(2)}ms/请求, ${result.requestsPerSecond.toFixed(2)}rps`);
    });
  }

  async benchmarkLargeDataHandling() {
    console.log('开始大数据量处理基准测试...');
    
    // 创建大量星种数据
    const largeDataPromises = [];
    for (let i = 0; i < 20; i++) {
      largeDataPromises.push(
        request
          .post('/api/starseeds/publish')
          .set('Authorization', `Bearer ${this.authToken}`)
          .send({
            content: `大数据量测试星种 ${i} - ${'x'.repeat(200)}`,
            spectrum: Array(5).fill(0).map((_, j) => `tag${j}`)
          })
      );
    }
    
    const startTime = performance.now();
    await Promise.all(largeDataPromises);
    const endTime = performance.now();
    
    console.log(`大数据量创建完成: ${(endTime - startTime).toFixed(2)}ms`);
    
    // 测试大数据量查询
    const queryStartTime = performance.now();
    const response = await request
      .get('/api/starseeds?limit=100')
      .set('Authorization', `Bearer ${this.authToken}`);
    const queryEndTime = performance.now();
    
    console.log(`大数据量查询完成: ${(queryEndTime - queryStartTime).toFixed(2)}ms`);
    console.log(`返回数据量: ${response.body.data.starSeeds.length} 条记录`);
  }

  async benchmarkCachePerformance() {
    console.log('开始缓存性能基准测试...');
    
    // 测试缓存命中率
    const cacheTestPromises = [];
    const testEndpoint = '/api/starseeds';
    
    // 第一次请求（缓存未命中）
    const firstRequestStart = performance.now();
    await request.get(testEndpoint).set('Authorization', `Bearer ${this.authToken}`);
    const firstRequestEnd = performance.now();
    const firstRequestTime = firstRequestEnd - firstRequestStart;
    
    // 多次请求（缓存命中）
    for (let i = 0; i < 10; i++) {
      cacheTestPromises.push(
        request.get(testEndpoint).set('Authorization', `Bearer ${this.authToken}`)
      );
    }
    
    const cacheRequestStart = performance.now();
    await Promise.all(cacheTestPromises);
    const cacheRequestEnd = performance.now();
    const cacheRequestTime = cacheRequestEnd - cacheRequestStart;
    const avgCacheRequestTime = cacheRequestTime / 10;
    
    console.log(`缓存性能测试结果:`);
    console.log(`首次请求时间: ${firstRequestTime.toFixed(2)}ms`);
    console.log(`缓存请求平均时间: ${avgCacheRequestTime.toFixed(2)}ms`);
    console.log(`缓存加速比: ${(firstRequestTime / avgCacheRequestTime).toFixed(2)}x`);
  }

  async benchmarkDatabaseQueries() {
    console.log('开始数据库查询性能基准测试...');
    
    const queryTypes = [
      { name: '简单查询', endpoint: '/api/starseeds?limit=10' },
      { name: '复杂查询', endpoint: '/api/starseeds?limit=50&sort=createdAt&order=desc' },
      { name: '聚合查询', endpoint: '/api/performance/report' },
      { name: '关联查询', endpoint: '/api/clusters' }
    ];
    
    for (const queryType of queryTypes) {
      const times: number[] = [];
      
      for (let i = 0; i < 10; i++) {
        const startTime = performance.now();
        await request.get(queryType.endpoint).set('Authorization', `Bearer ${this.authToken}`);
        const endTime = performance.now();
        times.push(endTime - startTime);
      }
      
      const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      const minTime = Math.min(...times);
      const maxTime = Math.max(...times);
      
      console.log(`${queryType.name}: 平均${avgTime.toFixed(2)}ms, 最小${minTime.toFixed(2)}ms, 最大${maxTime.toFixed(2)}ms`);
    }
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
