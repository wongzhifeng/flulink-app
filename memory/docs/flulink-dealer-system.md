# FluLink 流感发牌手服务 核心架构设计

## 产品愿景
FluLink流感发牌手服务是一款革命性的异步社交平台，通过"发牌手"作为AI仲裁者，将用户的内容传播变成一场充满未知的博弈游戏。核心哲学：**让社交像流感一样自然而然地传播，同时保持游戏的乐趣和公平性**。

## 核心概念创新

### 1. "发牌手"模式
- **AI仲裁者**：发牌手不是简单的自动化回复机器人，而是拥有深邃哲学的传播观察者
- **世界规则不变**：发牌手遵循的核心世界规则永不可修改，确保公平性
- **动态规则开关**：管理员可通过后台开关控制细节规则的激活/关闭
- **人格化体验**：发牌手具有冷静、理性、略带科学家气质的人格特征

### 2. "亮牌"机制
用户通过发送位置和文本内容"亮牌"，发牌手根据既定规则进行分析判断，决定传播策略和回复内容。

## MVP 功能架构

### 用户端核心功能

#### 启动机制
1. **位置验证**：用户首次使用需要发送精确位置（建议街道级精度以上）
2. **区域映射**：系统自动匹配用户所在小区、街道、城市层级
3. **初始激活**：发送测试毒株完成用户认证
4. **区域归属**：用户被分配到特定地理传播网络

#### 亮牌流程
```
用户操作序列：
1. 进入FluLink → 自动获得当前位置
2. 输入文本内容（必填）
3. 选择是否附加表单数据
4. 点击"亮牌" → 等待发牌手分析
5. 接收发牌结果 → 观察传播效果
```

#### 会话保持
- **长期记忆**：发牌手记住用户的传播历史和偏好
- **智能推荐**：基于地理位置和兴趣标签优化策略
- **成就系统**：记录用户的传播里程碑

### 发牌手核心规则（不可修改）

#### 世界法则
1. **公平至上**：无论付费免费，每张牌都平等对待
2. **自然传播**：传播路径必须符合地理逻辑和社交常识
3. **真实反映**：毒性分析基于内容质量，不人为操纵
4. **透明操作**：传播规则向用户公开，拒绝黑箱操作
5. **道德边界**：拒绝传播有害、虚假、恶意内容

#### 地理传播协议
```
层级传播规则：
L1 (本小区)：    即时传播，0延迟
L2 (临近小区)：  5-15分钟延迟，需要L1感染≥20人
L3 (所属街道)：  30-60分钟延迟，需要L2≥2个小区≥15人
L4 (城市区域)：  2-4小时延迟，需要L3≥3个小区传播
跨国传播：       特殊毒株解锁，24-48小时延迟
```

#### 毒性评分算法（固定权重）
```
基础评分 = 内容质量分(40%) + 位置精度分(20%) + 传播历史加权(20%) + 用户信用分(20%)

内容质量维度：
- 文本长度适中(100-500字)：+2分
- 包含具体信息：+3分
- 具有互动性：+2分
- 图片质量好：+1分

传播阈值：
毒性 ≤ 3：仅限本小区传播
毒性 4-6：普通传播路径
毒性 ≥ 7：超级传播模式解锁
```

### 动态规则管理

#### 管理员后台功能
- **规则开关面板**：直观的开关控制各个规则模块
- **实时数据监控**：传播数据、用户行为、系统健康度
- **A/B测试管理**：不同用户群体应用不同规则策略
- **应急响应**：异常情况紧急关闭或调整规则

#### 可调节参数
```json
{
  "传播延迟倍数": "1.0-3.0",
  "最大传播人数": "100-10000",
  "内容审核等级": "1-5级",
  "位置精度要求": "小区级/街道级/城市级",
  "付费用户特权权重": "1.0-2.0"
}
```

## 技术架构设计

### 后端服务架构
```
发牌手服务 (Node.js):
├── 会话管理模块
├── 规则引擎核心
├── 地理传播计算
├── 内容毒性分析
├── 实时状态同步
└── 管理员接口

数据存储:
├── MongoDB (会话数据)
├── Redis (实时状态)
├── Neo4j (地理关系图)
└── S3 (附件存储)

外部服务:
├── 高德地图API (地理编码)
├── AI内容审核
└── WebSocket服务
```

### 核心算法实现

#### 发牌手决策引擎
```javascript
class FluDealer {
  async processCard(cardData) {
    // 1. 地理精度验证
    const location = await this.validateLocation(cardData.location);
    
    // 2. 内容毒性评分
    const toxicity = await this.calculateToxicity(cardData.content);
    
    // 3. 传播路径预测
    const spreadPath = await this.predictSpreadPath(toxicity, location);
    
    // 4. 延迟计算
    const delay = this.calculateDelay(spreadPath);
    
    // 5. 发牌回复
    return this.generateResponse(toxicity, spreadPath, delay);
  }
  
  async validateLocation(location) {
    // 验证位置精度，降级处理低精度位置
    const precision = await this.geocodingService.getPrecision(location);
    return precision >= 'street' ? location : this.fallbackLocation(location);
  }
  
  calculateToxicity(content) {
    // 基于内容质量、用户历史、位置上下文综合评分
    const contentScore = this.analyzeContent(content.text);
    const userScore = this.getUserCredibility(content.userId);
    const locationScore = this.getLocationContext(content.location);
    
    return (contentScore * 0.4) + (userScore * 0.3) + (locationScore * 0.3);
  }
}
```

