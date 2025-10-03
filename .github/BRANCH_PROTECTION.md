# GitHub分支保护规则配置

## 🛡️ 分支保护设置

### main分支保护规则
```yaml
main:
  required_status_checks:
    strict: true
    contexts:
      - "CI/CD Pipeline"
      - "Code Quality"
      - "World Rules Check"
  enforce_admins: true
  required_pull_request_reviews:
    required_approving_review_count: 2
    dismiss_stale_reviews: true
    require_code_owner_reviews: true
    required_review_thread_resolution: true
  restrictions:
    users: []
    teams: ["core-developers"]
  allow_force_pushes: false
  allow_deletions: false
```

### develop分支保护规则
```yaml
develop:
  required_status_checks:
    strict: true
    contexts:
      - "CI/CD Pipeline"
      - "Code Quality"
  enforce_admins: false
  required_pull_request_reviews:
    required_approving_review_count: 1
    dismiss_stale_reviews: true
  restrictions:
    users: []
    teams: ["core-developers", "feature-developers"]
  allow_force_pushes: false
  allow_deletions: false
```

## 👥 团队权限设置

### 核心开发者团队 (core-developers)
```yaml
permissions:
  admin: true
repositories:
  - "flulink-app"
members:
  - "wongzhifeng"
  - "lead-dev1"
  - "lead-dev2"
```

### 功能开发者团队 (feature-developers)
```yaml
permissions:
  write: true
repositories:
  - "flulink-app"
members:
  - "dev1"
  - "dev2"
  - "dev3"
```

### 贡献者团队 (contributors)
```yaml
permissions:
  triage: true
repositories:
  - "flulink-app"
members:
  - "contributor1"
  - "contributor2"
```

## 🏷️ 标签配置

### Issue标签
```yaml
labels:
  # 优先级
  - name: "priority:high"
    color: "d73a4a"
    description: "高优先级问题"
  - name: "priority:medium"
    color: "ffc107"
    description: "中优先级问题"
  - name: "priority:low"
    color: "28a745"
    description: "低优先级问题"
  
  # 类型
  - name: "type:feature"
    color: "0075ca"
    description: "功能需求"
  - name: "type:bug"
    color: "d73a4a"
    description: "问题修复"
  - name: "type:enhancement"
    color: "a2eeef"
    description: "功能增强"
  - name: "type:documentation"
    color: "7057ff"
    description: "文档更新"
  
  # 状态
  - name: "status:open"
    color: "28a745"
    description: "开放状态"
  - name: "status:in-progress"
    color: "ffc107"
    description: "进行中"
  - name: "status:review"
    color: "0075ca"
    description: "审查中"
  - name: "status:closed"
    color: "6c757d"
    description: "已关闭"
  
  # 世界规则
  - name: "world-rule:essence"
    color: "8b5cf6"
    description: "回归本质"
  - name: "world-rule:natural"
    color: "06b6d4"
    description: "遵循自然规律"
  - name: "world-rule:balance"
    color: "10b981"
    description: "追求简约与平衡"
  - name: "world-rule:action"
    color: "f59e0b"
    description: "敢作敢当"
  - name: "world-rule:humble"
    color: "ef4444"
    description: "保持谦逊"
```

### PR标签
```yaml
labels:
  # 状态
  - name: "status:ready-for-review"
    color: "28a745"
    description: "准备审查"
  - name: "status:needs-changes"
    color: "ffc107"
    description: "需要修改"
  - name: "status:approved"
    color: "0075ca"
    description: "已批准"
  
  # 类型
  - name: "type:feature"
    color: "0075ca"
    description: "功能开发"
  - name: "type:bugfix"
    color: "d73a4a"
    description: "问题修复"
  - name: "type:refactor"
    color: "a2eeef"
    description: "代码重构"
  - name: "type:docs"
    color: "7057ff"
    description: "文档更新"
  
  # 世界规则检查
  - name: "world-rule:checked"
    color: "28a745"
    description: "已通过世界规则检查"
  - name: "world-rule:needs-review"
    color: "ffc107"
    description: "需要世界规则审查"
```

## 🔄 自动化规则

### 自动标签分配
```yaml
# 基于文件路径自动分配标签
rules:
  - paths: ["src/components/**"]
    labels: ["type:feature"]
  - paths: ["docs/**"]
    labels: ["type:documentation"]
  - paths: ["*.md"]
    labels: ["type:documentation"]
  - paths: ["src/**/*.test.*"]
    labels: ["type:test"]
```

