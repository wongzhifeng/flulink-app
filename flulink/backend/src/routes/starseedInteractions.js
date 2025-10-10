const express = require('express');
const { StarSeed, User, Interaction } = require('../models');
const { authMiddleware } = require('../middleware/auth');
const StarSeedEvolutionEngine = require('../algorithms/starSeedEvolutionEngine');
const redisService = require('../services/redisService');

const router = express.Router();

// 点亮星种
router.post('/:starSeedId/light', authMiddleware, async (req, res) => {
  try {
    const { starSeedId } = req.params;
    const userId = req.user.id;

    // 检查星种是否存在
    const starSeed = await StarSeed.findById(starSeedId);
    if (!starSeed) {
      return res.status(404).json({
        success: false,
        message: '星种不存在'
      });
    }

    // 检查是否已经点亮过
    const existingInteraction = await Interaction.findOne({
      userId,
      targetId: starSeedId,
      targetType: 'starseed',
      actionType: 'like'
    });

    if (existingInteraction) {
      return res.status(409).json({
        success: false,
        message: '已经点亮过此星种'
      });
    }

    // 创建点亮互动
    const interaction = new Interaction({
      userId,
      targetId: starSeedId,
      targetType: 'starseed',
      actionType: 'like',
      resonanceImpact: 1.0
    });

    await interaction.save();

    // 更新星种演化
    const evolutionEngine = new StarSeedEvolutionEngine();
    const evolutionResult = await evolutionEngine.evolveStarSeed(starSeedId, interaction);

    // 更新用户互动历史
    const user = await User.findById(userId);
    if (user) {
      user.interactions.push({
        targetSeedId: starSeedId,
        actionType: 'like',
        timestamp: new Date()
      });
      await user.save();
    }

    res.json({
      success: true,
      message: '星种点亮成功',
      data: {
        interaction: {
          id: interaction._id,
          actionType: interaction.actionType,
          timestamp: interaction.createdAt
        },
        evolution: evolutionResult.evolution,
        starSeed: {
          id: starSeed._id,
          luminosity: evolutionResult.starSeed.luminosity,
          jumpEligible: evolutionResult.starSeed.jumpEligible
        }
      }
    });
  } catch (error) {
    console.error('Light star seed error:', error);
    res.status(500).json({
      success: false,
      message: '点亮星种失败',
      error: error.message
    });
  }
});

// 取消点亮星种
router.delete('/:starSeedId/light', authMiddleware, async (req, res) => {
  try {
    const { starSeedId } = req.params;
    const userId = req.user.id;

    // 查找点亮记录
    const interaction = await Interaction.findOne({
      userId,
      targetId: starSeedId,
      targetType: 'starseed',
      actionType: 'like'
    });

    if (!interaction) {
      return res.status(404).json({
        success: false,
        message: '未点亮过此星种'
      });
    }

    // 删除点亮记录
    await Interaction.findByIdAndDelete(interaction._id);

    // 重新计算星种演化
    const evolutionEngine = new StarSeedEvolutionEngine();
    const evolutionResult = await evolutionEngine.evolveStarSeed(starSeedId);

    res.json({
      success: true,
      message: '取消点亮成功',
      data: {
        starSeed: {
          id: starSeedId,
          luminosity: evolutionResult.starSeed.luminosity,
          jumpEligible: evolutionResult.starSeed.jumpEligible
        }
      }
    });
  } catch (error) {
    console.error('Unlight star seed error:', error);
    res.status(500).json({
      success: false,
      message: '取消点亮失败',
      error: error.message
    });
  }
});

// 评论星种
router.post('/:starSeedId/comment', authMiddleware, async (req, res) => {
  try {
    const { starSeedId } = req.params;
    const userId = req.user.id;
    const { content } = req.body;

    // 验证输入
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '评论内容不能为空'
      });
    }

    if (content.length > 200) {
      return res.status(400).json({
        success: false,
        message: '评论内容不能超过200个字符'
      });
    }

    // 检查星种是否存在
    const starSeed = await StarSeed.findById(starSeedId);
    if (!starSeed) {
      return res.status(404).json({
        success: false,
        message: '星种不存在'
      });
    }

    // 创建评论互动
    const interaction = new Interaction({
      userId,
      targetId: starSeedId,
      targetType: 'starseed',
      actionType: 'comment',
      content: content.trim(),
      resonanceImpact: 3.0
    });

    await interaction.save();

    // 更新星种演化
    const evolutionEngine = new StarSeedEvolutionEngine();
    const evolutionResult = await evolutionEngine.evolveStarSeed(starSeedId, interaction);

    // 更新用户互动历史
    const user = await User.findById(userId);
    if (user) {
      user.interactions.push({
        targetSeedId: starSeedId,
        actionType: 'comment',
        timestamp: new Date()
      });
      await user.save();
    }

    res.json({
      success: true,
      message: '评论成功',
      data: {
        interaction: {
          id: interaction._id,
          actionType: interaction.actionType,
          content: interaction.content,
          timestamp: interaction.createdAt
        },
        evolution: evolutionResult.evolution,
        starSeed: {
          id: starSeed._id,
          luminosity: evolutionResult.starSeed.luminosity,
          jumpEligible: evolutionResult.starSeed.jumpEligible
        }
      }
    });
  } catch (error) {
    console.error('Comment star seed error:', error);
    res.status(500).json({
      success: false,
      message: '评论失败',
      error: error.message
    });
  }
});

