#!/usr/bin/env node

/**
 * FluLink API测试脚本
 * 使用spec-kit进行API规范测试
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 配置
const config = {
  baseURL: process.env.API_BASE_URL || 'http://localhost:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'FluLink-API-Tester/1.0.0'
  }
};

// 创建axios实例
const api = axios.create(config);

// 测试结果存储
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
};

/**
 * 执行API测试
 */
async function runApiTest(endpoint, method = 'GET', data = null, expectedStatus = 200) {
  testResults.total++;
  
  try {
    console.log(`🧪 测试 ${method} ${endpoint}...`);
    
    const requestConfig = {
      method,
      url: endpoint,
      validateStatus: () => true // 不抛出状态码错误
    };
    
    // 只有在POST/PUT/PATCH请求时才添加data
    if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      requestConfig.data = data;
    }
    
    const response = await api(requestConfig);
    
    if (response.status === expectedStatus) {
      console.log(`✅ ${method} ${endpoint} - 状态码: ${response.status}`);
      testResults.passed++;
      return response.data;
    } else {
      console.log(`❌ ${method} ${endpoint} - 期望状态码: ${expectedStatus}, 实际: ${response.status}`);
      testResults.failed++;
      testResults.errors.push({
        endpoint,
        method,
        expected: expectedStatus,
        actual: response.status,
        error: response.data
      });
      return null;
    }
  } catch (error) {
    console.log(`❌ ${method} ${endpoint} - 错误: ${error.message}`);
    testResults.failed++;
    testResults.errors.push({
      endpoint,
      method,
      error: error.message
    });
    return null;
  }
}

/**
 * 健康检查测试
 */
async function testHealthCheck() {
  console.log('\n📊 健康检查测试');
  console.log('='.repeat(50));
  
  const healthData = await runApiTest('/api/health', 'GET', null, 200);
  
  if (healthData) {
    console.log('📋 健康检查详情:');
    console.log(`   - 服务状态: ${healthData.success ? '正常' : '异常'}`);
    console.log(`   - 版本: ${healthData.version}`);
    console.log(`   - 时间戳: ${healthData.timestamp}`);
  }
}

/**
 * API文档测试
 */
async function testApiDocs() {
  console.log('\n📚 API文档测试');
  console.log('='.repeat(50));
  
  // 测试Swagger UI
  await runApiTest('/api-docs', 'GET', null, 200);
  
  // 测试API规范JSON
  const specData = await runApiTest('/api-docs.json', 'GET', null, 200);
  
  if (specData) {
    console.log('📋 API规范详情:');
    console.log(`   - 标题: ${specData.info.title}`);
    console.log(`   - 版本: ${specData.info.version}`);
    console.log(`   - 描述: ${specData.info.description}`);
    console.log(`   - 路径数量: ${Object.keys(specData.paths || {}).length}`);
  }
}

/**
 * 认证API测试
 */
async function testAuthApis() {
  console.log('\n🔐 认证API测试');
  console.log('='.repeat(50));
  
  // 测试注册API（使用测试数据）
  const registerData = {
    phone: '13800138000',
    password: 'testpassword123',
    nickname: '测试用户',
    motto: '测试座右铭',
    poem: '测试诗句',
    tags: ['测试', 'API']
  };
  
  await runApiTest('/api/auth/register', 'POST', registerData, 201);
  
  // 测试登录API
  const loginData = {
    phone: '13800138000',
    password: 'testpassword123'
  };
  
  const loginResult = await runApiTest('/api/auth/login', 'POST', loginData, 200);
  
  if (loginResult && loginResult.data && loginResult.data.token) {
    console.log('🔑 登录成功，获得访问令牌');
    
    // 更新API实例的认证头
    api.defaults.headers.common['Authorization'] = `Bearer ${loginResult.data.token}`;
    
    // 测试受保护的端点
    await runApiTest('/api/users/profile', 'GET', null, 200);
  }
}

/**
 * 用户API测试
 */
async function testUserApis() {
  console.log('\n👤 用户API测试');
  console.log('='.repeat(50));
  
  // 测试用户列表
  await runApiTest('/api/users', 'GET', null, 200);
  
  // 测试用户搜索
  await runApiTest('/api/users/search?q=测试', 'GET', null, 200);
  
  // 测试用户标签
  await runApiTest('/api/users/tags', 'GET', null, 200);
}

