const express = require('express');
const { Cluster, User, StarSeed, Interaction } = require('../models');
const { authMiddleware } = require('../middleware/auth');
const ClusterGenerator = require('../algorithms/clusterGenerator');
const ClusterMatchingAlgorithm = require('../algorithms/clusterMatchingAlgorithm');
const redisService = require('../services/redisService');

const router = express.Router();

/**
 * @swagger
 * /api/clusters/generate:
 *   post:
 *     summary: 生成星团
 *     description: 为用户生成新的星团
 *     tags: [Clusters]
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
 *       201:
 *         description: 星团生成成功
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
 *                     cluster:
 *                       $ref: '#/components/schemas/Cluster'
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
// 生成星团
router.post('/generate', authMiddleware, async (req, res) => {
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
        message: '不能与自己生成星团'
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

    // 检查用户是否已在星团中
    if (userA.currentCluster || userB.currentCluster) {
      return res.status(409).json({
        success: false,
        message: '用户已在星团中'
      });
    }

    // 生成星团
    const clusterGenerator = new ClusterGenerator();
    const cluster = await clusterGenerator.generateCluster(userA, userB);

    res.status(201).json({
      success: true,
      message: '星团生成成功',
      data: {
        cluster: {
          id: cluster._id,
          members: cluster.members,
          coreUsers: cluster.coreUsers,
          resonanceScore: cluster.resonanceScore,
          averageResonance: cluster.averageResonance,
          activityDistribution: cluster.activityDistribution,
          tagDiversity: Object.fromEntries(cluster.tagDiversity),
          expiresAt: cluster.expiresAt,
          isActive: cluster.isActive,
          createdAt: cluster.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Generate cluster error:', error);
    res.status(500).json({
      success: false,
      message: '星团生成失败',
      error: error.message
    });
  }
});

// 检查星团生成条件
router.post('/check-generation', authMiddleware, async (req, res) => {
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

    // 检查生成条件
    const clusterGenerator = new ClusterGenerator();
    const conditions = await clusterGenerator.checkClusterGenerationConditions(userA, userB);

    res.json({
      success: true,
      data: {
        conditions
      }
    });
  } catch (error) {
    console.error('Check generation conditions error:', error);
    res.status(500).json({
      success: false,
      message: '检查生成条件失败',
      error: error.message
    });
  }
});

// 获取星团列表
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'active', sortBy = 'createdAt', order = 'desc' } = req.query;

    // 构建查询条件
    const query = {};
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'expired') {
      query.isActive = false;
    }

    // 构建排序条件
    const sort = {};
    sort[sortBy] = order === 'desc' ? -1 : 1;

    // 分页查询
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const clusters = await Cluster.find(query)
      .populate('members', 'nickname avatar starColor')
      .populate('coreUsers', 'nickname avatar starColor')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Cluster.countDocuments(query);

    res.json({
      success: true,
      data: {
        clusters: clusters.map(cluster => ({
          id: cluster._id,
          members: cluster.members.map(member => ({
            id: member._id,
            nickname: member.nickname,
            avatar: member.avatar,
            starColor: member.starColor
          })),
          coreUsers: cluster.coreUsers.map(user => ({
            id: user._id,
            nickname: user.nickname,
            avatar: user.avatar,
            starColor: user.starColor
          })),
          resonanceScore: cluster.resonanceScore,
          averageResonance: cluster.averageResonance,
          activityDistribution: cluster.activityDistribution,
          tagDiversity: Object.fromEntries(cluster.tagDiversity),
          expiresAt: cluster.expiresAt,
          isActive: cluster.isActive,
          createdAt: cluster.createdAt
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
    console.error('Get clusters error:', error);
    res.status(500).json({
      success: false,
      message: '获取星团列表失败',
      error: error.message
    });
  }
});

// 获取星团详情
router.get('/:clusterId', authMiddleware, async (req, res) => {
  try {
    const { clusterId } = req.params;

    const cluster = await Cluster.findById(clusterId)
      .populate('members', 'nickname avatar starColor motto poem tags daysActive')
      .populate('coreUsers', 'nickname avatar starColor motto poem tags daysActive');

    if (!cluster) {
      return res.status(404).json({
        success: false,
        message: '星团不存在'
      });
    }

    // 获取星团统计信息
    const starSeeds = await StarSeed.find({ clusterId });
    const totalInteractions = await Interaction.countDocuments({
      targetId: { $in: starSeeds.map(s => s._id) },
      targetType: 'starseed'
    });

    res.json({
      success: true,
      data: {
        cluster: {
          id: cluster._id,
          members: cluster.members.map(member => ({
            id: member._id,
            nickname: member.nickname,
            avatar: member.avatar,
            starColor: member.starColor,
            motto: member.motto,
            poem: member.poem,
            tags: member.tags,
            daysActive: member.daysActive
          })),
          coreUsers: cluster.coreUsers.map(user => ({
            id: user._id,
            nickname: user.nickname,
            avatar: user.avatar,
            starColor: user.starColor,
            motto: user.motto,
            poem: user.poem,
            tags: user.tags,
            daysActive: user.daysActive
          })),
          resonanceScore: cluster.resonanceScore,
          averageResonance: cluster.averageResonance,
          activityDistribution: cluster.activityDistribution,
          tagDiversity: Object.fromEntries(cluster.tagDiversity),
          expiresAt: cluster.expiresAt,
          isActive: cluster.isActive,
          stats: {
            memberCount: cluster.members.length,
            starSeedCount: starSeeds.length,
            totalInteractions,
            averageLuminosity: starSeeds.length > 0 ? 
              starSeeds.reduce((sum, s) => sum + s.luminosity, 0) / starSeeds.length : 0
          },
          createdAt: cluster.createdAt,
          updatedAt: cluster.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Get cluster detail error:', error);
    res.status(500).json({
      success: false,
      message: '获取星团详情失败',
      error: error.message
    });
  }
});

// 获取用户当前星团
router.get('/user/current', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const clusterGenerator = new ClusterGenerator();
    const cluster = await clusterGenerator.getUserCurrentCluster(userId);

    if (!cluster) {
      return res.json({
        success: true,
        data: {
          cluster: null
        }
      });
    }

    res.json({
      success: true,
      data: {
        cluster: {
          id: cluster._id,
          members: cluster.members,
          coreUsers: cluster.coreUsers,
          resonanceScore: cluster.resonanceScore,
          averageResonance: cluster.averageResonance,
          expiresAt: cluster.expiresAt,
          isActive: cluster.isActive,
          createdAt: cluster.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Get user current cluster error:', error);
    res.status(500).json({
      success: false,
      message: '获取用户当前星团失败',
      error: error.message
    });
  }
});

// 获取星团成员
router.get('/:clusterId/members', authMiddleware, async (req, res) => {
  try {
    const { clusterId } = req.params;

    const clusterGenerator = new ClusterGenerator();
    const members = await clusterGenerator.getClusterMembers(clusterId);

    res.json({
      success: true,
      data: {
        members: members.map(member => ({
          id: member._id,
          nickname: member.nickname,
          avatar: member.avatar,
          starColor: member.starColor,
          motto: member.motto,
          poem: member.poem,
          tags: member.tags,
          daysActive: member.daysActive
        }))
      }
    });
  } catch (error) {
    console.error('Get cluster members error:', error);
    res.status(500).json({
      success: false,
      message: '获取星团成员失败',
      error: error.message
    });
  }
});

// 解散星团
router.delete('/:clusterId', authMiddleware, async (req, res) => {
  try {
    const { clusterId } = req.params;
    const userId = req.user.id;

    const cluster = await Cluster.findById(clusterId);
    if (!cluster) {
      return res.status(404).json({
        success: false,
        message: '星团不存在'
      });
    }

    // 检查权限（只有核心用户或管理员可以解散星团）
    const isCoreUser = cluster.coreUsers.some(user => user.toString() === userId);
    if (!isCoreUser) {
      return res.status(403).json({
        success: false,
        message: '无权限解散此星团'
      });
    }

    // 解散星团
    const clusterGenerator = new ClusterGenerator();
    await clusterGenerator.dissolveCluster(clusterId);

    res.json({
      success: true,
      message: '星团解散成功'
    });
  } catch (error) {
    console.error('Dissolve cluster error:', error);
    res.status(500).json({
      success: false,
      message: '解散星团失败',
      error: error.message
    });
  }
});

// 获取星团统计
router.get('/:clusterId/stats', authMiddleware, async (req, res) => {
  try {
    const { clusterId } = req.params;

    const cluster = await Cluster.findById(clusterId);
    if (!cluster) {
      return res.status(404).json({
        success: false,
        message: '星团不存在'
      });
    }

    // 获取星团统计信息
    const starSeeds = await StarSeed.find({ clusterId });
    const interactions = await Interaction.find({
      targetId: { $in: starSeeds.map(s => s._id) },
      targetType: 'starseed'
    });

    const stats = {
      memberCount: cluster.members.length,
      starSeedCount: starSeeds.length,
      totalInteractions: interactions.length,
      averageLuminosity: starSeeds.length > 0 ? 
        starSeeds.reduce((sum, s) => sum + s.luminosity, 0) / starSeeds.length : 0,
      resonanceScore: cluster.resonanceScore,
      averageResonance: cluster.averageResonance,
      activityDistribution: cluster.activityDistribution,
      tagDiversity: Object.fromEntries(cluster.tagDiversity),
      createdAt: cluster.createdAt,
      expiresAt: cluster.expiresAt,
      isActive: cluster.isActive
    };

    res.json({
      success: true,
      data: {
        stats
      }
    });
  } catch (error) {
    console.error('Get cluster stats error:', error);
    res.status(500).json({
      success: false,
      message: '获取星团统计失败',
      error: error.message
    });
  }
});

// 批量解散过期星团
router.post('/dissolve-expired', authMiddleware, async (req, res) => {
  try {
    const clusterGenerator = new ClusterGenerator();
    const dissolvedCount = await clusterGenerator.dissolveExpiredClusters();

    res.json({
      success: true,
      message: `成功解散${dissolvedCount}个过期星团`,
      data: {
        dissolvedCount
      }
    });
  } catch (error) {
    console.error('Dissolve expired clusters error:', error);
    res.status(500).json({
      success: false,
      message: '解散过期星团失败',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/clusters/{id}/members:
 *   get:
 *     summary: 获取星团成员
 *     description: 获取指定星团的所有成员信息
 *     tags: [Clusters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 星团ID
 *     responses:
 *       200:
 *         description: 获取成员成功
 *       404:
 *         description: 星团不存在
 */
