# Contributing to FluLink

## 🎯 贡献指南

欢迎为FluLink项目贡献代码！请遵循以下指南确保协作和谐高效。

## 🌍 世界规则

所有贡献必须遵循《德道经》+第一性原理世界规则：

- **回归本质**: 专注社交核心功能，避免过度复杂化
- **遵循自然规律**: 实现符合自然规律，用户行为自然
- **追求简约与平衡**: 设计简约而不简单，功能平衡
- **敢作敢当的谦下精神**: 敢于创新但保持谦逊

## 🚀 快速开始

### 1. Fork和克隆
```bash
# Fork仓库到你的GitHub账户
# 然后克隆到本地
git clone https://github.com/your-username/flulink-app.git
cd flulink-app

# 添加上游仓库
git remote add upstream https://github.com/wongzhifeng/flulink-app.git
```

### 2. 安装依赖
```bash
npm install
```

### 3. 创建分支
```bash
git checkout develop
git pull upstream develop
git checkout -b feature/your-feature-name
```

## 📝 开发流程

### 1. 代码规范
- 使用TypeScript
- 遵循ESLint规则
- 编写清晰的注释
- 保持代码简洁

### 2. 提交信息规范
```
<type>(<scope>): <subject>

<body>

<footer>
```

类型：
- `feat`: 新功能
- `fix`: 修复问题
- `docs`: 文档更新
- `style`: 代码格式
- `refactor`: 重构
- `test`: 测试
- `chore`: 构建工具

示例：
```
feat(notification): 添加推送通知系统

- ✅ 实现通知模板管理
- ✅ 添加用户通知设置
- ✅ 遵循世界规则：回归本质

Closes #123
```

### 3. 世界规则检查
每个PR必须通过世界规则符合性检查：

- [ ] 回归本质：功能是否符合社交本质需求？
- [ ] 遵循自然规律：实现是否符合自然规律？
- [ ] 追求简约与平衡：设计是否简约平衡？
- [ ] 敢作敢当：是否敢于创新和承担责任？
- [ ] 保持谦逊：是否保持学习态度？

## 🔄 Pull Request流程

### 1. 创建PR
- 标题格式：`<type>: <description>`
- 详细描述变更内容
- 说明世界规则符合性
- 关联相关Issue

### 2. 代码审查
- 至少需要2个核心开发者审查
- 必须通过CI检查
- 必须符合世界规则
- 必须更新相关文档

### 3. 合并规则
- 审查通过后才能合并
- 保持提交历史清晰
- 更新CHANGELOG.md

## 🧪 测试要求

### 1. 本地测试
```bash
# 类型检查
npx tsc --noEmit

# 代码检查
npm run lint

# 构建测试
npm run build

# 功能测试
npm test
```

### 2. 测试覆盖
- 新功能必须有测试
- 修复问题必须有回归测试
- 测试覆盖率不低于80%

## 📚 文档要求

### 1. 代码文档
- 复杂函数必须有注释
- API接口必须有文档
- 组件必须有使用示例

### 2. 更新文档
- 新功能必须更新README
- API变更必须更新API文档
- 重要变更必须更新CHANGELOG

## 🏷️ Issue规范

### 1. Issue类型
- `bug`: 问题报告
- `feature`: 功能请求
- `enhancement`: 功能增强
- `documentation`: 文档更新
- `question`: 问题咨询

### 2. Issue模板
```markdown
## 问题描述
简要描述问题或需求

## 世界规则符合性
- [ ] 回归本质
- [ ] 遵循自然规律
- [ ] 追求简约与平衡
- [ ] 敢作敢当的谦下精神

## 预期行为
描述期望的行为

## 实际行为
描述实际的行为

## 环境信息
- 操作系统：
- 浏览器：
- 版本：
```

## 🎯 开发重点

### 1. 核心功能
- 用户认证系统
- 毒株创建与传播
- 地理热力图
- 标签匹配系统
- 免疫系统

### 2. 技术栈
- Next.js 15.5.4
- TypeScript
- Tailwind CSS v3.4.17
- Radix UI
- React 19.1.0

### 3. 部署要求
- 必须支持Zeabur部署
- 使用端口3000
- Docker配置完整
- 环境变量安全

## 📞 联系方式

- 项目维护者：@wongzhifeng
- 讨论区：GitHub Discussions
- 问题报告：GitHub Issues

## 📄 许可证

本项目采用MIT许可证，详见LICENSE文件。

感谢您的贡献！🙏

