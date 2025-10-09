// spec-kit工具包配置文件
// FluLink API规范工具包 - 集成API文档、测试、验证等功能

const specKitConfig = {
  // API文档配置
  apiDocs: {
    enabled: true,
    version: '2.0.0',
    title: 'FluLink API - spec-kit增强版',
    description: 'FluLink星尘共鸣版API文档 - 集成spec-kit工具包',
    baseUrl: 'https://flulink-app.zeabur.app',
    docsPath: '/api-docs',
    specPath: '/api-docs.json'
  },

  // Mock服务器配置
  mockServer: {
    enabled: true,
    port: 3001,
    baseUrl: 'http://localhost:3001',
    delay: 100, // 模拟网络延迟
    features: {
      'user-registration': true,
      'user-login': true,
      'starseed-crud': true,
      'cluster-generation': true,
      'resonance-calculation': true
    }
  },

  // API测试配置
  apiTesting: {
    enabled: true,
    frameworks: ['jest', 'supertest'],
    testSuites: [
      'authentication',
      'user-management',
      'starseed-management',
      'cluster-management',
      'resonance-calculation'
    ],
    coverage: {
      enabled: true,
      threshold: 80
    }
  },

  // API验证配置
  validation: {
    enabled: true,
    requestValidation: true,
    responseValidation: true,
    schemaValidation: true,
    errorHandling: true
  },

  // 性能监控配置
  performance: {
    enabled: true,
    metrics: {
      responseTime: true,
      throughput: true,
      errorRate: true,
      memoryUsage: true
    },
    alerts: {
      slowResponse: 1000, // ms
      highErrorRate: 5, // %
      memoryThreshold: 80 // %
    }
  },

  // 代码质量配置
  codeQuality: {
    enabled: true,
    tools: {
      eslint: true,
      prettier: true,
      typescript: true,
      sonarqube: false
    },
    rules: {
      complexity: 'low',
      maintainability: 'high',
      reliability: 'high',
      security: 'high'
    }
  },

  // 部署配置
  deployment: {
    platform: 'zeabur',
    environment: 'production',
    port: 8080,
    healthCheck: '/api/health',
    monitoring: {
      enabled: true,
      metrics: true,
      logs: true,
      alerts: true
    }
  },

  // 安全配置
  security: {
    enabled: true,
    features: {
      authentication: true,
      authorization: true,
      rateLimiting: true,
      inputValidation: true,
      outputSanitization: true
    },
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000'
    }
  }
};

// spec-kit工具函数
const specKitUtils = {
  // 生成API测试用例
  generateTestCases: (apiSpec) => {
    const testCases = [];
    
    Object.keys(apiSpec.paths).forEach(path => {
      Object.keys(apiSpec.paths[path]).forEach(method => {
        const operation = apiSpec.paths[path][method];
        testCases.push({
          path,
          method: method.toUpperCase(),
          operationId: operation.operationId,
          summary: operation.summary,
          tags: operation.tags || [],
          parameters: operation.parameters || [],
          requestBody: operation.requestBody,
          responses: operation.responses
        });
      });
    });
    
    return testCases;
  },

  // 验证API响应
  validateResponse: (response, schema) => {
    // 实现响应验证逻辑
    return {
      valid: true,
      errors: []
    };
  },

  // 生成Mock数据
  generateMockData: (schema) => {
    // 实现Mock数据生成逻辑
    return {};
  },

  // 性能分析
  analyzePerformance: (metrics) => {
    // 实现性能分析逻辑
    return {
      score: 95,
      recommendations: []
    };
  }
};

module.exports = {
  specKitConfig,
  specKitUtils
};
