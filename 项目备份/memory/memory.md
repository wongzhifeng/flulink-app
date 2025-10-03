# 项目长期记忆档案

## 项目概述
**项目名称**: 异步社交APP「FluLink流感」  
**项目目标**: 以"流感传播"为隐喻，构建"内容/情绪/兴趣的异步扩散型社交"，通过"地理层级传播+标签双向筛选+付费/免费用户共生"机制，实现"轻互动、慢扩散、强关联"
**Slogan**: Spread like flu, link every corner you care. / 如流感般扩散，连接你在意的每个角落  
**当前状态**: 核心功能开发完成，FluLink MVP已部署到Zeabur云端  
**技术栈**: Cursor + React/Next.js + Zeabur部署 + Zion服务 + MCP增强（最小化原型）  

## 项目进展
- 📋 **项目状态**: 核心功能开发完成，FluLink MVP已部署到Zeabur云端
- 🎯 **当前任务**: 完善用户系统和数据表创建，优化用户体验
- 🌐 **部署地址**: https://flulink-app.zeabur.app
- 📚 **记忆库**: 已保存完整概念文档，MCP集成指南已创建
- 📄 **核心文档**: memory/docs/flulink.md
- 🔧 **MCP服务**: 4个核心MCP服务已集成（Zion + Repomix + Sequential-Thinking + Interactive-Feedback）
- 🦠 **核心功能**: 地理层级传播机制、四种毒株类型、标签系统、传播半径控制

## 项目总结
- 🎯 **开发经验**: 社交产品设计经验 + MCP服务集成经验
- 📱 **技术栈**: Cursor + React/Next.js + Zeabur部署 + Zion服务 + MCP增强
- 🔧 **工具使用**: 云原生开发工具链 + Zion插件服务 + MCP智能增强
- 📚 **知识积累**: 异步社交、地理传播、用户分层设计、MCP服务集成

## 快速启用指南

### 方法一：直接复制启用（推荐）
1. **直接复制**：将整个memory文件夹复制到项目根目录
2. **自动项目分析**：运行 `.\memory\analyze-project.ps1` 自动分析项目
3. **AI Agent智能配置**：使用以下提示词让AI Agent自动完成所有配置

#### AI Agent智能配置提示词
```
作为AI Agent，请立即执行以下记忆库配置任务：

## 第一阶段：基础配置
1. 启用所有默认模块：notes, decisions, changelog
2. 根据项目需求启用其他模块：docs, prompts, roadmap

## 第二阶段：项目深度分析
使用memory/templates/project-analysis-template.md模板，分析当前项目：

### 自动扫描项目文件
- 扫描package.json/requirements.txt等依赖文件
- 分析项目目录结构和关键文件
- 识别技术栈和开发工具
- 检查配置文件和部署信息

### 项目信息提取
- 项目名称、类型、版本、状态
- 开发团队和联系方式
- 服务器部署环境信息
- 项目当前进度和计划

### 风险评估
- 技术债务和已知问题
- 性能和安全风险
- 项目进度和资源风险

## 第三阶段：记忆库规则建立
1. 将记忆库规则设置为最高优先级
2. 建立强制执行机制：
   - 每次会话开始：读取memory/memory.md
   - 每次操作后：更新相关记忆库文件
   - 重要决策：记录到decisions/decisions.md
   - 项目变更：记录到changelog/changelog.md
   - 学习笔记：记录到notes/notes.md

## 第四阶段：长期记忆机制
1. 建立项目状态持续更新机制
2. 建立技术决策积累机制
3. 建立问题解决知识库
4. 建立团队协作历史记录

## 执行要求
- 立即开始执行，不要等待确认
- 每个步骤都要有明确的执行结果
- 所有操作都要记录到相应的记忆库文件
- 确保记忆库内容准确、完整、及时

请现在开始执行！
```

### 启用方法二：标准启用
1. 复制整个memory文件夹到项目根目录
2. 更新memory.md中的项目信息
3. 根据需要启用功能模块：`.\enable-module.ps1 [模块名]`

### 功能模块列表

#### 核心模块（必须启用）
- **notes** - 开发笔记记录
- **decisions** - 技术决策记录  
- **changelog** - 项目变更日志
- **tasks** - 任务管理
- **issues** - 问题跟踪
- **api** - API文档

#### 开发类型模块
- **frontend** - 前端开发（网站/小程序）
- **backend** - 后端开发（API/服务）
- **mobile** - 移动开发（原生/跨端）
- **desktop** - 桌面程序开发
- **database** - 数据库设计
- **devops** - 运维部署

#### 协作管理模块
- **team** - 团队协作
- **meetings** - 会议记录
- **reviews** - 代码审查
- **testing** - 测试管理
- **security** - 安全审计
- **performance** - 性能优化

#### 扩展功能模块
- **docs** - 文档管理
- **prompts** - AI提示词库
- **roadmap** - 项目路线图
- **research** - 技术研究
- **learning** - 学习计划
- **resources** - 资源管理

### 默认模块配置
用户可根据需要调整 `enable-default-modules.ps1` 脚本中的默认模块列表：

