# FluLink完整开发提示词方案

## 项目背景
专为Claude优化的完整提示词方案，分为需求文档生成和极简MVP开发两部分，严格遵循《德道经》哲学理念。

---

## 一、FluLink完整需求文档生成提示词

### 核心要求
1. **严格遵循《德道经》第11章"三十辐共一毂"的思想**
   - 所有功能模块必须体现"无"(服务端)与"有"(客户端)的协同
   - 服务端为"无"，客户端为"有"，两者协同运作

2. **技术栈限定**
   - Zion免费版(数据层) + Zeabur(服务部署) + 微信小程序(用户端)
   - 完全放弃本地测试，所有验证通过Zeabur日志分析完成

### 输出结构

#### 1. 无为而治的服务端设计
规则引擎实现为5个纯函数：
```typescript
// 在Zeabur的Serverless Function中实现
function calculateSpread(strainType: 'text'|'image'|'form', location: GeoPoint): SpreadPath {
  // 仅包含确定性算法，禁用任何机器学习
}

function evaluateToxicity(content: string, userHistory: UserProfile): ToxicityScore {
  // 基于规则的毒性评估，无AI依赖
}

function generatePropagationPath(startLocation: GeoPoint, toxicity: number): PropagationPath {
  // 地理传播路径计算，纯数学算法
}

function validateUserPermission(openid: string, action: string): PermissionResult {
  // 权限验证，基于Zion用户表
}

function logSystemEvent(event: SystemEvent): void {
  // 系统日志记录，仅记录关键事件
}
```

#### 2. 小国寡民的客户端架构
微信小程序限定能力：
- 使用Zion SDK直接读写地理位置数据
- 本地缓存最近3次毒株分类结果
- 强制启用「省流模式」(禁用所有动画)

#### 3. 上善若水的部署流程
Zeabur配置清单必须包含：
```yaml
services:
  flulink-core:
    build: .
    ports: ["3000:3000"]
    env:
      ZION_TOKEN: ${ZION_TOKEN}
      DISABLE_LOCAL_TEST: "true" # 强制跳过本地测试
```

#### 4. 知止不殆的监控方案
仅收集3类日志：
- 规则引擎输入/输出快照
- Zion API调用耗时
- 小程序异常捕获事件

### 禁止事项
- 不得建议任何本地开发环境配置
- 禁用需要付费的云服务功能
- 排除所有非确定性算法

---

## 二、Zion+Zeabur极简MVP提示词

### 硬性约束

#### 1. 数据层约束
仅用Zion免费版的以下功能：
- **1个用户表**: `openid`, `location`
- **1个毒株表**: `strain_id`, `creator`, `type`, `base_score`
- **每日读写限额**: 控制在8万次内

#### 2. 服务端约束
单个Zeabur项目包含：
- **1个Node.js服务**: ≤300行代码
- **禁用任何数据库连接池**
- **必须启用Zeabur的自动HTTPS**

#### 3. 用户端选择
**微信小程序**（原因）：
- 比App更易获取地理位置权限
- 共享Zion的微信生态认证体系
- 无需处理App Store审核

### 最短实现清单

#### 1. 微信小程序核心页面（2个）
- **毒株发布页**: 仅含位置按钮+文本输入框
- **传播看板页**: 显示当前感染人数+简单热力图

#### 2. Zion数据模型（复制粘贴即可）
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

#### 3. Zeabur部署就绪的server.js
```javascript
app.post('/spread', (req, res) => {
  const { strainType, lat, lng } = req.body;
  const delay = Math.floor(Math.log2(lat * lng) % 10); // 模拟延迟计算
  res.json({ delay, scope: '本小区' }); // 固定返回最简结果
});
```

#### 4. 部署验证指令
在Zeabur控制台直接粘贴：
```bash
git clone https://github.com/your-repo && cd your-repo
zeabur deploy --no-test --production
```

#### 5. 检查日志关键词
- "Zion connection established"
- "WeChat MP request received"

---

## 三、道家开发法则

### 1. "治大国若烹小鲜"
- 绝不频繁修改Zion数据模型（每日≤3次结构调整）
- 保持系统稳定性，避免过度调整

### 2. "天下大事必作于细"
- 每次Zeabur部署只变更1个文件
- 小步快跑，降低部署风险

### 3. "善闭无关楗而不可开"
- 用微信原生权限系统替代自定义鉴权
- 利用现有生态，避免重复造轮子

### 4. "不出户知天下"
- 云端开发境界，无需本地环境
- 通过Zeabur日志分析完成所有验证

---

## 四、开发时间线

### 4小时完成全流程
1. **第1小时**: 需求文档生成（30分钟）+ Zion数据模型设计（30分钟）
2. **第2小时**: Node.js服务端开发（60分钟）
3. **第3小时**: 微信小程序页面开发（60分钟）
4. **第4小时**: Zeabur部署 + 日志验证（60分钟）

### 关键里程碑
- ✅ **1小时**: 需求文档完成
- ✅ **2小时**: 服务端API就绪
- ✅ **3小时**: 小程序界面完成
- ✅ **4小时**: 生产环境部署成功

---

## 五、技术哲学总结

### 核心思想
**"让内容像流感一样自然而然地传播，让社交回归本质，让连接更有意义"**

### 实现路径
- **无为而治**: 服务端规则引擎，确定性算法
- **小国寡民**: 客户端极简设计，省流模式
- **上善若水**: 部署流程自动化，云端开发
- **知止不殆**: 监控方案精简，关键指标

### 最终目标
实现*"不出户知天下"*的云端开发境界，4小时内完成从代码编写到生产部署的全流程。

---

**创建时间**: 2024年10月6日  
**文档版本**: v1.0  
**适用项目**: FluLink MVP  
**开发理念**: 《德道经》哲学指导  
**技术栈**: Zion + Zeabur + 微信小程序