/**
 * 星种API测试
 */
async function testStarSeedApis() {
  console.log('\n⭐ 星种API测试');
  console.log('='.repeat(50));
  
  // 测试星种列表
  await runApiTest('/api/starseeds', 'GET', null, 200);
  
  // 测试星种创建
  const starSeedData = {
    content: '这是一个测试星种',
    tags: ['测试', 'API'],
    media: []
  };
  
  await runApiTest('/api/starseeds', 'POST', starSeedData, 201);
}

/**
 * 星团API测试
 */
async function testClusterApis() {
  console.log('\n🌟 星团API测试');
  console.log('='.repeat(50));
  
  // 测试星团列表
  await runApiTest('/api/clusters', 'GET', null, 200);
  
  // 测试星团查询
  await runApiTest('/api/clusters/search?q=测试', 'GET', null, 200);
}

/**
 * 共鸣API测试
 */
async function testResonanceApis() {
  console.log('\n💫 共鸣API测试');
  console.log('='.repeat(50));
  
  // 测试共鸣计算
  await runApiTest('/api/resonance/calculate', 'POST', {
    userId: 'test-user-id',
    targetId: 'test-target-id'
  }, 200);
  
  // 测试共鸣历史
  await runApiTest('/api/resonance/history', 'GET', null, 200);
}

/**
 * 文件上传测试
 */
async function testUploadApis() {
  console.log('\n📁 文件上传测试');
  console.log('='.repeat(50));
  
  // 测试上传端点（不实际上传文件）
  await runApiTest('/api/upload', 'GET', null, 405); // 方法不允许
}

/**
 * 性能测试
 */
async function testPerformance() {
  console.log('\n⚡ 性能测试');
  console.log('='.repeat(50));
  
  const startTime = Date.now();
  const promises = [];
  
  // 并发请求测试
  for (let i = 0; i < 10; i++) {
    promises.push(runApiTest('/api/health', 'GET', null, 200));
  }
  
  await Promise.all(promises);
  const endTime = Date.now();
  
  console.log(`📊 并发测试完成，耗时: ${endTime - startTime}ms`);
}

/**
 * 生成测试报告
 */
function generateReport() {
  console.log('\n📊 测试报告');
  console.log('='.repeat(50));
  
  const successRate = ((testResults.passed / testResults.total) * 100).toFixed(2);
  
  console.log(`总测试数: ${testResults.total}`);
  console.log(`通过: ${testResults.passed}`);
  console.log(`失败: ${testResults.failed}`);
  console.log(`成功率: ${successRate}%`);
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ 失败详情:');
    testResults.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.method} ${error.endpoint}`);
      console.log(`   错误: ${error.error}`);
    });
  }
  
  // 保存报告到文件
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      total: testResults.total,
      passed: testResults.passed,
      failed: testResults.failed,
      successRate: parseFloat(successRate)
    },
    errors: testResults.errors
  };
  
  const reportPath = path.join(__dirname, 'test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  console.log(`\n📄 详细报告已保存到: ${reportPath}`);
}

/**
 * 主测试函数
 */
async function runTests() {
  console.log('🚀 开始FluLink API测试');
  console.log(`🌐 测试目标: ${config.baseURL}`);
  console.log('='.repeat(50));
  
  try {
    await testHealthCheck();
    await testApiDocs();
    await testAuthApis();
    await testUserApis();
    await testStarSeedApis();
    await testClusterApis();
    await testResonanceApis();
    await testUploadApis();
    await testPerformance();
    
    generateReport();
    
    // 根据测试结果设置退出码
    process.exit(testResults.failed > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('❌ 测试执行失败:', error.message);
    process.exit(1);
  }
}

// 运行测试
if (require.main === module) {
  runTests();
}

module.exports = {
  runApiTest,
  testHealthCheck,
  testApiDocs,
  testAuthApis,
  testUserApis,
  testStarSeedApis,
  testClusterApis,
  testResonanceApis,
  testUploadApis,
  testPerformance,
  generateReport
};
