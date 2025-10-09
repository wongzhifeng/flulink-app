const express = require('express');
const { Cluster, User, StarSeed, Interaction } = require('../models');
const { authMiddleware } = require('../middleware/auth');
const ClusterMatchingAlgorithm = require('../algorithms/clusterMatchingAlgorithm');
const ActivityBalanceAlgorithm = require('../algorithms/activityBalanceAlgorithm');
const TagDiversityAlgorithm = require('../algorithms/tagDiversityAlgorithm');
const redisService = require('../services/redisService');

const router = express.Router();

// 搜索星团
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { q, page = 1, limit = 20, sortBy = 'createdAt', order = 'desc' } = req.query;

    // 构建搜索条件
    const query = { isActive: true };
    
    if (q && q.trim().length > 0) {
      // 搜索包含特定用户的星团
      const users = await User.find({
        $or: [
          { nickname: { $regex: q, $options: 'i' } },
          { motto: { $regex: q, $options: 'i' } },
          { poem: { $regex: q, $options: 'i' } }
        ]
      }).select('_id');

      if (users.length > 0) {
        query.$or = [
          { members: { $in: users.map(u => u._id) } },
          { coreUsers: { $in: users.map(u => u._id) } }
        ];
      }
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
          expiresAt: cluster.expiresAt,
          createdAt: cluster.createdAt
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        },
        query: q
      }
    });
  } catch (error) {
    console.error('Search clusters error:', error);
    res.status(500).json({
      success: false,
      message: '搜索星团失败',
      error: error.message
    });
  }
});

