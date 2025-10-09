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

module.exports = router;

