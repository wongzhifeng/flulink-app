# API文档

## 项目信息
- **项目名称**: [项目名称]
- **API版本**: [版本号]
- **最后更新**: [更新日期]
- **记忆入口**: [memory/memory.md]

## API概览

### 基础信息
- **API名称**: [API名称]
- **版本**: [版本号]
- **基础URL**: [基础URL]
- **认证方式**: [认证方式]
- **数据格式**: [JSON/XML/其他]

### 通用响应格式
```json
{
  "code": 200,
  "message": "success",
  "data": {},
  "timestamp": "2025-01-01T00:00:00Z"
}
```

## API端点

### 用户管理 API

#### 用户注册
- **URL**: `POST /api/users/register`
- **描述**: 用户注册接口
- **请求参数**:
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **响应示例**:
  ```json
  {
    "code": 200,
    "message": "注册成功",
    "data": {
      "userId": "123",
      "username": "testuser"
    }
  }
  ```

#### 用户登录
- **URL**: `POST /api/users/login`
- **描述**: 用户登录接口
- **请求参数**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **响应示例**:
  ```json
  {
    "code": 200,
    "message": "登录成功",
    "data": {
      "token": "jwt_token_here",
      "user": {
        "id": "123",
        "username": "testuser"
      }
    }
  }
  ```

### 数据管理 API

#### 获取数据列表
- **URL**: `GET /api/data`
- **描述**: 获取数据列表
- **查询参数**:
  - `page`: 页码 (默认: 1)
  - `limit`: 每页数量 (默认: 10)
  - `sort`: 排序字段
  - `order`: 排序方向 (asc/desc)

#### 创建数据
- **URL**: `POST /api/data`
- **描述**: 创建新数据
- **请求参数**:
  ```json
  {
    "name": "string",
    "description": "string",
    "type": "string"
  }
  ```

#### 更新数据
- **URL**: `PUT /api/data/{id}`
- **描述**: 更新指定数据
- **路径参数**:
  - `id`: 数据ID

#### 删除数据
- **URL**: `DELETE /api/data/{id}`
- **描述**: 删除指定数据
- **路径参数**:
  - `id`: 数据ID

## 错误码说明

### 通用错误码
- `200`: 成功
- `400`: 请求参数错误
- `401`: 未授权
- `403`: 禁止访问
- `404`: 资源不存在
- `500`: 服务器内部错误

### 业务错误码
- `1001`: 用户不存在
- `1002`: 密码错误
- `1003`: 用户已存在
- `2001`: 数据不存在
- `2002`: 数据已存在
- `3001`: 权限不足

## 认证说明

### JWT Token认证
- **Header**: `Authorization: Bearer <token>`
- **Token格式**: JWT
- **过期时间**: 24小时
- **刷新机制**: 使用refresh_token刷新

### API Key认证
- **Header**: `X-API-Key: <api_key>`
- **用途**: 第三方应用调用
- **权限**: 只读权限

## 限流说明

### 限流规则
- **普通用户**: 100次/分钟
- **VIP用户**: 1000次/分钟
- **企业用户**: 10000次/分钟

### 限流响应
```json
{
  "code": 429,
  "message": "请求过于频繁，请稍后再试",
  "data": {
    "retryAfter": 60
  }
}
```

## SDK和示例

### JavaScript SDK
```javascript
// 安装
npm install @your-company/api-sdk

// 使用
import { ApiClient } from '@your-company/api-sdk';

const client = new ApiClient({
  baseURL: 'https://api.example.com',
  apiKey: 'YOUR_API_KEY_HERE'
});

// 调用API
const users = await client.users.list();
```

### Python SDK
```python
# 安装
pip install your-company-api

# 使用
from your_company_api import ApiClient

client = ApiClient(
    base_url='https://api.example.com',
    api_key='YOUR_API_KEY_HERE'
)

# 调用API
users = client.users.list()
```

## 联系方式
- **项目路径**: [项目根目录]
- **记忆文件**: memory/memory.md
- **最后更新**: [更新日期]
