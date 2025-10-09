const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
const { uploadsAccessControl } = require('./middleware/accessControl');

// 导入服务
const databaseService = require('./services/databaseService');
const redisService = require('./services/redisService');

// 导入路由
const apiRoutes = require('./routes');

// 导入Swagger中间件
const { setupSwaggerUI, validateApiSpec, formatApiResponse, generateApiDocs } = require('./middleware/swaggerMiddleware');

const app = express();
const PORT = process.env.PORT || 8080;

// 在反向代理（如Zeabur、Nginx）后运行时，信任代理以获得正确的IP等信息
app.set('trust proxy', 1);

// 安全中间件
app.use(helmet());

// 日志中间件
app.use(morgan('combined'));

// 压缩中间件
app.use(compression());

// 解析中间件
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Swagger中间件
app.use(generateApiDocs);
app.use(formatApiResponse);
app.use(validateApiSpec);

// 静态文件服务（受控）
const uploadsRoot = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsRoot)) {
  fs.mkdirSync(uploadsRoot, { recursive: true });
}
app.use('/uploads', uploadsAccessControl, express.static(uploadsRoot));

// 设置Swagger UI
setupSwaggerUI(app);

// API路由
app.use('/api', apiRoutes);

// 根路径
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'FluLink 星尘共鸣版 API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      docs: '/api-docs',
      spec: '/api-docs.json'
    }
  });
});

// 全局错误处理
app.use((error, req, res, next) => {
  console.error('Global Error:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || '服务器内部错误',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// 启动服务器
async function startServer() {
  try {
    // 初始化数据库连接
    const dbConnected = await databaseService.initialize();
    if (!dbConnected) {
      throw new Error('数据库连接失败');
    }

    // 初始化Redis连接
    await redisService.connect();

    // 创建数据库索引
    await databaseService.createIndexes();

    // 启动服务器
    app.listen(PORT, () => {
      console.log(`🚀 FluLink API服务器启动成功`);
      console.log(`📡 端口: ${PORT}`);
      console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 数据库: ${databaseService.getStatus().mongodb.connected ? '已连接' : '未连接'}`);
      console.log(`⚡ Redis: ${databaseService.getStatus().redis.connected ? '已连接' : '未连接'}`);
      console.log(`🔗 API地址: http://localhost:${PORT}/api`);
    });

    // 优雅关闭
    process.on('SIGTERM', async () => {
      console.log('收到SIGTERM信号，正在关闭服务器...');
      await databaseService.disconnect();
      await redisService.disconnect();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      console.log('收到SIGINT信号，正在关闭服务器...');
      await databaseService.disconnect();
      await redisService.disconnect();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
}

// 启动服务器
startServer();

module.exports = app;
