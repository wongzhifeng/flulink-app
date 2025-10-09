# Zion对象存储200M利用方案

## 📦 **Zion对象存储能力分析**

### ✅ **存储容量**
```
总容量：200MB
用途：图片、音视频、文档文件存储
限制：达到限制后无法保存新文件
状态：可用于FluLink项目
```

### 🎯 **对FluLink项目的价值**

#### **1. 图片毒株存储**
- **用户上传图片**: 毒株发布时的图片内容
- **头像存储**: 用户头像图片
- **缩略图生成**: 自动生成不同尺寸的图片
- **图片压缩**: 优化存储空间使用

#### **2. 文件类型支持**
- **图片格式**: JPG, PNG, GIF, WebP
- **文档格式**: PDF, Word, Excel
- **音视频**: MP3, MP4, AVI (小文件)
- **其他文件**: 任意格式文件

## 🚀 **FluLink项目集成方案**

### **图片毒株功能增强**
```javascript
// 图片上传和存储
const uploadStrainImage = async (imageFile) => {
  try {
    // 1. 图片压缩
    const compressedImage = await compressImage(imageFile);
    
    // 2. 上传到Zion对象存储
    const uploadResult = await app.request({
      url: '/api/upload/image',
      method: 'POST',
      data: {
        file: compressedImage,
        type: 'strain_image',
        userId: app.globalData.userInfo.openid
      }
    });
    
    // 3. 返回存储URL
    return uploadResult.url;
  } catch (error) {
    console.error('图片上传失败:', error);
    throw error;
  }
};
```

### **后端API集成**
```javascript
// server.js 中添加文件上传接口
const multer = require('multer');
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB限制
});

// 图片上传接口
app.post('/api/upload/image', upload.single('image'), async (req, res) => {
  try {
    const { file } = req;
    
    if (!file) {
      return res.status(400).json({ error: '没有上传文件' });
    }
    
    // 上传到Zion对象存储
    const zionResult = await zionClient.uploadFile({
      file: file.path,
      fileName: file.originalname,
      contentType: file.mimetype
    });
    
    // 删除临时文件
    fs.unlinkSync(file.path);
    
    res.json({
      success: true,
      url: zionResult.url,
      fileId: zionResult.id
    });
  } catch (error) {
    res.status(500).json({ error: '上传失败' });
  }
});
```

## 📊 **存储空间规划**

### **容量分配策略**
```
总容量：200MB
├── 用户头像：50MB (约1000个头像，50KB/个)
├── 毒株图片：120MB (约2400张图片，50KB/张)
├── 系统文件：20MB (图标、背景等)
└── 预留空间：10MB (缓冲和临时文件)
```

### **图片优化策略**
```javascript
// 图片压缩配置
const imageCompression = {
  maxWidth: 800,        // 最大宽度
  maxHeight: 600,       // 最大高度
  quality: 0.8,         // 压缩质量
  format: 'jpeg',       // 输出格式
  maxSize: 50 * 1024    // 最大文件大小50KB
};

// 自动压缩函数
const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // 计算压缩尺寸
      const { width, height } = calculateCompressSize(img.width, img.height);
      
      canvas.width = width;
      canvas.height = height;
      
      // 绘制压缩图片
      ctx.drawImage(img, 0, 0, width, height);
      
      // 转换为Blob
      canvas.toBlob(resolve, 'image/jpeg', 0.8);
    };
    
    img.src = URL.createObjectURL(file);
  });
};
```

## 🎨 **功能实现**

### **1. 图片毒株发布**
```javascript
// 在发布页面集成图片上传
const publishImageStrain = async (strainData) => {
  try {
    // 1. 上传图片
    const imageUrl = await uploadStrainImage(strainData.imageFile);
    
    // 2. 创建毒株记录
    const result = await app.request({
      url: '/api/strain/create',
      method: 'POST',
      data: {
        ...strainData,
        type: 'image',
        imageUrl: imageUrl,
        latitude: app.globalData.location.latitude,
        longitude: app.globalData.location.longitude
      }
    });
    
    return result;
  } catch (error) {
    console.error('发布图片毒株失败:', error);
    throw error;
  }
};
```