// 转发星种
router.post('/:starSeedId/forward', authMiddleware, async (req, res) => {
  try {
    const { starSeedId } = req.params;
    const userId = req.user.id;
    const { content } = req.body;

    // 检查星种是否存在
    const starSeed = await StarSeed.findById(starSeedId);
    if (!starSeed) {
      return res.status(404).json({
        success: false,
        message: '星种不存在'
      });
    }

    // 创建转发互动
    const interaction = new Interaction({
      userId,
      targetId: starSeedId,
      targetType: 'starseed',
      actionType: 'forward',
      content: content || '',
      resonanceImpact: 2.0
    });

    await interaction.save();

    // 更新星种演化
    const evolutionEngine = new StarSeedEvolutionEngine();
    const evolutionResult = await evolutionEngine.evolveStarSeed(starSeedId, interaction);

    // 更新用户互动历史
    const user = await User.findById(userId);
    if (user) {
      user.interactions.push({
        targetSeedId: starSeedId,
        actionType: 'forward',
        timestamp: new Date()
      });
      await user.save();
    }

    res.json({
      success: true,
      message: '转发成功',
      data: {
        interaction: {
          id: interaction._id,
          actionType: interaction.actionType,
          content: interaction.content,
          timestamp: interaction.createdAt
        },
        evolution: evolutionResult.evolution,
        starSeed: {
          id: starSeed._id,
          luminosity: evolutionResult.starSeed.luminosity,
          jumpEligible: evolutionResult.starSeed.jumpEligible
        }
      }
    });
  } catch (error) {
    console.error('Forward star seed error:', error);
    res.status(500).json({
      success: false,
      message: '转发失败',
      error: error.message
    });
  }
});

// 查看星种
router.post('/:starSeedId/view', authMiddleware, async (req, res) => {
  try {
    const { starSeedId } = req.params;
    const userId = req.user.id;

    // 检查星种是否存在
    const starSeed = await StarSeed.findById(starSeedId);
    if (!starSeed) {
      return res.status(404).json({
        success: false,
        message: '星种不存在'
      });
    }

    // 检查是否已经查看过（避免重复计算）
    const existingInteraction = await Interaction.findOne({
      userId,
      targetId: starSeedId,
      targetType: 'starseed',
      actionType: 'view',
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // 24小时内
    });

    if (existingInteraction) {
      return res.json({
        success: true,
        message: '查看记录已存在',
        data: {
          starSeed: {
            id: starSeed._id,
            luminosity: starSeed.luminosity
          }
        }
      });
    }

    // 创建查看互动
    const interaction = new Interaction({
      userId,
      targetId: starSeedId,
      targetType: 'starseed',
      actionType: 'view',
      resonanceImpact: 0.5
    });

    await interaction.save();

    // 更新星种演化
    const evolutionEngine = new StarSeedEvolutionEngine();
    const evolutionResult = await evolutionEngine.evolveStarSeed(starSeedId, interaction);

    res.json({
      success: true,
      message: '查看记录已保存',
      data: {
        interaction: {
          id: interaction._id,
          actionType: interaction.actionType,
          timestamp: interaction.createdAt
        },
        evolution: evolutionResult.evolution,
        starSeed: {
          id: starSeed._id,
          luminosity: evolutionResult.starSeed.luminosity
        }
      }
    });
  } catch (error) {
    console.error('View star seed error:', error);
    res.status(500).json({
      success: false,
      message: '查看记录失败',
      error: error.message
    });
  }
});

// 获取星种互动列表
router.get('/:starSeedId/interactions', authMiddleware, async (req, res) => {
  try {
    const { starSeedId } = req.params;
    const { page = 1, limit = 20, actionType } = req.query;

    // 构建查询条件
    const query = {
      targetId: starSeedId,
      targetType: 'starseed'
    };
    if (actionType) query.actionType = actionType;

    // 分页查询
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const interactions = await Interaction.find(query)
      .populate('userId', 'nickname avatar starColor')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Interaction.countDocuments(query);

    res.json({
      success: true,
      data: {
        interactions: interactions.map(interaction => ({
          id: interaction._id,
          actionType: interaction.actionType,
          content: interaction.content,
          user: {
            id: interaction.userId._id,
            nickname: interaction.userId.nickname,
            avatar: interaction.userId.avatar,
            starColor: interaction.userId.starColor
          },
          timestamp: interaction.createdAt
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get star seed interactions error:', error);
    res.status(500).json({
      success: false,
      message: '获取互动列表失败',
      error: error.message
    });
  }
});

// 获取用户对星种的互动状态
router.get('/:starSeedId/user-interaction', authMiddleware, async (req, res) => {
  try {
    const { starSeedId } = req.params;
    const userId = req.user.id;

    const interactions = await Interaction.find({
      userId,
      targetId: starSeedId,
      targetType: 'starseed'
    });

    const userInteraction = {
      liked: false,
      commented: false,
      forwarded: false,
      viewed: false,
      interactions: interactions.map(i => ({
        actionType: i.actionType,
        content: i.content,
        timestamp: i.createdAt
      }))
    };

    interactions.forEach(interaction => {
      switch (interaction.actionType) {
        case 'like':
          userInteraction.liked = true;
          break;
        case 'comment':
          userInteraction.commented = true;
          break;
        case 'forward':
          userInteraction.forwarded = true;
          break;
        case 'view':
          userInteraction.viewed = true;
          break;
      }
    });

    res.json({
      success: true,
      data: {
        userInteraction
      }
    });
  } catch (error) {
    console.error('Get user interaction error:', error);
    res.status(500).json({
      success: false,
      message: '获取用户互动状态失败',
      error: error.message
    });
  }
});

module.exports = router;