## 🎯 贡献指南

欢迎为FluLink项目贡献代码！请遵循以下指南确保协作和谐高效。

## 🌍 世界规则

所有贡献必须遵循《德道经》+第一性原理世界规则：

- **回归本质**: 专注社交核心功能，避免过度复杂化
- **遵循自然规律**: 实现符合自然规律，用户行为自然
- **追求简约与平衡**: 设计简约而不简单，功能平衡
- **敢作敢当的谦下精神**: 敢于创新但保持谦逊

## 🚀 快速开始

### 1. Fork和克隆
```bash
# Fork仓库到你的GitHub账户
# 然后克隆到本地
git clone https://github.com/your-username/flulink-app.git
cd flulink-app

# 添加上游仓库
git remote add upstream https://github.com/wongzhifeng/flulink-app.git
```

### 2. 安装依赖
```bash
npm install
```

### 3. 创建分支
```bash
git checkout develop
git pull upstream develop
git checkout -b feature/your-feature-name
```

## 📝 开发流程

### 1. 代码规范
- 使用TypeScript
- 遵循ESLint规则
- 编写清晰的注释
- 保持代码简洁

### 2. 提交信息规范
```
<type>(<scope>): <subject>

<body>

<footer>
```

类型：
- `feat`: 新功能
- `fix`: 修复问题
- `docs`: 文档更新
- `style`: 代码格式
- `refactor`: 重构
- `test`: 测试
- `chore`: 构建工具

示例：
```
feat(notification): 添加推送通知系统

- ✅ 实现通知模板管理
- ✅ 添加用户通知设置
- ✅ 遵循世界规则：回归本质

Closes #123
```

### 3. 世界规则检查
每个PR必须通过世界规则符合性检查：

- [ ] 回归本质：功能是否符合社交本质需求？
- [ ] 遵循自然规律：实现是否符合自然规律？
- [ ] 追求简约与平衡：设计是否简约平衡？
- [ ] 敢作敢当：是否敢于创新和承担责任？
- [ ] 保持谦逊：是否保持学习态度？

## 🔄 Pull Request流程

### 1. 创建PR
- 标题格式：`<type>: <description>`
- 详细描述变更内容
- 说明世界规则符合性
- 关联相关Issue

### 2. 代码审查
- 至少需要2个核心开发者审查
- 必须通过CI检查
- 必须符合世界规则
- 必须更新相关文档

### 3. 合并规则
- 审查通过后才能合并
- 保持提交历史清晰
- 更新CHANGELOG.md

## 🧪 测试要求

### 1. 本地测试
```bash
# 类型检查
npx tsc --noEmit

# 代码检查
npm run lint

# 构建测试
npm run build

# 功能测试
npm test
```

### 2. 测试覆盖
- 新功能必须有测试
- 修复问题必须有回归测试
- 测试覆盖率不低于80%

## 📚 文档要求

### 1. 代码文档
- 复杂函数必须有注释
- API接口必须有文档
- 组件必须有使用示例

### 2. 更新文档
- 新功能必须更新README
- API变更必须更新API文档
- 重要变更必须更新CHANGELOG

## 🏷️ Issue规范

### 1. Issue类型
- `bug`: 问题报告
- `feature`: 功能请求
- `enhancement`: 功能增强
- `documentation`: 文档更新
- `question`: 问题咨询

### 2. Issue模板
```markdown
## 问题描述
简要描述问题或需求

## 世界规则符合性
- [ ] 回归本质
- [ ] 遵循自然规律
- [ ] 追求简约与平衡
- [ ] 敢作敢当的谦下精神

## 预期行为
描述期望的行为

## 实际行为
描述实际的行为

## 环境信息
- 操作系统：
- 浏览器：
- 版本：
```

## 🎯 开发重点

### 1. 核心功能
- 用户认证系统
- 毒株创建与传播
- 地理热力图
- 标签匹配系统
- 免疫系统

### 2. 技术栈
- Next.js 15.5.4
- TypeScript
- Tailwind CSS v3.4.17
- Radix UI
- React 19.1.0

### 3. 部署要求
- 必须支持Zeabur部署
- 使用端口3000
- Docker配置完整
- 环境变量安全

## 📞 联系方式

- 项目维护者：@wongzhifeng
- 讨论区：GitHub Discussions
- 问题报告：GitHub Issues

## 📄 许可证

本项目采用MIT许可证，详见LICENSE文件。

感谢您的贡献！🙏


