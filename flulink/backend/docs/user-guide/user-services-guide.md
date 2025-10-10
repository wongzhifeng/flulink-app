# FluLink 用户服务节点使用指南

**版本**: v1.0.0  
**理念**: 基于《德道经》"利而不害"原则的互助服务平台

---

## 概述

用户服务节点（长期服务标签/"毒株"）是FluLink平台的核心功能，允许用户发布和匹配长期服务，通过地理围栏和信用评分系统实现智能匹配，确保所有服务交易互利互惠。

### 核心价值

- **互助共赢**: 让服务像"毒株"一样自然传播，连接有需要的人
- **道德优先**: 基于《德道经》哲学，确保所有交易"利而不害"
- **智能匹配**: 地理围栏+信用评分，精准推荐优质服务
- **轨迹围栏**: 自动检测用户轨迹与服务范围交集，触发"毒株"推送

---

## 快速开始

### 1. 注册登录

首先需要注册FluLink账号：

```javascript
// 注册
const register = async () => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: '13900000000',
      password: 'your_password',
      nickname: '您的昵称'
    })
  });
  
  const result = await response.json();
  localStorage.setItem('token', result.data.token);
};
```

### 2. 更新位置信息

为了使用服务匹配功能，需要更新您的位置：

```javascript
// 更新位置
const updateLocation = async (coordinates) => {
  const response = await fetch('/api/users/location', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      coordinates: [116.404, 39.915] // [经度, 纬度]
    })
  });
};
```

---

## 发布服务

### 服务类型

平台支持6种基础服务类型：

| 类型 | 说明 | 示例 |
|------|------|------|
| `housing` | 房屋租赁 | 合租房源、短租公寓 |
| `repair` | 维修服务 | 家电维修、家具维修 |
| `education` | 教育培训 | 一对一辅导、技能培训 |
| `health` | 健康服务 | 健身指导、健康咨询 |
| `transport` | 交通出行 | 顺风车、代驾服务 |
| `other` | 其他服务 | 宠物照顾、家政服务 |

### 发布步骤

#### 1. 准备服务信息

```javascript
const serviceData = {
  serviceType: 'housing',
  title: '两室一厅合租',
  description: '环境优美，交通便利，适合上班族。房间朝南，采光好，家具齐全。',
  images: [
    'https://example.com/room1.jpg',
    'https://example.com/room2.jpg'
  ],
  location: {
    coordinates: [116.404, 39.915] // 您的服务位置
  },
  serviceRadius: 1.0 // 服务范围（公里）
};
```

#### 2. 发布服务

```javascript
const publishService = async (serviceData) => {
  try {
    const response = await fetch('/api/services/publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(serviceData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ 服务发布成功！');
      console.log(`📜 ${result.daoQuote}`);
      return result.data;
    } else {
      console.log('❌ 发布失败:', result.message);
      console.log(`📜 ${result.daoQuote}`);
      
      // 处理道德风控拦截
      if (result.violations) {
        result.violations.forEach(violation => {
          console.log(`⚠️ ${violation.message}`);
        });
      }
    }
  } catch (error) {
    console.error('网络错误:', error);
  }
};
```

### 道德风控规则

发布服务时会自动进行道德风控检查：

#### 规则1: 新用户限制（"知止不殆"）
- 新用户7天内只能发布1个服务
- 防止新用户过度扩张

#### 规则2: 差评率冻结（"利而不害"）
- 差评率>30%自动暂停所有服务
- 保护服务寻求者权益

#### 规则3: IP防刷单
- 同一IP下最多发布2个服务
- 防止恶意刷单和虚假服务

#### 规则4: 服务数量上限（"知足不辱"）
- 新用户最多1个服务
- 老用户最多3个服务

---

## 匹配服务

### 搜索附近服务

```javascript
const searchServices = async (serviceType, userLocation) => {
  try {
    const response = await fetch('/api/services/match', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        serviceType: serviceType,
        location: {
          coordinates: userLocation
        },
        maxDistance: 1000 // 搜索范围（米）
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log(`🎯 找到 ${result.data.count} 个匹配服务`);
      return result.data.matches;
    }
  } catch (error) {
    console.error('搜索失败:', error);
  }
};
```

### 匹配算法说明

服务匹配采用加权评分机制：

- **距离权重 (40%)**: 1公里线性衰减
- **信用权重 (40%)**: 基于用户信用分和共鸣算法
- **时效性权重 (20%)**: 30天内线性衰减

### 匹配结果示例

```javascript
const matches = [
  {
    service: {
      _id: "64f8a1b2c3d4e5f6a7b8c9d0",
      serviceType: "housing",
      title: "两室一厅合租",
      description: "环境优美，交通便利",
      location: {
        coordinates: [116.404, 39.915]
      },
      serviceRadius: 1.0,
      creditScore: 85,
      userId: {
        _id: "64f8a1b2c3d4e5f6a7b8c9d1",
        nickname: "房东小王",
        creditScore: 85
      }
    },
    score: 0.85, // 综合匹配分数
    distance: 120, // 距离（米）
    breakdown: {
      distanceWeight: "0.88", // 距离权重
      creditWeight: "0.85",   // 信用权重
      freshnessWeight: "0.95" // 时效性权重
    }
  }
];
```

---

## 管理服务

### 查看我的服务

```javascript
const getMyServices = async () => {
  const response = await fetch('/api/services/my-services', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const result = await response.json();
  return result.data;
};
```

### 关闭服务

```javascript
const deactivateService = async (serviceId) => {
  const response = await fetch(`/api/services/${serviceId}/deactivate`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const result = await response.json();
  
  if (result.success) {
    console.log('✅ 服务已关闭');
    console.log(`📜 ${result.daoQuote}`); // "知足不辱，知止不殆"
  }
};
```

