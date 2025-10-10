# FluLink 用户服务节点 API 文档

**版本**: v1.0.0  
**基础URL**: `https://flulink-backend-v2.zeabur.app/api`  
**开发理念**: 基于《德道经》"利而不害"原则

---

## 概述

用户服务节点（长期服务标签/"毒株"）功能允许用户发布和匹配长期服务，通过地理围栏和信用评分系统实现智能匹配，确保所有服务交易互利互惠。

### 核心特性

- **地理围栏匹配**: 基于MongoDB 2dsphere索引的1公里范围匹配
- **信用评分系统**: 60-100分评分，集成共鸣算法加成
- **道德风控**: 4条核心规则自动验证和拦截
- **轨迹围栏**: 支持用户位置历史与服务范围交集检测

---

## 认证

所有API请求都需要Bearer Token认证：

```http
Authorization: Bearer <your_jwt_token>
```

---

## API端点

### 1. 发布服务

发布长期服务标签，需通过道德风控验证。

```http
POST /api/services/publish
```

**请求体**:
```json
{
  "serviceType": "housing",
  "title": "两室一厅合租",
  "description": "环境优美，交通便利，适合上班族",
  "images": ["https://example.com/image1.jpg"],
  "location": {
    "coordinates": [116.404, 39.915]
  },
  "serviceRadius": 1.0
}
```

**参数说明**:
- `serviceType` (string, required): 服务类型
  - `housing`: 房屋租赁
  - `repair`: 维修服务
  - `education`: 教育培训
  - `health`: 健康服务
  - `transport`: 交通出行
  - `other`: 其他服务
- `title` (string, required): 服务标题，最多50字
- `description` (string, required): 服务描述，最多200字
- `images` (array, optional): 服务图片URL，最多3张
- `location.coordinates` (array, required): [经度, 纬度]
- `serviceRadius` (number, optional): 服务范围（公里），0.1-5.0，默认1.0

**成功响应** (201):
```json
{
  "success": true,
  "message": "服务发布成功",
  "daoQuote": "天道无亲，常与善人",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "serviceType": "housing",
    "title": "两室一厅合租",
    "description": "环境优美，交通便利，适合上班族",
    "location": {
      "type": "Point",
      "coordinates": [116.404, 39.915]
    },
    "serviceRadius": 1.0,
    "creditScore": 80,
    "moralStatus": "active",
    "isActive": true,
    "createdAt": "2024-10-10T10:00:00.000Z"
  }
}
```

**道德风控拦截** (403):
```json
{
  "success": false,
  "message": "知止不殆：新用户7天内只能发布1个服务",
  "daoQuote": "知足不辱，知止不殆",
  "violations": [
    {
      "rule": "NEW_USER_LIMIT",
      "message": "知止不殆：新用户7天内只能发布1个服务",
      "daoQuote": "知足不辱，知止不殆",
      "severity": "high"
    }
  ]
}
```

---

### 2. 匹配服务

基于地理围栏和信用评分匹配附近的服务提供者。

```http
POST /api/services/match
```

**请求体**:
```json
{
  "serviceType": "housing",
  "location": {
    "coordinates": [116.405, 39.916]
  },
  "maxDistance": 1000
}
```

**参数说明**:
- `serviceType` (string, required): 服务类型
- `location.coordinates` (array, required): [经度, 纬度]
- `maxDistance` (number, optional): 最大距离（米），默认1000

**成功响应** (200):
```json
{
  "success": true,
  "message": "匹配成功",
  "daoQuote": "天道无亲，常与善人",
  "data": {
    "matches": [
      {
        "service": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
          "serviceType": "housing",
          "title": "两室一厅合租",
          "description": "环境优美，交通便利",
          "location": {
            "coordinates": [116.404, 39.915]
          },
          "serviceRadius": 1.0,
          "creditScore": 85,
          "userId": {
            "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
            "nickname": "房东小王",
            "creditScore": 85
          }
        },
        "score": 0.85,
        "distance": 120,
        "breakdown": {
          "distanceWeight": "0.88",
          "creditWeight": "0.85",
          "freshnessWeight": "0.95"
        }
      }
    ],
    "count": 1
  }
}
```

---

### 3. 获取我的服务

获取当前用户的所有服务列表。

```http
GET /api/services/my-services
```

