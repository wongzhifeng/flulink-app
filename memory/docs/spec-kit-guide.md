# FluLink Spec-Kit 使用指南

## 🚀 概述

Spec-Kit是FluLink项目的API规范管理工具包，集成了Swagger/OpenAPI规范、API测试、Mock服务器等功能，为API开发和测试提供完整的解决方案。

## 📦 功能特性

### 1. API规范管理
- **Swagger/OpenAPI 3.0**: 完整的API规范文档
- **自动生成**: 从代码注释自动生成API文档
- **实时更新**: 代码变更时自动更新文档
- **多格式支持**: JSON、YAML格式输出

### 2. API测试框架
- **自动化测试**: 全面的API端点测试
- **性能测试**: 并发请求和响应时间测试
- **健康检查**: 服务状态监控
- **测试报告**: 详细的测试结果报告

### 3. Mock服务器
- **快速原型**: 无需后端即可进行前端开发
- **数据模拟**: 真实的API响应数据
- **CORS支持**: 跨域请求支持
- **热重载**: 实时更新Mock数据

### 4. API验证
- **请求验证**: 自动验证请求参数
- **响应验证**: 确保响应格式正确
- **类型检查**: 严格的数据类型验证
- **错误处理**: 统一的错误响应格式

## 🛠️ 安装和配置

### 1. 安装依赖
```bash
cd flulink/backend
npm install
```

### 2. 启动服务
```bash
# 启动API服务器
npm start

# 启动开发模式
npm run dev

# 启动Mock服务器
npm run test:mock
```

### 3. 访问API文档
- **Swagger UI**: http://localhost:8080/api-docs
- **API规范JSON**: http://localhost:8080/api-docs.json
- **OpenAPI规范**: http://localhost:8080/openapi.json

## 📚 API文档

### 1. 查看API文档
```bash
# 生成API文档
npm run docs:generate

# 启动文档服务器
npm run docs:serve
```

### 2. API规范结构
```
/api-docs          # Swagger UI界面
/api-docs.json     # API规范JSON
/openapi.json      # OpenAPI规范
/api/health        # 健康检查
```

### 3. 主要API端点
- **认证**: `/api/auth/*`
- **用户**: `/api/users/*`
- **星种**: `/api/starseeds/*`
- **星团**: `/api/clusters/*`
- **共鸣**: `/api/resonance/*`
- **上传**: `/api/upload/*`

## 🧪 API测试

### 1. 运行API测试
```bash
# 运行完整API测试
npm run test:api

# 运行特定测试
node src/tests/api-test.js
```

### 2. 测试覆盖范围
- ✅ 健康检查测试
- ✅ API文档测试
- ✅ 认证API测试
- ✅ 用户API测试
- ✅ 星种API测试
- ✅ 星团API测试
- ✅ 共鸣API测试
- ✅ 文件上传测试
- ✅ 性能测试

### 3. 测试报告
测试完成后会生成详细的测试报告：
- 总测试数
- 通过/失败数量
- 成功率统计
- 错误详情
- 性能指标

## 🎭 Mock服务器

### 1. 启动Mock服务器
```bash
npm run test:mock
```

### 2. Mock服务器特性
- **端口**: 3001
- **CORS**: 已启用
- **数据**: 预置测试数据
- **响应**: 真实API格式

### 3. Mock数据
```javascript
// 用户数据
{
  "id": "user-1",
  "username": "starseeker",
  "email": "starseeker@example.com",
  "avatar": "https://via.placeholder.com/100",
  "bio": "探索星尘共鸣的奥秘",
  "tags": ["技术", "艺术", "音乐"]
}

// 星种数据
{
  "id": "starseed-1",
  "userId": "user-1",
  "content": "分享一个有趣的技术发现",
  "tags": ["技术", "分享"],
  "resonanceCount": 15
}
```

## 🔧 配置选项