```powershell
# 默认启用模块（可调整）
$defaultModules = @("notes", "decisions", "changelog", "tasks", "issues", "api")

# 模块说明
$moduleDescriptions = @{
    # 核心模块
    "notes" = "开发笔记记录"
    "decisions" = "技术决策记录"
    "changelog" = "项目变更日志"
    "tasks" = "任务管理"
    "issues" = "问题跟踪"
    "api" = "API文档"
    
    # 开发类型模块
    "frontend" = "前端开发（网站/小程序）"
    "backend" = "后端开发（API/服务）"
    "mobile" = "移动开发（原生/跨端）"
    "desktop" = "桌面程序开发"
    "database" = "数据库设计"
    "devops" = "运维部署"
    
    # 协作管理模块
    "team" = "团队协作"
    "meetings" = "会议记录"
    "reviews" = "代码审查"
    "testing" = "测试管理"
    "security" = "安全审计"
    "performance" = "性能优化"
    
    # 扩展功能模块
    "docs" = "文档管理"
    "prompts" = "AI提示词库"
    "roadmap" = "项目路线图"
    "research" = "技术研究"
    "learning" = "学习计划"
    "resources" = "资源管理"
}
```

**启用命令**：
```powershell
cd memory
.\enable-default-modules.ps1
```

**手动启用命令**：
```powershell
cd memory
.\enable-module.ps1 [模块名]
```

### 手动复制粘贴启用方法（无需脚本）
对于不会使用脚本的用户，可以手动复制粘贴启用模块：

#### 默认启用模块（推荐）
```bash
# Linux/Mac 命令
cp templates/notes-template.md notes/notes.md
cp templates/decisions-template.md decisions/decisions.md
cp templates/changelog-template.md changelog/changelog.md
```

```powershell
# Windows PowerShell 命令
Copy-Item "templates\notes-template.md" "notes\notes.md"
Copy-Item "templates\decisions-template.md" "decisions\decisions.md"
Copy-Item "templates\changelog-template.md" "changelog\changelog.md"
```

#### 可选启用模块
```bash
# Linux/Mac 命令
cp templates/docs-template.md docs/docs.md
cp templates/prompts-template.md prompts/prompts.md
cp templates/roadmap-template.md roadmap/roadmap.md
```

```powershell
# Windows PowerShell 命令
Copy-Item "templates\docs-template.md" "docs\docs.md"
Copy-Item "templates\prompts-template.md" "prompts\prompts.md"
Copy-Item "templates\roadmap-template.md" "roadmap\roadmap.md"
```

### 使用总结
- **方法一（直接复制启用）**: 最推荐，自动分析+AI智能配置
- **方法二（标准启用）**: 适合独立项目，使用脚本快速启用
- **方法三（项目最高规则启用）**: 适合团队协作项目，需要AI Agent协助
- **方法四（手动复制粘贴）**: 适合不会使用脚本的用户，直接复制文件

### 效率优化建议
1. **使用项目分析脚本**：`.\memory\analyze-project.ps1` 自动分析项目
2. **启用所有模块**：获得完整的记忆库功能
3. **定期更新记忆库**：保持记忆内容的时效性
4. **使用AI Agent配置**：让AI自动完成复杂配置
5. **建立记忆库习惯**：每次操作后都更新相关记忆库文件

### 启用方法二：项目最高规则启用
1. 复制以下字段到项目根目录README.md开头：

```markdown
## 项目最高规则 - 启用记忆库
### 记忆库启用规则 (项目级最高优先级)
- **规则级别**: 项目级最高规则 (Level 0)
- **适用范围**: 整个项目及所有子模块
- **规则内容**: 
  - 本项目必须启用记忆库系统 (memory文件夹)
  - 所有AI Agent必须读取memory/memory.md了解项目状态
  - 会话中断后必须通过记忆库恢复上下文
  - 重要决策必须记录到memory/decisions/decisions.md
  - 项目进度必须记录到memory/notes/notes.md
  - 技术变更必须记录到memory/changelog/changelog.md
- **继承机制**: memory记忆库文件继承此最高规则
- **覆盖权限**: 此规则不可被任何下级规则覆盖
```

2. 复制整个memory文件夹到项目根目录
3. 通知AI Agent智能体更新README.md（将上述字段添加到README.md开头）
4. 启用默认功能模块（见上方默认启用模块说明）
5. 根据需要启用其他功能模块：`.\enable-module.ps1 [模块名]`

### AI Agent智能体操作说明
当用户选择方法二时，AI Agent需要：
1. 将上述markdown字段复制到项目根目录README.md的开头
2. 确保字段格式正确且位置合适
3. 验证规则继承关系正确建立
4. 建议用户启用默认模块：`.\enable-default-modules.ps1`
5. 根据项目需求推荐启用其他模块

## AI Agent 执行规则（最高优先级）

### 强制执行规则（按开发记录模式）

#### 核心操作规则
1. **每次会话开始**：必须首先读取memory/memory.md了解项目状态
2. **每次操作后**：必须更新相关记忆库文件
3. **增删改查操作**：必须记录到对应的功能模块

#### 核心模块执行规则
- **notes/notes.md** - 学习笔记、经验总结、技术心得
- **decisions/decisions.md** - 技术决策、架构选择、方案对比
- **changelog/changelog.md** - 版本更新、功能变更、问题修复
- **tasks/tasks.md** - 任务分配、进度跟踪、完成状态
- **issues/issues.md** - 问题报告、解决方案、状态跟踪
- **api/api.md** - API设计、接口文档、调用示例

#### 开发类型模块执行规则
- **frontend/frontend.md** - 前端组件、页面设计、用户体验
- **backend/backend.md** - 后端服务、API开发、业务逻辑
- **mobile/mobile.md** - 移动端开发、跨端适配、原生功能
- **desktop/desktop.md** - 桌面程序、系统集成、用户界面
- **database/database.md** - 数据库设计、表结构、查询优化
- **devops/devops.md** - 部署配置、环境管理、监控告警