**成功响应** (200):
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "serviceType": "housing",
      "title": "两室一厅合租",
      "description": "环境优美，交通便利",
      "isActive": true,
      "moralStatus": "active",
      "ratings": {
        "totalCount": 5,
        "averageScore": 4.2,
        "negativeRate": 0.1
      },
      "createdAt": "2024-10-10T10:00:00.000Z"
    }
  ]
}
```

---

### 4. 获取服务详情

获取指定服务的详细信息，包含风险评分。

```http
GET /api/services/{id}
```

**路径参数**:
- `id` (string): 服务ID

**成功响应** (200):
```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "serviceType": "housing",
    "title": "两室一厅合租",
    "description": "环境优美，交通便利",
    "images": ["https://example.com/image1.jpg"],
    "location": {
      "type": "Point",
      "coordinates": [116.404, 39.915]
    },
    "serviceRadius": 1.0,
    "creditScore": 80,
    "moralStatus": "active",
    "ratings": {
      "totalCount": 5,
      "averageScore": 4.2,
      "negativeRate": 0.1
    },
    "riskScore": 15,
    "createdAt": "2024-10-10T10:00:00.000Z"
  }
}
```

---

### 5. 关闭服务

关闭指定的服务。

```http
PUT /api/services/{id}/deactivate
```

**路径参数**:
- `id` (string): 服务ID

**成功响应** (200):
```json
{
  "success": true,
  "message": "知足不辱，知止不殆",
  "daoQuote": "知足不辱，知止不殆",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "isActive": false,
    "updatedAt": "2024-10-10T11:00:00.000Z"
  }
}
```

---

### 6. 评价服务

对服务进行评价，自动更新服务提供者信用分。

```http
POST /api/services/{id}/rate
```

**请求体**:
```json
{
  "score": 5,
  "comment": "服务很好，推荐！",
  "isPositive": true
}
```

**参数说明**:
- `score` (number, required): 评分，1-5分
- `comment` (string, optional): 评价内容
- `isPositive` (boolean, required): 是否正面评价

**成功响应** (200):
```json
{
  "success": true,
  "message": "评价成功",
  "daoQuote": "天道无亲，常与善人"
}
```

---

## 道德风控规则

### 规则1: 新用户限制（"知止不殆"）
- 新用户7天内只能发布1个服务
- 防止新用户过度扩张

### 规则2: 差评率冻结（"利而不害"）
- 差评率>30%自动暂停所有服务
- 保护服务寻求者权益

### 规则3: IP防刷单
- 同一IP下最多发布2个服务
- 防止恶意刷单和虚假服务

### 规则4: 服务数量上限（"知足不辱"）
- 新用户最多1个服务
- 老用户最多3个服务

---

## 错误码

| 状态码 | 说明 | 示例 |
|--------|------|------|
| 200 | 请求成功 | 获取服务列表成功 |
| 201 | 创建成功 | 服务发布成功 |
| 400 | 请求参数错误 | 缺少必填字段 |
| 401 | 认证失败 | Token无效或过期 |
| 403 | 道德风控拦截 | 新用户限制 |
| 404 | 资源不存在 | 服务不存在 |
| 500 | 服务器错误 | 数据库连接失败 |

---

## 使用示例

### JavaScript/TypeScript

```typescript
// 发布服务
const publishService = async (serviceData: any) => {
  const response = await fetch('https://flulink-backend-v2.zeabur.app/api/services/publish', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(serviceData)
  });
  
  const result = await response.json();
  
  if (result.success) {
    console.log('服务发布成功:', result.daoQuote);
    return result.data;
  } else {
    console.error('发布失败:', result.message);
    throw new Error(result.message);
  }
};

// 匹配服务
const matchServices = async (serviceType: string, location: any) => {
  const response = await fetch('https://flulink-backend-v2.zeabur.app/api/services/match', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      serviceType,
      location,
      maxDistance: 1000
    })
  });
  
  const result = await response.json();
  return result.data.matches;
};
```

### Python

```python
import requests

def publish_service(service_data, token):
    url = "https://flulink-backend-v2.zeabur.app/api/services/publish"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }
    
    response = requests.post(url, json=service_data, headers=headers)
    result = response.json()
    
    if result["success"]:
        print(f"服务发布成功: {result['daoQuote']}")
        return result["data"]
    else:
        print(f"发布失败: {result['message']}")
        raise Exception(result["message"])

def match_services(service_type, location, token):
    url = "https://flulink-backend-v2.zeabur.app/api/services/match"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }
    
    data = {
        "serviceType": service_type,
        "location": location,
        "maxDistance": 1000
    }
    
    response = requests.post(url, json=data, headers=headers)
    result = response.json()
    
    return result["data"]["matches"]
```

---

## 最佳实践

### 1. 服务发布
- 标题简洁明了，突出核心价值
- 描述详细具体，包含关键信息
- 选择合适的地理位置和服务范围
- 上传高质量的服务图片

### 2. 服务匹配
- 根据实际需求选择服务类型
- 合理设置搜索范围
- 关注信用评分和评价信息
- 优先选择高信用服务提供者

### 3. 道德风控
- 遵守平台规则，避免违规行为
- 提供优质服务，维护良好信用
- 及时响应评价，持续改进
- 合理使用服务槽位

---

## 道家哲学引用

### 核心原则
- **"利而不害"**: 所有服务必须互利互惠
- **"知足不辱，知止不殆"**: 限制服务数量，防止过度扩张
- **"天道无亲，常与善人"**: 信用评分优先，奖励善行
- **"治大国若烹小鲜"**: 小步快跑，稳定发展

### 界面文案
- 服务发布成功: "天道无亲，常与善人"
- 服务关闭: "知足不辱，知止不殆"
- 道德警告: "利而不害"
- 新用户限制: "知止不殆"

---

## 技术支持

如有问题，请参考：
1. [Swagger API文档](https://flulink-backend-v2.zeabur.app/api-docs)
2. [道德风控规则说明](#道德风控规则)
3. [错误码对照表](#错误码)

---

**文档版本**: v1.0.0  
**最后更新**: 2024-10-10  
**开发理念**: 《德道经》哲学指导  
**技术栈**: Node.js + MongoDB + React + TypeScript