// 获取星团成员
router.get('/:id/members', async (req, res) => {
  try {
    const clusterId = req.params.id;

    // 查找星团
    const cluster = await Cluster.findById(clusterId);
    if (!cluster) {
      return res.status(404).json({
        success: false,
        message: '星团不存在'
      });
    }

    // 获取成员详细信息
    const memberIds = cluster.members.map(member => member.userId);
    const members = await User.find({ _id: { $in: memberIds } })
      .select('nickname avatar tags starColor daysActive createdAt');

    // 组合成员信息
    const memberDetails = cluster.members.map(member => {
      const userInfo = members.find(user => user._id.toString() === member.userId.toString());
      return {
        userId: member.userId,
        position: member.position,
        resonanceValue: member.resonanceValue,
        activityScore: member.activityScore,
        joinedAt: member.joinedAt,
        user: userInfo ? {
          nickname: userInfo.nickname,
          avatar: userInfo.avatar,
          tags: userInfo.tags,
          starColor: userInfo.starColor,
          daysActive: userInfo.daysActive,
          createdAt: userInfo.createdAt
        } : null
      };
    });

    res.json({
      success: true,
      data: {
        clusterId: cluster._id,
        members: memberDetails,
        totalMembers: memberDetails.length,
        averageResonance: cluster.averageResonance,
        resonanceThreshold: cluster.resonanceThreshold
      }
    });
  } catch (error) {
    console.error('Get cluster members error:', error);
    res.status(500).json({
      success: false,
      message: '获取星团成员失败，请稍后重试'
    });
  }
});

