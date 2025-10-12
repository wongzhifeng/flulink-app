# FluLink项目Zeabur部署指南
**基于《德道经》"无为而治"哲学的部署策略**

## 🚀 部署准备

### 1. 环境要求
- Zeabur账户
- Turso数据库账户
- GitHub仓库

### 2. 数据库配置
1. 在Turso控制台创建数据库
2. 获取数据库URL和认证Token
3. 配置环境变量

### 3. 环境变量设置
```bash
# 在Zeabur项目设置中配置以下环境变量
TURSO_DATABASE_URL=libsql://your-database-url.turso.io
TURSO_AUTH_TOKEN=your-auth-token
TURSO_SYNC_URL=https://your-sync-url.turso.io
NODE_ENV=production
```

## 📦 部署步骤

### 方法1：通过Zeabur控制台
1. 登录Zeabur控制台
2. 点击"New Project"
3. 选择"Deploy from GitHub"
4. 选择FluLink仓库
5. 配置环境变量
6. 点击"Deploy"

### 方法2：通过Zeabur CLI
```bash
# 安装Zeabur CLI
npm install -g @zeabur/cli

# 登录
zeabur login

# 部署
zeabur deploy
```

## 🔧 部署配置

### zeabur.yaml配置
```yaml
name: flulink
runtime: bun
build: bun install && bun run build
start: bun run start
port: 3000
```

### 健康检查
- 路径：`/api/health`
- 间隔：30秒
- 超时：10秒
- 重试：3次

## 📊 监控和调试

### 1. 日志查看
```bash
# 查看实时日志
zeabur logs --follow

# 查看特定服务日志
zeabur logs --service flulink
```

### 2. 健康检查
```bash
# 检查服务状态
curl https://your-app.zeabur.app/api/health

# 预期响应
{
  "status": "healthy",
  "timestamp": "2025-01-12T17:30:00.000Z",
  "uptime": 3600,
  "responseTime": "45.67ms",
  "services": {
    "database": "healthy",
    "api": "healthy",
    "cache": "healthy"
  }
}
```

### 3. 性能监控
- 响应时间 <200ms
- 内存使用 <512MB
- CPU使用 <50%
- 数据库连接 <1000

## 🐛 故障排除

### 常见问题

#### 1. 数据库连接失败
```bash
# 检查环境变量
zeabur env list

# 重新配置数据库
zeabur env set TURSO_DATABASE_URL=your-new-url
```

#### 2. 构建失败
```bash
# 检查构建日志
zeabur logs --build

# 常见原因：
# - 依赖安装失败
# - TypeScript编译错误
# - 环境变量缺失
```

#### 3. 运行时错误
```bash
# 查看运行时日志
zeabur logs --runtime

# 检查健康状态
curl https://your-app.zeabur.app/api/health
```

## 🔄 更新部署

### 自动部署
- 推送到main分支自动触发部署
- 支持预览部署（PR部署）

### 手动部署
```bash
# 重新部署
zeabur redeploy

# 回滚到上一版本
zeabur rollback
```

## 📈 性能优化

### 1. 边缘计算优化
- 使用Turso边缘数据库
- 配置CDN加速
- 启用压缩

### 2. 缓存策略
- API响应缓存
- 静态资源缓存
- 数据库查询缓存

### 3. 监控告警
- 设置性能阈值告警
- 配置错误率告警
- 监控资源使用情况

## 🎯 部署验证

### 功能测试
```bash
# 测试API端点
curl https://your-app.zeabur.app/api/strains
curl https://your-app.zeabur.app/api/health

# 测试前端页面
open https://your-app.zeabur.app
```

### 性能测试
```bash
# 压力测试
ab -n 1000 -c 10 https://your-app.zeabur.app/api/strains

# 预期结果：
# - 平均响应时间 <200ms
# - 成功率 >99%
# - 无内存泄漏
```

## 📝 部署清单

- [ ] 环境变量配置完成
- [ ] 数据库连接测试通过
- [ ] 构建成功无错误
- [ ] 健康检查通过
- [ ] API端点测试通过
- [ ] 前端页面正常显示
- [ ] 性能指标符合要求
- [ ] 监控告警配置完成

## 🎉 部署完成

部署成功后，FluLink项目将在Zeabur平台上运行，具备：
- 全球边缘计算能力
- 高可用性保障
- 自动扩缩容
- 实时监控
- 快速部署更新

**恭喜！FluLink项目已成功部署到生产环境！** 🚀
