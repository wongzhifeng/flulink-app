# 微信测试号配置指南

## 📱 微信测试号信息

### 测试号基本信息
- **AppID**: `wx525bf7620bb3fb9f`
- **AppSecret**: `14fb51e5d31bfd44ef35e921de77481f`
- **测试号类型**: 微信公众平台测试号

### 接口配置信息

#### URL配置
```
URL: https://flulink-app.zeabur.app/wechat/verify
```

#### Token配置
```
Token: flulink_dealer_token_2024
```

### 配置步骤

#### 1. 访问微信公众平台测试号系统
- 链接: https://mp.weixin.qq.com/debug/cgi-bin/sandbox?t=sandbox/login
- 扫码登录获取测试号权限

#### 2. 配置接口信息
在测试号管理页面的"接口配置信息"部分填写：

**URL**: `https://flulink-app.zeabur.app/wechat/verify`
**Token**: `flulink_dealer_token_2024`

#### 3. 配置JS安全域名
在"JS接口安全域名"部分添加：
```
flulink-app.zeabur.app
```

#### 4. 验证配置
点击"提交"按钮，微信会向您的服务器发送验证请求：
- **请求方式**: GET
- **请求URL**: `https://flulink-app.zeabur.app/wechat/verify`
- **参数**: `signature`, `timestamp`, `nonce`, `echostr`

## 🔧 服务端实现

### 微信验证接口
```javascript
// GET /wechat/verify - 微信接口验证
app.get('/wechat/verify', (req, res) => {
  try {
    const { signature, timestamp, nonce, echostr } = req.query;
    
    // 微信验证Token（需要与微信公众平台配置一致）
    const token = 'flulink_dealer_token_2024';
    
    // 验证签名
    const crypto = require('crypto');
    const tmpArr = [token, timestamp, nonce].sort();
    const tmpStr = tmpArr.join('');
    const hash = crypto.createHash('sha1').update(tmpStr).digest('hex');
    
    if (hash === signature) {
      res.send(echostr);  // 验证成功，返回echostr
    } else {
      res.status(403).send('Forbidden');  // 验证失败
    }
  } catch (error) {
    res.status(500).send('Server Error');
  }
});
```

### 微信消息处理接口
```javascript
// POST /wechat/verify - 微信消息处理
app.post('/wechat/verify', (req, res) => {
  try {
    // 处理微信消息（后续扩展）
    res.send('success');
  } catch (error) {
    res.status(500).send('Server Error');
  }
});
```

## 📋 配置清单

### ✅ 需要配置的项目

#### 1. 接口配置信息
- [x] **URL**: `https://flulink-app.zeabur.app/wechat/verify`
- [x] **Token**: `flulink_dealer_token_2024`
- [x] **验证方式**: GET请求，返回echostr参数

#### 2. JS接口安全域名
- [x] **域名**: `flulink-app.zeabur.app`
- [x] **用途**: 微信小程序调用JS接口

#### 3. 服务端配置
- [x] **验证接口**: `/wechat/verify` (GET)
- [x] **消息接口**: `/wechat/verify` (POST)
- [x] **Token验证**: SHA1签名验证
- [x] **错误处理**: 403/500状态码

## 🚀 部署验证

### 1. 本地测试
```bash
# 启动服务
ZION_TOKEN=mg7edqye ZION_PROJECT_ID=QP7kZReZywL node server-zion-simple.js

# 测试验证接口
curl "http://localhost:3000/wechat/verify?signature=test&timestamp=1234567890&nonce=test&echostr=hello"
```

### 2. Zeabur部署
```bash
# 部署到Zeabur
git add .
git commit -m "feat: 添加微信测试号验证接口"
git push origin main

# 验证部署
curl "https://flulink-app.zeabur.app/wechat/verify"
```

### 3. 微信验证
1. 在微信公众平台测试号页面点击"提交"
2. 微信会向 `https://flulink-app.zeabur.app/wechat/verify` 发送验证请求
3. 如果验证成功，会显示"配置成功"

## 🔍 故障排除

### 常见问题

#### 1. 验证失败
**问题**: 微信验证返回"配置失败"
**解决**: 
- 检查URL是否正确: `https://flulink-app.zeabur.app/wechat/verify`
- 检查Token是否一致: `flulink_dealer_token_2024`
- 检查服务是否正常运行

#### 2. 域名无法访问
**问题**: 微信无法访问配置的URL
**解决**:
- 确认Zeabur部署成功
- 检查域名是否正确
- 确认HTTPS证书有效

#### 3. 签名验证失败
**问题**: 服务端返回403 Forbidden
**解决**:
- 检查Token配置是否一致
- 验证SHA1签名算法实现
- 检查参数传递是否正确

## 📊 配置状态

### 当前状态
- ✅ **服务端**: 微信验证接口已实现
- ✅ **Token**: `flulink_dealer_token_2024` 已配置
- ✅ **URL**: `https://flulink-app.zeabur.app/wechat/verify` 已准备
- ⏳ **微信配置**: 等待在微信公众平台配置
- ⏳ **验证测试**: 等待微信验证请求

### 下一步操作
1. 在微信公众平台测试号页面配置URL和Token
2. 点击"提交"进行验证
3. 验证成功后配置JS安全域名
4. 开始微信小程序开发

---

**配置时间**: 2024年10月6日  
**测试号**: wx525bf7620bb3fb9f  
**服务域名**: flulink-app.zeabur.app  
**验证Token**: flulink_dealer_token_2024