/**
 * @swagger
 * /api/clusters/{id}/leave:
 *   post:
 *     summary: 离开星团
 *     description: 用户主动离开星团
 *     tags: [Clusters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 星团ID
 *     responses:
 *       200:
 *         description: 离开成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权访问
 *       404:
 *         description: 星团不存在
 */
// 离开星团
router.post('/:id/leave', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const clusterId = req.params.id;

    // 查找星团
    const cluster = await Cluster.findById(clusterId);
    if (!cluster) {
      return res.status(404).json({
        success: false,
        message: '星团不存在'
      });
    }

    // 检查用户是否在星团中
    const memberIndex = cluster.members.findIndex(member => member.userId.toString() === userId);
    if (memberIndex === -1) {
      return res.status(400).json({
        success: false,
        message: '您不在此星团中'
      });
    }

    // 移除成员
    cluster.members.splice(memberIndex, 1);

    // 如果成员数量少于2人，解散星团
    if (cluster.members.length < 2) {
      cluster.status = 'dissolved';
      cluster.dissolvedAt = new Date();
      
      // 清除所有成员的用户状态
      await User.updateMany(
        { _id: { $in: cluster.members.map(m => m.userId) } },
        { currentCluster: null }
      );
    } else {
      // 重新计算平均共鸣值
      const totalResonance = cluster.members.reduce((sum, member) => sum + member.resonanceValue, 0);
      cluster.averageResonance = totalResonance / cluster.members.length;
    }

    await cluster.save();

    // 更新用户状态
    await User.findByIdAndUpdate(userId, { currentCluster: null });

    res.json({
      success: true,
      message: cluster.status === 'dissolved' ? '已离开星团，星团已解散' : '已离开星团',
      data: {
        clusterStatus: cluster.status,
        remainingMembers: cluster.members.length
      }
    });
  } catch (error) {
    console.error('Leave cluster error:', error);
    res.status(500).json({
      success: false,
      message: '离开星团失败，请稍后重试'
    });
  }
});

