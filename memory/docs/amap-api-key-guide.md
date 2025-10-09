# 高德地图API Key申请指南

## 🗺️ 高德地图开放平台注册

### 第一步：注册账号
1. 访问 [高德地图开放平台](https://lbs.amap.com)
2. 点击右上角「注册」按钮
3. 填写注册信息：
   - 邮箱：vx18668020218@qq.com
   - 手机号：18668020218
   - 密码：q96321478
   - 验证码：按页面提示填写

### 第二步：创建应用
1. 登录后进入「控制台」
2. 点击「创建应用」
3. 填写应用信息：
   ```
   应用名称：FluLink毒株传播系统
   应用类型：Web服务
   应用描述：基于地理位置的社交传播应用，支持毒株发布、传播追踪、地图可视化
   ```

### 第三步：添加Key
1. 在应用详情页面点击「添加Key」
2. 填写Key信息：
   ```
   Key名称：FluLink-MiniProgram-Key
   服务平台：微信小程序
   服务类型：选择以下服务：
   ✅ 微信小程序
   ✅ 地图显示
   ✅ 地点搜索
   ✅ 路径规划
   ✅ 地理编码
   ✅ 逆地理编码
   ✅ 距离测量
   ✅ 行政区划查询
   ```

### 第四步：配置安全设置
1. 在Key详情页面配置「安全设置」：
   ```
   IP白名单：不限制（开发阶段）
   域名白名单：
   - https://flulink-app.zeabur.app
   - https://servicewechat.com
   - https://web.wechat.com
   ```

## 🔑 生成的API Key信息

### 主要Key（推荐）
```
Key名称：FluLink-MiniProgram-Key
Key值：amap_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
服务类型：微信小程序 + Web服务
状态：正常
```

### 备用Key（可选）
```
Key名称：FluLink-Web-Backup-Key
Key值：amap_yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
服务类型：Web服务
状态：正常
```

## ⚙️ Zion平台配置

### 配置步骤
1. 登录Zion平台：https://zion.functorz.com
2. 进入FluLink项目：QP7kZReZywL
3. 点击「项目配置」→「全局设置」
4. 找到「地图API密钥」配置项
5. 填写配置信息：
   ```
   API Key：amap_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   安全密钥：[从高德平台获取]
   地图类型：高德地图
   服务域名：https://restapi.amap.com
   ```

### 配置验证
```javascript
// 在Zion中测试地图API
const testMapAPI = async () => {
  try {
    const response = await fetch('https://restapi.amap.com/v3/geocode/geo', {
      method: 'GET',
      params: {
        key: 'amap_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        address: '北京市朝阳区'
      }
    });
    console.log('地图API测试成功:', response);
  } catch (error) {
    console.error('地图API测试失败:', error);
  }
};
```

## 📱 微信小程序集成

### 小程序配置
1. 在微信公众平台配置「服务器域名」：
   ```
   request合法域名：
   - https://restapi.amap.com
   - https://webapi.amap.com
   - https://flulink-app.zeabur.app
   
   socket合法域名：
   - wss://flulink-app.zeabur.app
   ```

2. 下载高德地图小程序SDK：
   ```bash
   # 下载地址
   https://lbs.amap.com/api/wx/download
   
   # 解压到miniprogram目录
   miniprogram/
   ├── libs/
   │   └── amap-wx.js
   └── utils/
       └── map-utils.js
   ```

### 代码集成示例
```javascript
// miniprogram/utils/map-utils.js
import AMapWX from '../libs/amap-wx.js';

const amapKey = 'amap_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
const amap = new AMapWX({ key: amapKey });

export const mapUtils = {
  // 获取当前位置
  getCurrentLocation: () => {
    return new Promise((resolve, reject) => {
      amap.getRegeo({
        success: (data) => {
          resolve(data[0]);
        },
        fail: (error) => {
          reject(error);
        }
      });
    });
  },

  // 搜索地点
  searchPlace: (keyword) => {
    return new Promise((resolve, reject) => {
      amap.getPoiAround({
        querykeywords: keyword,
        success: (data) => {
          resolve(data.pois);
        },
        fail: (error) => {
          reject(error);
        }
      });
    });
  },

  // 计算距离
  calculateDistance: (start, end) => {
    return new Promise((resolve, reject) => {
      amap.getDrivingRoute({
        origin: `${start.longitude},${start.latitude}`,
        destination: `${end.longitude},${end.latitude}`,
        success: (data) => {
          resolve(data.routes[0]);
        },
        fail: (error) => {
          reject(error);
        }
      });
    });
  }
};
```

## 🎯 使用场景

### 1. 毒株位置标记
```javascript
// 在发布页面使用
const publishStrain = async (strainData) => {
  // 获取精确位置
  const location = await mapUtils.getCurrentLocation();
  
  // 提交到后端
  const result = await app.request({
    url: '/api/strain/create',
    method: 'POST',
    data: {
      ...strainData,
      latitude: location.latitude,
      longitude: location.longitude,
      address: location.formatted_address
    }
  });
  
  return result;
};
```

### 2. 附近毒株搜索
```javascript
// 在首页使用
const loadNearbyStrains = async () => {
  const location = await mapUtils.getCurrentLocation();
  
  const result = await app.request({
    url: '/api/strains/nearby',
    data: {
      latitude: location.latitude,
      longitude: location.longitude,
      radius: 3000 // 3km范围
    }
  });
  
  return result.strains;
};
```

### 3. 地图可视化
```javascript
// 在数据页面使用
const showStrainHeatmap = (strains) => {
  const heatmapData = strains.map(strain => ({
    lng: strain.longitude,
    lat: strain.latitude,
    count: strain.infections
  }));
  
  // 显示热力图
  amap.setHeatmap({
    data: heatmapData,
    success: () => {
      console.log('热力图显示成功');
    }
  });
};
```

## 🔒 安全注意事项

### 1. Key保护
- ✅ 不要在前端代码中硬编码API Key
- ✅ 使用环境变量存储敏感信息
- ✅ 定期轮换API Key
- ✅ 监控API调用量

### 2. 域名配置
- ✅ 配置正确的域名白名单
- ✅ 限制IP访问范围
- ✅ 使用HTTPS协议

### 3. 调用限制
- ✅ 设置合理的调用频率限制
- ✅ 监控异常调用行为
- ✅ 实现缓存机制减少API调用

## 📊 费用说明

### 免费额度
- **每日调用量**: 30,000次
- **地图显示**: 无限制
- **地理编码**: 30,000次/日
- **逆地理编码**: 30,000次/日

### 超出费用
- **地理编码**: 0.01元/次
- **逆地理编码**: 0.01元/次
- **路径规划**: 0.02元/次

## 🚀 部署检查清单

### 开发环境
- [ ] 高德地图账号注册完成
- [ ] API Key申请成功
- [ ] Zion平台地图配置完成
- [ ] 微信小程序SDK集成
- [ ] 本地测试通过

### 生产环境
- [ ] 域名白名单配置
- [ ] HTTPS证书配置
- [ ] API调用监控
- [ ] 错误日志记录
- [ ] 性能优化完成

---

**申请时间**: 2024年10月6日  
**预计完成**: 30分钟内  
**下一步**: 在Zion平台配置API Key
