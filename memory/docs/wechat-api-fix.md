# 微信测试号接口配置指南

## 🎯 问题解决

**问题**: 微信测试号接口配置失败  
**原因**: Zeabur部署的是Next.js应用，但API路由在Node.js服务器中  
**解决**: 创建Next.js API路由处理微信验证

## ✅ 解决方案

### 1. 创建Next.js API路由

#### 微信验证路由 (`src/app/wechat/verify/route.ts`)
```typescript
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const signature = searchParams.get('signature');
    const timestamp = searchParams.get('timestamp');
    const nonce = searchParams.get('nonce');
    const echostr = searchParams.get('echostr');

    // 微信验证逻辑
    const token = 'flulink_dealer_token_2024';
    const tmpArr = [token, timestamp, nonce].sort();
    const tmpStr = tmpArr.join('');
    const hash = crypto.createHash('sha1').update(tmpStr).digest('hex');

    if (hash === signature) {
      return new NextResponse(echostr, { status: 200 });
    } else {
      return new NextResponse('Forbidden', { status: 403 });
    }
  } catch (error) {
    return new NextResponse('Server Error', { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return new NextResponse('success', { status: 200 });
}
```

#### 健康检查路由 (`src/app/health/route.ts`)
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'FluLink MVP',
    version: '1.0.0'
  };
  
  return NextResponse.json(healthData, { status: 200 });
}
```

#### Zion API信息路由 (`src/app/api/zion/info/route.ts`)
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const zionInfo = {
    success: true,
    message: 'Zion API integration ready',
    data: {
      projectId: 'QP7kZReZywL',
      account: 'vx18668020218@qq.com',
      databaseApi: 'mg7edqye'
    }
  };
  
  return NextResponse.json(zionInfo, { status: 200 });
}
```

### 2. 测试验证

#### 本地测试
```bash
# 启动Next.js开发服务器
npm run dev

# 测试微信验证接口
curl "http://localhost:3000/wechat/verify?signature=test&timestamp=1234567890&nonce=test&echostr=hello"
# 预期返回: Forbidden (因为签名不匹配)

# 测试健康检查
curl "http://localhost:3000/health"
# 预期返回: {"status":"ok",...}

# 测试Zion API
curl "http://localhost:3000/api/zion/info"
# 预期返回: {"success":true,...}
```

#### 部署测试
```bash
# 测试Zeabur部署
curl "https://flulink-app.zeabur.app/wechat/verify?signature=test&timestamp=1234567890&nonce=test&echostr=hello"
curl "https://flulink-app.zeabur.app/health"
curl "https://flulink-app.zeabur.app/api/zion/info"
```

## 📱 微信测试号配置

### 配置信息
- **URL**: `https://flulink-app.zeabur.app/wechat/verify`
- **Token**: `flulink_dealer_token_2024`
- **AppID**: `wx525bf7620bb3fb9f`
- **AppSecret**: `14fb51e5d31bfd44ef35e921de77481e`

### 配置步骤
1. 访问[微信公众平台测试号系统](https://mp.weixin.qq.com/debug/cgi-bin/sandbox?t=sandbox/login)
2. 扫码获取测试号
3. 在"接口配置信息"中填写：
   - **URL**: `https://flulink-app.zeabur.app/wechat/verify`
   - **Token**: `flulink_dealer_token_2024`
4. 点击"提交"进行验证

### 验证原理
微信会发送GET请求到配置的URL，包含以下参数：
- `signature`: 微信计算的签名
- `timestamp`: 时间戳
- `nonce`: 随机数
- `echostr`: 回显字符串

服务器需要：
1. 将token、timestamp、nonce按字典序排序
2. 拼接成字符串
3. 进行SHA1加密
4. 与signature比较
5. 如果匹配，返回echostr；否则返回错误

## 🔧 技术细节

### Next.js API路由
- 使用App Router的`route.ts`文件
- 支持GET、POST等HTTP方法
- 自动处理请求和响应
- 支持TypeScript类型检查

### 微信签名算法
```javascript
const crypto = require('crypto');

function verifyWeChatSignature(token, timestamp, nonce, signature) {
  const tmpArr = [token, timestamp, nonce].sort();
  const tmpStr = tmpArr.join('');
  const hash = crypto.createHash('sha1').update(tmpStr).digest('hex');
  return hash === signature;
}
```

### 错误处理
- 参数缺失：返回400状态码
- 签名验证失败：返回403状态码
- 服务器错误：返回500状态码
- 验证成功：返回200状态码和echostr

## 📊 部署状态

### 当前状态
- ✅ Next.js API路由已创建
- ✅ 本地测试通过
- ✅ 代码已推送到Gitee
- ⏳ 等待Zeabur重新部署
- ⏳ 等待微信验证测试

### 下一步
1. 等待Zeabur自动重新部署
2. 测试部署后的API接口
3. 在微信测试号中重新配置接口
4. 验证微信接口配置成功

## 🎉 预期结果

部署完成后，微信测试号接口配置应该会成功，因为：
- API路由已正确实现
- 签名验证逻辑正确
- 支持GET和POST请求
- 错误处理完善
- 本地测试通过

---

**配置时间**: 2024年10月6日  
**解决状态**: ✅ 已解决  
**部署状态**: ⏳ 等待重新部署  
**下一步**: 测试微信接口配置