### 自动审查者分配
```yaml
# 基于文件路径自动分配审查者
rules:
  - paths: ["src/components/**"]
    reviewers: ["@core-developers"]
  - paths: ["src/lib/**"]
    reviewers: ["@core-developers"]
  - paths: ["docs/**"]
    reviewers: ["@feature-developers"]
```

## 📊 项目设置

### 项目模板
```yaml
project:
  name: "FluLink Development"
  description: "FluLink异步社交APP开发项目"
  columns:
    - "To Do"
    - "In Progress"
    - "Review"
    - "Done"
  
  automation:
    - column: "To Do"
      trigger: "opened"
    - column: "In Progress"
      trigger: "assigned"
    - column: "Review"
      trigger: "pull_request"
    - column: "Done"
      trigger: "closed"
```

### 里程碑设置
```yaml
milestones:
  - name: "v1.0.0-mvp"
    description: "MVP版本发布"
    due_on: "2025-02-01"
  - name: "v1.1.0-features"
    description: "功能增强版本"
    due_on: "2025-03-01"
  - name: "v1.2.0-optimization"
    description: "性能优化版本"
    due_on: "2025-04-01"
```

## 🚀 部署规则

### 自动部署触发
```yaml
deployment:
  triggers:
    - branch: "main"
      environment: "production"
      required_contexts:
        - "CI/CD Pipeline"
        - "Code Quality"
        - "World Rules Check"
  
  environments:
    production:
      protection_rules:
        - required_reviewers: ["@core-developers"]
        - wait_timer: 0
        - prevent_self_review: true
```

## 📝 通知规则

### 通知设置
```yaml
notifications:
  channels:
    - name: "core-developers"
      events: ["pull_request", "issue", "deployment"]
    - name: "feature-developers"
      events: ["pull_request", "issue"]
    - name: "contributors"
      events: ["issue"]
  
  rules:
    - event: "pull_request"
      condition: "review_requested"
      notify: ["@core-developers"]
    - event: "issue"
      condition: "assigned"
      notify: ["@feature-developers"]
```

这些配置确保多开发者协作时遵循世界规则，保持代码质量和项目稳定性。

## 🛡️ 分支保护设置

### main分支保护规则
```yaml
main:
  required_status_checks:
    strict: true
    contexts:
      - "CI/CD Pipeline"
      - "Code Quality"
      - "World Rules Check"
  enforce_admins: true
  required_pull_request_reviews:
    required_approving_review_count: 2
    dismiss_stale_reviews: true
    require_code_owner_reviews: true
    required_review_thread_resolution: true
  restrictions:
    users: []
    teams: ["core-developers"]
  allow_force_pushes: false
  allow_deletions: false
```

### develop分支保护规则
```yaml
develop:
  required_status_checks:
    strict: true
    contexts:
      - "CI/CD Pipeline"
      - "Code Quality"
  enforce_admins: false
  required_pull_request_reviews:
    required_approving_review_count: 1
    dismiss_stale_reviews: true
  restrictions:
    users: []
    teams: ["core-developers", "feature-developers"]
  allow_force_pushes: false
  allow_deletions: false
```

## 👥 团队权限设置

### 核心开发者团队 (core-developers)
```yaml
permissions:
  admin: true
repositories:
  - "flulink-app"
members:
  - "wongzhifeng"
  - "lead-dev1"
  - "lead-dev2"
```

### 功能开发者团队 (feature-developers)
```yaml
permissions:
  write: true
repositories:
  - "flulink-app"
members:
  - "dev1"
  - "dev2"
  - "dev3"
```

### 贡献者团队 (contributors)
```yaml
permissions:
  triage: true
repositories:
  - "flulink-app"
members:
  - "contributor1"
  - "contributor2"
```

## 🏷️ 标签配置

