# FluLink 数据库Schema设计

## 核心数据模型

### 1. User (用户模型)
```javascript
{
  _id: ObjectId,
  phone: String,           // 手机号(唯一)
  nickname: String,         // 昵称
  motto: String,           // 个人签名
  poem: String,            // 代表诗句
  avatar: String,          // 头像URL
  starColor: String,       // 星球颜色
  
  // 社交属性
  tags: [String],          // 兴趣标签
  contentPreferences: Map,  // 内容偏好权重
  
  // 互动历史
  interactions: [{
    targetUserId: ObjectId,
    targetSeedId: ObjectId,
    actionType: String,    // 'like', 'comment', 'forward'
    timestamp: Date
  }],
  
  // 星团状态
  currentCluster: ObjectId, // 当前星团ID
  clusterHistory: [ObjectId], // 历史星团ID列表
  
  // 用户状态
  isActive: Boolean,
  lastActiveAt: Date,
  daysActive: Number,      // 活跃天数
  
  // 系统字段
  createdAt: Date,
  updatedAt: Date
}
```

### 2. StarSeed (星种模型)
```javascript
{
  _id: ObjectId,
  authorId: ObjectId,      // 发布者ID
  
  // 内容
  content: String,         // 文字内容
  imageUrl: String,        // 图片URL
  audioUrl: String,        // 音频URL
  
  // 星种属性
  luminosity: Number,      // 当前光度
  initialLuminosity: Number, // 初始光度
  spectrum: Map,           // 光谱标签权重
  
  // 传播状态
  clusterId: ObjectId,    // 所属星团ID
  propagationPath: [{
    clusterId: ObjectId,
    timestamp: Date,
    userCount: Number
  }],
  
  // 互动数据
  interactions: [{
    userId: ObjectId,
    actionType: String,    // 'like', 'comment', 'forward'
    timestamp: Date
  }],
  
  // 演化历史
  evolutionHistory: [{
    timestamp: Date,
    luminosity: Number,
    spectrum: Map
  }],
  
  // 跃迁状态
  jumpEligible: Boolean,   // 是否具备跃迁资格
  jumpTargets: [ObjectId], // 跃迁目标星团
  
  // 系统字段
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Cluster (星团模型)
```javascript
{
  _id: ObjectId,
  
  // 星团成员
  members: [ObjectId],     // 49个用户ID
  coreUsers: [ObjectId],   // 核心用户(触发星团生成的用户)
  
  // 星团属性
  resonanceScore: Number,  // 核心共鸣值
  averageResonance: Number, // 平均共鸣值
  
  // 活跃度分布
  activityDistribution: {
    high: Number,          // 高活跃用户数量
    medium: Number,        // 中活跃用户数量
    low: Number           // 低活跃用户数量
  },
  
  // 标签多样性
  tagDiversity: Map,      // 标签分布统计
  
  // 生命周期
  createdAt: Date,
  expiresAt: Date,        // 7天后过期
  isActive: Boolean,      // 是否活跃
  
  // 星团统计
  totalSeeds: Number,     // 总星种数
  totalInteractions: Number, // 总互动数
  averageLuminosity: Number, // 平均光度
}
```

### 4. Interaction (互动模型)
```javascript
{
  _id: ObjectId,
  userId: ObjectId,        // 互动者ID
  targetType: String,      // 'starseed', 'user'
  targetId: ObjectId,      // 目标ID
  actionType: String,      // 'like', 'comment', 'forward', 'view'
  
  // 互动内容
  content: String,         // 评论内容(如果是评论)
  
  // 共鸣影响
  resonanceImpact: Number, // 对共鸣值的影响
  
  // 系统字段
  createdAt: Date
}
```

### 5. Resonance (共鸣记录模型)
```javascript
{
  _id: ObjectId,
  userA: ObjectId,        // 用户A
  userB: ObjectId,        // 用户B
  
  // 共鸣计算
  tagSimilarity: Number,  // 标签相似度
  interactionScore: Number, // 互动得分
  contentPreferenceMatch: Number, // 内容偏好匹配
  randomFactor: Number,   // 随机因子
  
  // 最终共鸣值
  totalResonance: Number, // 总共鸣值
  calculatedAt: Date,     // 计算时间
  
  // 历史记录
  history: [{
    timestamp: Date,
    resonance: Number,
    factors: {
      tagSimilarity: Number,
      interactionScore: Number,
      contentPreferenceMatch: Number,
      randomFactor: Number
    }
  }]
}
```

## 索引设计

### User集合索引
- `phone`: 唯一索引
- `currentCluster`: 普通索引
- `tags`: 多键索引
- `isActive`: 普通索引
- `lastActiveAt`: 普通索引

### StarSeed集合索引
- `authorId`: 普通索引
- `clusterId`: 普通索引
- `luminosity`: 普通索引
- `createdAt`: 普通索引
- `jumpEligible`: 普通索引

### Cluster集合索引
- `members`: 多键索引
- `expiresAt`: 普通索引
- `isActive`: 普通索引
- `createdAt`: 普通索引

### Interaction集合索引
- `userId`: 普通索引
- `targetId`: 普通索引
- `targetType`: 普通索引
- `createdAt`: 普通索引

### Resonance集合索引
- `userA`: 普通索引
- `userB`: 普通索引
- `totalResonance`: 普通索引
- `calculatedAt`: 普通索引

## 数据关系

1. **User ↔ Cluster**: 多对多关系，通过members数组
2. **User ↔ StarSeed**: 一对多关系，通过authorId
3. **Cluster ↔ StarSeed**: 一对多关系，通过clusterId
4. **User ↔ Interaction**: 一对多关系，通过userId
5. **StarSeed ↔ Interaction**: 一对多关系，通过targetId
6. **User ↔ Resonance**: 多对多关系，通过userA和userB

## 数据一致性保证

1. **星团成员限制**: 确保每个星团只有49个成员
2. **星团生命周期**: 7天自动过期机制
3. **共鸣值更新**: 互动后自动重新计算共鸣值
4. **光度演化**: 星种互动后自动更新光度
5. **标签权重**: 根据互动反馈动态调整标签权重

