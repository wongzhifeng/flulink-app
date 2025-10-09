# 微信前端组件开发计划

## 🎉 微信测试配置成功

**时间**: 2024年10月6日  
**状态**: ✅ 微信测试号接口配置成功  
**URL**: `https://flulink-app.zeabur.app/wechat/verify`  
**Token**: `flulink_dealer_token_2024`

## 🎯 微信前端组件开发目标

### 核心功能
1. **毒株发布页面** - 用户发布内容
2. **传播看板页面** - 显示感染人数和热力图
3. **用户管理页面** - 个人信息和设置
4. **实时数据更新** - WebSocket连接

### 技术栈
- **框架**: 微信小程序原生开发
- **UI组件**: 微信原生组件 + 自定义组件
- **数据管理**: Zion SDK
- **实时通信**: WebSocket
- **地图服务**: 微信地图API

## 📱 页面结构设计

### 1. 毒株发布页面 (pages/publish)
```javascript
// 功能
- 位置获取和显示
- 内容输入 (文本/图片/表单)
- 毒株类型选择
- 发布按钮

// 组件
- LocationPicker (位置选择器)
- ContentInput (内容输入)
- StrainTypeSelector (毒株类型选择)
- PublishButton (发布按钮)
```

### 2. 传播看板页面 (pages/dashboard)
```javascript
// 功能
- 当前感染人数显示
- 热力图展示
- 传播路径动画
- 实时数据更新

// 组件
- InfectionCounter (感染计数器)
- HeatMap (热力图)
- SpreadAnimation (传播动画)
- RealTimeData (实时数据)
```

### 3. 用户管理页面 (pages/profile)
```javascript
// 功能
- 用户信息显示
- 设置选项
- 历史记录
- 退出登录

// 组件
- UserInfo (用户信息)
- SettingsPanel (设置面板)
- HistoryList (历史记录)
- LogoutButton (退出按钮)
```

## 🔧 核心组件开发

### 1. LocationPicker 位置选择器
```javascript
// 功能
- 获取当前位置
- 地图选择位置
- 位置信息显示
- 位置验证

// API
- wx.getLocation()
- wx.chooseLocation()
- 地图组件
```

### 2. ContentInput 内容输入
```javascript
// 功能
- 文本输入
- 图片上传
- 表单创建
- 内容预览

// 组件
- TextInput (文本输入)
- ImageUploader (图片上传)
- FormBuilder (表单构建)
- ContentPreview (内容预览)
```

### 3. StrainTypeSelector 毒株类型选择
```javascript
// 功能
- 毒株类型选择
- 类型说明
- 影响范围预览
- 确认选择

// 类型
- text (文本传播)
- image (图片传播)
- form (表单传播)
```

### 4. InfectionCounter 感染计数器
```javascript
// 功能
- 实时感染人数
- 增长动画
- 地区分布
- 趋势图表

// 数据源
- Zion API
- WebSocket实时数据
- 本地缓存
```

## 📊 数据流设计

### 数据获取流程
```
用户操作 → 微信小程序 → Zion SDK → 后端API → 数据库
                ↓
        本地缓存 ← WebSocket ← 实时更新
```

### 状态管理
```javascript
// 全局状态
const globalState = {
  user: {
    openid: '',
    location: {},
    profile: {}
  },
  strains: [],
  infections: {
    count: 0,
    locations: [],
    trends: []
  },
  realtime: {
    connected: false,
    lastUpdate: null
  }
}
```

## 🎨 UI/UX设计原则

### 设计风格
- **简洁现代**: 扁平化设计
- **流感主题**: 蓝色渐变配色
- **动态效果**: 流畅的动画过渡
- **响应式**: 适配不同屏幕尺寸

### 交互设计
- **一键发布**: 简化操作流程
- **实时反馈**: 即时状态更新
- **直观导航**: 清晰的页面结构
- **错误处理**: 友好的错误提示

## 🔄 开发计划

### 第一阶段: 基础组件 (1-2天)
- [ ] LocationPicker 位置选择器
- [ ] ContentInput 内容输入
- [ ] StrainTypeSelector 毒株类型选择
- [ ] 基础页面框架

### 第二阶段: 核心功能 (2-3天)
- [ ] 毒株发布功能
- [ ] 传播看板页面
- [ ] 用户管理页面
- [ ] Zion SDK集成

### 第三阶段: 高级功能 (2-3天)
- [ ] WebSocket实时通信
- [ ] 热力图展示
- [ ] 传播动画效果
- [ ] 性能优化

### 第四阶段: 测试优化 (1-2天)
- [ ] 功能测试
- [ ] 性能测试
- [ ] 用户体验优化
- [ ] 发布准备

## 📱 微信小程序配置

### app.json
```json
{
  "pages": [
    "pages/publish/publish",
    "pages/dashboard/dashboard", 
    "pages/profile/profile"
  ],
  "permission": {
    "scope.userLocation": {
      "desc": "获取位置信息用于毒株传播"
    }
  },
  "requiredBackgroundModes": ["location"]
}
```

### 权限配置
- **位置权限**: 获取用户位置
- **相机权限**: 拍照上传
- **存储权限**: 本地数据缓存
- **网络权限**: API调用和WebSocket

## 🔗 API集成

### Zion SDK集成
```javascript
// 初始化Zion客户端
const zion = new ZionClient({
  projectId: 'QP7kZReZywL',
  token: 'mg7edqye'
});

// 数据操作
await zion.create('strains', strainData);
await zion.query('infections', { location: userLocation });
```

### 后端API调用
```javascript
// 发布毒株
POST /api/strain/publish
{
  type: 'text',
  content: '...',
  location: { lat: 0, lng: 0 }
}

// 获取感染数据
GET /api/infections?location=...
```

## 📚 开发资源

### 文档参考
- 微信小程序官方文档
- Zion SDK文档
- 地图API文档
- WebSocket API文档

### 工具推荐
- 微信开发者工具
- 真机调试
- 性能分析工具
- 代码审查工具

---

**开发开始时间**: 2024年10月6日  
**预计完成时间**: 2024年10月12日  
**开发状态**: 🚀 准备开始  
**优先级**: 高
