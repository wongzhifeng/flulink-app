# FluLink Zeabur部署指南

## 🚀 云端开发模式

本项目采用云端开发模式：
- **本地**: 仅用于Cursor开发
- **测试**: 在Zeabur上进行
- **部署**: 直接推送到Gitee，自动部署到Zeabur

## 📋 部署步骤

### 1. 连接Gitee仓库到Zeabur

1. 登录 [Zeabur](https://zeabur.com)
2. 点击 "New Project"
3. 选择 "Import from Git"
4. 连接Gitee账户
5. 选择仓库: `hangzhou_thousand_army_wangzhifeng/flulink-app`

### 2. 配置服务

#### 后端服务配置
- **服务名称**: `flulink-backend`
- **构建方式**: Dockerfile
- **Dockerfile路径**: `flulink/backend/Dockerfile`
- **端口**: 8080

#### 环境变量配置
```bash
NODE_ENV=production
PORT=8080
MONGODB_URI=mongodb://mongodb:27017/flulink
REDIS_URL=redis://redis:6379
JWT_SECRET=your-super-secret-jwt-key-here
CORS_ORIGIN=https://your-frontend-domain.com
```

### 3. 数据库服务

#### MongoDB
- **服务类型**: MongoDB
- **服务名称**: `mongodb`
- **版本**: Latest
- **数据库名**: `flulink`

#### Redis
- **服务类型**: Redis
- **服务名称**: `redis`
- **版本**: Latest

### 4. 域名配置

1. 在Zeabur项目设置中添加自定义域名
2. 配置SSL证书（自动）
3. 设置环境变量中的CORS_ORIGIN

## 🔧 本地开发流程

### 开发步骤
1. 在Cursor中编辑代码
2. 测试代码语法和逻辑
3. 提交到本地Git
4. 推送到Gitee: `git push origin main`
5. Zeabur自动构建和部署

### 代码推送命令
```bash
# 添加更改
git add .

# 提交更改
git commit -m "描述更改内容"

# 推送到Gitee（触发Zeabur部署）
git push origin main
```

## 📊 部署监控

### 查看部署状态
1. 登录Zeabur控制台
2. 选择项目
3. 查看服务状态和日志

### 健康检查
- **端点**: `https://your-domain.com/api/health`
- **检查间隔**: 30秒
- **超时时间**: 3秒

## 🛠️ 故障排除

### 常见问题

#### 1. 构建失败
- 检查Dockerfile语法
- 确认package.json依赖
- 查看构建日志

#### 2. 服务启动失败
- 检查环境变量配置
- 确认数据库连接
- 查看服务日志

#### 3. 数据库连接问题
- 确认MongoDB和Redis服务状态
- 检查连接字符串
- 验证网络配置

### 日志查看
```bash
# 在Zeabur控制台查看实时日志
# 或使用Zeabur CLI
zeabur logs --service flulink-backend
```

## 🎯 部署检查清单

- [ ] Gitee仓库连接成功
- [ ] Dockerfile构建通过
- [ ] 环境变量配置正确
- [ ] MongoDB服务运行
- [ ] Redis服务运行
- [ ] 后端服务健康检查通过
- [ ] 自定义域名配置
- [ ] SSL证书生效
- [ ] API端点可访问

## 📈 性能优化

### 资源配置
- **CPU**: 1核心（可根据需要调整）
- **内存**: 512MB（可根据需要调整）
- **存储**: 1GB（可根据需要调整）

### 监控设置
- 启用性能监控
- 设置告警阈值
- 配置日志保留策略

## 🔄 持续部署

### 自动部署
- 推送到main分支自动触发部署
- 支持分支部署（开发/测试环境）
- 支持回滚到之前版本

### 部署策略
- **蓝绿部署**: 零停机时间
- **滚动更新**: 渐进式更新
- **金丝雀发布**: 小流量测试

## 📞 支持

如遇到部署问题，请：
1. 查看Zeabur文档
2. 检查服务日志
3. 联系技术支持

---

**注意**: 本指南基于Zeabur平台特性编写，具体操作可能因平台更新而有所变化。