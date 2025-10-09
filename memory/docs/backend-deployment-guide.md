# FluLink后端部署说明

## 🚀 部署步骤

### 1. 环境准备
确保以下环境已安装：
- Node.js >= 18.0.0
- npm >= 8.0.0
- MongoDB >= 5.0
- Redis >= 6.0

### 2. 环境变量配置
创建 `.env` 文件，配置以下环境变量：

```bash
NODE_ENV=production
PORT=8080
MONGODB_URI=mongodb://localhost:27017/flulink
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=http://localhost:3000
```

### 3. 依赖安装
```bash
cd flulink/backend
npm install
```

### 4. 数据库初始化
```bash
# 启动MongoDB
mongod

# 启动Redis
redis-server
```

### 5. 运行服务
```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

### 6. 健康检查
```bash
curl http://localhost:8080/api/health
```

## 🐳 Docker部署

### 1. 构建镜像
```bash
cd flulink/backend
docker build -t flulink-backend .
```

### 2. 运行容器
```bash
docker run -d \
  --name flulink-backend \
  -p 8080:8080 \
  -e NODE_ENV=production \
  -e PORT=8080 \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/flulink \
  -e REDIS_URL=redis://host.docker.internal:6379 \
  flulink-backend
```

## ☁️ 云平台部署

### Zeabur部署
1. 连接Gitee仓库
2. 选择Node.js应用类型
3. 设置构建目录为 `flulink/backend`
4. 配置环境变量
5. 部署

### 环境变量配置
```bash
NODE_ENV=production
PORT=8080
MONGODB_URI=your-mongodb-connection-string
REDIS_URL=your-redis-connection-string
JWT_SECRET=your-jwt-secret
CORS_ORIGIN=your-frontend-url
```

## 🔧 故障排除

### 常见问题

#### 1. npm ci 失败
```bash
# 清理依赖重新安装
rm -rf node_modules package-lock.json
npm install
```

#### 2. 数据库连接失败
- 检查MongoDB服务是否启动
- 验证连接字符串是否正确
- 检查网络连接

#### 3. Redis连接失败
- 检查Redis服务是否启动
- 验证连接字符串是否正确
- 检查Redis密码配置

#### 4. 端口占用
```bash
# 查看端口占用
lsof -i :8080

# 杀死占用进程
kill -9 <PID>
```

## 📊 监控和日志

### 日志查看
```bash
# 实时日志
npm run logs

# 查看特定日志
tail -f logs/app.log
```

### 健康检查
```bash
# API健康检查
curl http://localhost:8080/api/health

# 数据库连接检查
curl http://localhost:8080/api/health/db
```

## 🔒 安全配置

### 1. JWT密钥
确保JWT_SECRET是强密钥，建议使用32位随机字符串

### 2. CORS配置
根据实际部署环境配置CORS_ORIGIN

### 3. 速率限制
默认配置：15分钟内最多100个请求

### 4. 文件上传
- 最大文件大小：10MB
- 允许的文件类型：JPEG, PNG, GIF

## 📈 性能优化

### 1. 缓存配置
- 缓存TTL：5分钟
- 最大缓存条目：1000

### 2. 数据库优化
- 创建必要的索引
- 使用连接池
- 启用查询优化

### 3. Redis优化
- 配置内存限制
- 启用持久化
- 使用集群模式

---

**部署完成后，您的FluLink后端服务将在 http://localhost:8080 运行**
