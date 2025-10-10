const express = require('express');
const { StarSeed, User, Interaction } = require('../models');
const { authMiddleware } = require('../middleware/auth');
const StarSeedEvolutionEngine = require('../algorithms/starSeedEvolutionEngine');
const redisService = require('../services/redisService');

const router = express.Router();

/**
 * @swagger
 * /api/starseeds/publish:
 *   post:
 *     summary: 发布星种
 *     description: 用户发布新的星种内容
 *     tags: [StarSeeds]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: 星种内容
 *                 example: "分享一个有趣的技术发现"
 *               imageUrl:
 *                 type: string
 *                 description: 图片URL
 *                 example: "https://example.com/image.jpg"
 *               audioUrl:
 *                 type: string
 *                 description: 音频URL
 *                 example: "https://example.com/audio.mp3"
 *               spectrum:
 *                 type: object
 *                 description: 光谱数据
 *     responses:
 *       201:
 *         description: 星种发布成功
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
 *                     starseed:
 *                       $ref: '#/components/schemas/StarSeed'
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
// 发布星种
router.post('/publish', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { content, imageUrl, audioUrl, spectrum } = req.body;

    // 验证输入
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '星种内容不能为空'
      });
    }

    if (content.length > 500) {
      return res.status(400).json({
        success: false,
        message: '星种内容不能超过500个字符'
      });
    }

    // 获取用户信息
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 创建星种
    const starSeed = new StarSeed({
      authorId: userId,
      content: content.trim(),
      imageUrl: imageUrl || '',
      audioUrl: audioUrl || '',
      spectrum: spectrum ? new Map(Object.entries(spectrum)) : new Map(),
      luminosity: parseInt(process.env.STARSEED_INITIAL_LUMINOSITY) || 10,
      initialLuminosity: parseInt(process.env.STARSEED_INITIAL_LUMINOSITY) || 10,
      clusterId: user.currentCluster || null,
      jumpEligible: false
    });

    await starSeed.save();

    // 更新用户互动历史
    user.interactions.push({
      targetSeedId: starSeed._id,
      actionType: 'create',
      timestamp: new Date()
    });
    await user.save();

    // 缓存星种热度
    await redisService.cacheSeedHotness(starSeed._id, starSeed.luminosity);

    // 触发星种演化
    const evolutionEngine = new StarSeedEvolutionEngine();
    await evolutionEngine.evolveStarSeed(starSeed._id);

    // 更新用户星种计数
    await User.findByIdAndUpdate(userId, { $inc: { starSeedCount: 1 } });

    res.status(201).json({
      success: true,
      message: '星种发布成功',
      data: {
        starSeed: {
          id: starSeed._id,
          content: starSeed.content,
          imageUrl: starSeed.imageUrl,
          audioUrl: starSeed.audioUrl,
          spectrum: Object.fromEntries(starSeed.spectrum),
          luminosity: starSeed.luminosity,
          clusterId: starSeed.clusterId,
          jumpEligible: starSeed.jumpEligible,
          createdAt: starSeed.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Publish star seed error:', error);
    res.status(500).json({
      success: false,
      message: '星种发布失败',
      error: error.message
    });
  }
});

// 获取星种列表
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, clusterId, authorId, sortBy = 'createdAt', order = 'desc' } = req.query;

    // 构建查询条件
    const query = {};
    if (clusterId) query.clusterId = clusterId;
    if (authorId) query.authorId = authorId;

    // 构建排序条件
    const sort = {};
    sort[sortBy] = order === 'desc' ? -1 : 1;

    // 分页查询
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const starSeeds = await StarSeed.find(query)
      .populate('authorId', 'nickname avatar starColor')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // 获取总数
    const total = await StarSeed.countDocuments(query);

    res.json({
      success: true,
      data: {
        starSeeds: starSeeds.map(seed => ({
          id: seed._id,
          content: seed.content,
          imageUrl: seed.imageUrl,
          audioUrl: seed.audioUrl,
          spectrum: Object.fromEntries(seed.spectrum),
          luminosity: seed.luminosity,
          clusterId: seed.clusterId,
          jumpEligible: seed.jumpEligible,
          author: {
            id: seed.authorId._id,
            nickname: seed.authorId.nickname,
            avatar: seed.authorId.avatar,
            starColor: seed.authorId.starColor
          },
          createdAt: seed.createdAt,
          updatedAt: seed.updatedAt
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
    console.error('Get star seeds error:', error);
    res.status(500).json({
      success: false,
      message: '获取星种列表失败',
      error: error.message
    });
  }
});

// 获取星种详情
router.get('/:starSeedId', authMiddleware, async (req, res) => {
  try {
    const { starSeedId } = req.params;

    const starSeed = await StarSeed.findById(starSeedId)
      .populate('authorId', 'nickname avatar starColor motto poem')
      .populate('clusterId', 'members resonanceScore');

    if (!starSeed) {
      return res.status(404).json({
        success: false,
        message: '星种不存在'
      });
    }

    // 获取互动统计
    const interactions = await Interaction.find({
      targetId: starSeedId,
      targetType: 'starseed'
    });

    const interactionStats = {
      total: interactions.length,
      likes: interactions.filter(i => i.actionType === 'like').length,
      comments: interactions.filter(i => i.actionType === 'comment').length,
      forwards: interactions.filter(i => i.actionType === 'forward').length,
      views: interactions.filter(i => i.actionType === 'view').length
    };

    res.json({
      success: true,
      data: {
        starSeed: {
          id: starSeed._id,
          content: starSeed.content,
          imageUrl: starSeed.imageUrl,
          audioUrl: starSeed.audioUrl,
          spectrum: Object.fromEntries(starSeed.spectrum),
          luminosity: starSeed.luminosity,
          clusterId: starSeed.clusterId,
          jumpEligible: starSeed.jumpEligible,
          author: {
            id: starSeed.authorId._id,
            nickname: starSeed.authorId.nickname,
            avatar: starSeed.authorId.avatar,
            starColor: starSeed.authorId.starColor,
            motto: starSeed.authorId.motto,
            poem: starSeed.authorId.poem
          },
          cluster: starSeed.clusterId ? {
            id: starSeed.clusterId._id,
            members: starSeed.clusterId.members,
            resonanceScore: starSeed.clusterId.resonanceScore
          } : null,
          interactionStats,
          createdAt: starSeed.createdAt,
          updatedAt: starSeed.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Get star seed detail error:', error);
    res.status(500).json({
      success: false,
      message: '获取星种详情失败',
      error: error.message
    });
  }
});

// 更新星种
router.put('/:starSeedId', authMiddleware, async (req, res) => {
  try {
    const { starSeedId } = req.params;
    const userId = req.user.id;
    const { content, imageUrl, audioUrl, spectrum } = req.body;

    const starSeed = await StarSeed.findById(starSeedId);
    if (!starSeed) {
      return res.status(404).json({
        success: false,
        message: '星种不存在'
      });
    }

    // 检查权限
    if (starSeed.authorId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: '无权限修改此星种'
      });
    }

    // 更新字段
    if (content !== undefined) {
      if (content.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: '星种内容不能为空'
        });
      }
      if (content.length > 500) {
        return res.status(400).json({
          success: false,
          message: '星种内容不能超过500个字符'
        });
      }
      starSeed.content = content.trim();
    }

    if (imageUrl !== undefined) {
      starSeed.imageUrl = imageUrl;
    }

    if (audioUrl !== undefined) {
      starSeed.audioUrl = audioUrl;
    }

    if (spectrum !== undefined) {
      starSeed.spectrum = new Map(Object.entries(spectrum));
    }

    starSeed.updatedAt = new Date();
    await starSeed.save();

    res.json({
      success: true,
      message: '星种更新成功',
      data: {
        starSeed: {
          id: starSeed._id,
          content: starSeed.content,
          imageUrl: starSeed.imageUrl,
          audioUrl: starSeed.audioUrl,
          spectrum: Object.fromEntries(starSeed.spectrum),
          luminosity: starSeed.luminosity,
          updatedAt: starSeed.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Update star seed error:', error);
    res.status(500).json({
      success: false,
      message: '更新星种失败',
      error: error.message
    });
  }
});

// 删除星种
router.delete('/:starSeedId', authMiddleware, async (req, res) => {
  try {
    const { starSeedId } = req.params;
    const userId = req.user.id;

    const starSeed = await StarSeed.findById(starSeedId);
    if (!starSeed) {
      return res.status(404).json({
        success: false,
        message: '星种不存在'
      });
    }

    // 检查权限
    if (starSeed.authorId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: '无权限删除此星种'
      });
    }

    // 删除相关互动记录
    await Interaction.deleteMany({
      targetId: starSeedId,
      targetType: 'starseed'
    });

    // 删除星种
    await StarSeed.findByIdAndDelete(starSeedId);

    // 清除缓存
    await redisService.deleteCache(`seed:hot:${starSeedId}`);

    res.json({
      success: true,
      message: '星种删除成功'
    });
  } catch (error) {
    console.error('Delete star seed error:', error);
    res.status(500).json({
      success: false,
      message: '删除星种失败',
      error: error.message
    });
  }
});

// 获取用户的星种
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const starSeeds = await StarSeed.find({ authorId: userId })
      .populate('authorId', 'nickname avatar starColor')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await StarSeed.countDocuments({ authorId: userId });

    res.json({
      success: true,
      data: {
        starSeeds: starSeeds.map(seed => ({
          id: seed._id,
          content: seed.content,
          imageUrl: seed.imageUrl,
          audioUrl: seed.audioUrl,
          spectrum: Object.fromEntries(seed.spectrum),
          luminosity: seed.luminosity,
          clusterId: seed.clusterId,
          jumpEligible: seed.jumpEligible,
          author: {
            id: seed.authorId._id,
            nickname: seed.authorId.nickname,
            avatar: seed.authorId.avatar,
            starColor: seed.authorId.starColor
          },
          createdAt: seed.createdAt
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
    console.error('Get user star seeds error:', error);
    res.status(500).json({
      success: false,
      message: '获取用户星种失败',
      error: error.message
    });
  }
});

// 获取星种统计
router.get('/:starSeedId/stats', authMiddleware, async (req, res) => {
  try {
    const { starSeedId } = req.params;

    const starSeed = await StarSeed.findById(starSeedId);
    if (!starSeed) {
      return res.status(404).json({
        success: false,
        message: '星种不存在'
      });
    }

    // 获取互动统计
    const interactions = await Interaction.find({
      targetId: starSeedId,
      targetType: 'starseed'
    });

    const stats = {
      totalInteractions: interactions.length,
      likes: interactions.filter(i => i.actionType === 'like').length,
      comments: interactions.filter(i => i.actionType === 'comment').length,
      forwards: interactions.filter(i => i.actionType === 'forward').length,
      views: interactions.filter(i => i.actionType === 'view').length,
      luminosity: starSeed.luminosity,
      jumpEligible: starSeed.jumpEligible,
      createdAt: starSeed.createdAt,
      updatedAt: starSeed.updatedAt
    };

    res.json({
      success: true,
      data: {
        stats
      }
    });
  } catch (error) {
    console.error('Get star seed stats error:', error);
    res.status(500).json({
      success: false,
      message: '获取星种统计失败',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/starseeds/{id}/light:
 *   post:
 *     summary: 点亮星种
 *     description: 用户点亮（点赞）星种
 *     tags: [StarSeeds]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 星种ID
 *     responses:
 *       200:
 *         description: 点亮成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权访问
 *       404:
 *         description: 星种不存在
 */
