const express = require('express');
const { Resonance, User, Interaction } = require('../models');
const { authMiddleware } = require('../middleware/auth');
const redisService = require('../services/redisService');

const router = express.Router();

// 获取共鸣历史记录
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, targetUserId, sortBy = 'timestamp', order = 'desc' } = req.query;

    // 构建查询条件
    const query = {
      $or: [
        { userA: userId },
        { userB: userId }
      ]
    };

    if (targetUserId) {
      query.$or = [
        { userA: userId, userB: targetUserId },
        { userA: targetUserId, userB: userId }
      ];
    }

    // 构建排序条件
    const sort = {};
    sort[sortBy] = order === 'desc' ? -1 : 1;

    // 分页查询
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const resonanceHistory = await Resonance.find(query)
      .populate('userA', 'nickname avatar starColor')
      .populate('userB', 'nickname avatar starColor')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Resonance.countDocuments(query);

    // 格式化数据
    const formattedHistory = resonanceHistory.map(record => {
      const isUserA = record.userA._id.toString() === userId;
      const otherUser = isUserA ? record.userB : record.userA;
      
      return {
        id: record._id,
        otherUser: {
          id: otherUser._id,
          nickname: otherUser.nickname,
          avatar: otherUser.avatar,
          starColor: otherUser.starColor
        },
        resonance: record.resonance,
        factors: record.factors,
        timestamp: record.timestamp
      };
    });

    res.json({
      success: true,
      data: {
        history: formattedHistory,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get resonance history error:', error);
    res.status(500).json({
      success: false,
      message: '获取共鸣历史失败',
      error: error.message
    });
  }
});

// 获取共鸣历史趋势
router.get('/trends/:targetUserId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetUserId } = req.params;
    const { days = 30 } = req.query;

    const startDate = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);

    // 获取共鸣历史趋势
    const trends = await Resonance.find({
      $or: [
        { userA: userId, userB: targetUserId },
        { userA: targetUserId, userB: userId }
      ],
      timestamp: { $gte: startDate }
    }).sort({ timestamp: 1 });

    // 按日期分组
    const trendsByDate = {};
    trends.forEach(record => {
      const date = record.timestamp.toISOString().split('T')[0];
      if (!trendsByDate[date]) {
        trendsByDate[date] = [];
      }
      trendsByDate[date].push(record.resonance);
    });

    // 计算每日平均共鸣值
    const dailyTrends = Object.entries(trendsByDate).map(([date, values]) => ({
      date,
      averageResonance: values.reduce((sum, val) => sum + val, 0) / values.length,
      count: values.length,
      maxResonance: Math.max(...values),
      minResonance: Math.min(...values)
    }));

    res.json({
      success: true,
      data: {
        trends: dailyTrends,
        period: parseInt(days)
      }
    });
  } catch (error) {
    console.error('Get resonance trends error:', error);
    res.status(500).json({
      success: false,
      message: '获取共鸣趋势失败',
      error: error.message
    });
  }
});

// 获取共鸣历史统计
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 'all' } = req.query;

    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = null;
    }

    // 构建查询条件
    const query = {
      $or: [
        { userA: userId },
        { userB: userId }
      ]
    };

    if (startDate) {
      query.timestamp = { $gte: startDate };
    }

    // 获取共鸣统计
    const resonanceStats = await Resonance.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          averageResonance: { $avg: '$resonance' },
          maxResonance: { $max: '$resonance' },
          minResonance: { $min: '$resonance' },
          highResonance: {
            $sum: {
              $cond: [{ $gte: ['$resonance', 80] }, 1, 0]
            }
          },
          mediumResonance: {
            $sum: {
              $cond: [
                { $and: [{ $gte: ['$resonance', 50] }, { $lt: ['$resonance', 80] }] },
                1,
                0
              ]
            }
          },
          lowResonance: {
            $sum: {
              $cond: [{ $lt: ['$resonance', 50] }, 1, 0]
            }
          }
        }
      }
    ]);

    const stats = resonanceStats[0] || {
      totalRecords: 0,
      averageResonance: 0,
      maxResonance: 0,
      minResonance: 0,
      highResonance: 0,
      mediumResonance: 0,
      lowResonance: 0
    };

    // 计算共鸣分布
    const distribution = {
      high: stats.highResonance,
      medium: stats.mediumResonance,
      low: stats.lowResonance,
      total: stats.totalRecords
    };

    res.json({
      success: true,
      data: {
        stats: {
          totalRecords: stats.totalRecords,
          averageResonance: Math.round(stats.averageResonance * 100) / 100,
          maxResonance: stats.maxResonance,
          minResonance: stats.minResonance,
          distribution
        },
        period
      }
    });
  } catch (error) {
    console.error('Get resonance stats error:', error);
    res.status(500).json({
      success: false,
      message: '获取共鸣统计失败',
      error: error.message
    });
  }
});

