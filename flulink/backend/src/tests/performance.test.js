const supertest = require('supertest');
const { performance } = require('perf_hooks');
const app = require('../index');
const { User, UserService } = require('../models');

const request = supertest(app);

/**
 * API性能基准测试
 * 基于《德道经》"治大国若烹小鲜"原则 - 确保系统稳定高效
 */
class APIBenchmark {
  constructor() {
    this.results = [];
    this.authToken = null;
    this.testUser = null;
  }

  async setup() {
    // 创建测试用户
    const response = await request
      .post('/api/auth/register')
      .send({
        phone: '13900000999',
        password: 'test123',
        nickname: '性能测试用户',
        location: {
          coordinates: [116.404, 39.915]
        }
      });
    
    this.authToken = response.body.data.token;
    this.testUser = response.body.data.user;

    // 创建测试服务数据
    await this.createTestServices();
  }

  async createTestServices() {
    const services = [];
    for (let i = 0; i < 10; i++) {
      services.push({
        userId: this.testUser._id,
        serviceType: ['housing', 'repair', 'education', 'health', 'transport', 'other'][i % 6],
        title: `测试服务${i}`,
        description: `这是第${i}个测试服务`,
        location: {
          type: 'Point',
          coordinates: [
            116.404 + (Math.random() - 0.5) * 0.01, // 随机位置
            39.915 + (Math.random() - 0.5) * 0.01
          ]
        },
        serviceRadius: 1.0,
        isActive: true
      });
    }
    
    await UserService.insertMany(services);
  }

  async benchmarkEndpoint(method, path, data = null, iterations = 10) {
    const times = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      
      let response;
      if (method === 'GET') {
        response = await request
          .get(path)
          .set('Authorization', `Bearer ${this.authToken}`);
      } else if (method === 'POST') {
        response = await request
          .post(path)
          .set('Authorization', `Bearer ${this.authToken}`)
          .send(data);
      } else if (method === 'PUT') {
        response = await request
          .put(path)
          .set('Authorization', `Bearer ${this.authToken}`)
          .send(data);
      }
      
      const end = performance.now();
      const duration = end - start;
      
      times.push(duration);
      
      // 确保请求成功
      if (response.status >= 400) {
        console.warn(`警告: ${method} ${path} 返回状态码 ${response.status}`);
      }
    }
    
    return {
      endpoint: `${method} ${path}`,
      iterations,
      averageTime: times.reduce((a, b) => a + b, 0) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      times
    };
  }

  async runBenchmarks() {
    console.log('🚀 开始API性能基准测试...\n');

    // 1. 服务发布性能测试
    const publishResult = await this.benchmarkEndpoint(
      'POST',
      '/api/services/publish',
      {
        serviceType: 'housing',
        title: '性能测试服务',
        description: '这是一个性能测试服务',
        location: {
          coordinates: [116.404, 39.915]
        },
        serviceRadius: 1.0
      },
      5 // 减少迭代次数，避免创建太多服务
    );
    this.results.push(publishResult);

    // 2. 服务匹配性能测试
    const matchResult = await this.benchmarkEndpoint(
      'POST',
      '/api/services/match',
      {
        serviceType: 'housing',
        location: {
          coordinates: [116.404, 39.915]
        },
        maxDistance: 1000
      }
    );
    this.results.push(matchResult);

    // 3. 获取服务列表性能测试
    const listResult = await this.benchmarkEndpoint(
      'GET',
      '/api/services/my-services'
    );
    this.results.push(listResult);

    // 4. 健康检查性能测试
    const healthResult = await this.benchmarkEndpoint(
      'GET',
      '/api/health'
    );
    this.results.push(healthResult);

    return this.results;
  }

  generateReport() {
    console.log('\n📊 API性能基准测试报告');
    console.log('=' .repeat(50));
    
    this.results.forEach(result => {
      console.log(`\n🔗 ${result.endpoint}`);
      console.log(`   迭代次数: ${result.iterations}`);
      console.log(`   平均响应时间: ${result.averageTime.toFixed(2)}ms`);
      console.log(`   最快响应时间: ${result.minTime.toFixed(2)}ms`);
      console.log(`   最慢响应时间: ${result.maxTime.toFixed(2)}ms`);
      
      // 性能评级
      let rating = '🟢 优秀';
      if (result.averageTime > 1000) {
        rating = '🔴 需要优化';
      } else if (result.averageTime > 500) {
        rating = '🟡 良好';
      }
      
      console.log(`   性能评级: ${rating}`);
    });

    // 总体性能评估
    const overallAverage = this.results.reduce((sum, r) => sum + r.averageTime, 0) / this.results.length;
    console.log(`\n📈 总体平均响应时间: ${overallAverage.toFixed(2)}ms`);
    
    if (overallAverage < 500) {
      console.log('🎯 系统性能优秀，符合"治大国若烹小鲜"原则');
    } else if (overallAverage < 1000) {
      console.log('⚠️  系统性能良好，建议进一步优化');
    } else {
      console.log('🚨 系统性能需要优化，建议检查数据库查询和缓存策略');
    }
  }

  async cleanup() {
    // 清理测试数据
    await User.deleteMany({ phone: /^13900000999/ });
    await UserService.deleteMany({ userId: this.testUser._id });
  }
}

/**
 * 并发性能测试
 */
class ConcurrencyTest {
  constructor() {
    this.authToken = null;
    this.testUser = null;
  }

  async setup() {
    const response = await request
      .post('/api/auth/register')
      .send({
        phone: '13900000888',
        password: 'test123',
        nickname: '并发测试用户'
      });
    
    this.authToken = response.body.data.token;
    this.testUser = response.body.data.user;
  }

  async testConcurrentRequests(concurrency = 10) {
    console.log(`\n🔄 并发测试 (${concurrency} 个并发请求)`);
    
    const promises = [];
    const startTime = performance.now();
    
    for (let i = 0; i < concurrency; i++) {
      promises.push(
        request
          .get('/api/services/my-services')
          .set('Authorization', `Bearer ${this.authToken}`)
      );
    }
    
    const responses = await Promise.all(promises);
    const endTime = performance.now();
    
    const successCount = responses.filter(r => r.status === 200).length;
    const totalTime = endTime - startTime;
    
    console.log(`   总耗时: ${totalTime.toFixed(2)}ms`);
    console.log(`   成功请求: ${successCount}/${concurrency}`);
    console.log(`   成功率: ${(successCount / concurrency * 100).toFixed(1)}%`);
    
    return {
      concurrency,
      totalTime,
      successCount,
      successRate: successCount / concurrency
    };
  }

  async cleanup() {
    await User.deleteMany({ phone: /^13900000888/ });
  }
}

// 主测试函数
async function runPerformanceTests() {
  console.log('🎯 开始FluLink API性能测试');
  console.log('基于《德道经》"治大国若烹小鲜"原则\n');

  try {
    // 基准测试
    const benchmark = new APIBenchmark();
    await benchmark.setup();
    await benchmark.runBenchmarks();
    benchmark.generateReport();
    await benchmark.cleanup();

    // 并发测试
    const concurrencyTest = new ConcurrencyTest();
    await concurrencyTest.setup();
    await concurrencyTest.testConcurrentRequests(5);
    await concurrencyTest.testConcurrentRequests(10);
    await concurrencyTest.testConcurrentRequests(20);
    await concurrencyTest.cleanup();

    console.log('\n✅ 性能测试完成！');
    
  } catch (error) {
    console.error('❌ 性能测试失败:', error);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  runPerformanceTests();
}

module.exports = {
  APIBenchmark,
  ConcurrencyTest,
  runPerformanceTests
};