#### 协作管理模块执行规则
- **team/team.md** - 团队分工、沟通记录、协作流程
- **meetings/meetings.md** - 会议纪要、决策记录、行动计划
- **reviews/reviews.md** - 代码审查、质量检查、改进建议
- **testing/testing.md** - 测试用例、测试结果、质量报告
- **security/security.md** - 安全审计、漏洞修复、安全策略
- **performance/performance.md** - 性能测试、优化方案、监控数据

#### 扩展功能模块执行规则
- **docs/docs.md** - 项目文档、技术文档、用户手册
- **prompts/prompts.md** - AI提示词、自动化脚本、工具配置
- **roadmap/roadmap.md** - 项目规划、里程碑、长期目标
- **research/research.md** - 技术调研、方案研究、可行性分析
- **learning/learning.md** - 学习计划、技能提升、知识积累
- **resources/resources.md** - 资源链接、工具推荐、参考文档

#### 进度显示模块执行规则
- **progress-display-prompts.md** - 详细进度信息显示提示词
- **session-progress.md** - AI会话实时进度跟踪
- **real-time-progress.md** - 实时进度更新日志

### 长期记忆机制
- **项目状态记忆**：持续更新项目当前状态和进度
- **技术决策记忆**：记录所有技术选型和架构决策
- **问题解决记忆**：积累问题解决方案和最佳实践
- **团队协作记忆**：记录团队沟通和协作历史
- **版本演进记忆**：跟踪项目版本和功能演进

### 效率优化机制
- **智能检索**：基于关键词快速定位相关记忆
- **自动分类**：根据操作类型自动选择记忆库文件
- **增量更新**：只更新变化的内容，避免重复记录
- **关联记忆**：建立记忆之间的关联关系
- **优先级排序**：重要记忆优先显示和更新

### 记忆库维护策略
- **定期清理**：清理过时和重复的记忆内容
- **版本控制**：使用Git跟踪记忆库变更历史
- **备份机制**：定期备份重要记忆内容
- **同步机制**：确保多环境记忆库同步
- **质量检查**：定期检查记忆库内容的准确性

## 项目概述
**项目名称**: 记忆库 (Memory System)
**创建时间**: 2025-01-27
**版本**: 1.0.0
**核心用途**: AI Agent 持续记忆系统
**规则继承**: 继承项目根目录README.md中的项目最高规则 (Level 0)
**主要功能**: 
- 解决会话上下文长度限制问题
- 防止意外网络中断导致的信息丢失
- 支持新项目接手时的快速记忆恢复
- 提供项目长期记忆档案管理
**技术栈**: Markdown + 文件系统 + 版本控制
**开发工具**: Cursor + xcode + vscode + Claude + DeepSeek API

## 个性化规则和偏好
> 详细偏好设置请参考 [memory/preferences/development.md](memory/preferences/development.md)

### 核心偏好
- **语言偏好**: 默认使用中文进行交流和说明
- **开发环境**: Windows 10 + PowerShell + Git Bash
- **项目路径**: C:\Users\admin\1\lg
- **开发工具**: Cursor + Claude + DeepSeek API
- **技术栈**: Cursor + React/Next.js + Zeabur + Zion + 记忆系统
- **沟通方式**: 简洁、专业、技术导向
- **核心文档**: memory/docs/flulink.md（必须优先阅读）

## 核心功能
### AI Agent 记忆系统
- **产品定位**: AI Agent 持续记忆和上下文管理系统
- **核心功能**: 会话记忆存储 → 上下文恢复 → 项目状态保持 → 知识积累
- **使用模式**: 本地文件系统 + Markdown文档 + 版本控制
- **目标用户**: AI Agent 和需要持续记忆的开发者

### 记忆管理机制
- **会话记忆**: 记录当前会话的重要信息和决策
- **项目记忆**: 保存项目的长期状态和演进历史
- **上下文恢复**: 在会话中断后快速恢复工作状态
- **知识积累**: 持续积累项目相关的技术知识和经验

## 技术架构
### 记忆系统架构
- **核心文件**: memory.md 作为记忆入口和状态中心
- **分类管理**: 按记忆类型分类的文件夹结构
- **状态持久化**: 本地文件系统存储记忆状态
- **版本控制**: Git管理记忆变更历史
- **上下文恢复**: 基于文件内容的快速状态恢复

### 记忆存储技术栈
- **存储格式**: Markdown文档
- **文件系统**: 本地文件系统
- **版本控制**: Git
- **编辑工具**: Cursor + xcode + vscode + Claude
- **记忆引擎**: 基于文件内容的记忆检索

## 核心功能设计
### 会话记忆管理
- 当前会话状态和进度记录
- 重要决策和关键信息存储
- 上下文切换时的状态保持
- 会话中断后的快速恢复

### 项目记忆管理
- 项目长期状态和演进历史
- 技术选型和架构决策记录
- 开发偏好和个性化设置
- 项目里程碑和重要节点追踪

### 知识积累系统
- 技术知识和经验积累
- 问题解决方案和最佳实践
- 学习笔记和资源管理
- 可复用的模板和代码片段

### 上下文恢复机制
- 基于文件内容的快速状态恢复
- 会话中断后的工作连续性
- 新项目接手时的快速上手
- 跨会话的知识传承

