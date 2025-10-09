# Zion平台高德地图API Key配置

## 🔑 **API Key信息**

```
Key名称：FluLink-mKey
Key值：c928299e7b3ea00f94355588e32509b7
服务域名：https://restapi.amap.com
服务类型：高德地图Web服务
状态：已激活
```

## ⚙️ **Zion平台配置步骤**

### 第一步：登录Zion平台
- **平台地址**: https://zion.functorz.com
- **账号**: vx18668020218@qq.com
- **密码**: q96321478
- **项目ID**: QP7kZReZywL (FluLink)

### 第二步：进入项目配置
1. 登录后选择FluLink项目
2. 点击左侧导航栏「项目配置」
3. 选择「全局设置」选项

### 第三步：配置地图API密钥
在全局设置中找到「地图API密钥」配置项，填写以下信息：

```
地图服务商：高德地图
API Key：c928299e7b3ea00f94355588e32509b7
安全密钥：[可选，如需要可联系高德平台获取]
服务域名：https://restapi.amap.com
地图类型：Web服务
```

### 第四步：保存配置
1. 确认输入信息无误
2. 点击「保存」或「应用」按钮
3. 等待配置生效（通常1-2分钟）

## 🧪 **配置验证**

### API测试
```javascript
// 测试高德地图API是否配置成功
const testAmapAPI = async () => {
  try {
    const response = await fetch('https://restapi.amap.com/v3/geocode/geo', {
      method: 'GET',
      params: {
        key: 'c928299e7b3ea00f94355588e32509b7',
        address: '北京市朝阳区'
      }
    });
    
    if (response.ok) {
      console.log('✅ 高德地图API配置成功');
      return true;
    } else {
      console.error('❌ 高德地图API配置失败');
      return false;
    }
  } catch (error) {
    console.error('❌ API测试出错:', error);
    return false;
  }
};
```

### Zion地图组件测试
```javascript
// 在Zion项目中使用地图组件
const mapComponent = {
  type: 'map',
  config: {
    apiKey: 'c928299e7b3ea00f94355588e32509b7',
    center: [116.397428, 39.90923], // 北京坐标
    zoom: 10,
    markers: [
      {
        position: [116.397428, 39.90923],
        title: 'FluLink总部'
      }
    ]
  }
};
```

## 📱 **微信小程序集成**

### 小程序域名配置
在微信公众平台配置以下域名：

```
request合法域名：
- https://restapi.amap.com
- https://webapi.amap.com
- https://flulink-app.zeabur.app

socket合法域名：
- wss://flulink-app.zeabur.app
```

### 小程序代码集成
```javascript
// miniprogram/utils/amap-config.js
export const amapConfig = {
  key: 'c928299e7b3ea00f94355588e32509b7',
  baseUrl: 'https://restapi.amap.com',
  services: {
    geocode: '/v3/geocode/geo',        // 地理编码
    regeocode: '/v3/geocode/regeo',    // 逆地理编码
    search: '/v3/place/text',          // 地点搜索
    distance: '/v3/distance',          // 距离测量
    driving: '/v3/direction/driving'   // 路径规划
  }
};

// 使用示例
const getLocationInfo = async (address) => {
  try {
    const response = await wx.request({
      url: `${amapConfig.baseUrl}${amapConfig.services.geocode}`,
      data: {
        key: amapConfig.key,
        address: address
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('获取位置信息失败:', error);
    throw error;
  }
};
```

## 🎯 **功能实现**

### 1. 毒株位置标记
```javascript
// 在发布页面使用
const publishStrainWithLocation = async (strainData) => {
  // 获取当前位置
  const location = await wx.getLocation({
    type: 'gcj02'
  });
  
  // 逆地理编码获取地址
  const addressInfo = await getLocationInfo(
    `${location.longitude},${location.latitude}`
  );
  
  // 提交毒株数据
  const result = await app.request({
    url: '/api/strain/create',
    method: 'POST',
    data: {
      ...strainData,
      latitude: location.latitude,
      longitude: location.longitude,
      address: addressInfo.formatted_address
    }
  });
  
  return result;
};
```

### 2. 附近毒株搜索
```javascript
// 搜索附近毒株
const searchNearbyStrains = async (userLocation, radius = 3000) => {
  try {
    const result = await app.request({
      url: '/api/strains/nearby',
      data: {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        radius: radius
      }
    });
    
    // 计算距离
    const strainsWithDistance = result.strains.map(strain => {
      const distance = calculateDistance(
        userLocation,
        { latitude: strain.latitude, longitude: strain.longitude }
      );
      
      return {
        ...strain,
        distance: distance
      };
    });
    
    return strainsWithDistance.sort((a, b) => a.distance - b.distance);
  } catch (error) {
    console.error('搜索附近毒株失败:', error);
    return [];
  }
};
```

### 3. 地图可视化
```javascript
// 显示毒株分布热力图
const showStrainHeatmap = (strains) => {
  const heatmapData = strains.map(strain => ({
    lng: strain.longitude,
    lat: strain.latitude,
    count: strain.infections || 1
  }));
  
  // 使用高德地图热力图API
  return heatmapData;
};
```

## 🔒 **安全配置**

### 域名白名单
```
高德地图平台配置：
- https://flulink-app.zeabur.app
- https://servicewechat.com
- https://web.wechat.com
- https://zion.functorz.com
```

### 调用限制
```
每日免费额度：
- 地理编码：30,000次
- 逆地理编码：30,000次
- 地点搜索：30,000次
- 路径规划：30,000次
```

## 📊 **配置状态检查**

### 配置完成检查清单
- [x] 高德地图API Key获取成功
- [x] Zion平台登录成功
- [ ] 项目配置页面访问
- [ ] 地图API密钥填写
- [ ] 配置保存成功
- [ ] API测试通过
- [ ] 微信小程序域名配置
- [ ] 功能集成测试

### 下一步操作
1. **立即配置**: 在Zion平台填写API Key
2. **测试验证**: 运行API测试确认配置成功
3. **小程序配置**: 配置微信小程序域名白名单
4. **功能集成**: 在现有代码中集成地图功能

## 🚀 **预期效果**

### 功能增强
- ✅ **精确位置**: 高德地图提供更准确的位置服务
- ✅ **地址解析**: 自动获取详细地址信息
- ✅ **距离计算**: 精确计算毒株与用户的距离
- ✅ **地图可视化**: 直观显示毒株分布和传播路径

### 用户体验提升
- ✅ **地图选择**: 用户可在地图上选择发布位置
- ✅ **导航功能**: 引导用户到感兴趣的毒株地点
- ✅ **实时更新**: 动态显示位置变化
- ✅ **交互优化**: 流畅的地图操作体验

---

**配置时间**: 2024年10月6日 13:30  
**API Key**: c928299e7b3ea00f94355588e32509b7  
**状态**: 待配置到Zion平台  
**预计完成**: 5分钟内
