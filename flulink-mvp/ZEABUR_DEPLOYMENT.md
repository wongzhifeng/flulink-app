# Zeabur部署配置
# FluLink MVP - 异步社交APP

## 部署要求
- **端口**: 3000 (Zeabur标准)
- **Node.js版本**: 18
- **构建模式**: standalone
- **数据库**: PostgreSQL (Zeabur提供)
- **缓存**: Redis (可选)

## 环境变量配置
在Zeabur项目设置中添加以下环境变量：

### 基础配置
```
NODE_ENV=production
PORT=3000
```

### 数据库配置 (PostgreSQL)
```
DATABASE_HOST=<zeabur-postgres-host>
DATABASE_PORT=5432
DATABASE_NAME=<zeabur-postgres-database>
DATABASE_USER=<zeabur-postgres-user>
DATABASE_PASSWORD=<zeabur-postgres-password>
DATABASE_CONNECTION_LIMIT=10
```

### Redis配置 (可选)
```
REDIS_HOST=<zeabur-redis-host>
REDIS_PORT=6379
REDIS_PASSWORD=<zeabur-redis-password>
CACHE_TTL=3600
CACHE_MAX_ITEMS=1000
```

## 部署步骤
1. 连接GitHub仓库
2. 选择根目录: `flulink-mvp`
3. 构建命令: `npm run build`
4. 启动命令: `npm start`
5. 端口: 3000

## 功能验证
部署完成后，可以访问以下URL验证功能：

- **主页**: `https://your-app.zeabur.app/`
- **仪表板**: `https://your-app.zeabur.app/dashboard`
- **数据库管理**: `https://your-app.zeabur.app/dashboard?tab=database`
- **缓存管理**: `https://your-app.zeabur.app/dashboard?tab=cache`
- **监控系统**: `https://your-app.zeabur.app/dashboard?tab=monitoring`
- **权限管理**: `https://your-app.zeabur.app/dashboard?tab=permissions`

## 注意事项
- 确保Dockerfile使用Node.js 18
- 端口必须设置为3000
- 数据库连接字符串由Zeabur自动注入
- 所有功能都经过完整性测试
- 符合世界规则要求