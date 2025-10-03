# 项目模板规则

## 项目初始化流??
1. **项目命名**: 使用有意义的英文名称
2. **目录结构**: 遵循标准的前端项目结??
3. **配置文件**: 创建必要的配置文??
4. **依赖管理**: 使用 npm ??yarn 管理依赖
5. **代码规范**: 配置 ESLint ??Prettier

## 技术栈选择
### 前端框架
- **React**: 用于构建用户界面
- **Next.js**: 用于全栈应用开??
- **TypeScript**: 用于类型安全
- **Tailwind CSS**: 用于样式设计

### 状态管??
- **Zustand**: 轻量级状态管??
- **React Query**: 用于数据获取和缓??

### 开发工??
- **Cursor**: 主要开发环??
- **Claude**: AI 编程助手
- **DeepSeek**: AI API 服务

## 项目结构规范
```
project-name/
├── src/                    # 源代??
??  ├── app/               # Next.js App Router
??  ├── components/         # 可复用组??
??  ├── lib/               # 工具??
??  ├── types/             # TypeScript 类型
??  └── styles/            # 样式文件
├── docs/                  # 项目文档
├── memory/                # 记忆文件??
??  ├── rules/             # 规则
??  ├── preferences/       # 偏好
??  └── history/          # 历史
├── notes/                 # 开发笔??
├── prompts/               # AI 提示??
├── .gitignore             # Git 忽略文件
├── package.json           # 项目配置
├── tsconfig.json          # TypeScript 配置
├── tailwind.config.js     # Tailwind 配置
└── README.md              # 项目说明
```

## 开发规??
### 代码风格
- 使用 2 空格缩进
- 使用单引??
- 使用分号
- 使用 TypeScript 严格模式

### 命名规范
- 组件名使??PascalCase
- 文件名使??kebab-case
- 变量名使??camelCase
- 常量使用 UPPER_SNAKE_CASE

### 提交规范
- feat: 新功??
- fix: 修复问题
- docs: 文档更新
- style: 代码格式
- refactor: 重构
- test: 测试
- chore: 构建过程或辅助工具的变动

## 部署规范
### 环境配置
- 开发环?? localhost:3000
- 测试环境: staging.domain.com
- 生产环境: domain.com

### 构建流程
1. 代码检??(ESLint)
2. 类型检??(TypeScript)
3. 单元测试 (Jest)
4. 构建项目 (Next.js)
5. 部署到平??(Zeabur)

## 质量保证
### 测试要求
- 单元测试覆盖??> 80%
- 集成测试覆盖核心功能
- 端到端测试覆盖用户流??

### 性能要求
- 首屏加载时间 < 3??
- 页面切换时间 < 1??
- 包大??< 1MB
-  Lighthouse 分数 > 90

## 文档要求
### 必需文档
- README.md: 项目说明
- CHANGELOG.md: 更新日志
- CONTRIBUTING.md: 贡献指南
- LICENSE: 许可??

### 可选文??
- API.md: API 文档
- DEPLOYMENT.md: 部署指南
- TROUBLESHOOTING.md: 故障排除
- ROADMAP.md: 路线??











