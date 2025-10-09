const express = require('express');
const cors = require('cors');
const path = require('path');

/**
 * FluLink Mock服务器
 * 用于API开发和测试
 */

const app = express();
const PORT = process.env.MOCK_PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Mock数据
const mockData = {
  users: [
    {
      id: 'user-1',
      username: 'starseeker',
      email: 'starseeker@example.com',
      avatar: 'https://via.placeholder.com/100',
      bio: '探索星尘共鸣的奥秘',
      tags: ['技术', '艺术', '音乐'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'user-2',
      username: 'cosmicdreamer',
      email: 'cosmic@example.com',
      avatar: 'https://via.placeholder.com/100',
      bio: '梦想与现实的桥梁',
      tags: ['设计', '哲学', '文学'],
      createdAt: new Date().toISOString()
    }
  ],
  starseeds: [
    {
      id: 'starseed-1',
      userId: 'user-1',
      content: '分享一个有趣的技术发现',
      tags: ['技术', '分享'],
      resonanceCount: 15,
      createdAt: new Date().toISOString()
    },
    {
      id: 'starseed-2',
      userId: 'user-2',
      content: '艺术与技术的完美结合',
      tags: ['艺术', '技术'],
      resonanceCount: 23,
      createdAt: new Date().toISOString()
    }
  ],
  clusters: [
    {
      id: 'cluster-1',
      name: '技术探索者',
      description: '专注于技术创新的星团',
      tags: ['技术', '创新', 'AI'],
      members: ['user-1', 'user-2'],
      luminosity: 0.92,
      createdAt: new Date().toISOString()
    },
    {
      id: 'cluster-2',
      name: '艺术创作者',
      description: '艺术与创意的交汇点',
      tags: ['艺术', '创意', '设计'],
      members: ['user-2'],
      luminosity: 0.85,
      createdAt: new Date().toISOString()
    }
  ],
  resonances: [
    {
      id: 'resonance-1',
      userId: 'user-1',
      targetId: 'starseed-2',
      strength: 0.85,
      factors: {
        tagSimilarity: 0.8,
        interactionHistory: 0.9,
        temporalProximity: 0.85
      },
      createdAt: new Date().toISOString()
    }
  ]
};

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'FluLink Mock API服务正常运行',
    timestamp: new Date().toISOString(),
    version: '1.0.0-mock'
  });
});

// 用户相关API
app.get('/api/users', (req, res) => {
  res.json({
    success: true,
    data: mockData.users,
    total: mockData.users.length
  });
});

app.get('/api/users/:id', (req, res) => {
  const user = mockData.users.find(u => u.id === req.params.id);
  if (user) {
    res.json({
      success: true,
      data: user
    });
  } else {
    res.status(404).json({
      success: false,
      message: '用户未找到'
    });
  }
});

app.post('/api/users', (req, res) => {
  const newUser = {
    id: `user-${Date.now()}`,
    ...req.body,
    createdAt: new Date().toISOString()
  };
  mockData.users.push(newUser);
  
  res.status(201).json({
    success: true,
    data: newUser
  });
});

// 星种相关API
app.get('/api/starseeds', (req, res) => {
  res.json({
    success: true,
    data: mockData.starseeds,
    total: mockData.starseeds.length
  });
});

app.get('/api/starseeds/:id', (req, res) => {
  const starseed = mockData.starseeds.find(s => s.id === req.params.id);
  if (starseed) {
    res.json({
      success: true,
      data: starseed
    });
  } else {
    res.status(404).json({
      success: false,
      message: '星种未找到'
    });
  }
});

app.post('/api/starseeds', (req, res) => {
  const newStarSeed = {
    id: `starseed-${Date.now()}`,
    ...req.body,
    resonanceCount: 0,
    createdAt: new Date().toISOString()
  };
  mockData.starseeds.push(newStarSeed);
  
  res.status(201).json({
    success: true,
    data: newStarSeed
  });
});

