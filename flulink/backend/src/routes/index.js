const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// 导入路由
const authRoutes = require('./auth');
const userRoutes = require('./users');
const userTagRoutes = require('./userTags');
const starSeedRoutes = require('./starseeds');
const starSeedInteractionRoutes = require('./starseedInteractions');
const starSeedEvolutionRoutes = require('./starseedEvolution');
const clusterRoutes = require('./clusters');
const clusterQueryRoutes = require('./clusterQueries');
const clusterDissolutionRoutes = require('./clusterDissolution');
const resonanceRoutes = require('./resonance');
const resonanceHistoryRoutes = require('./resonanceHistory');
const uploadRoutes = require('./upload');

const router = express.Router();

// 配置CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: process.env.CORS_CREDENTIALS === 'true',
  optionsSuccessStatus: 200
};

router.use(cors(corsOptions));

// 第5次优化：增强速率限制配置，添加智能限流
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15分钟
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // 限制每个IP 100次请求
  message: {
    success: false,
    message: '请求过于频繁，请稍后再试',
    retryAfter: Math.ceil(15 * 60 * 1000 / 1000) // 添加重试时间
  },
  // 优化5.1: 添加智能限流策略
  standardHeaders: true,
  legacyHeaders: false,
  // 优化5.2: 添加跳过条件
  skip: (req) => {
    // 健康检查接口跳过限流
    if (req.path === '/health') return true;
    // 开发环境跳过限流
    if (process.env.NODE_ENV === 'development') return true;
    return false;
  },
  // 优化5.3: 添加自定义键生成器，增强安全性
  keyGenerator: (req) => {
    // 第5次优化: 增强键生成器，添加更多安全因素
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    const userId = req.user ? req.user._id : 'anonymous';
    
    // 优化5.1: 使用哈希避免键过长
    const crypto = require('crypto');
    const keyString = `${ip}:${userAgent}:${userId}`;
    const hash = crypto.createHash('md5').update(keyString).digest('hex');
    
    return `rate_limit:${hash}`;
  },
  
  // 优化5.4: 添加自定义跳过逻辑
  skipSuccessfulRequests: true,
  
  // 优化5.5: 添加自定义处理函数
  onLimitReached: (req, res, options) => {
    console.warn(`Rate limit exceeded for ${req.ip}: ${req.originalUrl}`);
    
    // 优化5.6: 记录限流事件
    const rateLimitData = {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
      timestamp: new Date(),
      limit: options.max,
      windowMs: options.windowMs
    };
    
    // 异步记录限流事件
    setImmediate(() => {
      const redisService = require('../services/redisService');
      redisService.set(`rate_limit_event:${Date.now()}`, JSON.stringify(rateLimitData), 86400);
    });
  }
});

router.use(limiter);

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: 健康检查
 *     description: 检查API服务是否正常运行
 *     tags: [System]
 *     responses:
 *       200:
 *         description: 服务正常运行
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "FluLink API服务正常运行"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'FluLink API服务正常运行',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API路由
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/users', userTagRoutes);
router.use('/starseeds', starSeedRoutes);
router.use('/starseeds', starSeedInteractionRoutes);
router.use('/starseeds', starSeedEvolutionRoutes);
router.use('/clusters', clusterRoutes);
router.use('/clusters', clusterQueryRoutes);
router.use('/clusters', clusterDissolutionRoutes);
router.use('/resonance', resonanceRoutes);
router.use('/resonance', resonanceHistoryRoutes);
router.use('/upload', uploadRoutes);

// 404处理 - 使用中间件方式
router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API接口不存在',
    path: req.originalUrl
  });
});

// 错误处理中间件
router.use((error, req, res, next) => {
  console.error('API Error:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || '服务器内部错误',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

module.exports = router;