// 获取共鸣历史详情
router.get('/history/:recordId', authMiddleware, async (req, res) => {
  try {
    const { recordId } = req.params;
    const userId = req.user.id;

    const resonanceRecord = await Resonance.findById(recordId)
      .populate('userA', 'nickname avatar starColor motto poem tags')
      .populate('userB', 'nickname avatar starColor motto poem tags');

    if (!resonanceRecord) {
      return res.status(404).json({
        success: false,
        message: '共鸣记录不存在'
      });
    }

    // 检查权限
    const isUserA = resonanceRecord.userA._id.toString() === userId;
    const isUserB = resonanceRecord.userB._id.toString() === userId;
    
    if (!isUserA && !isUserB) {
      return res.status(403).json({
        success: false,
        message: '无权限查看此共鸣记录'
      });
    }

    res.json({
      success: true,
      data: {
        record: {
          id: resonanceRecord._id,
          userA: {
            id: resonanceRecord.userA._id,
            nickname: resonanceRecord.userA.nickname,
            avatar: resonanceRecord.userA.avatar,
            starColor: resonanceRecord.userA.starColor,
            motto: resonanceRecord.userA.motto,
            poem: resonanceRecord.userA.poem,
            tags: resonanceRecord.userA.tags
          },
          userB: {
            id: resonanceRecord.userB._id,
            nickname: resonanceRecord.userB.nickname,
            avatar: resonanceRecord.userB.avatar,
            starColor: resonanceRecord.userB.starColor,
            motto: resonanceRecord.userB.motto,
            poem: resonanceRecord.userB.poem,
            tags: resonanceRecord.userB.tags
          },
          resonance: resonanceRecord.resonance,
          factors: resonanceRecord.factors,
          timestamp: resonanceRecord.timestamp
        }
      }
    });
  } catch (error) {
    console.error('Get resonance record detail error:', error);
    res.status(500).json({
      success: false,
      message: '获取共鸣记录详情失败',
      error: error.message
    });
  }
});

// 删除共鸣历史记录
router.delete('/history/:recordId', authMiddleware, async (req, res) => {
  try {
    const { recordId } = req.params;
    const userId = req.user.id;

    const resonanceRecord = await Resonance.findById(recordId);

    if (!resonanceRecord) {
      return res.status(404).json({
        success: false,
        message: '共鸣记录不存在'
      });
    }

    // 检查权限
    const isUserA = resonanceRecord.userA.toString() === userId;
    const isUserB = resonanceRecord.userB.toString() === userId;
    
    if (!isUserA && !isUserB) {
      return res.status(403).json({
        success: false,
        message: '无权限删除此共鸣记录'
      });
    }

    // 删除记录
    await Resonance.findByIdAndDelete(recordId);

    // 清除缓存
    await redisService.deleteCache(`resonance:${userId}:${resonanceRecord.userA}:${resonanceRecord.userB}`);
    await redisService.deleteCache(`resonance:${userId}:${resonanceRecord.userB}:${resonanceRecord.userA}`);

    res.json({
      success: true,
      message: '共鸣记录删除成功'
    });
  } catch (error) {
    console.error('Delete resonance record error:', error);
    res.status(500).json({
      success: false,
      message: '删除共鸣记录失败',
      error: error.message
    });
  }
});

// 获取共鸣历史导出
router.get('/export', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { format = 'json', period = 'all' } = req.query;

    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = null;
    }

    // 构建查询条件
    const query = {
      $or: [
        { userA: userId },
        { userB: userId }
      ]
    };

    if (startDate) {
      query.timestamp = { $gte: startDate };
    }

    // 获取共鸣历史
    const resonanceHistory = await Resonance.find(query)
      .populate('userA', 'nickname avatar starColor')
      .populate('userB', 'nickname avatar starColor')
      .sort({ timestamp: -1 });

    // 格式化数据
    const exportData = resonanceHistory.map(record => {
      const isUserA = record.userA._id.toString() === userId;
      const otherUser = isUserA ? record.userB : record.userA;
      
      return {
        id: record._id,
        otherUserId: otherUser._id,
        otherUserNickname: otherUser.nickname,
        otherUserAvatar: otherUser.avatar,
        otherUserStarColor: otherUser.starColor,
        resonance: record.resonance,
        factors: record.factors,
        timestamp: record.timestamp
      };
    });

    if (format === 'csv') {
      // 生成CSV格式
      const csvHeader = 'ID,其他用户ID,其他用户昵称,其他用户头像,其他用户星球颜色,共鸣值,时间戳\n';
      const csvRows = exportData.map(record => 
        `${record.id},${record.otherUserId},${record.otherUserNickname},${record.otherUserAvatar},${record.otherUserStarColor},${record.resonance},${record.timestamp}`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=resonance_history.csv');
      res.send(csvHeader + csvRows);
    } else {
      // 返回JSON格式
      res.json({
        success: true,
        data: {
          exportData,
          period,
          totalRecords: exportData.length
        }
      });
    }
  } catch (error) {
    console.error('Export resonance history error:', error);
    res.status(500).json({
      success: false,
      message: '导出共鸣历史失败',
      error: error.message
    });
  }
});

module.exports = router;