// 星团相关API
app.get('/api/clusters', (req, res) => {
  res.json({
    success: true,
    data: mockData.clusters,
    total: mockData.clusters.length
  });
});

app.get('/api/clusters/:id', (req, res) => {
  const cluster = mockData.clusters.find(c => c.id === req.params.id);
  if (cluster) {
    res.json({
      success: true,
      data: cluster
    });
  } else {
    res.status(404).json({
      success: false,
      message: '星团未找到'
    });
  }
});

app.post('/api/clusters', (req, res) => {
  const newCluster = {
    id: `cluster-${Date.now()}`,
    ...req.body,
    members: [],
    luminosity: 0.5,
    createdAt: new Date().toISOString()
  };
  mockData.clusters.push(newCluster);
  
  res.status(201).json({
    success: true,
    data: newCluster
  });
});

// 共鸣相关API
app.get('/api/resonance/history', (req, res) => {
  res.json({
    success: true,
    data: mockData.resonances,
    total: mockData.resonances.length
  });
});

app.post('/api/resonance/calculate', (req, res) => {
  const { userId, targetId } = req.body;
  
  // 模拟共鸣计算
  const strength = Math.random() * 0.5 + 0.5; // 0.5-1.0之间的随机值
  
  const resonance = {
    id: `resonance-${Date.now()}`,
    userId,
    targetId,
    strength,
    factors: {
      tagSimilarity: Math.random(),
      interactionHistory: Math.random(),
      temporalProximity: Math.random()
    },
    createdAt: new Date().toISOString()
  };
  
  mockData.resonances.push(resonance);
  
  res.json({
    success: true,
    data: resonance
  });
});

// 认证相关API
app.post('/api/auth/login', (req, res) => {
  const { phone, password } = req.body;
  
  // 模拟登录
  if (phone && password) {
    res.json({
      success: true,
      data: {
        token: 'mock-jwt-token-' + Date.now(),
        user: mockData.users[0]
      }
    });
  } else {
    res.status(400).json({
      success: false,
      message: '手机号和密码不能为空'
    });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { phone, password, nickname } = req.body;
  
  // 模拟注册
  if (phone && password) {
    const newUser = {
      id: `user-${Date.now()}`,
      username: nickname || '新用户',
      email: phone + '@example.com',
      phone,
      avatar: 'https://via.placeholder.com/100',
      bio: '新用户',
      tags: [],
      createdAt: new Date().toISOString()
    };
    
    mockData.users.push(newUser);
    
    res.status(201).json({
      success: true,
      data: {
        token: 'mock-jwt-token-' + Date.now(),
        user: newUser
      }
    });
  } else {
    res.status(400).json({
      success: false,
      message: '手机号和密码不能为空'
    });
  }
});

// 文件上传API
app.post('/api/upload', (req, res) => {
  res.json({
    success: true,
    data: {
      url: 'https://via.placeholder.com/300',
      filename: 'uploaded-file.jpg',
      size: 1024,
      type: 'image/jpeg'
    }
  });
});

// 搜索API
app.get('/api/search', (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({
      success: false,
      message: '搜索关键词不能为空'
    });
  }
  
  const results = {
    users: mockData.users.filter(u => 
      u.username.includes(q) || u.bio.includes(q)
    ),
    starseeds: mockData.starseeds.filter(s => 
      s.content.includes(q)
    ),
    clusters: mockData.clusters.filter(c => 
      c.name.includes(q) || c.description.includes(q)
    )
  };
  
  res.json({
    success: true,
    data: results,
    query: q
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API接口不存在',
    path: req.originalUrl
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 FluLink Mock API服务器启动成功`);
  console.log(`📡 端口: ${PORT}`);
  console.log(`🌍 环境: Mock`);
  console.log(`🔗 API地址: http://localhost:${PORT}/api`);
  console.log(`📊 健康检查: http://localhost:${PORT}/api/health`);
});

module.exports = app;
