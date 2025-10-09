const express = require('express');
const { Cluster, User, StarSeed, Interaction } = require('../models');
const { authMiddleware } = require('../middleware/auth');
const ClusterGenerator = require('../algorithms/clusterGenerator');
const redisService = require('../services/redisService');

const router = express.Router();

// 解散星团
router.delete('/:clusterId/dissolve', authMiddleware, async (req, res) => {
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

// 强制解散星团（管理员权限）
router.delete('/:clusterId/force-dissolve', authMiddleware, async (req, res) => {
  try {
    const { clusterId } = req.params;
    const userId = req.user.id;

    // 检查管理员权限（这里简化处理，实际应该检查用户角色）
    const user = await User.findById(userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: '无权限强制解散星团'
      });
    }

    const cluster = await Cluster.findById(clusterId);
    if (!cluster) {
      return res.status(404).json({
        success: false,
        message: '星团不存在'
      });
    }

    // 强制解散星团
    const clusterGenerator = new ClusterGenerator();
    await clusterGenerator.dissolveCluster(clusterId);

    res.json({
      success: true,
      message: '星团强制解散成功'
    });
  } catch (error) {
    console.error('Force dissolve cluster error:', error);
    res.status(500).json({
      success: false,
      message: '强制解散星团失败',
      error: error.message
    });
  }
});

// 批量解散过期星团
router.post('/dissolve-expired', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // 检查管理员权限
    const user = await User.findById(userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: '无权限执行批量解散操作'
      });
    }

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
      message: '批量解散过期星团失败',
      error: error.message
    });
  }
});

// 获取即将过期的星团
router.get('/expiring', authMiddleware, async (req, res) => {
  try {
    const { hours = 24, page = 1, limit = 20 } = req.query;

    const now = new Date();
    const expiringTime = new Date(now.getTime() + parseInt(hours) * 60 * 60 * 1000);

    const query = {
      isActive: true,
      expiresAt: { $lte: expiringTime }
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const expiringClusters = await Cluster.find(query)
      .populate('members', 'nickname avatar starColor')
      .populate('coreUsers', 'nickname avatar starColor')
      .sort({ expiresAt: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Cluster.countDocuments(query);

    res.json({
      success: true,
      data: {
        expiringClusters: expiringClusters.map(cluster => ({
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
          expiresAt: cluster.expiresAt,
          timeUntilExpiry: cluster.expiresAt - now
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
    console.error('Get expiring clusters error:', error);
    res.status(500).json({
      success: false,
      message: '获取即将过期星团失败',
      error: error.message
    });
  }
});

// 延长星团生命周期
router.put('/:clusterId/extend', authMiddleware, async (req, res) => {
  try {
    const { clusterId } = req.params;
    const userId = req.user.id;
    const { days = 7 } = req.body;

    const cluster = await Cluster.findById(clusterId);
    if (!cluster) {
      return res.status(404).json({
        success: false,
        message: '星团不存在'
      });
    }

    // 检查权限（只有核心用户或管理员可以延长星团）
    const isCoreUser = cluster.coreUsers.some(user => user.toString() === userId);
    if (!isCoreUser) {
      return res.status(403).json({
        success: false,
        message: '无权限延长此星团生命周期'
      });
    }

    // 延长星团生命周期
    const newExpiryTime = new Date(cluster.expiresAt.getTime() + parseInt(days) * 24 * 60 * 60 * 1000);
    cluster.expiresAt = newExpiryTime;
    cluster.updatedAt = new Date();
    await cluster.save();

    res.json({
      success: true,
      message: `星团生命周期延长${days}天`,
      data: {
        cluster: {
          id: cluster._id,
          expiresAt: cluster.expiresAt,
          updatedAt: cluster.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Extend cluster error:', error);
    res.status(500).json({
      success: false,
      message: '延长星团生命周期失败',
      error: error.message
    });
  }
});

// 获取星团解散历史
router.get('/dissolution-history', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    // 检查管理员权限
    const user = await User.findById(userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: '无权限查看解散历史'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const dissolvedClusters = await Cluster.find({ isActive: false })
      .populate('members', 'nickname avatar starColor')
      .populate('coreUsers', 'nickname avatar starColor')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Cluster.countDocuments({ isActive: false });

    res.json({
      success: true,
      data: {
        dissolutionHistory: dissolvedClusters.map(cluster => ({
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
          createdAt: cluster.createdAt,
          expiresAt: cluster.expiresAt,
          dissolvedAt: cluster.updatedAt
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
    console.error('Get dissolution history error:', error);
    res.status(500).json({
      success: false,
      message: '获取解散历史失败',
      error: error.message
    });
  }
});

// 获取星团解散统计
router.get('/dissolution-stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // 检查管理员权限
    const user = await User.findById(userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: '无权限查看解散统计'
      });
    }

    const totalClusters = await Cluster.countDocuments();
    const activeClusters = await Cluster.countDocuments({ isActive: true });
    const dissolvedClusters = await Cluster.countDocuments({ isActive: false });

    // 按时间统计解散数量
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const dissolvedLast24Hours = await Cluster.countDocuments({
      isActive: false,
      updatedAt: { $gte: last24Hours }
    });

    const dissolvedLast7Days = await Cluster.countDocuments({
      isActive: false,
      updatedAt: { $gte: last7Days }
    });

    const dissolvedLast30Days = await Cluster.countDocuments({
      isActive: false,
      updatedAt: { $gte: last30Days }
    });

    const stats = {
      total: {
        clusters: totalClusters,
        active: activeClusters,
        dissolved: dissolvedClusters
      },
      dissolutionRate: {
        last24Hours: dissolvedLast24Hours,
        last7Days: dissolvedLast7Days,
        last30Days: dissolvedLast30Days
      },
      averageLifespan: dissolvedClusters > 0 ? 
        await Cluster.aggregate([
          { $match: { isActive: false } },
          { $project: { lifespan: { $subtract: ['$updatedAt', '$createdAt'] } } },
          { $group: { _id: null, avgLifespan: { $avg: '$lifespan' } } }
        ]) : 0
    };

    res.json({
      success: true,
      data: {
        dissolutionStats: stats
      }
    });
  } catch (error) {
    console.error('Get dissolution stats error:', error);
    res.status(500).json({
      success: false,
      message: '获取解散统计失败',
      error: error.message
    });
  }
});

module.exports = router;