// 点亮星种
router.post('/:id/light', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const starSeedId = req.params.id;

    // 查找星种
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
      actionType: 'light'
    });

    if (existingInteraction) {
      return res.status(400).json({
        success: false,
        message: '您已经点亮过这个星种了'
      });
    }

    // 创建点亮互动
    const interaction = new Interaction({
      userId,
      targetId: starSeedId,
      targetType: 'starseed',
      actionType: 'light',
      createdAt: new Date()
    });

    await interaction.save();

    // 更新星种互动计数
    starSeed.interactions.lights += 1;
    await starSeed.save();

    // 触发星种演化
    const evolutionEngine = new StarSeedEvolutionEngine();
    await evolutionEngine.evolveStarSeed(starSeedId, interaction);

    res.json({
      success: true,
      message: '点亮成功',
      data: {
        lights: starSeed.interactions.lights
      }
    });
  } catch (error) {
    console.error('Light star seed error:', error);
    res.status(500).json({
      success: false,
      message: '点亮失败，请稍后重试'
    });
  }
});

/**
 * @swagger
 * /api/starseeds/{id}/comment:
 *   post:
 *     summary: 评论星种
 *     description: 用户评论星种
 *     tags: [StarSeeds]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 星种ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: 评论内容
 *                 example: "这个想法很棒！"
 *     responses:
 *       200:
 *         description: 评论成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权访问
 *       404:
 *         description: 星种不存在
 */