### 1. Swagger配置
```javascript
// src/config/swagger.js
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FluLink API',
      version: '1.0.0',
      description: 'FluLink星尘共鸣版API文档'
    },
    servers: [
      {
        url: 'http://localhost:8080',
        description: '开发环境'
      }
    ]
  }
};
```

### 2. 测试配置
```javascript
// src/tests/api-test.js
const config = {
  baseURL: 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
};
```

### 3. Mock配置
```javascript
// src/tests/mock-server.js
const PORT = process.env.MOCK_PORT || 3001;
```

## 📝 API注释规范

### 1. 基本结构
```javascript
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: 获取用户列表
 *     description: 获取所有用户信息
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: 成功获取用户列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 */
```

### 2. 请求体
```javascript
/**
 * @swagger
 * /api/users:
 *   post:
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 */
```

### 3. 响应体
```javascript
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         username:
 *           type: string
 *         email:
 *           type: string
 */
```

## 🚀 部署和集成

### 1. 生产环境
```bash
# 构建API文档
npm run docs:generate

# 验证API规范
npm run validate

# 运行测试
npm run test:api
```

### 2. CI/CD集成
```yaml
# .github/workflows/api-test.yml
name: API Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:api
      - run: npm run validate
```

### 3. Docker集成
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src/ ./src/
EXPOSE 8080
CMD ["npm", "start"]
```

## 📊 监控和日志

### 1. API使用监控
```javascript
// 自动记录API使用情况
const apiUsage = {
  path: req.path,
  method: req.method,
  timestamp: new Date().toISOString(),
  userAgent: req.get('User-Agent'),
  ip: req.ip
};
```

### 2. 性能监控
```javascript
// 响应时间监控
const startTime = Date.now();
// ... API处理 ...
const endTime = Date.now();
const responseTime = endTime - startTime;
```

### 3. 错误监控
```javascript
// 错误日志记录
app.use((error, req, res, next) => {
  console.error('API Error:', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});
```

## 🔍 故障排除

### 1. 常见问题

#### API文档无法访问
```bash
# 检查服务是否启动
curl http://localhost:8080/api/health

# 检查端口是否被占用
lsof -i :8080
```

#### 测试失败
```bash
# 检查API服务状态
npm run test:api

# 查看详细错误信息
DEBUG=* npm run test:api
```

#### Mock服务器问题
```bash
# 重启Mock服务器
npm run test:mock

# 检查Mock端口
lsof -i :3001
```

### 2. 调试技巧
- 使用`DEBUG=*`环境变量查看详细日志
- 检查API规范语法错误
- 验证请求/响应格式
- 确认服务端口和URL配置

## 📈 最佳实践

### 1. API设计
- 使用RESTful设计原则
- 保持API版本一致性
- 提供清晰的错误信息
- 实现适当的缓存策略

### 2. 文档维护
- 及时更新API注释
- 保持文档与代码同步
- 提供示例和用例
- 定期审查API规范

### 3. 测试策略
- 编写全面的测试用例
- 定期运行自动化测试
- 监控API性能指标
- 及时修复发现的问题

## 🎯 下一步计划

### 短期目标 (1-2周)
- [ ] 完善所有API端点的Swagger注释
- [ ] 增加更多测试用例
- [ ] 优化Mock服务器性能
- [ ] 添加API版本管理

### 中期目标 (1-3个月)
- [ ] 实现API自动化测试
- [ ] 添加性能基准测试
- [ ] 集成API监控系统
- [ ] 实现API文档国际化

### 长期目标 (3-6个月)
- [ ] 构建API网关
- [ ] 实现API限流和熔断
- [ ] 添加API安全扫描
- [ ] 实现API自动化部署

---

**Spec-Kit已成功启用！现在您可以：**
- 📚 访问完整的API文档
- 🧪 运行全面的API测试
- 🎭 使用Mock服务器进行开发
- 🔍 验证API规范的正确性

**开始使用**: `npm run docs` 查看API文档