#### 地理传播计算
```javascript
class GeographicSpreader {
  async spreadTo(targetLevel, sourceLocation, toxicity) {
    const neighbors = await this.findNeighbors(sourceLocation, targetLevel);
    const eligibleTargets = this.filterEligibleTargets(neighbors, toxicity);
    
    return {
      targets: eligibleTargets,
      delay: this.calculatePropagationDelay(targetLevel, toxicity),
      estimatedReach: this.predictReachNumber(tox)
    };
  }
  
  findNeighbors(location, level) {
    // 基于地理数据库查找邻居区域
    switch(level) {
      case 'neighborhood': return this.findNearbyCommunities(location);
      case 'district': return this.findNearbyDistricts(location);
      case 'city': return this.findNearbyCities(location);
    }
  }
}
```

## 用户体验设计

### 发牌手人格设定
- **冷静专业**：回复理性、数据驱动、科学严谨
- **神秘观察**：偶尔引用哲学思考，保持神秘感
- **适度温暖**：在专业中流露人情味，给予用户鼓励
- **逻辑清晰**：每次发牌都有明确的分析过程和结果预测

### 典型发牌对话

```
用户：[杭州西湖区文三路] "附近有什么好喝的咖啡馆？"

发牌手：📍 位置信息确认，西湖区文三路... 
        🔬 正在分析毒株特性...
        
        ✅ 毒性评分：6.2/10 - 具备良好传播潜力
        
        分析报告：
        • 内容明确度：9/10（问题具体可答）
        • 区域适用性：8/10（本地化需求明确）  
        • 互动潜力：7/10（有回答和分享价值）
        
        🗺️ 传播路径预测：
        文三路小区 → 翠苑街道 → 西湖区中心
        预计覆盖：1小时内影响15-25人
        扩散速率：中等偏快
        
        💡 建议优化：指定咖啡类型偏好(手冲/意式)，
           可提升匹配精度至23-35人覆盖范围。
```

### 管理员控制面板
```javascript
const AdminDashboard = {
  rules: {
    propagationDelay: { current: 1.0, range: [0.5, 2.0] },
    toxicityThresholds: { 
      low: { min: 1, max: 3 },
      medium: { min: 4, max: 6 },
      high: { min: 7, max: 10 }
    },
    locationPrecision: { required: 'street', options: ['city', 'street', 'community'] }
  },
  
  controls: {
    emergencyStop: false,
    contentFilterLevel: 3,
    geofencingEnabled: true,
    premiumUserBonuses: 1.2
  },
  
  analytics: {
    dailyActiveUsers: "1,234",
    propagationSuccessRate: "87%",
    averageResponseTime: "2.3s",
    toxicityDistribution: "Low:45%, Medium:42%, High:13%"
  }
};
```

## 商业模式

### 收入模型
1. **付费会员**：解锁高级传播模式和更多功能区
2. **区域服务商**：本地商家付费获得专区推广权
3. **数据服务**：匿名化的城市生活数据报告
4. **企业定制**：企业内部传播协作工具

### 用户分层权益
```
免费用户：
• 基础亮牌功能 (每日5次)
• 本小区和临近小区传播
• 标准和延迟确认机制

付费会员 (¥19.9/月)：
• 无限亮牌次数
• 加速传播选项
• 街道级和城市级传播权限
• 详细传播分析报告

超级会员 (¥69.9/月)：
• 跨国传播权限
• 自定义毒株定向
• 优先发牌排队
• Beta功能抢先体验
```

## 竞争壁垒

### 技术壁垒
- **独特算法**：基于地理位置和社交网络的传播模型
- **数据积累**：区域社交密度和用户行为数据
- **专利保护**：核心传播算法的知识产权

### 生态壁垒  
- **网络效应**：用户越多，传播效果越好
- **转换成本**：用户的传播历史和社交关系沉淀
- **地域优势**：深度本地化的先行者优势

## 风险管理

### 技术风险
- **系统稳定性**：确保发牌手服务99.9%可用性
- **数据安全**：用户隐私保护和数据加密
- **扩展性**：支持百万级用户同时亮牌

### 业务风险
- **竞争压力**：大厂快速复制功能
- **用户留存**：保持产品新鲜感和粘性
- **合规风险**：内容审核和政策合规

## 未来规划

### Phase 1: MVP验证 (3个月)
- 完成发牌手核心功能
- 杭州5000种子用户验证
- 基础传播机制测试

### Phase 2: 功能完善 (6个月)  
- 增加附件处理能力
- 完善管理员后台
- 扩展至3-5个城市

### Phase 3: 生态建设 (12个月)
- 商家服务整合
- 内容创作者扶持
- 开放API平台

---

*FluLink流感发牌手服务将通过其独特的"亮牌"机制和AI仲裁系统，重新定义异步社交的标准。我们的目标不是替代现有社交平台，而是创造一个全新的社交范式——一个让内容像流感一样自然而然地找到最合适的传播路径，让用户在每一次"亮牌"中都能感受到未知的刺激和社交的乐趣。*
