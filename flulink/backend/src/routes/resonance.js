const express = require('express');
const { User, Interaction, Resonance } = require('../models');
const { authMiddleware } = require('../middleware/auth');
const ResonanceCalculator = require('../algorithms/resonanceCalculator');
const TagMatchingAlgorithm = require('../algorithms/tagMatchingAlgorithm');
const InteractionHistoryCalculator = require('../algorithms/interactionHistoryCalculator');
const DynamicWeightAdjuster = require('../algorithms/dynamicWeightAdjuster');
const redisService = require('../services/redisService');

const router = express.Router();

/**
 * @swagger
 * /api/resonance/calculate:
 *   post:
 *     summary: 计算共鸣值
 *     description: 计算两个用户之间的共鸣强度
 *     tags: [Resonance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetUserId
 *             properties:
 *               targetUserId:
 *                 type: string
 *                 description: 目标用户ID
 *                 example: "60f7b3b3b3b3b3b3b3b3b3b3"
 *     responses:
 *       200:
 *         description: 共鸣值计算成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     resonance:
 *                       $ref: '#/components/schemas/Resonance'
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// 计算两个用户的共鸣值
router.post('/calculate', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: '目标用户ID不能为空'
      });
    }

    if (targetUserId === userId) {
      return res.status(400).json({
        success: false,
        message: '不能计算与自己的共鸣值'
      });
    }

    // 获取用户信息
    const userA = await User.findById(userId);
    const userB = await User.findById(targetUserId);

    if (!userA || !userB) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 计算共鸣值
    const resonanceCalculator = new ResonanceCalculator();
    const resonance = await resonanceCalculator.calculateResonance(userA, userB);

    // 保存共鸣记录
    const resonanceRecord = new Resonance({
      userA: userId,
      userB: targetUserId,
      resonance: resonance.resonance,
      factors: resonance.factors,
      timestamp: new Date()
    });

    await resonanceRecord.save();

    // 缓存共鸣值
    await redisService.cacheResonance(userId, targetUserId, resonance.resonance);

    res.json({
      success: true,
      data: {
        resonance: {
          value: resonance.resonance,
          factors: resonance.factors,
          timestamp: new Date()
        }
      }
    });
  } catch (error) {
    console.error('Calculate resonance error:', error);
    res.status(500).json({
      success: false,
      message: '计算共鸣值失败',
      error: error.message
    });
  }
});

// 批量计算共鸣值
router.post('/calculate-batch', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetUserIds } = req.body;

    if (!targetUserIds || !Array.isArray(targetUserIds)) {
      return res.status(400).json({
        success: false,
        message: '目标用户ID列表格式不正确'
      });
    }

    if (targetUserIds.length > 50) {
      return res.status(400).json({
        success: false,
        message: '批量计算用户数量不能超过50个'
      });
    }

    // 获取用户信息
    const userA = await User.findById(userId);
    const targetUsers = await User.find({ _id: { $in: targetUserIds } });

    if (!userA) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 批量计算共鸣值
    const resonanceCalculator = new ResonanceCalculator();
    const results = [];

    for (const userB of targetUsers) {
      try {
        const resonance = await resonanceCalculator.calculateResonance(userA, userB);
        results.push({
          targetUserId: userB._id,
          success: true,
          resonance: {
            value: resonance.resonance,
            factors: resonance.factors
          }
        });

        // 缓存共鸣值
        await redisService.cacheResonance(userId, userB._id, resonance.resonance);
      } catch (error) {
        results.push({
          targetUserId: userB._id,
          success: false,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      data: {
        results
      }
    });
  } catch (error) {
    console.error('Calculate batch resonance error:', error);
    res.status(500).json({
      success: false,
      message: '批量计算共鸣值失败',
      error: error.message
    });
  }
});

// 获取用户共鸣值
router.get('/:targetUserId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetUserId } = req.params;

    // 先从缓存获取
    const cachedResonance = await redisService.getResonance(userId, targetUserId);
    if (cachedResonance !== null) {
      return res.json({
        success: true,
        data: {
          resonance: {
            value: cachedResonance,
            cached: true,
            timestamp: new Date()
          }
        }
      });
    }

    // 从数据库获取最新记录
    const resonanceRecord = await Resonance.findOne({
      $or: [
        { userA: userId, userB: targetUserId },
        { userA: targetUserId, userB: userId }
      ]
    }).sort({ timestamp: -1 });

    if (resonanceRecord) {
      // 缓存结果
      await redisService.cacheResonance(userId, targetUserId, resonanceRecord.resonance);
      
      return res.json({
        success: true,
        data: {
          resonance: {
            value: resonanceRecord.resonance,
            factors: resonanceRecord.factors,
            timestamp: resonanceRecord.timestamp
          }
        }
      });
    }

    res.json({
      success: true,
      data: {
        resonance: null
      }
    });
  } catch (error) {
    console.error('Get resonance error:', error);
    res.status(500).json({
      success: false,
      message: '获取共鸣值失败',
      error: error.message
    });
  }
});

// 获取用户共鸣排行榜
router.get('/rankings/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, sortBy = 'resonance', order = 'desc' } = req.query;

    // 构建排序条件
    const sort = {};
    sort[sortBy] = order === 'desc' ? -1 : 1;

    // 获取共鸣排行榜
    const rankings = await Resonance.find({
      $or: [
        { userA: userId },
        { userB: userId }
      ]
    })
    .populate('userA', 'nickname avatar starColor')
    .populate('userB', 'nickname avatar starColor')
    .sort(sort)
    .limit(parseInt(limit));

    const formattedRankings = rankings.map((record, index) => {
      const isUserA = record.userA._id.toString() === userId;
      const otherUser = isUserA ? record.userB : record.userA;
      
      return {
        rank: index + 1,
        userId: otherUser._id,
        nickname: otherUser.nickname,
        avatar: otherUser.avatar,
        starColor: otherUser.starColor,
        resonance: record.resonance,
        factors: record.factors,
        timestamp: record.timestamp
      };
    });

    res.json({
      success: true,
      data: {
        rankings: formattedRankings
      }
    });
  } catch (error) {
    console.error('Get resonance rankings error:', error);
    res.status(500).json({
      success: false,
      message: '获取共鸣排行榜失败',
      error: error.message
    });
  }
});

// 获取标签匹配详情
router.post('/tag-matching', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: '目标用户ID不能为空'
      });
    }

    // 获取用户信息
    const userA = await User.findById(userId);
    const userB = await User.findById(targetUserId);

    if (!userA || !userB) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 计算标签匹配
    const tagMatchingAlgorithm = new TagMatchingAlgorithm();
    const tagMatching = await tagMatchingAlgorithm.calculateTagSimilarity(userA, userB);

    res.json({
      success: true,
      data: {
        tagMatching
      }
    });
  } catch (error) {
    console.error('Get tag matching error:', error);
    res.status(500).json({
      success: false,
      message: '获取标签匹配失败',
      error: error.message
    });
  }
});

// 获取互动历史详情
router.post('/interaction-history', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: '目标用户ID不能为空'
      });
    }

    // 获取用户信息
    const userA = await User.findById(userId);
    const userB = await User.findById(targetUserId);

    if (!userA || !userB) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 计算互动历史
    const interactionHistoryCalculator = new InteractionHistoryCalculator();
    const interactionHistory = await interactionHistoryCalculator.calculateInteractionScore(userA, userB);

    res.json({
      success: true,
      data: {
        interactionHistory
      }
    });
  } catch (error) {
    console.error('Get interaction history error:', error);
    res.status(500).json({
      success: false,
      message: '获取互动历史失败',
      error: error.message
    });
  }
});

// 获取动态权重
router.post('/dynamic-weights', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: '目标用户ID不能为空'
      });
    }

    // 获取用户信息
    const userA = await User.findById(userId);
    const userB = await User.findById(targetUserId);

    if (!userA || !userB) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 计算动态权重
    const dynamicWeightAdjuster = new DynamicWeightAdjuster();
    const dynamicWeights = await dynamicWeightAdjuster.getDynamicWeights(userA, userB);

    res.json({
      success: true,
      data: {
        dynamicWeights
      }
    });
  } catch (error) {
    console.error('Get dynamic weights error:', error);
    res.status(500).json({
      success: false,
      message: '获取动态权重失败',
      error: error.message
    });
  }
});

module.exports = router;