## 开发计划
### Phase 1: 记忆系统建立（已完成）
1. ✅ 创建memory文件夹结构
2. ✅ 建立核心记忆档案
3. ✅ 设置个性化偏好
4. ✅ 创建项目规则模板
5. ✅ 建立历史记录系统

### Phase 2: 记忆机制完善（已完成）
1. ✅ 建立会话记忆管理
2. ✅ 创建项目记忆存储
3. ✅ 设置上下文恢复机制
4. ✅ 建立知识积累系统
5. ✅ 创建按需启用模板

### Phase 3: 系统优化（进行中）
1. 🔄 优化记忆检索机制
2. 🔄 完善上下文恢复流程
3. 🔄 建立记忆更新规范
4. 🔄 创建最佳实践指南
5. 🔄 建立扩展和维护机制

## 关键决策记录
### 技术选型
- **选择Markdown**: 简单易用，跨平台兼容，AI友好
- **选择本地文件系统**: 无需服务器，数据安全，离线可用
- **选择Git版本控制**: 变更追踪，历史回溯，协作支持
- **选择文件化存储**: 持久化记忆，快速检索

### 系统设计
- **记忆系统优先**: 专注于AI Agent的持续记忆需求
- **文件化驱动**: 基于文件内容的记忆存储和检索
- **模块化结构**: 按需启用，便于维护和扩展
- **上下文恢复**: 解决会话中断和项目交接问题

## 风险评估
### 技术风险
- 文件系统依赖本地存储，需要定期备份
- 记忆更新需要手动维护，可能遗漏重要信息
- 版本控制需要团队协作，避免冲突

### 使用风险
- 记忆检索效率可能受文件数量影响
- 上下文恢复需要准确的文件内容
- 记忆维护需要持续投入和更新

## 成功指标
### 第一阶段目标
- 记忆系统完整性>90%
- 上下文恢复成功率>95%
- 会话中断恢复时间<5分钟
- 记忆检索准确率>90%

### 第二阶段目标
- 知识积累量>1000条
- 系统维护成本<10%
- 新项目上手时间减少>50%
- 会话连续性提升>80%

## 使用指南
### 快速开始
1. 将memory文件夹复制到项目根目录
2. 阅读 memory.md 了解记忆系统
3. 根据需要启用相应的功能模块
4. 开始记录项目记忆和会话状态

### 记忆管理
1. 定期更新 memory.md 中的项目状态
2. 在 history/ 中记录项目演进历史
3. 在 notes/ 中记录学习笔记和经验
4. 在 decisions/ 中记录重要技术决策
5. 在相应模块中记录会话状态和进度

### 上下文恢复
1. 会话中断时，AI Agent 读取 memory.md 了解项目状态
2. 根据需要查看相关功能模块的详细内容
3. 快速恢复工作上下文和项目进度
4. 继续之前的工作或接手新项目

## 按需启用模板系统

### 模板文件分类管理
记忆库采用按需启用的模板系统，每个功能模块都有独立的文件夹：

