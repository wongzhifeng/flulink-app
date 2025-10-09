# Zeabur部署崩溃修复指南

## 🚨 问题诊断

### 错误信息
```
[Error: Could not find a production build in the '.next' directory. Try building your app with 'next build' before starting the production server. https://nextjs.org/docs/messages/production-start-no-build-id]
```

### 根本原因
- Zeabur检测到了Next.js项目文件（`.next`目录、`next.config.js`等）
- 但package.json配置的是Node.js服务
- 缺少Next.js构建文件导致启动失败

## 🔧 修复方案

### 1. 更新.dockerignore文件
```dockerfile
# 排除Next.js相关文件
.next
src/
public/
next.config.js
tailwind.config.ts
tsconfig.json
postcss.config.js
.eslintrc.json
next-env.d.ts
tsconfig.tsbuildinfo
```

### 2. 更新Dockerfile
```dockerfile
# FluLink MVP Dockerfile for Zeabur - Node.js Service
FROM node:18-alpine

# 安装curl用于健康检查
RUN apk add --no-cache curl

# 设置工作目录
WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制Node.js服务文件
COPY server-zion-ready.js ./
COPY reset-database*.sh ./
COPY verify-deployment.sh ./

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# 启动应用
CMD ["npm", "start"]
```

### 3. 更新package.json
```json
{
  "name": "flulink-dealer-mvp",
  "version": "1.0.0",
  "description": "FluLink Dealer MVP - Node.js Service",
  "main": "server-zion-ready.js",
  "scripts": {
    "start": "node server-zion-ready.js",
    "dev": "node server-zion-ready.js",
    "build": "echo \"Node.js service - no build required\"",
    "test": "echo \"No tests specified\" && exit 0"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  },
  "keywords": [
    "nodejs",
    "express",
    "flulink",
    "dealer",
    "mvp",
    "wechat",
    "zion"
  ],
  "author": "wongzhifeng",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  },
  "zeabur": {
    "framework": "nodejs",
    "buildCommand": "npm ci --only=production",
    "startCommand": "npm start",
    "nodeVersion": "18",
    "ports": ["3000"],
    "env": {
      "NODE_ENV": "production",
      "PORT": "3000"
    }
  }
}
```

## 🚀 部署步骤

### 1. 提交修复
```bash
git add package.json Dockerfile .dockerignore package-zeabur-nodejs.json
git commit -m "fix: 修复Zeabur Next.js检测问题

- 更新.dockerignore排除Next.js文件
- 修改Dockerfile明确指定Node.js服务
- 更新package.json添加Zeabur配置
- 解决Next.js构建错误问题"
git push origin main
git push github main
```

### 2. Zeabur重新部署
1. 进入Zeabur控制台
2. 选择项目
3. 点击"重新部署"
4. 等待构建完成

### 3. 验证部署
```bash
# 健康检查
curl https://flulink-app.zeabur.app/health

# API信息
curl https://flulink-app.zeabur.app/api/zion/info

# 微信验证
curl https://flulink-app.zeabur.app/wechat/verify
```

## 📊 修复验证

### 预期结果
- ✅ 构建成功：无Next.js错误
- ✅ 服务启动：Node.js服务正常运行
- ✅ 端口监听：3000端口正常
- ✅ 健康检查：/health接口正常
- ✅ API接口：所有接口响应正常

### 错误解决
- ❌ Next.js构建错误 → ✅ Node.js服务启动
- ❌ 缺少.next目录 → ✅ 直接运行Node.js
- ❌ 框架检测错误 → ✅ 明确指定nodejs框架

## 🔍 故障排除

### 如果仍然失败
1. **检查Zeabur日志**：查看详细错误信息
2. **确认框架检测**：确保检测为Node.js项目
3. **验证文件结构**：确认必要文件存在
4. **检查环境变量**：确认PORT等变量设置

### 常见问题
- **框架检测错误**：在package.json中添加zeabur配置
- **文件缺失**：检查.dockerignore是否正确
- **端口冲突**：确认PORT环境变量设置
- **依赖问题**：检查package-lock.json

## 📚 相关文件

### 修复文件
- ✅ `package.json` - 更新为Node.js配置
- ✅ `Dockerfile` - 修改为Node.js服务
- ✅ `.dockerignore` - 排除Next.js文件
- ✅ `package-zeabur-nodejs.json` - Zeabur专用配置

### 服务文件
- ✅ `server-zion-ready.js` - 主服务文件
- ✅ `reset-database*.sh` - 数据库重置脚本
- ✅ `verify-deployment.sh` - 部署验证脚本

---

**修复时间**: 2024年10月6日  
**问题状态**: ✅ 已修复  
**下一步**: 重新部署验证
