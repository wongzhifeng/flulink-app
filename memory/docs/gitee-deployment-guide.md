# FluLink项目Gitee部署指导

## 🚀 部署到Gitee步骤

### 1. 创建Gitee仓库

1. 访问 [Gitee.com](https://gitee.com)
2. 登录您的账号
3. 点击右上角的 "+" 号，选择 "新建仓库"
4. 填写仓库信息：
   - **仓库名称**: `flulink`
   - **仓库描述**: `FluLink星尘共鸣版 - 基于星空图谱的异步社交应用`
   - **仓库类型**: 公开
   - **语言**: JavaScript
   - **添加 .gitignore**: 选择 Node
   - **添加 README**: 不勾选（我们已有README）
5. 点击 "创建" 按钮

### 2. 配置本地Git仓库

```bash
# 移除现有的远程仓库配置
git remote remove origin

# 添加您的Gitee仓库地址（替换为您的用户名）
git remote add origin https://gitee.com/YOUR_USERNAME/flulink.git

# 推送代码到Gitee
git push -u origin main
```

### 3. 设置Gitee Pages（可选）

如果您想部署静态页面：

1. 进入您的Gitee仓库
2. 点击 "服务" -> "Gitee Pages"
3. 选择部署分支：`main`
4. 选择部署目录：`flulink/frontend/dist`
5. 点击 "启动" 按钮

### 4. 配置自动部署（推荐）

#### 使用Zeabur云平台部署

1. 访问 [Zeabur.com](https://zeabur.com)
2. 连接您的Gitee账号
3. 选择 `flulink` 仓库
4. 选择部署类型：
   - **后端**: Node.js应用
   - **前端**: Static Site
5. 配置环境变量：
   ```bash
   # 后端环境变量
   NODE_ENV=production
   MONGODB_URI=your_mongodb_connection_string
   REDIS_URL=your_redis_connection_string
   JWT_SECRET=your_jwt_secret
   CORS_ORIGIN=https://your-frontend-domain.com
   ```

#### 使用Docker部署

1. 在Gitee仓库中创建 `.github/workflows/deploy.yml` 文件
2. 配置GitHub Actions自动部署
3. 或者使用Docker Compose本地部署

### 5. 数据库配置

#### MongoDB Atlas（推荐）
1. 访问 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. 创建免费集群
3. 获取连接字符串
4. 配置到环境变量中

#### Redis Cloud
1. 访问 [Redis Cloud](https://redis.com/redis-enterprise-cloud/)
2. 创建免费实例
3. 获取连接信息
4. 配置到环境变量中

### 6. 域名配置（可选）

1. 购买域名（如：flulink.com）
2. 配置DNS解析到部署平台
3. 配置SSL证书（HTTPS）

## 🔧 部署配置示例

### Zeabur部署配置

#### 后端服务配置
```yaml
# zeabur.yaml
services:
  backend:
    source: ./flulink/backend
    build:
      dockerfile: Dockerfile
    env:
      - NODE_ENV=production
      - PORT=3001
      - MONGODB_URI=${MONGODB_URI}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
    ports:
      - 3001
```

#### 前端服务配置
```yaml
services:
  frontend:
    source: ./flulink/frontend
    build:
      dockerfile: Dockerfile
    ports:
      - 80
```

### Docker Compose配置

```yaml
# docker-compose.yml
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password123
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  redis:
    image: redis:7.2-alpine
    command: redis-server --requirepass redis123
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  backend:
    build: ./flulink/backend
    environment:
      NODE_ENV: production
      MONGODB_URI: mongodb://admin:password123@mongodb:27017/flulink?authSource=admin
      REDIS_URL: redis://:redis123@redis:6379
      JWT_SECRET: your-super-secret-jwt-key
    ports:
      - "3001:3001"
    depends_on:
      - mongodb
      - redis

  frontend:
    build: ./flulink/frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  mongodb_data:
  redis_data:
```

## 📊 部署检查清单

### 部署前检查
- [ ] 代码已提交到Gitee
- [ ] 环境变量已配置
- [ ] 数据库连接正常
- [ ] Redis连接正常
- [ ] 依赖安装完成

### 部署后检查
- [ ] 后端API服务正常启动
- [ ] 前端页面正常访问
- [ ] 数据库连接正常
- [ ] 缓存服务正常
- [ ] 日志输出正常
- [ ] 健康检查通过

## 🚨 常见问题

### 1. 推送失败
```bash
# 如果推送失败，检查远程仓库地址
git remote -v

# 重新设置远程仓库
git remote set-url origin https://gitee.com/YOUR_USERNAME/flulink.git
```

### 2. 权限问题
```bash
# 确保您有仓库的推送权限
# 检查Gitee账号设置
```

### 3. 部署失败
- 检查环境变量配置
- 查看部署日志
- 确认依赖安装
- 检查端口占用

### 4. 数据库连接失败
- 检查MongoDB连接字符串
- 确认网络访问权限
- 检查数据库用户权限

## 📞 技术支持

如果在部署过程中遇到问题，可以：

1. 查看项目文档：`memory/docs/`
2. 检查部署日志
3. 提交Issue到Gitee仓库
4. 联系技术支持

---

**部署完成后，您的FluLink星尘共鸣版应用就可以在云端运行了！** ✨