### 评价服务

```javascript
const rateService = async (serviceId, rating) => {
  const response = await fetch(`/api/services/${serviceId}/rate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      score: rating.score, // 1-5分
      comment: rating.comment,
      isPositive: rating.score >= 4
    })
  });
  
  const result = await response.json();
  
  if (result.success) {
    console.log('✅ 评价成功');
    console.log(`📜 ${result.daoQuote}`);
  }
};
```

---

## 信用评分系统

### 信用分计算

信用分范围：60-100分

| 行为 | 影响 | 说明 |
|------|------|------|
| 好评 | +2分 | 获得正面评价 |
| 差评 | -5分 | 获得负面评价 |
| 完成服务 | +1分 | 成功完成服务 |
| 违规 | -10分 | 违反平台规则 |
| 互助服务 | +3分 | 提供互助服务 |

### 信用等级

- **90-100分**: 优秀服务提供者
- **80-89分**: 良好服务提供者
- **70-79分**: 一般服务提供者
- **60-69分**: 需要改进
- **<60分**: 信用过低，可能被限制

### 提升信用分

1. **提供优质服务**: 确保服务质量，及时响应
2. **获得正面评价**: 鼓励用户给出好评
3. **遵守平台规则**: 避免违规行为
4. **互助服务**: 主动提供帮助

---

## 轨迹围栏功能

### 自动"毒株"推送

当用户轨迹与服务提供者位置有交集时，系统会自动推送相关服务：

```javascript
// 检查轨迹交集（后端自动执行）
const checkTrajectoryIntersection = async (userId, serviceId) => {
  // 系统会检查用户24小时内的位置历史
  // 如果与服务范围有交集，触发推送通知
};
```

### 位置历史管理

```javascript
// 更新位置历史
const updateLocationHistory = async (coordinates, accuracy) => {
  const response = await fetch('/api/users/location-history', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      coordinates: coordinates,
      accuracy: accuracy // 定位精度（米）
    })
  });
};
```

---

## 最佳实践

### 服务发布

1. **标题简洁明了**
   - 突出核心价值
   - 避免冗长描述
   - 最多50字

2. **描述详细具体**
   - 包含关键信息
   - 说明服务内容
   - 最多200字

3. **选择合适位置**
   - 准确的地理坐标
   - 合理的服务范围
   - 考虑交通便利性

4. **上传优质图片**
   - 清晰的服务照片
   - 最多3张图片
   - 展示服务特色

### 服务匹配

1. **明确需求**
   - 选择正确的服务类型
   - 设定合理的搜索范围
   - 考虑时间因素

2. **关注信用**
   - 优先选择高信用提供者
   - 查看历史评价
   - 了解服务记录

3. **及时沟通**
   - 快速响应匹配结果
   - 详细询问服务细节
   - 确认服务条件

### 道德风控

1. **遵守规则**
   - 了解平台政策
   - 避免违规行为
   - 维护良好记录

2. **提供优质服务**
   - 确保服务质量
   - 及时响应需求
   - 持续改进

3. **合理使用资源**
   - 不要滥用服务槽位
   - 避免重复发布
   - 及时关闭不需要的服务

---

## 常见问题

### Q: 为什么新用户只能发布1个服务？

A: 这是基于《德道经》"知止不殆"原则的保护机制，防止新用户过度扩张，确保平台服务质量。

### Q: 如何提升信用分？

A: 提供优质服务、获得正面评价、遵守平台规则、主动互助等行为都可以提升信用分。

### Q: 差评率过高会怎样？

A: 差评率>30%会自动暂停所有服务，这是"利而不害"原则的体现，保护服务寻求者权益。

### Q: 服务匹配的范围如何确定？

A: 默认搜索1公里范围内的服务，您可以根据需要调整maxDistance参数。

### Q: 如何获得"毒株"推送？

A: 当您的轨迹与服务提供者的服务范围有交集时，系统会自动推送相关服务通知。

---

## 技术支持

### 获取帮助

1. **API文档**: [用户服务API文档](./user-services-api.md)
2. **Swagger文档**: https://flulink-backend-v2.zeabur.app/api-docs
3. **道德风控规则**: [道德风控说明](#道德风控规则)

### 错误处理

```javascript
const handleApiError = (error) => {
  switch (error.status) {
    case 401:
      console.log('认证失败，请重新登录');
      break;
    case 403:
      console.log('道德风控拦截:', error.message);
      console.log('建议:', error.daoQuote);
      break;
    case 404:
      console.log('服务不存在');
      break;
    case 500:
      console.log('服务器错误，请稍后重试');
      break;
    default:
      console.log('未知错误:', error.message);
  }
};
```

---

## 道家哲学理念

### 核心原则

- **"利而不害"**: 所有服务必须互利互惠，不伤害任何一方
- **"知足不辱，知止不殆"**: 限制服务数量，防止贪婪和过度扩张
- **"天道无亲，常与善人"**: 信用评分系统奖励善行，优先推荐高信用用户
- **"治大国若烹小鲜"**: 小步快跑，稳定发展，避免频繁变更

### 界面文案

- 服务发布成功: "天道无亲，常与善人"
- 服务关闭: "知足不辱，知止不殆"
- 道德警告: "利而不害"
- 新用户限制: "知止不殆"

---

**指南版本**: v1.0.0  
**最后更新**: 2024-10-10  
**开发理念**: 《德道经》哲学指导  
**技术支持**: FluLink开发团队

---

*"让服务像流感一样自然而然地传播，让社交回归本质，让连接更有意义。"* ✨

