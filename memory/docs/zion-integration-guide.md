# Zion数据集成指南

## 🎯 集成目标

将FluLink MVP的内存存储替换为真实的Zion SDK，实现持久化数据存储。

## 📊 当前状态

### ✅ 已完成
- **服务架构**: Node.js + Express + CORS
- **API接口**: 9个核心接口全部实现
- **微信集成**: 测试号验证接口就绪
- **数据模型**: 用户、毒株、感染记录结构设计
- **算法逻辑**: 传播计算、距离计算、评分算法
- **Zion配置**: 项目ID、Token、API基础配置

### 🔄 当前实现
- **数据存储**: 内存Map模拟（临时方案）
- **Zion连接**: 配置就绪，等待SDK集成
- **API测试**: 所有接口功能正常

## 🏗️ Zion数据模型设计

### 1. 用户表 (account)
```sql
-- 使用现有account表，扩展oauth2_user_info_map字段
{
  "id": "BIGSERIAL PRIMARY KEY",
  "fz_email": "TEXT (openid)",
  "fz_phone_number": "TEXT",
  "oauth2_user_info_map": "JSONB (位置信息)",
  "created_at": "TIMESTAMPTZ",
  "updated_at": "TIMESTAMPTZ"
}
```

**oauth2_user_info_map结构**:
```json
{
  "openid": "用户微信openid",
  "last_location": {
    "latitude": 39.9042,
    "longitude": 116.4074
  },
  "last_updated": "2024-10-06T03:28:34.070Z",
  "profile": {
    "nickname": "用户昵称",
    "avatar": "头像URL"
  }
}
```

### 2. 毒株表 (fz_audit_record)
```sql
-- 使用现有fz_audit_record表存储毒株数据
{
  "id": "BIGSERIAL PRIMARY KEY",
  "account_id": "BIGINT (创建者ID)",
  "query_string": "TEXT ('strain_create')",
  "variables": "JSONB (毒株数据)",
  "created_at": "TIMESTAMPTZ"
}
```

**variables结构**:
```json
{
  "strain_id": "唯一毒株ID",
  "creator_openid": "创建者openid",
  "type": "text|image|form",
  "content": "毒株内容",
  "base_score": "基础毒性评分(1-10)",
  "location": {
    "latitude": 39.9042,
    "longitude": 116.4074
  },
  "infected_count": "感染人数",
  "status": "active|inactive",
  "created_at": "2024-10-06T03:28:34.070Z"
}
```

### 3. 感染记录表 (fz_audit_record)
```sql
-- 使用现有fz_audit_record表存储感染记录
{
  "id": "BIGSERIAL PRIMARY KEY",
  "account_id": "BIGINT (感染者ID)",
  "query_string": "TEXT ('strain_infect')",
  "variables": "JSONB (感染数据)",
  "created_at": "TIMESTAMPTZ"
}
```

**variables结构**:
```json
{
  "strain_id": "被感染的毒株ID",
  "infected_at": "2024-10-06T03:28:34.070Z",
  "infection_source": "感染来源",
  "location": {
    "latitude": 39.9042,
    "longitude": 116.4074
  }
}
```

## 🔧 Zion SDK集成方案

### 方案1: GraphQL API调用
```javascript
// 使用fetch直接调用Zion GraphQL API
async function zionQuery(query, variables = {}) {
  const response = await fetch(`${ZION_API_BASE}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ZION_TOKEN}`,
      'X-Zion-Project-Id': ZION_PROJECT_ID
    },
    body: JSON.stringify({ query, variables })
  });
  return await response.json();
}
```

### 方案2: Zion SDK包
```javascript
// 安装Zion SDK
npm install @functorz/zion-sdk

// 使用SDK
const Zion = require('@functorz/zion-sdk');
const zionClient = new Zion({
  token: ZION_TOKEN,
  projectId: ZION_PROJECT_ID,
  apiBase: ZION_API_BASE
});
```

## 📝 核心API实现

### 1. 用户注册/更新
```javascript
app.post('/api/user/update', async (req, res) => {
  const { openid, latitude, longitude } = req.body;
  
  // 检查用户是否存在
  const checkQuery = `
    query GetUser($email: String!) {
      account(where: {fz_email: {_eq: $email}}) {
        id
        oauth2_user_info_map
      }
    }
  `;
  
  const result = await zionQuery(checkQuery, { email: openid });
  
  if (result.data.account.length > 0) {
    // 更新用户位置
    const updateQuery = `
      mutation UpdateUser($id: BigInt!, $oauth2Info: JSONB!) {
        update_account_by_pk(pk_columns: {id: $id}, _set: {
          oauth2_user_info_map: $oauth2Info,
          updated_at: "now()"
        }) {
          id
        }
      }
    `;
    // 执行更新...
  } else {
    // 创建新用户
    const createQuery = `
      mutation CreateUser($email: String!, $phone: String!, $oauth2Info: JSONB!) {
        insert_account_one(object: {
          fz_email: $email,
          fz_phone_number: $phone,
          fz_deleted: false,
          oauth2_user_info_map: $oauth2Info
        }) {
          id
        }
      }
    `;
    // 执行创建...
  }
});
```