// 获取推荐星团
router.get('/recommendations', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 获取用户标签
    const userTags = user.tags || [];
    
    // 查找包含相似标签用户的星团
    const similarUsers = await User.find({
      _id: { $ne: userId },
      tags: { $in: userTags },
      currentCluster: null
    }).limit(20);

    if (similarUsers.length === 0) {
      return res.json({
        success: true,
        data: {
          recommendations: []
        }
      });
    }

    // 查找这些用户参与的星团
    const clusters = await Cluster.find({
      isActive: true,
      $or: [
        { members: { $in: similarUsers.map(u => u._id) } },
        { coreUsers: { $in: similarUsers.map(u => u._id) } }
      ]
    })
    .populate('members', 'nickname avatar starColor')
    .populate('coreUsers', 'nickname avatar starColor')
    .sort({ resonanceScore: -1 })
    .limit(parseInt(limit));

    res.json({
      success: true,
      data: {
        recommendations: clusters.map(cluster => ({
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
          expiresAt: cluster.expiresAt,
          createdAt: cluster.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Get cluster recommendations error:', error);
    res.status(500).json({
      success: false,
      message: '获取推荐星团失败',
      error: error.message
    });
  }
});

// 获取星团匹配建议
router.post('/match-suggestions', authMiddleware, async (req, res) => {
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

    // 获取候选用户
    const clusterGenerator = new ClusterGenerator();
    const candidates = await clusterGenerator.getCandidateUsers(userA, userB);

    // 使用匹配算法
    const matchingAlgorithm = new ClusterMatchingAlgorithm();
    const matchResult = await matchingAlgorithm.match49Users([userA, userB], candidates);

    res.json({
      success: true,
      data: {
        matchResult: {
          members: matchResult.members.map(member => ({
            id: member._id,
            nickname: member.nickname,
            avatar: member.avatar,
            starColor: member.starColor,
            tags: member.tags,
            daysActive: member.daysActive
          })),
          qualityScore: matchResult.qualityScore,
          averageResonance: matchResult.averageResonance,
          diversityScore: matchResult.diversityScore,
          activityBalance: matchResult.activityBalance
        }
      }
    });
  } catch (error) {
    console.error('Get match suggestions error:', error);
    res.status(500).json({
      success: false,
      message: '获取匹配建议失败',
      error: error.message
    });
  }
});

// 获取星团活跃度分析
router.get('/:clusterId/activity-analysis', authMiddleware, async (req, res) => {
  try {
    const { clusterId } = req.params;

    const cluster = await Cluster.findById(clusterId);
    if (!cluster) {
      return res.status(404).json({
        success: false,
        message: '星团不存在'
      });
    }

    // 获取星团成员
    const members = await User.find({ _id: { $in: cluster.members } });

    // 分析活跃度
    const activityAlgorithm = new ActivityBalanceAlgorithm();
    const activityStats = await activityAlgorithm.getActivityStatistics(members);

    res.json({
      success: true,
      data: {
        activityAnalysis: activityStats
      }
    });
  } catch (error) {
    console.error('Get activity analysis error:', error);
    res.status(500).json({
      success: false,
      message: '获取活跃度分析失败',
      error: error.message
    });
  }
});

// 获取星团标签多样性分析
router.get('/:clusterId/diversity-analysis', authMiddleware, async (req, res) => {
  try {
    const { clusterId } = req.params;

    const cluster = await Cluster.findById(clusterId);
    if (!cluster) {
      return res.status(404).json({
        success: false,
        message: '星团不存在'
      });
    }

    // 获取星团成员
    const members = await User.find({ _id: { $in: cluster.members } });

    // 分析标签多样性
    const diversityAlgorithm = new TagDiversityAlgorithm();
    const diversityStats = diversityAlgorithm.getTagDiversityStatistics(members);

    res.json({
      success: true,
      data: {
        diversityAnalysis: diversityStats
      }
    });
  } catch (error) {
    console.error('Get diversity analysis error:', error);
    res.status(500).json({
      success: false,
      message: '获取多样性分析失败',
      error: error.message
    });
  }
});

// 获取星团共鸣分析
router.get('/:clusterId/resonance-analysis', authMiddleware, async (req, res) => {
  try {
    const { clusterId } = req.params;

    const cluster = await Cluster.findById(clusterId);
    if (!cluster) {
      return res.status(404).json({
        success: false,
        message: '星团不存在'
      });
    }

    // 获取星团成员
    const members = await User.find({ _id: { $in: cluster.members } });

    // 计算成员间的共鸣值
    const resonanceValues = [];
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        // 这里应该调用共鸣计算算法
        // 暂时使用一个简化的计算
        const resonance = Math.random() * 100;
        resonanceValues.push({
          userA: members[i]._id,
          userB: members[j]._id,
          resonance
        });
      }
    }

    const analysis = {
      averageResonance: cluster.averageResonance,
      maxResonance: Math.max(...resonanceValues.map(r => r.resonance)),
      minResonance: Math.min(...resonanceValues.map(r => r.resonance)),
      resonanceDistribution: {
        high: resonanceValues.filter(r => r.resonance >= 80).length,
        medium: resonanceValues.filter(r => r.resonance >= 50 && r.resonance < 80).length,
        low: resonanceValues.filter(r => r.resonance < 50).length
      },
      resonanceValues
    };

    res.json({
      success: true,
      data: {
        resonanceAnalysis: analysis
      }
    });
  } catch (error) {
    console.error('Get resonance analysis error:', error);
    res.status(500).json({
      success: false,
      message: '获取共鸣分析失败',
      error: error.message
    });
  }
});

// 获取星团时间线
router.get('/:clusterId/timeline', authMiddleware, async (req, res) => {
  try {
    const { clusterId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // 获取星团内的星种
    const starSeeds = await StarSeed.find({ clusterId })
      .populate('authorId', 'nickname avatar starColor')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const total = await StarSeed.countDocuments({ clusterId });

    res.json({
      success: true,
      data: {
        timeline: starSeeds.map(seed => ({
          id: seed._id,
          content: seed.content,
          imageUrl: seed.imageUrl,
          audioUrl: seed.audioUrl,
          luminosity: seed.luminosity,
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
    console.error('Get cluster timeline error:', error);
    res.status(500).json({
      success: false,
      message: '获取星团时间线失败',
      error: error.message
    });
  }
});

// 获取星团统计概览
router.get('/stats/overview', authMiddleware, async (req, res) => {
  try {
    const totalClusters = await Cluster.countDocuments();
    const activeClusters = await Cluster.countDocuments({ isActive: true });
    const expiredClusters = await Cluster.countDocuments({ isActive: false });

    const totalMembers = await User.countDocuments({ currentCluster: { $ne: null } });
    const totalStarSeeds = await StarSeed.countDocuments();
    const totalInteractions = await Interaction.countDocuments();

    const overview = {
      clusters: {
        total: totalClusters,
        active: activeClusters,
        expired: expiredClusters
      },
      members: {
        total: totalMembers,
        averagePerCluster: activeClusters > 0 ? Math.round(totalMembers / activeClusters) : 0
      },
      starSeeds: {
        total: totalStarSeeds,
        averagePerCluster: activeClusters > 0 ? Math.round(totalStarSeeds / activeClusters) : 0
      },
      interactions: {
        total: totalInteractions,
        averagePerStarSeed: totalStarSeeds > 0 ? Math.round(totalInteractions / totalStarSeeds) : 0
      }
    };

    res.json({
      success: true,
      data: {
        overview
      }
    });
  } catch (error) {
    console.error('Get stats overview error:', error);
    res.status(500).json({
      success: false,
      message: '获取统计概览失败',
      error: error.message
    });
  }
});

module.exports = router;


