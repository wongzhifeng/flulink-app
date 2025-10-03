# FluLink 开发者协作信息

## 🎯 当前开发状态 (实时更新)

### 📊 项目概览
- **项目**: FluLink MVP - 异步社交APP
- **版本**: v1.0.0
- **阶段**: MVP完成，进入扩展开发
- **完成度**: 19/19 核心功能 (100%)
- **部署**: ✅ Zeabur (https://flulink-app.zeabur.app)

### 👨‍💻 当前开发者状态
- **开发者**: wongzhifeng
- **状态**: 可用 (等待新任务)
- **当前任务**: 无
- **工作分支**: main
- **最后活动**: 2025-01-27T12:00:00Z
- **环境**: Windows 10 + Cursor + Node.js 18

## 🔄 任务队列

### 🚀 高优先级任务
1. **FluLink-Notification-Push** - 推送通知系统
   - 状态: 待开发
   - 预计工作量: 2-3天
   - 测试可见性: A级 (用户直接可见)
   - 世界规则: ✅ 符合

2. **FluLink-Performance-Optimization** - 性能优化
   - 状态: 待开发
   - 预计工作量: 1-2天
   - 测试可见性: A级 (用户直接可见)
   - 世界规则: ✅ 符合

### 🔧 中优先级任务
3. **FluLink-Testing-Basic** - 基础测试系统
   - 状态: 待开发
   - 预计工作量: 1-2天
   - 测试可见性: B级 (数据/日志可见)
   - 世界规则: ⚠️ 需要评估

## 🛠️ 开发环境信息

### 💻 技术栈
- **前端**: Next.js 15.5.4 + TypeScript + Tailwind CSS v3.4.17
- **UI库**: Radix UI
- **部署**: Zeabur + Docker
- **数据库**: PostgreSQL (模拟)
- **缓存**: Redis (模拟)

### 🔧 开发工具
- **编辑器**: Cursor
- **包管理器**: npm
- **版本控制**: Git
- **CI/CD**: GitHub Actions

### 📁 关键目录
- `src/app/` - Next.js App Router
- `src/components/` - React组件
- `src/lib/` - 工具函数和服务
- `src/types/` - TypeScript类型定义
- `scripts/` - 脚本文件
- `.github/` - GitHub配置
- `memory/` - 记忆库系统

## 🌍 世界规则 (必须遵循)

### 📋 检查清单
每个功能开发前必须通过以下检查：

- [ ] **回归本质**: 功能是否符合社交本质需求？
- [ ] **遵循自然规律**: 实现是否符合自然规律？
- [ ] **追求简约与平衡**: 设计是否简约平衡？
- [ ] **敢作敢当**: 是否敢于创新和承担责任？
- [ ] **保持谦逊**: 是否保持学习态度？

### 🎯 世界规则应用
- **回归本质**: 专注社交核心功能，避免过度复杂化
- **遵循自然规律**: 实现符合自然规律，用户行为自然
- **追求简约与平衡**: 设计简约而不简单，功能平衡
- **敢作敢当的谦下精神**: 敢于创新但保持谦逊

## 🤝 协作流程

### 🔄 开发流程
1. **同步代码**: `git pull origin main`
2. **创建分支**: `git checkout -b feature/功能名称`
3. **开发功能**: 遵循世界规则检查
4. **提交代码**: `git commit -m "feat: 功能描述"`
5. **推送分支**: `git push origin feature/功能名称`
6. **创建PR**: 使用PR模板
7. **代码审查**: 至少2个开发者审查
8. **合并代码**: 审查通过后合并

### 📝 代码规范
- **提交信息**: 使用约定式提交格式
- **代码风格**: ESLint + Prettier
- **类型检查**: TypeScript严格模式
- **测试要求**: 新功能必须有测试
- **文档要求**: 重要变更必须更新文档

## 🚨 重要注意事项

### ⚠️ 开发要求
1. **端口配置**: 必须使用端口3000 (Zeabur要求)
2. **依赖版本**: 使用稳定版本，避免实验性版本
3. **世界规则**: 每个功能必须通过世界规则检查
4. **部署测试**: 新功能必须测试Zeabur部署

### 🔒 安全要求
1. **环境变量**: 敏感信息使用环境变量
2. **代码审查**: 所有代码必须经过审查
3. **权限控制**: 遵循最小权限原则
4. **数据保护**: 用户数据安全保护

## 📞 联系信息

### 🆘 获取帮助
- **技术问题**: 创建GitHub Issue
- **协作问题**: 使用GitHub Discussions
- **紧急问题**: 直接联系主开发者

### 📚 相关文档
- **开发任务**: [DEVELOPMENT_TASKS.md](./DEVELOPMENT_TASKS.md)
- **贡献指南**: [CONTRIBUTING.md](./CONTRIBUTING.md)
- **部署指南**: [ZEABUR_DEPLOYMENT.md](./ZEABUR_DEPLOYMENT.md)
- **世界规则**: [memory/rules/world-rules.md](./memory/rules/world-rules.md)
- **协作规则**: [.github/BRANCH_PROTECTION.md](./.github/BRANCH_PROTECTION.md)

## 🔧 常用命令

### 开发命令
```bash
# 启动开发服务器
npm run dev

# 构建项目
npm run build

# 代码检查
npm run lint

# 类型检查
npm run type-check

# 世界规则检查
npm run world-rules-check

# 更新开发者状态
npm run update-status
```

### Git 命令
```bash
# 同步最新代码
git pull origin main

# 创建功能分支
git checkout -b feature/功能名称

# 提交代码
git add .
git commit -m "feat: 功能描述"

# 推送分支
git push origin feature/功能名称
```

## 📊 项目状态监控

### 🎯 关键指标
- **MVP完成度**: 100% (19/19)
- **部署状态**: ✅ 成功
- **测试覆盖**: 待完善
- **性能指标**: 待优化
- **用户反馈**: 待收集

### 📈 进度跟踪
- **当前阶段**: 扩展开发
- **下一里程碑**: 推送通知系统
- **预计完成**: 根据任务优先级
- **风险评估**: 低风险

---

**最后更新**: 2025-01-27  
**更新者**: wongzhifeng  
**状态**: 实时更新中

## 🎯 当前开发状态 (实时更新)

### 📊 项目概览
- **项目**: FluLink MVP - 异步社交APP
- **版本**: v1.0.0
- **阶段**: MVP完成，进入扩展开发
- **完成度**: 19/19 核心功能 (100%)
- **部署**: ✅ Zeabur (https://flulink-app.zeabur.app)

### 👨‍💻 当前开发者状态
- **开发者**: wongzhifeng
- **状态**: 可用 (等待新任务)
- **当前任务**: 无
- **工作分支**: main
- **最后活动**: 2025-01-27T12:00:00Z
- **环境**: Windows 10 + Cursor + Node.js 18

## 🔄 任务队列

### 🚀 高优先级任务
1. **FluLink-Notification-Push** - 推送通知系统
   - 状态: 待开发
   - 预计工作量: 2-3天
   - 测试可见性: A级 (用户直接可见)
   - 世界规则: ✅ 符合

2. **FluLink-Performance-Optimization** - 性能优化
   - 状态: 待开发
   - 预计工作量: 1-2天
   - 测试可见性: A级 (用户直接可见)
   - 世界规则: ✅ 符合

### 🔧 中优先级任务
3. **FluLink-Testing-Basic** - 基础测试系统
   - 状态: 待开发
   - 预计工作量: 1-2天
   - 测试可见性: B级 (数据/日志可见)
   - 世界规则: ⚠️ 需要评估

## 🛠️ 开发环境信息

### 💻 技术栈
- **前端**: Next.js 15.5.4 + TypeScript + Tailwind CSS v3.4.17
- **UI库**: Radix UI
- **部署**: Zeabur + Docker
- **数据库**: PostgreSQL (模拟)
- **缓存**: Redis (模拟)

### 🔧 开发工具
- **编辑器**: Cursor
- **包管理器**: npm
- **版本控制**: Git
- **CI/CD**: GitHub Actions

### 📁 关键目录
- `src/app/` - Next.js App Router
- `src/components/` - React组件
- `src/lib/` - 工具函数和服务
- `src/types/` - TypeScript类型定义
- `scripts/` - 脚本文件
- `.github/` - GitHub配置
- `memory/` - 记忆库系统

## 🌍 世界规则 (必须遵循)

### 📋 检查清单
每个功能开发前必须通过以下检查：

- [ ] **回归本质**: 功能是否符合社交本质需求？
- [ ] **遵循自然规律**: 实现是否符合自然规律？
- [ ] **追求简约与平衡**: 设计是否简约平衡？
- [ ] **敢作敢当**: 是否敢于创新和承担责任？
- [ ] **保持谦逊**: 是否保持学习态度？

### 🎯 世界规则应用
- **回归本质**: 专注社交核心功能，避免过度复杂化
- **遵循自然规律**: 实现符合自然规律，用户行为自然
- **追求简约与平衡**: 设计简约而不简单，功能平衡
- **敢作敢当的谦下精神**: 敢于创新但保持谦逊

## 🤝 协作流程

### 🔄 开发流程
1. **同步代码**: `git pull origin main`
2. **创建分支**: `git checkout -b feature/功能名称`
3. **开发功能**: 遵循世界规则检查
4. **提交代码**: `git commit -m "feat: 功能描述"`
5. **推送分支**: `git push origin feature/功能名称`
6. **创建PR**: 使用PR模板
7. **代码审查**: 至少2个开发者审查
8. **合并代码**: 审查通过后合并

### 📝 代码规范
- **提交信息**: 使用约定式提交格式
- **代码风格**: ESLint + Prettier
- **类型检查**: TypeScript严格模式
- **测试要求**: 新功能必须有测试
- **文档要求**: 重要变更必须更新文档

## 🚨 重要注意事项

### ⚠️ 开发要求
1. **端口配置**: 必须使用端口3000 (Zeabur要求)
2. **依赖版本**: 使用稳定版本，避免实验性版本
3. **世界规则**: 每个功能必须通过世界规则检查
4. **部署测试**: 新功能必须测试Zeabur部署

### 🔒 安全要求
1. **环境变量**: 敏感信息使用环境变量
2. **代码审查**: 所有代码必须经过审查
3. **权限控制**: 遵循最小权限原则
4. **数据保护**: 用户数据安全保护

## 📞 联系信息

### 🆘 获取帮助
- **技术问题**: 创建GitHub Issue
- **协作问题**: 使用GitHub Discussions
- **紧急问题**: 直接联系主开发者

### 📚 相关文档
- **开发任务**: [DEVELOPMENT_TASKS.md](./DEVELOPMENT_TASKS.md)
- **贡献指南**: [CONTRIBUTING.md](./CONTRIBUTING.md)
- **部署指南**: [ZEABUR_DEPLOYMENT.md](./ZEABUR_DEPLOYMENT.md)
- **世界规则**: [memory/rules/world-rules.md](./memory/rules/world-rules.md)
- **协作规则**: [.github/BRANCH_PROTECTION.md](./.github/BRANCH_PROTECTION.md)

## 🔧 常用命令

### 开发命令
```bash
# 启动开发服务器
npm run dev

# 构建项目
npm run build

# 代码检查
npm run lint

# 类型检查
npm run type-check

# 世界规则检查
npm run world-rules-check

# 更新开发者状态
npm run update-status
```

### Git 命令
```bash
# 同步最新代码
git pull origin main

# 创建功能分支
git checkout -b feature/功能名称

# 提交代码
git add .
git commit -m "feat: 功能描述"

# 推送分支
git push origin feature/功能名称
```

## 📊 项目状态监控

### 🎯 关键指标
- **MVP完成度**: 100% (19/19)
- **部署状态**: ✅ 成功
- **测试覆盖**: 待完善
- **性能指标**: 待优化
- **用户反馈**: 待收集

### 📈 进度跟踪
- **当前阶段**: 扩展开发
- **下一里程碑**: 推送通知系统
- **预计完成**: 根据任务优先级
- **风险评估**: 低风险

---

**最后更新**: 2025-01-27  
**更新者**: wongzhifeng  
**状态**: 实时更新中