### 2. 毒株创建
```javascript
app.post('/api/strain/create', async (req, res) => {
  const { openid, type, content, latitude, longitude } = req.body;
  
  // 计算毒性评分
  let base_score = 5;
  if (content.length > 50) base_score += 1;
  if (content.length > 100) base_score += 1;
  if (type === 'form') base_score += 2;
  base_score = Math.min(10, Math.max(1, base_score));
  
  // 创建毒株记录
  const createQuery = `
    mutation CreateStrain($accountId: BigInt!, $variables: JSONB!) {
      insert_fz_audit_record_one(object: {
        account_id: $accountId,
        query_string: "strain_create",
        variables: $variables
      }) {
        id
      }
    }
  `;
  
  const strainData = {
    strain_id: generateId(),
    creator_openid: openid,
    type, content, base_score,
    location: { latitude, longitude },
    infected_count: 0,
    created_at: new Date().toISOString(),
    status: 'active'
  };
  
  await zionQuery(createQuery, {
    accountId: userId,
    variables: JSON.stringify(strainData)
  });
});
```

### 3. 感染传播
```javascript
app.post('/api/strain/infect', async (req, res) => {
  const { strain_id, openid } = req.body;
  
  // 检查是否已感染
  const checkQuery = `
    query CheckInfection($accountId: BigInt!, $strainId: String!) {
      fz_audit_record(where: {
        account_id: {_eq: $accountId},
        query_string: {_eq: "strain_infect"},
        variables: {_contains: $strainId}
      }) {
        id
      }
    }
  `;
  
  // 记录感染
  const createQuery = `
    mutation CreateInfection($accountId: BigInt!, $variables: JSONB!) {
      insert_fz_audit_record_one(object: {
        account_id: $accountId,
        query_string: "strain_infect",
        variables: $variables
      }) {
        id
      }
    }
  `;
  
  // 更新毒株感染计数
  const updateQuery = `
    mutation UpdateStrain($id: BigInt!, $variables: JSONB!) {
      update_fz_audit_record_by_pk(pk_columns: {id: $id}, _set: {
        variables: $variables
      }) {
        id
      }
    }
  `;
});
```

## 🚀 部署配置

### 环境变量
```bash
ZION_TOKEN=mg7edqye
ZION_PROJECT_ID=QP7kZReZywL
ZION_API_BASE=https://zion-api.functorz.com
PORT=3000
NODE_ENV=production
```

### package.json依赖
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "@functorz/zion-sdk": "^1.0.0"
  }
}
```

## 🔍 测试验证

### 1. 连接测试
```bash
curl http://localhost:3000/api/zion/info
```

### 2. 用户注册测试
```bash
curl -X POST http://localhost:3000/api/user/update \
  -H "Content-Type: application/json" \
  -d '{"openid":"test123","latitude":39.9042,"longitude":116.4074}'
```

### 3. 毒株创建测试
```bash
curl -X POST http://localhost:3000/api/strain/create \
  -H "Content-Type: application/json" \
  -d '{"openid":"test123","type":"text","content":"测试毒株","latitude":39.9042,"longitude":116.4074}'
```

### 4. 感染测试
```bash
curl -X POST http://localhost:3000/api/strain/infect \
  -H "Content-Type: application/json" \
  -d '{"strain_id":"strain123","openid":"test456"}'
```

## 📊 性能优化

### 1. 数据查询优化
- 使用索引优化地理位置查询
- 限制查询结果数量（limit 20）
- 缓存热点数据

### 2. API响应优化
- 异步处理非关键操作
- 批量操作减少API调用
- 错误重试机制

### 3. 存储优化
- JSONB字段压缩存储
- 定期清理过期数据
- 分页查询大数据集

## 🎯 下一步计划

### 阶段1: 基础集成
1. ✅ 服务架构设计
2. ✅ API接口实现
3. ✅ 数据模型设计
4. ⏳ Zion SDK集成
5. ⏳ 数据持久化测试

### 阶段2: 功能完善
1. ⏳ 微信小程序集成
2. ⏳ 实时数据同步
3. ⏳ 性能优化
4. ⏳ 错误处理完善

### 阶段3: 生产部署
1. ⏳ Zeabur部署配置
2. ⏳ 微信测试号验证
3. ⏳ 生产环境测试
4. ⏳ 监控和日志

---

**集成状态**: 准备就绪，等待Zion SDK集成  
**项目ID**: QP7kZReZywL  
**Token**: mg7edqye  
**API基础**: https://zion-api.functorz.com
