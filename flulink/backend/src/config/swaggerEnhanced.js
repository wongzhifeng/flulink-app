import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FluLink API - Enhanced Specification',
      version: '2.2.0',
      description: `
        # FluLink API - 星尘共鸣社交网络平台
        
        ## 概述
        FluLink是一个基于星尘共鸣的智能社交网络平台，通过先进的算法实现用户间的智能匹配和星团生成。
        
        ## 核心功能
        - **用户认证**: 支持手机号登录、短信验证码、JWT令牌管理
        - **星种管理**: 内容发布、互动、演化机制
        - **星团生成**: 基于共鸣算法的49人智能匹配
        - **实时通信**: WebSocket星种辐射和星团同步
        - **性能监控**: 全面的性能指标和缓存优化
        
        ## 技术特性
        - RESTful API设计
        - JWT身份验证
        - Redis缓存优化
        - MongoDB数据存储
        - WebSocket实时通信
        - 性能监控和分析
        
        ## 版本历史
        - v1.0.0: 基础功能实现
        - v2.0.0: 性能优化和监控增强
        - v2.1.0: API文档增强和测试覆盖扩展
        - v2.2.0: 增强示例和用例，添加边界测试和压力测试
        
        ## API使用示例
        
        ### 用户认证流程
        \`\`\`javascript
        // 1. 发送验证码
        const response = await fetch('/api/auth/send-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: '13800138000' })
        });
        
        // 2. 验证码登录
        const loginResponse = await fetch('/api/auth/login-with-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            phone: '13800138000', 
            code: '123456' 
          })
        });
        
        const { token } = await loginResponse.json();
        \`\`\`
        
        ### 星种发布和互动
        \`\`\`javascript
        // 发布星种
        const starSeed = await fetch('/api/starseeds', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': \`Bearer \${token}\`
          },
          body: JSON.stringify({
            content: '分享一个有趣的想法...',
            spectrum: ['科技', '创新']
          })
        });
        
        // 点亮星种
        await fetch(\`/api/starseeds/\${starSeedId}/light\`, {
          method: 'POST',
          headers: { 'Authorization': \`Bearer \${token}\` }
        });
        \`\`\`
        
        ### 星团生成和加入
        \`\`\`javascript
        // 生成星团
        const cluster = await fetch('/api/clusters/generate', {
          method: 'POST',
          headers: { 'Authorization': \`Bearer \${token}\` }
        });
        
        // 获取星团成员
        const members = await fetch(\`/api/clusters/\${clusterId}/members\`, {
          headers: { 'Authorization': \`Bearer \${token}\` }
        });
        \`\`\`
        
        ## 错误处理最佳实践
        
        ### 统一错误响应格式
        所有API都遵循统一的错误响应格式：
        \`\`\`json
        {
          "success": false,
          "message": "错误描述",
          "error": "详细错误信息（仅开发环境）",
          "timestamp": "2024-01-01T00:00:00.000Z",
          "requestId": "req_123456789"
        }
        \`\`\`
        
        ### 常见错误码
        - \`400\`: 参数验证失败
        - \`401\`: 认证失败
        - \`403\`: 权限不足
        - \`404\`: 资源未找到
        - \`429\`: 请求频率限制
        - \`500\`: 服务器内部错误
        
        ## 性能优化建议
        
        ### 缓存策略
        - 用户信息缓存：5分钟
        - 星种列表缓存：2分钟
        - 星团信息缓存：10分钟
        
        ### 分页查询
        所有列表接口都支持分页：
        \`\`\`javascript
        const params = new URLSearchParams({
          page: '1',
          limit: '20',
          sort: 'createdAt',
          order: 'desc'
        });
        
        const response = await fetch(\`/api/starseeds?\${params}\`);
        \`\`\`
        
        ### 实时更新
        使用WebSocket获取实时更新：
        \`\`\`javascript
        const ws = new WebSocket('wss://flulink-backend-v2.zeabur.app/ws');
        
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'starseed_radiation') {
            // 处理星种辐射事件
          }
        };
        \`\`\`
        
        ### 边界测试示例
        \`\`\`javascript
        // 测试最大内容长度
        const maxContentTest = {
          content: 'A'.repeat(10000), // 最大长度测试
          tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'], // 最大标签数
          spectrum: Array(100).fill(0).map((_, i) => i) // 最大光谱数组
        };
        
        // 测试空值和特殊字符
        const edgeCaseTest = {
          content: '', // 空内容
          tags: [], // 空标签数组
          spectrum: null, // null值测试
          specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?' // 特殊字符测试
        };
        
        // 测试并发请求
        const concurrentTest = async () => {
          const promises = Array(100).fill(0).map(() => 
            fetch('/api/starseeds', { method: 'POST', body: JSON.stringify(testData) })
          );
          const results = await Promise.all(promises);
          return results;
        };
        \`\`\`
        
        ### 压力测试示例
        \`\`\`javascript
        // 内存使用测试
        const memoryTest = async () => {
          const startMemory = process.memoryUsage();
          const largeData = Array(10000).fill(0).map((_, i) => ({
            id: i,
            content: `Test content ${i}`,
            tags: [`tag${i % 10}`]
          }));
          const endMemory = process.memoryUsage();
          return {
            memoryUsed: endMemory.heapUsed - startMemory.heapUsed,
            dataSize: largeData.length
          };
        };
        
        // 数据库连接测试
        const dbConnectionTest = async () => {
          const startTime = Date.now();
          const connections = Array(50).fill(0).map(() => 
            fetch('/api/users/profile')
          );
          await Promise.all(connections);
          const endTime = Date.now();
          return {
            connections: 50,
            totalTime: endTime - startTime,
            avgTime: (endTime - startTime) / 50
          };
        };
        \`\`\`
      `,
      contact: {
        name: 'FluLink Development Team',
        email: 'dev@flulink.com',
        url: 'https://flulink.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'https://flulink-backend-v2.zeabur.app',
        description: 'Production Server'
      },
      {
        url: 'http://localhost:3001',
        description: 'Development Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT令牌认证'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['_id', 'phone', 'nickname', 'createdAt'],
          properties: {
            _id: {
              type: 'string',
              format: 'ObjectId',
              description: '用户唯一标识符'
            },
            phone: {
              type: 'string',
              pattern: '^1[3-9]\\d{9}$',
              description: '手机号码',
              example: '13800138000'
            },
            nickname: {
              type: 'string',
              minLength: 1,
              maxLength: 20,
              description: '用户昵称',
              example: '星尘探索者'
            },
            motto: {
              type: 'string',
              maxLength: 50,
              description: '座右铭',
              example: '探索无限可能的星空世界'
            },
            poem: {
              type: 'string',
              maxLength: 100,
              description: '个人诗句',
              example: '星光点点，照亮前行的路'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string',
                maxLength: 20
              },
              description: '用户标签',
              example: ['科技', '音乐', '旅行']
            },
            avatar: {
              type: 'string',
              format: 'uri',
              description: '头像URL',
              example: 'https://example.com/avatar.jpg'
            },
            starColor: {
              type: 'string',
              pattern: '^#[0-9A-Fa-f]{6}$',
              description: '星色',
              example: '#FFD700'
            },
            daysActive: {
              type: 'integer',
              minimum: 0,
              description: '活跃天数',
              example: 30
            },
            currentCluster: {
              type: 'string',
              format: 'ObjectId',
              description: '当前星团ID',
              nullable: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: '创建时间'
            },
            lastActiveAt: {
              type: 'string',
              format: 'date-time',
              description: '最后活跃时间'
            }
          }
        },
        StarSeed: {
          type: 'object',
          required: ['_id', 'authorId', 'content', 'createdAt'],
          properties: {
            _id: {
              type: 'string',
              format: 'ObjectId',
              description: '星种唯一标识符'
            },
            authorId: {
              type: 'string',
              format: 'ObjectId',
              description: '作者ID'
            },
            content: {
              type: 'string',
              minLength: 1,
              maxLength: 500,
              description: '星种内容',
              example: '分享一个有趣的想法...'
            },
            imageUrl: {
              type: 'string',
              format: 'uri',
              description: '图片URL',
              nullable: true
            },
            audioUrl: {
              type: 'string',
              format: 'uri',
              description: '音频URL',
              nullable: true
            },
            spectrum: {
              type: 'array',
              items: {
                type: 'string',
                maxLength: 20
              },
              description: '光谱标签',
              example: ['科技', '创新']
            },
            luminosity: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              description: '当前光度',
              example: 75.5
            },
            initialLuminosity: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              description: '初始光度',
              example: 50.0
            },
            interactions: {
              type: 'object',
              properties: {
                lights: {
                  type: 'integer',
                  minimum: 0,
                  description: '点亮次数'
                },
                comments: {
                  type: 'integer',
                  minimum: 0,
                  description: '评论次数'
                },
                shares: {
                  type: 'integer',
                  minimum: 0,
                  description: '分享次数'
                }
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: '创建时间'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: '更新时间'
            }
          }
        },
        Cluster: {
          type: 'object',
          required: ['_id', 'members', 'centerUser', 'createdAt'],
          properties: {
            _id: {
              type: 'string',
              format: 'ObjectId',
              description: '星团唯一标识符'
            },
            name: {
              type: 'string',
              maxLength: 50,
              description: '星团名称',
              nullable: true
            },
            members: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  userId: {
                    type: 'string',
                    format: 'ObjectId'
                  },
                  position: {
                    type: 'object',
                    properties: {
                      x: { type: 'number' },
                      y: { type: 'number' },
                      z: { type: 'number' }
                    }
                  },
                  resonanceValue: {
                    type: 'number',
                    minimum: 0,
                    maximum: 1
                  },
                  activityScore: {
                    type: 'number',
                    minimum: 0,
                    maximum: 1
                  },
                  joinedAt: {
                    type: 'string',
                    format: 'date-time'
                  }
                }
              },
              minItems: 2,
              maxItems: 49,
              description: '星团成员'
            },
            centerUser: {
              type: 'string',
              format: 'ObjectId',
              description: '中心用户ID'
            },
            averageResonance: {
              type: 'number',
              minimum: 0,
              maximum: 1,
              description: '平均共鸣值',
              example: 0.75
            },
            resonanceThreshold: {
              type: 'number',
              minimum: 0,
              maximum: 1,
              description: '共鸣阈值',
              example: 0.6
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: '创建时间'
            },
            expiresAt: {
              type: 'string',
              format: 'date-time',
              description: '过期时间'
            }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: '请求是否成功'
            },
            message: {
              type: 'string',
              description: '响应消息'
            },
            data: {
              type: 'object',
              description: '响应数据'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: '响应时间戳'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
              description: '请求失败'
            },
            message: {
              type: 'string',
              description: '错误消息'
            },
            error: {
              type: 'string',
              description: '详细错误信息（仅开发环境）'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: '错误时间戳'
            },
            requestId: {
              type: 'string',
              description: '请求ID'
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: '认证失败',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                message: '认证失败',
                timestamp: '2024-01-01T00:00:00.000Z'
              }
            }
          }
        },
        ForbiddenError: {
          description: '权限不足',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                message: '权限不足',
                timestamp: '2024-01-01T00:00:00.000Z'
              }
            }
          }
        },
        NotFoundError: {
          description: '资源未找到',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                message: '资源未找到',
                timestamp: '2024-01-01T00:00:00.000Z'
              }
            }
          }
        },
        ValidationError: {
          description: '参数验证失败',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                message: '参数验证失败',
                timestamp: '2024-01-01T00:00:00.000Z'
              }
            }
          }
        },
        ServerError: {
          description: '服务器内部错误',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                message: '服务器内部错误',
                timestamp: '2024-01-01T00:00:00.000Z'
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: '用户认证相关接口'
      },
      {
        name: 'StarSeeds',
        description: '星种管理相关接口'
      },
      {
        name: 'Clusters',
        description: '星团管理相关接口'
      },
      {
        name: 'Performance',
        description: '性能监控相关接口'
      },
      {
        name: 'Health',
        description: '健康检查接口'
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/routes/*.ts'
  ]
};

const swaggerSpec = swaggerJSDoc(options);

// 增强的Swagger UI配置
const swaggerUiOptions = {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #1890ff; font-size: 2.5em; }
    .swagger-ui .info .description { font-size: 1.2em; line-height: 1.6; }
    .swagger-ui .scheme-container { background: #f0f2f5; padding: 20px; border-radius: 8px; }
    .swagger-ui .opblock.opblock-post { border-color: #52c41a; }
    .swagger-ui .opblock.opblock-get { border-color: #1890ff; }
    .swagger-ui .opblock.opblock-put { border-color: #faad14; }
    .swagger-ui .opblock.opblock-delete { border-color: #ff4d4f; }
    .swagger-ui .btn.authorize { background-color: #1890ff; border-color: #1890ff; }
    .swagger-ui .btn.authorize:hover { background-color: #40a9ff; border-color: #40a9ff; }
  `,
  customSiteTitle: 'FluLink API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true,
    requestInterceptor: (req) => {
      // 添加请求拦截器
      req.headers['X-Request-ID'] = Math.random().toString(36).substring(2, 15);
      return req;
    },
    responseInterceptor: (res) => {
      // 添加响应拦截器
      console.log('API Response:', res);
      return res;
    }
  }
};

export { swaggerSpec, swaggerUi, swaggerUiOptions };
