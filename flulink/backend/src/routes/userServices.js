const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { UserService, User } = require('../models');
const serviceMatchingAlgorithm = require('../algorithms/serviceMatchingAlgorithm');
const moralGuardService = require('../services/moralGuardService');

/**
 * @swagger
 * tags:
 *   name: UserServices
 *   description: 用户服务节点管理（长期服务标签/"毒株"）
 */

/**
 * @swagger
 * /api/services/publish:
 *   post:
 *     summary: 发布长期服务标签
 *     description: 用户发布服务，需通过道德风控验证
 *     tags: [UserServices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceType
 *               - title
 *               - description
 *               - location
 *             properties:
 *               serviceType:
 *                 type: string
 *                 enum: [housing, repair, education, health, transport, other]
 *                 description: 服务类型
 *               title:
 *                 type: string
 *                 maxLength: 50
 *                 description: 服务标题
 *               description:
 *                 type: string
 *                 maxLength: 200
 *                 description: 服务描述
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 maxItems: 3
 *                 description: 服务图片URL（最多3张）
 *               location:
 *                 type: object
 *                 properties:
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *                     description: [经度, 纬度]
 *               serviceRadius:
 *                 type: number
 *                 minimum: 0.1
 *                 maximum: 5.0
 *                 default: 1.0
 *                 description: 服务范围（公里）
 *     responses:
 *       201:
 *         description: 服务发布成功
 *       403:
 *         description: 道德风控拦截
 *       500:
 *         description: 服务器错误
 */
router.post('/publish', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const serviceData = req.body;

    // 道德风控检查
    const validation = await moralGuardService.validateServicePublication(
      userId,
      { ...serviceData, ipAddress: req.ip }
    );

    if (!validation.isValid) {
      return res.status(403).json({
        success: false,
        message: validation.violations[0].message,
        daoQuote: validation.violations[0].daoQuote,
        violations: validation.violations
      });
    }

    // 创建服务
    const service = new UserService({
      userId,
      serviceType: serviceData.serviceType,
      title: serviceData.title,
      description: serviceData.description,
      images: serviceData.images || [],
      location: {
        type: 'Point',
        coordinates: serviceData.location.coordinates
      },
      serviceRadius: serviceData.serviceRadius || 1.0,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    await service.save();

    // 更新用户服务计数
    await User.findByIdAndUpdate(userId, {
      $inc: { 'serviceSlots.currentServices': 1 }
    });

    res.status(201).json({
      success: true,
      message: '服务发布成功',
      daoQuote: '天道无亲，常与善人',
      data: service
    });
  } catch (error) {
    console.error('服务发布失败:', error);
    res.status(500).json({
      success: false,
      message: '服务发布失败',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/services/match:
 *   post:
 *     summary: 匹配附近的服务提供者
 *     description: 基于地理围栏和信用评分匹配服务
 *     tags: [UserServices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceType
 *               - location
 *             properties:
 *               serviceType:
 *                 type: string
 *                 enum: [housing, repair, education, health, transport, other]
 *               location:
 *                 type: object
 *                 properties:
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *               maxDistance:
 *                 type: number
 *                 default: 1000
 *                 description: 最大距离（米）
 *     responses:
 *       200:
 *         description: 匹配成功
 *       500:
 *         description: 服务器错误
 */
router.post('/match', authMiddleware, async (req, res) => {
  try {
    const { serviceType, location, maxDistance } = req.body;
    const seekerId = req.user._id;

    const matches = await serviceMatchingAlgorithm.matchServices(
      seekerId,
      location,
      serviceType,
      maxDistance || 1000
    );

    res.json({
      success: true,
      message: '匹配成功',
      daoQuote: '天道无亲，常与善人',
      data: {
        matches,
        count: matches.length
      }
    });
  } catch (error) {
    console.error('匹配失败:', error);
    res.status(500).json({
      success: false,
      message: '匹配失败',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/services/my-services:
 *   get:
 *     summary: 获取我的服务列表
 *     tags: [UserServices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 */
router.get('/my-services', authMiddleware, async (req, res) => {
  try {
    const services = await UserService.find({
      userId: req.user._id
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    console.error('获取服务列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取服务列表失败',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/services/{id}:
 *   get:
 *     summary: 获取服务详情
 *     tags: [UserServices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 获取成功
 *       404:
 *         description: 服务不存在
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const service = await UserService.findById(req.params.id).populate('userId');

    if (!service) {
      return res.status(404).json({
        success: false,
        message: '服务不存在'
      });
    }

    // 计算风险评分
    const riskScore = await moralGuardService.calculateServiceRiskScore(service._id);

    res.json({
      success: true,
      data: {
        ...service.toObject(),
        riskScore
      }
    });
  } catch (error) {
    console.error('获取服务详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取服务详情失败',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/services/{id}/deactivate:
 *   put:
 *     summary: 关闭服务
 *     tags: [UserServices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 关闭成功
 *       404:
 *         description: 服务不存在
 */
router.put('/:id/deactivate', authMiddleware, async (req, res) => {
  try {
    const service = await UserService.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: '服务不存在'
      });
    }

    service.isActive = false;
    await service.save();

    // 更新用户服务计数
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'serviceSlots.currentServices': -1 }
    });

    res.json({
      success: true,
      message: '知足不辱，知止不殆',
      daoQuote: '知足不辱，知止不殆',
      data: service
    });
  } catch (error) {
    console.error('关闭服务失败:', error);
    res.status(500).json({
      success: false,
      message: '关闭服务失败',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/services/{id}/rate:
 *   post:
 *     summary: 评价服务
 *     tags: [UserServices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               score:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *               isPositive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: 评价成功
 */
router.post('/:id/rate', authMiddleware, async (req, res) => {
  try {
    const { score, comment, isPositive } = req.body;
    const service = await UserService.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: '服务不存在'
      });
    }

    // 更新评价统计
    service.ratings.totalCount += 1;
    service.ratings.averageScore = 
      ((service.ratings.averageScore * (service.ratings.totalCount - 1)) + score) / 
      service.ratings.totalCount;
    
    if (!isPositive) {
      service.ratings.negativeRate = 
        (service.ratings.negativeRate * (service.ratings.totalCount - 1) + 1) / 
        service.ratings.totalCount;
    }

    await service.save();

    // 更新服务提供者信用分
    await moralGuardService.updateCreditScore(
      service.userId,
      isPositive ? 'positive_rating' : 'negative_rating'
    );

    res.json({
      success: true,
      message: '评价成功',
      daoQuote: isPositive ? '天道无亲，常与善人' : '利而不害'
    });
  } catch (error) {
    console.error('评价服务失败:', error);
    res.status(500).json({
      success: false,
      message: '评价服务失败',
      error: error.message
    });
  }
});

module.exports = router;