### **2. 用户头像管理**
```javascript
// 用户头像上传
const uploadUserAvatar = async (avatarFile) => {
  try {
    // 压缩头像
    const compressedAvatar = await compressImage(avatarFile, {
      maxWidth: 200,
      maxHeight: 200,
      quality: 0.9
    });
    
    // 上传到Zion
    const result = await app.request({
      url: '/api/user/avatar',
      method: 'POST',
      data: {
        file: compressedAvatar,
        userId: app.globalData.userInfo.openid
      }
    });
    
    return result.avatarUrl;
  } catch (error) {
    console.error('头像上传失败:', error);
    throw error;
  }
};
```

### **3. 图片展示和缓存**
```javascript
// 图片展示组件
const ImageDisplay = ({ imageUrl, alt, className }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  return (
    <div className={className}>
      {loading && <div className="loading">加载中...</div>}
      {error && <div className="error">图片加载失败</div>}
      <img
        src={imageUrl}
        alt={alt}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
        style={{ display: loading ? 'none' : 'block' }}
      />
    </div>
  );
};
```

## 🔧 **技术实现**

### **Zion SDK集成**
```javascript
// zion-client.js 中添加文件上传功能
const zionClient = {
  // 上传文件
  uploadFile: async ({ file, fileName, contentType }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', fileName);
      formData.append('contentType', contentType);
      
      const response = await fetch(`${ZION_API_BASE}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ZION_TOKEN}`
        },
        body: formData
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Zion文件上传失败:', error);
      throw error;
    }
  },
  
  // 删除文件
  deleteFile: async (fileId) => {
    try {
      const response = await fetch(`${ZION_API_BASE}/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${ZION_TOKEN}`
        }
      });
      
      return response.ok;
    } catch (error) {
      console.error('Zion文件删除失败:', error);
      throw error;
    }
  }
};
```

### **存储监控**
```javascript
// 存储空间监控
const storageMonitor = {
  // 获取存储使用情况
  getStorageUsage: async () => {
    try {
      const response = await app.request({
        url: '/api/storage/usage'
      });
      
      return response.data;
    } catch (error) {
      console.error('获取存储使用情况失败:', error);
      return null;
    }
  },
  
  // 检查存储空间
  checkStorageSpace: async () => {
    const usage = await this.getStorageUsage();
    if (usage) {
      const usedPercentage = (usage.used / usage.total) * 100;
      
      if (usedPercentage > 80) {
        console.warn('存储空间使用率超过80%');
        return false;
      }
      
      return true;
    }
    
    return false;
  }
};
```

## 📈 **使用场景**

### **1. 图片毒株发布**
- 用户选择图片
- 自动压缩优化
- 上传到Zion存储
- 生成分享链接

### **2. 用户头像管理**
- 头像上传和更新
- 自动裁剪和压缩
- 多尺寸生成
- 缓存管理

### **3. 内容展示**
- 图片懒加载
- 缩略图预览
- 全屏查看
- 分享功能

## 🔒 **安全考虑**

### **文件类型限制**
```javascript
const allowedFileTypes = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  documents: ['application/pdf', 'application/msword'],
  maxFileSize: 5 * 1024 * 1024 // 5MB
};

const validateFile = (file) => {
  if (file.size > allowedFileTypes.maxFileSize) {
    throw new Error('文件大小超过限制');
  }
  
  if (!allowedFileTypes.images.includes(file.type)) {
    throw new Error('不支持的文件类型');
  }
  
  return true;
};
```

### **访问控制**
- 文件访问权限管理
- 用户身份验证
- 防盗链保护
- 定期清理过期文件

## 🚀 **实施建议**

### **优先级**
1. **高优先级**: 图片毒株上传功能
2. **中优先级**: 用户头像管理
3. **低优先级**: 文档文件支持

### **实施步骤**
1. **集成Zion文件上传API**
2. **实现图片压缩功能**
3. **开发上传界面组件**
4. **添加存储监控功能**
5. **测试和优化**

### **预期效果**
- ✅ **功能增强**: 支持图片毒株发布
- ✅ **用户体验**: 流畅的图片上传体验
- ✅ **存储优化**: 智能压缩和空间管理
- ✅ **成本控制**: 充分利用200MB免费额度

---

**存储容量**: 200MB  
**适用场景**: 图片毒株、用户头像、系统资源  
**实施难度**: 中等  
**预期价值**: 高