/**
 * @swagger
 * /api/clusters/{id}/stats:
 *   get:
 *     summary: 获取星团统计
 *     description: 获取星团的详细统计信息
 *     tags: [Clusters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 星团ID
 *     responses:
 *       200:
 *         description: 获取统计成功
 *       404:
 *         description: 星团不存在
 */
// 获取星团统计
router.get('/:id/stats', async (req, res) => {
  try {
    const clusterId = req.params.id;

    // 查找星团
    const cluster = await Cluster.findById(clusterId);
    if (!cluster) {
      return res.status(404).json({
        success: false,
        message: '星团不存在'
      });
    }

    // 计算统计信息
    const memberIds = cluster.members.map(member => member.userId);
    
    // 获取成员活跃度统计
    const activeMembers = await User.countDocuments({
      _id: { $in: memberIds },
      lastActiveAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    // 获取星种统计
    const starSeedCount = await StarSeed.countDocuments({
      authorId: { $in: memberIds },
      createdAt: { $gte: cluster.createdAt }
    });

    // 获取互动统计
    const interactionCount = await Interaction.countDocuments({
      userId: { $in: memberIds },
      createdAt: { $gte: cluster.createdAt }
    });

    // 计算共鸣值分布
    const resonanceValues = cluster.members.map(member => member.resonanceValue);
    const resonanceStats = {
      min: Math.min(...resonanceValues),
      max: Math.max(...resonanceValues),
      average: cluster.averageResonance,
      median: resonanceValues.sort((a, b) => a - b)[Math.floor(resonanceValues.length / 2)]
    };

    res.json({
      success: true,
      data: {
        clusterId: cluster._id,
        stats: {
          totalMembers: cluster.members.length,
          activeMembers,
          starSeedCount,
          interactionCount,
          resonanceStats,
          averageResonance: cluster.averageResonance,
          resonanceThreshold: cluster.resonanceThreshold,
          createdAt: cluster.createdAt,
          expiresAt: cluster.expiresAt,
          status: cluster.status
        }
      }
    });
  } catch (error) {
    console.error('Get cluster stats error:', error);
    res.status(500).json({
      success: false,
      message: '获取星团统计失败，请稍后重试'
    });
  }
});

/**
 * @swagger
 * /api/clusters/{id}/recommendations:
 *   get:
 *     summary: 获取星团推荐
 *     description: 基于星团成员获取推荐内容
 *     tags: [Clusters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 星团ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 推荐数量
 *     responses:
 *       200:
 *         description: 获取推荐成功
 *       404:
 *         description: 星团不存在
 */
// 获取星团推荐
router.get('/:id/recommendations', async (req, res) => {
  try {
    const clusterId = req.params.id;
    const limit = parseInt(req.query.limit) || 10;

    // 查找星团
    const cluster = await Cluster.findById(clusterId);
    if (!cluster) {
      return res.status(404).json({
        success: false,
        message: '星团不存在'
      });
    }

    const memberIds = cluster.members.map(member => member.userId);

    // 获取成员发布的星种
    const starSeeds = await StarSeed.find({
      authorId: { $in: memberIds },
      createdAt: { $gte: cluster.createdAt }
    })
    .populate('authorId', 'nickname avatar')
    .sort({ luminosity: -1 })
    .limit(limit);

    // 获取相关用户推荐
    const allUserTags = [];
    cluster.members.forEach(member => {
      if (member.user && member.user.tags) {
        allUserTags.push(...member.user.tags);
      }
    });

    const commonTags = [...new Set(allUserTags)];
    const recommendedUsers = await User.find({
      _id: { $nin: memberIds },
      tags: { $in: commonTags },
      currentCluster: null
    })
    .select('nickname avatar tags')
    .limit(5);

    res.json({
      success: true,
      data: {
        clusterId: cluster._id,
        recommendations: {
          starSeeds: starSeeds.map(seed => ({
            id: seed._id,
            content: seed.content,
            luminosity: seed.luminosity,
            author: {
              id: seed.authorId._id,
              nickname: seed.authorId.nickname,
              avatar: seed.authorId.avatar
            },
            createdAt: seed.createdAt
          })),
          users: recommendedUsers.map(user => ({
            id: user._id,
            nickname: user.nickname,
            avatar: user.avatar,
            tags: user.tags
          }))
        }
      }
    });
  } catch (error) {
    console.error('Get cluster recommendations error:', error);
    res.status(500).json({
      success: false,
      message: '获取星团推荐失败，请稍后重试'
    });
  }
});

module.exports = router;

