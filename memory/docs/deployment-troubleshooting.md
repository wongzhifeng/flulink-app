# Zeabur部署故障排除指南

## 🚨 常见部署问题及解决方案

### 1. npm依赖问题

#### 问题症状
```
npm error Missing: debug@2.6.9 from lock file
npm error Missing: encodeurl@1.0.2 from lock file
npm error Invalid: lock file's media-typer@1.1.0 does not satisfy media-typer@0.3.0
```

#### 解决方案
```bash
# 1. 删除不匹配的package-lock.json
rm package-lock.json

# 2. 重新安装依赖
npm install

# 3. 提交新的package-lock.json
git add package-lock.json
git commit -m "fix: 更新package-lock.json"
git push origin main
```

### 2. 端口配置问题

#### 问题症状
```
Error: listen EADDRINUSE: address already in use :::3000
```

#### 解决方案
```javascript
// 在server文件中使用环境变量
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 3. 环境变量问题

#### 问题症状
```
Zion connection failed: Missing token
```

#### 解决方案
在Zeabur控制台配置环境变量：
- `ZION_TOKEN`: mg7edqye
- `ZION_PROJECT_ID`: QP7kZReZywL
- `PORT`: 3000
- `NODE_ENV`: production

### 4. 构建超时问题

#### 问题症状
```
Build timeout after 10 minutes
```

#### 解决方案
```dockerfile
# 优化Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔧 部署检查清单

### 部署前检查
- [ ] `package.json`配置正确
- [ ] `package-lock.json`与`package.json`匹配
- [ ] 主入口文件存在（`server-zion-ready.js`）
- [ ] 环境变量配置完整
- [ ] Dockerfile配置正确

### 部署后验证
- [ ] 服务健康检查通过
- [ ] API接口响应正常
- [ ] 微信验证接口可访问
- [ ] Zion连接状态正常

## 📊 当前部署状态

### ✅ 已修复问题
- **npm依赖冲突**: 删除并重新生成package-lock.json
- **主入口配置**: 更新为server-zion-ready.js
- **Docker配置**: 添加Dockerfile和.dockerignore
- **本地测试**: 服务启动正常

### 🎯 部署配置
**服务文件**: `server-zion-ready.js`
**依赖**: express@^4.18.2, cors@^2.8.5
**端口**: 3000
**环境**: production

### 🔗 验证接口
- **健康检查**: `GET /health`
- **API信息**: `GET /api/zion/info`
- **微信验证**: `GET /wechat/verify`
- **用户更新**: `POST /api/user/update`
- **毒株创建**: `POST /api/strain/create`

## 🚀 重新部署步骤

### 1. Zeabur控制台操作
1. 进入项目设置
2. 点击"重新部署"
3. 等待构建完成
4. 检查部署日志

### 2. 验证部署
```bash
# 健康检查
curl https://flulink-app.zeabur.app/health

# API信息
curl https://flulink-app.zeabur.app/api/zion/info

# 微信验证
curl https://flulink-app.zeabur.app/wechat/verify
```

### 3. 微信测试号配置
1. 访问微信公众平台测试号
2. 配置接口URL: `https://flulink-app.zeabur.app/wechat/verify`
3. 配置Token: `flulink_dealer_token_2024`
4. 点击提交验证

## 🔍 日志分析

### 构建日志关键词
- ✅ `npm ci` - 依赖安装成功
- ✅ `Server running on port 3000` - 服务启动成功
- ✅ `Zion Project ID: QP7kZReZywL` - Zion连接成功

### 错误日志关键词
- ❌ `npm error` - npm依赖问题
- ❌ `EADDRINUSE` - 端口占用问题
- ❌ `Missing token` - 环境变量问题
- ❌ `Build timeout` - 构建超时问题

## 📞 技术支持

### 常见问题
1. **依赖版本冲突**: 删除package-lock.json重新安装
2. **端口配置错误**: 使用环境变量PORT
3. **环境变量缺失**: 在Zeabur控制台配置
4. **构建超时**: 优化Dockerfile减少构建时间

### 联系信息
- **项目**: FluLink MVP
- **仓库**: https://gitee.com/hangzhou_thousand_army_wangzhifeng/flulink-app.git
- **域名**: flulink-app.zeabur.app
- **Zion项目**: QP7kZReZywL

---

**最后更新**: 2024年10月6日  
**状态**: npm依赖问题已修复，部署就绪  
**下一步**: 在Zeabur控制台重新部署