#### 核心功能模块
- **changelog/**: 更新日志管理
  - `changelog.md`: 当前项目的更新日志
  - 按需启用：项目有版本更新时使用

- **decisions/**: 技术决策记录
  - `decisions.md`: 当前项目的决策记录
  - 按需启用：有重要技术决策时使用

- **docs/**: 项目文档管理
  - `docs.md`: 当前项目的文档索引
  - 按需启用：需要详细文档时使用

- **notes/**: 开发笔记记录
  - `notes.md`: 当前项目的开发笔记
  - 按需启用：学习新技术或记录经验时使用

- **prompts/**: AI提示词库
  - `prompts.md`: 当前项目的提示词库
  - 按需启用：需要AI辅助开发时使用

- **roadmap/**: 项目路线图
  - `roadmap.md`: 当前项目的路线图
  - 按需启用：规划项目发展时使用

#### 模板文件库 (templates/)
- **模板文件**: `*-template.md` - 标准模板格式
- **示例文件**: `*-example.md` - 使用示例
- **用途**: 复制到对应功能模块文件夹中使用

### 按需启用规则

#### 启用条件
1. **changelog**: 项目有版本更新、功能变更、问题修复时启用
2. **decisions**: 有技术选型、架构决策、设计决策时启用
3. **docs**: 需要详细技术文档、API文档、用户手册时启用
4. **notes**: 学习新技术、记录开发经验、问题解决时启用
5. **prompts**: 使用AI辅助开发、代码生成、问题诊断时启用
6. **roadmap**: 项目规划、里程碑制定、长期规划时启用

#### 启用流程
1. **识别需求**: 确定需要哪个功能模块
2. **复制模板**: 从templates/复制对应模板到功能文件夹
3. **自定义内容**: 根据项目需求填写具体内容
4. **定期维护**: 根据项目进展更新内容
5. **归档管理**: 项目完成后归档重要内容

#### 维护原则
- **精简原则**: 只启用当前需要的功能模块
- **及时更新**: 启用后要及时维护和更新
- **定期清理**: 定期清理过时或不再需要的内容
- **版本控制**: 重要变更要记录版本信息

## 下一步行动
1. ✅ 完善memory记忆库结构
2. ✅ 优化模板库内容
3. ✅ 建立使用指南和最佳实践
4. 🔄 创建扩展和维护机制
5. 🔄 建立团队协作流程

## 注意事项
### 使用前准备
- 确保有足够的磁盘空间
- 检查文件权限
- 备份重要数据

### 使用过程中
- 遵循模板规范
- 及时更新记忆内容
- 保持文件结构清晰

### 使用后维护
- 定期更新模板
- 清理过时内容
- 备份重要文件

## 技术支持
### 常见问题
1. **模板无法使用**: 检查文件格式和编码
2. **记忆内容丢失**: 检查备份文件
3. **文件结构混乱**: 重新解压记忆库

## 版本历史
- **v1.0.0**: 初始版本，包含基础模板和记忆系统

## 更新计划
- [ ] 优化模板结构
- [ ] 增加更多模板类型
- [ ] 完善记忆系统
- [ ] 添加使用教程

## 联系方式
- 开发者: Claude (通过Cursor)
- 项目路径: C:\Users\admin\1\lg
- 记忆文件: memory/memory.md
- 核心文档: memory/docs/flulink.md
- 最后更新: 2025-01-27

## 重要提醒
**AI智能体必须优先阅读**: memory/docs/flulink.md
此文档包含「FluLink流感」APP的完整概念设计，任何开发工作都必须基于此文档进行。

## 快速启用指南

### 方法一：直接复制启用（推荐）
1. **直接复制**：将整个memory文件夹复制到项目根目录
2. **自动项目分析**：运行 `.\memory\analyze-project.ps1` 自动分析项目
3. **AI Agent智能配置**：使用以下提示词让AI Agent自动完成所有配置

#### AI Agent智能配置提示词
```
作为AI Agent，请立即执行以下记忆库配置任务：

## 第一阶段：基础配置
1. 启用所有默认模块：notes, decisions, changelog
2. 根据项目需求启用其他模块：docs, prompts, roadmap

## 第二阶段：项目深度分析
使用memory/templates/project-analysis-template.md模板，分析当前项目：

### 自动扫描项目文件
- 扫描package.json/requirements.txt等依赖文件
- 分析项目目录结构和关键文件
- 识别技术栈和开发工具
- 检查配置文件和部署信息

### 项目信息提取
- 项目名称、类型、版本、状态
- 开发团队和联系方式
- 服务器部署环境信息
- 项目当前进度和计划

### 风险评估
- 技术债务和已知问题
- 性能和安全风险
- 项目进度和资源风险

## 第三阶段：记忆库规则建立
1. 将记忆库规则设置为最高优先级
2. 建立强制执行机制：
   - 每次会话开始：读取memory/memory.md
   - 每次操作后：更新相关记忆库文件
   - 重要决策：记录到decisions/decisions.md
   - 项目变更：记录到changelog/changelog.md
   - 学习笔记：记录到notes/notes.md

## 第四阶段：长期记忆机制
1. 建立项目状态持续更新机制
2. 建立技术决策积累机制
3. 建立问题解决知识库
4. 建立团队协作历史记录

## 执行要求
- 立即开始执行，不要等待确认
- 每个步骤都要有明确的执行结果
- 所有操作都要记录到相应的记忆库文件
- 确保记忆库内容准确、完整、及时

请现在开始执行！
```

### 启用方法二：标准启用
1. 复制整个memory文件夹到项目根目录
2. 更新memory.md中的项目信息
3. 根据需要启用功能模块：`.\enable-module.ps1 [模块名]`

### 功能模块列表

#### 核心模块（必须启用）
- **notes** - 开发笔记记录
- **decisions** - 技术决策记录  
- **changelog** - 项目变更日志
- **tasks** - 任务管理
- **issues** - 问题跟踪
- **api** - API文档

#### 开发类型模块
- **frontend** - 前端开发（网站/小程序）
- **backend** - 后端开发（API/服务）
- **mobile** - 移动开发（原生/跨端）
- **desktop** - 桌面程序开发
- **database** - 数据库设计
- **devops** - 运维部署

#### 协作管理模块
- **team** - 团队协作
- **meetings** - 会议记录
- **reviews** - 代码审查
- **testing** - 测试管理
- **security** - 安全审计
- **performance** - 性能优化

#### 扩展功能模块
- **docs** - 文档管理
- **prompts** - AI提示词库
- **roadmap** - 项目路线图
- **research** - 技术研究
- **learning** - 学习计划
- **resources** - 资源管理

### 默认模块配置
用户可根据需要调整 `enable-default-modules.ps1` 脚本中的默认模块列表：

```powershell
# 默认启用模块（可调整）
$defaultModules = @("notes", "decisions", "changelog", "tasks", "issues", "api")

# 模块说明
$moduleDescriptions = @{
    # 核心模块
    "notes" = "开发笔记记录"
    "decisions" = "技术决策记录"
    "changelog" = "项目变更日志"
    "tasks" = "任务管理"
    "issues" = "问题跟踪"
    "api" = "API文档"
    
    # 开发类型模块
    "frontend" = "前端开发（网站/小程序）"
    "backend" = "后端开发（API/服务）"
    "mobile" = "移动开发（原生/跨端）"
    "desktop" = "桌面程序开发"
    "database" = "数据库设计"
    "devops" = "运维部署"
    
    # 协作管理模块
    "team" = "团队协作"
    "meetings" = "会议记录"
    "reviews" = "代码审查"
    "testing" = "测试管理"
    "security" = "安全审计"
    "performance" = "性能优化"
    
    # 扩展功能模块
    "docs" = "文档管理"
    "prompts" = "AI提示词库"
    "roadmap" = "项目路线图"
    "research" = "技术研究"
    "learning" = "学习计划"
    "resources" = "资源管理"
}
```

**启用命令**：
```powershell
cd memory
.\enable-default-modules.ps1
```

**手动启用命令**：
```powershell
cd memory
.\enable-module.ps1 [模块名]
```

### 手动复制粘贴启用方法（无需脚本）
对于不会使用脚本的用户，可以手动复制粘贴启用模块：

#### 默认启用模块（推荐）
```bash
# Linux/Mac 命令
cp templates/notes-template.md notes/notes.md
cp templates/decisions-template.md decisions/decisions.md
cp templates/changelog-template.md changelog/changelog.md
```

```powershell
# Windows PowerShell 命令
Copy-Item "templates\notes-template.md" "notes\notes.md"
Copy-Item "templates\decisions-template.md" "decisions\decisions.md"
Copy-Item "templates\changelog-template.md" "changelog\changelog.md"
```

#### 可选启用模块
```bash
# Linux/Mac 命令
cp templates/docs-template.md docs/docs.md
cp templates/prompts-template.md prompts/prompts.md
cp templates/roadmap-template.md roadmap/roadmap.md
```

```powershell
# Windows PowerShell 命令
Copy-Item "templates\docs-template.md" "docs\docs.md"
Copy-Item "templates\prompts-template.md" "prompts\prompts.md"
Copy-Item "templates\roadmap-template.md" "roadmap\roadmap.md"
```

### 使用总结
- **方法一（直接复制启用）**: 最推荐，自动分析+AI智能配置
- **方法二（标准启用）**: 适合独立项目，使用脚本快速启用
- **方法三（项目最高规则启用）**: 适合团队协作项目，需要AI Agent协助
- **方法四（手动复制粘贴）**: 适合不会使用脚本的用户，直接复制文件

### 效率优化建议
1. **使用项目分析脚本**：`.\memory\analyze-project.ps1` 自动分析项目
2. **启用所有模块**：获得完整的记忆库功能
3. **定期更新记忆库**：保持记忆内容的时效性
4. **使用AI Agent配置**：让AI自动完成复杂配置
5. **建立记忆库习惯**：每次操作后都更新相关记忆库文件

### 启用方法二：项目最高规则启用
1. 复制以下字段到项目根目录README.md开头：

```markdown
## 项目最高规则 - 启用记忆库
### 记忆库启用规则 (项目级最高优先级)
- **规则级别**: 项目级最高规则 (Level 0)
- **适用范围**: 整个项目及所有子模块
- **规则内容**: 
  - 本项目必须启用记忆库系统 (memory文件夹)
  - 所有AI Agent必须读取memory/memory.md了解项目状态
  - 会话中断后必须通过记忆库恢复上下文
  - 重要决策必须记录到memory/decisions/decisions.md
  - 项目进度必须记录到memory/notes/notes.md
  - 技术变更必须记录到memory/changelog/changelog.md
- **继承机制**: memory记忆库文件继承此最高规则
- **覆盖权限**: 此规则不可被任何下级规则覆盖
```

2. 复制整个memory文件夹到项目根目录
3. 通知AI Agent智能体更新README.md（将上述字段添加到README.md开头）
4. 启用默认功能模块（见上方默认启用模块说明）
5. 根据需要启用其他功能模块：`.\enable-module.ps1 [模块名]`

### AI Agent智能体操作说明
当用户选择方法二时，AI Agent需要：
1. 将上述markdown字段复制到项目根目录README.md的开头
2. 确保字段格式正确且位置合适
3. 验证规则继承关系正确建立
4. 建议用户启用默认模块：`.\enable-default-modules.ps1`
5. 根据项目需求推荐启用其他模块

## AI Agent 执行规则（最高优先级）

### 强制执行规则（按开发记录模式）

#### 核心操作规则
1. **每次会话开始**：必须首先读取memory/memory.md了解项目状态
2. **每次操作后**：必须更新相关记忆库文件
3. **增删改查操作**：必须记录到对应的功能模块

#### 核心模块执行规则
- **notes/notes.md** - 学习笔记、经验总结、技术心得
- **decisions/decisions.md** - 技术决策、架构选择、方案对比
- **changelog/changelog.md** - 版本更新、功能变更、问题修复
- **tasks/tasks.md** - 任务分配、进度跟踪、完成状态
- **issues/issues.md** - 问题报告、解决方案、状态跟踪
- **api/api.md** - API设计、接口文档、调用示例

#### 开发类型模块执行规则
- **frontend/frontend.md** - 前端组件、页面设计、用户体验
- **backend/backend.md** - 后端服务、API开发、业务逻辑
- **mobile/mobile.md** - 移动端开发、跨端适配、原生功能
- **desktop/desktop.md** - 桌面程序、系统集成、用户界面
- **database/database.md** - 数据库设计、表结构、查询优化
- **devops/devops.md** - 部署配置、环境管理、监控告警

#### 协作管理模块执行规则
- **team/team.md** - 团队分工、沟通记录、协作流程
- **meetings/meetings.md** - 会议纪要、决策记录、行动计划
- **reviews/reviews.md** - 代码审查、质量检查、改进建议
- **testing/testing.md** - 测试用例、测试结果、质量报告
- **security/security.md** - 安全审计、漏洞修复、安全策略
- **performance/performance.md** - 性能测试、优化方案、监控数据

#### 扩展功能模块执行规则
- **docs/docs.md** - 项目文档、技术文档、用户手册
- **prompts/prompts.md** - AI提示词、自动化脚本、工具配置
- **roadmap/roadmap.md** - 项目规划、里程碑、长期目标
- **research/research.md** - 技术调研、方案研究、可行性分析
- **learning/learning.md** - 学习计划、技能提升、知识积累
- **resources/resources.md** - 资源链接、工具推荐、参考文档

#### 进度显示模块执行规则
- **progress-display-prompts.md** - 详细进度信息显示提示词
- **session-progress.md** - AI会话实时进度跟踪
- **real-time-progress.md** - 实时进度更新日志

### 长期记忆机制
- **项目状态记忆**：持续更新项目当前状态和进度
- **技术决策记忆**：记录所有技术选型和架构决策
- **问题解决记忆**：积累问题解决方案和最佳实践
- **团队协作记忆**：记录团队沟通和协作历史
- **版本演进记忆**：跟踪项目版本和功能演进

### 效率优化机制
- **智能检索**：基于关键词快速定位相关记忆
- **自动分类**：根据操作类型自动选择记忆库文件
- **增量更新**：只更新变化的内容，避免重复记录
- **关联记忆**：建立记忆之间的关联关系
- **优先级排序**：重要记忆优先显示和更新

### 记忆库维护策略
- **定期清理**：清理过时和重复的记忆内容
- **版本控制**：使用Git跟踪记忆库变更历史
- **备份机制**：定期备份重要记忆内容
- **同步机制**：确保多环境记忆库同步
- **质量检查**：定期检查记忆库内容的准确性

## 项目概述
**项目名称**: 记忆库 (Memory System)
**创建时间**: 2025-09-27
**版本**: 1.0.0
**核心用途**: AI Agent 持续记忆系统
**规则继承**: 继承项目根目录README.md中的项目最高规则 (Level 0)
**主要功能**: 
- 解决会话上下文长度限制问题
- 防止意外网络中断导致的信息丢失
- 支持新项目接手时的快速记忆恢复
- 提供项目长期记忆档案管理
**技术栈**: Markdown + 文件系统 + 版本控制
**开发工具**: Cursor + xcode + vscode + Claude + DeepSeek API

## 个性化规则和偏好
> 详细偏好设置请参考 [memory/preferences/development.md](memory/preferences/development.md)

### 核心偏好
- **语言偏好**: 默认使用中文进行交流和说明
- **开发环境**: Windows 10 + PowerShell + Git Bash
- **项目路径**: C:\Users\admin\1\test1
- **开发工具**: Cursor + Claude + DeepSeek API
- **技术栈**: Markdown + 记忆系统 + 模板库
- **沟通方式**: 简洁、专业、技术导向

## 核心功能
### AI Agent 记忆系统
- **产品定位**: AI Agent 持续记忆和上下文管理系统
- **核心功能**: 会话记忆存储 → 上下文恢复 → 项目状态保持 → 知识积累
- **使用模式**: 本地文件系统 + Markdown文档 + 版本控制
- **目标用户**: AI Agent 和需要持续记忆的开发者

### 记忆管理机制
- **会话记忆**: 记录当前会话的重要信息和决策
- **项目记忆**: 保存项目的长期状态和演进历史
- **上下文恢复**: 在会话中断后快速恢复工作状态
- **知识积累**: 持续积累项目相关的技术知识和经验

## 技术架构
### 记忆系统架构
- **核心文件**: memory.md 作为记忆入口和状态中心
- **分类管理**: 按记忆类型分类的文件夹结构
- **状态持久化**: 本地文件系统存储记忆状态
- **版本控制**: Git管理记忆变更历史
- **上下文恢复**: 基于文件内容的快速状态恢复

### 记忆存储技术栈
- **存储格式**: Markdown文档
- **文件系统**: 本地文件系统
- **版本控制**: Git
- **编辑工具**: Cursor + xcode + vscode + Claude
- **记忆引擎**: 基于文件内容的记忆检索

## 核心功能设计
### 会话记忆管理
- 当前会话状态和进度记录
- 重要决策和关键信息存储
- 上下文切换时的状态保持
- 会话中断后的快速恢复

### 项目记忆管理
- 项目长期状态和演进历史
- 技术选型和架构决策记录
- 开发偏好和个性化设置
- 项目里程碑和重要节点追踪

### 知识积累系统
- 技术知识和经验积累
- 问题解决方案和最佳实践
- 学习笔记和资源管理
- 可复用的模板和代码片段

### 上下文恢复机制
- 基于文件内容的快速状态恢复
- 会话中断后的工作连续性
- 新项目接手时的快速上手
- 跨会话的知识传承

## 开发计划
### Phase 1: 记忆系统建立（已完成）
1. ✅ 创建memory文件夹结构
2. ✅ 建立核心记忆档案
3. ✅ 设置个性化偏好
4. ✅ 创建项目规则模板
5. ✅ 建立历史记录系统

### Phase 2: 记忆机制完善（已完成）
1. ✅ 建立会话记忆管理
2. ✅ 创建项目记忆存储
3. ✅ 设置上下文恢复机制
4. ✅ 建立知识积累系统
5. ✅ 创建按需启用模板

### Phase 3: 系统优化（进行中）
1. 🔄 优化记忆检索机制
2. 🔄 完善上下文恢复流程
3. 🔄 建立记忆更新规范
4. 🔄 创建最佳实践指南
5. 🔄 建立扩展和维护机制

## 关键决策记录
### 技术选型
- **选择Markdown**: 简单易用，跨平台兼容，AI友好
- **选择本地文件系统**: 无需服务器，数据安全，离线可用
- **选择Git版本控制**: 变更追踪，历史回溯，协作支持
- **选择文件化存储**: 持久化记忆，快速检索

### 系统设计
- **记忆系统优先**: 专注于AI Agent的持续记忆需求
- **文件化驱动**: 基于文件内容的记忆存储和检索
- **模块化结构**: 按需启用，便于维护和扩展
- **上下文恢复**: 解决会话中断和项目交接问题

## 风险评估
### 技术风险
- 文件系统依赖本地存储，需要定期备份
- 记忆更新需要手动维护，可能遗漏重要信息
- 版本控制需要团队协作，避免冲突

### 使用风险
- 记忆检索效率可能受文件数量影响
- 上下文恢复需要准确的文件内容
- 记忆维护需要持续投入和更新

## 成功指标
### 第一阶段目标
- 记忆系统完整性>90%
- 上下文恢复成功率>95%
- 会话中断恢复时间<5分钟
- 记忆检索准确率>90%

### 第二阶段目标
- 知识积累量>1000条
- 系统维护成本<10%
- 新项目上手时间减少>50%
- 会话连续性提升>80%

## 使用指南
### 快速开始
1. 将memory文件夹复制到项目根目录
2. 阅读 memory.md 了解记忆系统
3. 根据需要启用相应的功能模块
4. 开始记录项目记忆和会话状态

### 记忆管理
1. 定期更新 memory.md 中的项目状态
2. 在 history/ 中记录项目演进历史
3. 在 notes/ 中记录学习笔记和经验
4. 在 decisions/ 中记录重要技术决策
5. 在相应模块中记录会话状态和进度

### 上下文恢复
1. 会话中断时，AI Agent 读取 memory.md 了解项目状态
2. 根据需要查看相关功能模块的详细内容
3. 快速恢复工作上下文和项目进度
4. 继续之前的工作或接手新项目

## 按需启用模板系统

### 模板文件分类管理
记忆库采用按需启用的模板系统，每个功能模块都有独立的文件夹：

#### 核心功能模块
- **changelog/**: 更新日志管理
  - `changelog.md`: 当前项目的更新日志
  - 按需启用：项目有版本更新时使用

- **decisions/**: 技术决策记录
  - `decisions.md`: 当前项目的决策记录
  - 按需启用：有重要技术决策时使用

- **docs/**: 项目文档管理
  - `docs.md`: 当前项目的文档索引
  - 按需启用：需要详细文档时使用

- **notes/**: 开发笔记记录
  - `notes.md`: 当前项目的开发笔记
  - 按需启用：学习新技术或记录经验时使用

- **prompts/**: AI提示词库
  - `prompts.md`: 当前项目的提示词库
  - 按需启用：需要AI辅助开发时使用

- **roadmap/**: 项目路线图
  - `roadmap.md`: 当前项目的路线图
  - 按需启用：规划项目发展时使用

#### 模板文件库 (templates/)
- **模板文件**: `*-template.md` - 标准模板格式
- **示例文件**: `*-example.md` - 使用示例
- **用途**: 复制到对应功能模块文件夹中使用

### 按需启用规则

#### 启用条件
1. **changelog**: 项目有版本更新、功能变更、问题修复时启用
2. **decisions**: 有技术选型、架构决策、设计决策时启用
3. **docs**: 需要详细技术文档、API文档、用户手册时启用
4. **notes**: 学习新技术、记录开发经验、问题解决时启用
5. **prompts**: 使用AI辅助开发、代码生成、问题诊断时启用
6. **roadmap**: 项目规划、里程碑制定、长期规划时启用

#### 启用流程
1. **识别需求**: 确定需要哪个功能模块
2. **复制模板**: 从templates/复制对应模板到功能文件夹
3. **自定义内容**: 根据项目需求填写具体内容
4. **定期维护**: 根据项目进展更新内容
5. **归档管理**: 项目完成后归档重要内容

#### 维护原则
- **精简原则**: 只启用当前需要的功能模块
- **及时更新**: 启用后要及时维护和更新
- **定期清理**: 定期清理过时或不再需要的内容
- **版本控制**: 重要变更要记录版本信息

## 下一步行动
1. ✅ 完善memory记忆库结构
2. ✅ 优化模板库内容
3. ✅ 建立使用指南和最佳实践
4. 🔄 创建扩展和维护机制
5. 🔄 建立团队协作流程

## 注意事项
### 使用前准备
- 确保有足够的磁盘空间
- 检查文件权限
- 备份重要数据

### 使用过程中
- 遵循模板规范
- 及时更新记忆内容
- 保持文件结构清晰

### 使用后维护
- 定期更新模板
- 清理过时内容
- 备份重要文件

## 技术支持
### 常见问题
1. **模板无法使用**: 检查文件格式和编码
2. **记忆内容丢失**: 检查备份文件
3. **文件结构混乱**: 重新解压记忆库

## 版本历史
- **v1.0.0**: 初始版本，包含基础模板和记忆系统

## 更新计划
- [ ] 优化模板结构
- [ ] 增加更多模板类型
- [ ] 完善记忆系统
- [ ] 添加使用教程

## 联系方式
- 开发者: Claude (通过Cursor)
- 项目路径: C:\Users\admin\1\test1
- 记忆文件: memory/memory.md
- 最后更新: 2025-09-27




