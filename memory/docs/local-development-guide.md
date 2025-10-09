# FluLink 本地开发指南

## 🎯 云端开发模式

本项目采用**云端开发模式**，本地仅用于代码编辑和版本控制：

- ✅ **本地**: Cursor开发 + Git版本控制
- ✅ **云端**: Zeabur测试 + 部署 + 运行
- ❌ **本地**: 不运行测试服务器

## 🛠️ 本地开发环境

### 必需工具
- **Cursor**: 代码编辑器
- **Git**: 版本控制
- **Node.js**: 用于语法检查和依赖管理（不运行服务）

### 可选工具
- **Docker**: 本地测试（可选）
- **MongoDB Compass**: 数据库管理（可选）

## 📝 开发流程

### 1. 代码编辑
```bash
# 在Cursor中编辑代码
# 使用内置的语法检查和智能提示
```

### 2. 本地验证
```bash
# 检查语法
cd flulink/backend
node -c src/index.js

# 检查依赖
npm install --dry-run
```

### 3. 提交代码
```bash
# 添加更改
git add .

# 提交更改
git commit -m "功能描述"

# 推送到Gitee（触发Zeabur自动部署）
git push origin main
```

## 🚫 本地不运行的服务

以下服务**不应**在本地运行：
- ❌ Mock服务器 (`npm run test:mock`)
- ❌ 后端API服务器 (`npm start`)
- ❌ MongoDB数据库
- ❌ Redis缓存服务

## ✅ 本地可以做的事情

- ✅ 代码编辑和重构
- ✅ 语法检查和类型检查
- ✅ 代码格式化
- ✅ Git版本控制
- ✅ 依赖管理
- ✅ 文档编写

## 🔧 本地开发配置

### package.json脚本使用
```bash
# ✅ 可以使用
npm run lint          # 代码检查
npm run format        # 代码格式化
npm run build         # 构建检查
npm install           # 依赖安装

# ❌ 不要使用
npm start             # 不运行服务器
npm run test:mock     # 不运行Mock服务器
npm run test:api      # 不运行API测试
```

### 环境变量
本地不需要配置以下环境变量：
- `MONGODB_URI`
- `REDIS_URL`
- `JWT_SECRET`
- `CORS_ORIGIN`

## 🌐 云端测试和部署

### 测试流程
1. 推送代码到Gitee
2. Zeabur自动构建和部署
3. 访问 `https://flulink-app.zeabur.app/api/health` 检查服务
4. 使用Postman或curl测试API

### 部署监控
- **Zeabur控制台**: 查看构建和部署状态
- **服务日志**: 实时查看应用日志
- **健康检查**: 自动监控服务状态

## 📊 开发效率优化

### Cursor配置
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

### Git配置
```bash
# 设置快速推送
git config --global push.default simple

# 设置自动拉取
git config --global pull.rebase false
```

## 🚀 快速开发命令

### 常用命令组合
```bash
# 完整开发流程
git add . && git commit -m "更新功能" && git push origin main

# 检查代码质量
npm run lint && npm run format

# 检查构建
npm run build
```

## 🔍 调试和问题排查

### 本地调试
- 使用Cursor的调试功能
- 检查语法错误
- 验证代码逻辑

### 云端调试
- 查看Zeabur构建日志
- 检查服务运行日志
- 监控API响应

## 📈 性能优化

### 代码优化
- 使用Cursor的智能重构
- 优化算法复杂度
- 减少不必要的依赖

### 部署优化
- 优化Dockerfile
- 配置资源限制
- 启用缓存策略

## 🎯 最佳实践

1. **小步快跑**: 频繁提交和推送
2. **代码质量**: 使用lint和format工具
3. **文档同步**: 及时更新文档
4. **版本管理**: 使用语义化版本号
5. **云端优先**: 优先在云端测试

## 📞 支持

如遇到开发问题：
1. 检查Cursor设置
2. 查看Git状态
3. 检查Zeabur部署日志
4. 联系技术支持

---

**记住**: 本地只开发，云端来运行！