// 评论星种
router.post('/:id/comment', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const starSeedId = req.params.id;
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

    // 查找星种
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
      createdAt: new Date()
    });

    await interaction.save();

    // 更新星种互动计数
    starSeed.interactions.comments += 1;
    await starSeed.save();

    // 触发星种演化
    const evolutionEngine = new StarSeedEvolutionEngine();
    await evolutionEngine.evolveStarSeed(starSeedId, interaction);

    res.json({
      success: true,
      message: '评论成功',
      data: {
        comment: {
          id: interaction._id,
          content: interaction.content,
          userId: interaction.userId,
          createdAt: interaction.createdAt
        },
        comments: starSeed.interactions.comments
      }
    });
  } catch (error) {
    console.error('Comment star seed error:', error);
    res.status(500).json({
      success: false,
      message: '评论失败，请稍后重试'
    });
  }
});

/**
 * @swagger
 * /api/starseeds/{id}/share:
 *   post:
 *     summary: 分享星种
 *     description: 用户分享星种
 *     tags: [StarSeeds]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 星种ID
 *     responses:
 *       200:
 *         description: 分享成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权访问
 *       404:
 *         description: 星种不存在
 */
// 分享星种
router.post('/:id/share', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const starSeedId = req.params.id;

    // 查找星种
    const starSeed = await StarSeed.findById(starSeedId);
    if (!starSeed) {
      return res.status(404).json({
        success: false,
        message: '星种不存在'
      });
    }

    // 检查是否已经分享过
    const existingInteraction = await Interaction.findOne({
      userId,
      targetId: starSeedId,
      actionType: 'share'
    });

    if (existingInteraction) {
      return res.status(400).json({
        success: false,
        message: '您已经分享过这个星种了'
      });
    }

    // 创建分享互动
    const interaction = new Interaction({
      userId,
      targetId: starSeedId,
      targetType: 'starseed',
      actionType: 'share',
      createdAt: new Date()
    });

    await interaction.save();

    // 更新星种互动计数
    starSeed.interactions.shares += 1;
    await starSeed.save();

    // 触发星种演化
    const evolutionEngine = new StarSeedEvolutionEngine();
    await evolutionEngine.evolveStarSeed(starSeedId, interaction);

    res.json({
      success: true,
      message: '分享成功',
      data: {
        shares: starSeed.interactions.shares
      }
    });
  } catch (error) {
    console.error('Share star seed error:', error);
    res.status(500).json({
      success: false,
      message: '分享失败，请稍后重试'
    });
  }
});

/**
 * @swagger
 * /api/starseeds/{id}/comments:
 *   get:
 *     summary: 获取星种评论
 *     description: 获取星种的所有评论
 *     tags: [StarSeeds]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 星种ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 获取评论成功
 *       404:
 *         description: 星种不存在
 */
// 获取星种评论
router.get('/:id/comments', async (req, res) => {
  try {
    const starSeedId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // 查找星种
    const starSeed = await StarSeed.findById(starSeedId);
    if (!starSeed) {
      return res.status(404).json({
        success: false,
        message: '星种不存在'
      });
    }

    // 获取评论
    const comments = await Interaction.find({
      targetId: starSeedId,
      targetType: 'starseed',
      actionType: 'comment'
    })
    .populate('userId', 'nickname avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const total = await Interaction.countDocuments({
      targetId: starSeedId,
      targetType: 'starseed',
      actionType: 'comment'
    });

    res.json({
      success: true,
      data: {
        comments: comments.map(comment => ({
          id: comment._id,
          content: comment.content,
          user: {
            id: comment.userId._id,
            nickname: comment.userId.nickname,
            avatar: comment.userId.avatar
          },
          createdAt: comment.createdAt
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      message: '获取评论失败，请稍后重试'
    });
  }
});

module.exports = router;