### Issue标签
```yaml
labels:
  # 优先级
  - name: "priority:high"
    color: "d73a4a"
    description: "高优先级问题"
  - name: "priority:medium"
    color: "ffc107"
    description: "中优先级问题"
  - name: "priority:low"
    color: "28a745"
    description: "低优先级问题"
  
  # 类型
  - name: "type:feature"
    color: "0075ca"
    description: "功能需求"
  - name: "type:bug"
    color: "d73a4a"
    description: "问题修复"
  - name: "type:enhancement"
    color: "a2eeef"
    description: "功能增强"
  - name: "type:documentation"
    color: "7057ff"
    description: "文档更新"
  
  # 状态
  - name: "status:open"
    color: "28a745"
    description: "开放状态"
  - name: "status:in-progress"
    color: "ffc107"
    description: "进行中"
  - name: "status:review"
    color: "0075ca"
    description: "审查中"
  - name: "status:closed"
    color: "6c757d"
    description: "已关闭"
  
  # 世界规则
  - name: "world-rule:essence"
    color: "8b5cf6"
    description: "回归本质"
  - name: "world-rule:natural"
    color: "06b6d4"
    description: "遵循自然规律"
  - name: "world-rule:balance"
    color: "10b981"
    description: "追求简约与平衡"
  - name: "world-rule:action"
    color: "f59e0b"
    description: "敢作敢当"
  - name: "world-rule:humble"
    color: "ef4444"
    description: "保持谦逊"
```

### PR标签
```yaml
labels:
  # 状态
  - name: "status:ready-for-review"
    color: "28a745"
    description: "准备审查"
  - name: "status:needs-changes"
    color: "ffc107"
    description: "需要修改"
  - name: "status:approved"
    color: "0075ca"
    description: "已批准"
  
  # 类型
  - name: "type:feature"
    color: "0075ca"
    description: "功能开发"
  - name: "type:bugfix"
    color: "d73a4a"
    description: "问题修复"
  - name: "type:refactor"
    color: "a2eeef"
    description: "代码重构"
  - name: "type:docs"
    color: "7057ff"
    description: "文档更新"
  
  # 世界规则检查
  - name: "world-rule:checked"
    color: "28a745"
    description: "已通过世界规则检查"
  - name: "world-rule:needs-review"
    color: "ffc107"
    description: "需要世界规则审查"
```

## 🔄 自动化规则

### 自动标签分配
```yaml
# 基于文件路径自动分配标签
rules:
  - paths: ["src/components/**"]
    labels: ["type:feature"]
  - paths: ["docs/**"]
    labels: ["type:documentation"]
  - paths: ["*.md"]
    labels: ["type:documentation"]
  - paths: ["src/**/*.test.*"]
    labels: ["type:test"]
```

### 自动审查者分配
```yaml
# 基于文件路径自动分配审查者
rules:
  - paths: ["src/components/**"]
    reviewers: ["@core-developers"]
  - paths: ["src/lib/**"]
    reviewers: ["@core-developers"]
  - paths: ["docs/**"]
    reviewers: ["@feature-developers"]
```

## 📊 项目设置

### 项目模板
```yaml
project:
  name: "FluLink Development"
  description: "FluLink异步社交APP开发项目"
  columns:
    - "To Do"
    - "In Progress"
    - "Review"
    - "Done"
  
  automation:
    - column: "To Do"
      trigger: "opened"
    - column: "In Progress"
      trigger: "assigned"
    - column: "Review"
      trigger: "pull_request"
    - column: "Done"
      trigger: "closed"
```

### 里程碑设置
```yaml
milestones:
  - name: "v1.0.0-mvp"
    description: "MVP版本发布"
    due_on: "2025-02-01"
  - name: "v1.1.0-features"
    description: "功能增强版本"
    due_on: "2025-03-01"
  - name: "v1.2.0-optimization"
    description: "性能优化版本"
    due_on: "2025-04-01"
```

## 🚀 部署规则

### 自动部署触发
```yaml
deployment:
  triggers:
    - branch: "main"
      environment: "production"
      required_contexts:
        - "CI/CD Pipeline"
        - "Code Quality"
        - "World Rules Check"
  
  environments:
    production:
      protection_rules:
        - required_reviewers: ["@core-developers"]
        - wait_timer: 0
        - prevent_self_review: true
```

## 📝 通知规则

### 通知设置
```yaml
notifications:
  channels:
    - name: "core-developers"
      events: ["pull_request", "issue", "deployment"]
    - name: "feature-developers"
      events: ["pull_request", "issue"]
    - name: "contributors"
      events: ["issue"]
  
  rules:
    - event: "pull_request"
      condition: "review_requested"
      notify: ["@core-developers"]
    - event: "issue"
      condition: "assigned"
      notify: ["@feature-developers"]
```

这些配置确保多开发者协作时遵循世界规则，保持代码质量和项目稳定性。


