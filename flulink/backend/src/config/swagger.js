const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// spec-kit增强的Swagger配置选项
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FluLink API - spec-kit增强版',
      version: '2.0.0',
      description: 'FluLink星尘共鸣版API文档 - 集成spec-kit工具包',
      contact: {
        name: 'FluLink Team',
        email: 'support@flulink.com',
        url: 'https://flulink.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      },
      // spec-kit增强：添加API规范信息
      'x-spec-kit': {
        version: '1.0.0',
        features: ['api-docs', 'mock-server', 'api-testing', 'validation'],
        tools: ['swagger-ui', 'postman', 'insomnia', 'curl']
      }
    },
    servers: [
      {
        url: 'http://localhost:8080',
        description: '开发环境'
      },
      {
        url: 'https://flulink-app.zeabur.app',
        description: '生产环境'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        // spec-kit增强：用户模型
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', format: 'uuid', example: '507f1f77bcf86cd799439011' },
            phone: { type: 'string', example: '13800138000' },
            nickname: { type: 'string', example: '星尘探索者' },
            motto: { type: 'string', example: '探索无限可能' },
            poem: { type: 'string', example: '星光点点，共鸣无限' },
            tags: { type: 'array', items: { type: 'string' }, example: ['技术', '艺术', '音乐'] },
            avatar: { type: 'string', format: 'uri' },
            bio: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        // spec-kit增强：星种模型
        StarSeed: {
          type: 'object',
          properties: {
            _id: { type: 'string', format: 'uuid' },
            authorId: { type: 'string', format: 'uuid' },
            content: {
              type: 'object',
              properties: {
                text: { type: 'string', example: '分享一个美好的想法' },
                imageUrl: { type: 'string', format: 'uri' },
                audioUrl: { type: 'string', format: 'uri' }
              }
            },
            luminosity: { type: 'number', example: 75.5 },
            spectrum: { type: 'object' },
            propagationPath: { type: 'array' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        // spec-kit增强：星团模型
        Cluster: {
          type: 'object',
          properties: {
            _id: { type: 'string', format: 'uuid' },
            members: { type: 'array', items: { type: 'string' } },
            coreUsers: { type: 'array', items: { type: 'string' } },
            averageResonance: { type: 'number', example: 85.2 },
            diversityScore: { type: 'number', example: 0.75 },
            activityBalance: { type: 'number', example: 0.68 },
            createdAt: { type: 'string', format: 'date-time' },
            expiresAt: { type: 'string', format: 'date-time' }
          }
        },
        // spec-kit增强：共鸣值模型
        Resonance: {
          type: 'object',
          properties: {
            userAId: { type: 'string', format: 'uuid' },
            userBId: { type: 'string', format: 'uuid' },
            value: { type: 'number', example: 87.5 },
            factors: {
              type: 'object',
              properties: {
                tagSimilarity: { type: 'number', example: 0.8 },
                interactionScore: { type: 'number', example: 0.7 },
                contentPreferenceMatch: { type: 'number', example: 0.6 },
                randomFactor: { type: 'number', example: 0.05 }
              }
            },
            calculatedAt: { type: 'string', format: 'date-time' }
          }
        },
        // spec-kit增强：错误响应模型
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: '错误信息' },
            code: { type: 'string', example: 'VALIDATION_ERROR' },
            details: { type: 'object' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        },
        // spec-kit增强：成功响应模型
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: '操作成功' },
            data: { type: 'object' },
            meta: {
              type: 'object',
              properties: {
                total: { type: 'number', example: 100 },
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 20 },
                hasMore: { type: 'boolean', example: true }
              }
            },
            timestamp: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

// 生成Swagger规范
const swaggerSpec = swaggerJSDoc(swaggerOptions);

module.exports = {
  swaggerSpec,
  swaggerUi
};
