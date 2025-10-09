# Zion+Zeabur极简MVP开发提示词

## 项目背景
作为全栈AI工程师，请用最短代码实现可部署的FluLink MVP

## 硬性约束

### 1. 数据层约束
仅用Zion免费版的以下功能：
- **1个用户表**: `openid`, `location`
- **1个毒株表**: `strain_id`, `creator`, `type`, `base_score`
- **每日读写限额**: 控制在8万次内

### 2. 服务端约束
单个Zeabur项目包含：
- **1个Node.js服务**: ≤300行代码
- **禁用任何数据库连接池**
- **必须启用Zeabur的自动HTTPS**

### 3. 用户端选择
**微信小程序**（原因）：
- 比App更易获取地理位置权限
- 共享Zion的微信生态认证体系
- 无需处理App Store审核

## 最短实现清单

### 1. 微信小程序核心页面（2个）

#### 毒株发布页
- 仅含位置按钮+文本输入框
- 功能：获取位置、输入内容、发布毒株

#### 传播看板页
- 显示当前感染人数+简单热力图
- 功能：统计数据展示、附近毒株列表、感染传播

### 2. Zion数据模型（复制粘贴即可）

```javascript
// collections/users.js
Zion.Schema({
  openid: { type: String, required: true },
  last_loc: { type: GeoPoint, index: '2dsphere' }
});

// collections/strains.js
Zion.Schema({
  type: { enum: ['text', 'image', 'form'] },
  score: { type: Number, min: 1, max: 10 }
});
```

## 技术实现要求

### Node.js服务核心功能
1. **用户位置更新**: `POST /api/user/update`
2. **毒株发布**: `POST /api/strain/create`
3. **附近毒株查询**: `GET /api/strains/nearby`
4. **感染传播**: `POST /api/strain/infect`
5. **看板数据**: `GET /api/dashboard`

### 微信小程序核心功能
1. **位置获取**: 使用微信地理位置API
2. **毒株发布**: 调用服务端发布接口
3. **传播看板**: 显示统计数据和热力图
4. **感染传播**: 一键感染附近毒株

### 部署配置
- **Zeabur服务**: Node.js 18+, 0.5CPU, 512MB内存
- **域名配置**: 自动HTTPS，CORS支持
- **健康检查**: 30秒间隔，3次重试
- **环境变量**: Zion Token, 生产环境配置

## 成本控制目标
- **Zion免费版**: 每日读写≤8万次，存储1GB
- **Zeabur资源**: 0.5核心CPU，512MB内存，100GB流量/月
- **完全免费**: 符合所有免费服务限制

## 开发优先级
1. **Phase 1**: Node.js服务 + Zion数据模型
2. **Phase 2**: 微信小程序页面开发
3. **Phase 3**: Zeabur部署配置
4. **Phase 4**: 生产环境测试

---

**创建时间**: 2024年10月6日  
**项目状态**: Zion+Zeabur极简MVP实现完成  
**代码规模**: Node.js服务268行，微信小程序2个页面  
**部署状态**: 可立即部署到生产环境
