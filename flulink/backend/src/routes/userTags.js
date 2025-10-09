const express = require('express');
const { User } = require('../models');
const { authMiddleware } = require('../middleware/auth');
const redisService = require('../services/redisService');

const router = express.Router();

// 获取用户标签
router.get('/tags', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: {
        tags: user.tags || []
      }
    });
  } catch (error) {
    console.error('Get user tags error:', error);
    res.status(500).json({
      success: false,
      message: '获取用户标签失败',
      error: error.message
    });
  }
});

// 添加用户标签
router.post('/tags', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { tags } = req.body;

    if (!tags || !Array.isArray(tags)) {
      return res.status(400).json({
        success: false,
        message: '标签格式不正确'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 验证标签
    const validTags = tags.filter(tag => {
      return typeof tag === 'string' && tag.trim().length > 0 && tag.length <= 20;
    });

    if (validTags.length === 0) {
      return res.status(400).json({
        success: false,
        message: '没有有效的标签'
      });
    }

    // 检查标签数量限制
    const maxTags = 10;
    const currentTags = user.tags || [];
    const newTags = [...new Set([...currentTags, ...validTags])];

    if (newTags.length > maxTags) {
      return res.status(400).json({
        success: false,
        message: `标签数量不能超过${maxTags}个`
      });
    }

    // 更新用户标签
    user.tags = newTags;
    user.updatedAt = new Date();
    await user.save();

    // 清除用户标签缓存
    await redisService.deleteCache(`user:tags:${userId}`);

    res.json({
      success: true,
      message: '标签添加成功',
      data: {
        tags: user.tags
      }
    });
  } catch (error) {
    console.error('Add user tags error:', error);
    res.status(500).json({
      success: false,
      message: '添加标签失败',
      error: error.message
    });
  }
});

// 更新用户标签
router.put('/tags', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { tags } = req.body;

    if (!tags || !Array.isArray(tags)) {
      return res.status(400).json({
        success: false,
        message: '标签格式不正确'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 验证标签
    const validTags = tags.filter(tag => {
      return typeof tag === 'string' && tag.trim().length > 0 && tag.length <= 20;
    });

    // 检查标签数量限制
    const maxTags = 10;
    if (validTags.length > maxTags) {
      return res.status(400).json({
        success: false,
        message: `标签数量不能超过${maxTags}个`
      });
    }

    // 更新用户标签
    user.tags = validTags;
    user.updatedAt = new Date();
    await user.save();

    // 清除用户标签缓存
    await redisService.deleteCache(`user:tags:${userId}`);

    res.json({
      success: true,
      message: '标签更新成功',
      data: {
        tags: user.tags
      }
    });
  } catch (error) {
    console.error('Update user tags error:', error);
    res.status(500).json({
      success: false,
      message: '更新标签失败',
      error: error.message
    });
  }
});

// 删除用户标签
router.delete('/tags', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { tags } = req.body;

    if (!tags || !Array.isArray(tags)) {
      return res.status(400).json({
        success: false,
        message: '标签格式不正确'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 删除指定标签
    const currentTags = user.tags || [];
    const updatedTags = currentTags.filter(tag => !tags.includes(tag));

    // 更新用户标签
    user.tags = updatedTags;
    user.updatedAt = new Date();
    await user.save();

    // 清除用户标签缓存
    await redisService.deleteCache(`user:tags:${userId}`);

    res.json({
      success: true,
      message: '标签删除成功',
      data: {
        tags: user.tags
      }
    });
  } catch (error) {
    console.error('Delete user tags error:', error);
    res.status(500).json({
      success: false,
      message: '删除标签失败',
      error: error.message
    });
  }
});

// 获取推荐标签
router.get('/tags/recommendations', authMiddleware, async (req, res) => {
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

    // 获取所有用户的标签统计
    const tagStats = await User.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) * 2 }
    ]);

    // 过滤掉用户已有的标签
    const userTags = user.tags || [];
    const recommendedTags = tagStats
      .filter(stat => !userTags.includes(stat._id))
      .slice(0, parseInt(limit))
      .map(stat => ({
        tag: stat._id,
        count: stat.count
      }));

    res.json({
      success: true,
      data: {
        recommendations: recommendedTags
      }
    });
  } catch (error) {
    console.error('Get tag recommendations error:', error);
    res.status(500).json({
      success: false,
      message: '获取推荐标签失败',
      error: error.message
    });
  }
});

// 搜索标签
router.get('/tags/search', authMiddleware, async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '搜索关键词不能为空'
      });
    }

    // 搜索标签
    const tagStats = await User.aggregate([
      { $unwind: '$tags' },
      { $match: { tags: { $regex: q, $options: 'i' } } },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) }
    ]);

    const searchResults = tagStats.map(stat => ({
      tag: stat._id,
      count: stat.count
    }));

    res.json({
      success: true,
      data: {
        results: searchResults,
        query: q
      }
    });
  } catch (error) {
    console.error('Search tags error:', error);
    res.status(500).json({
      success: false,
      message: '搜索标签失败',
      error: error.message
    });
  }
});

// 获取热门标签
router.get('/tags/popular', async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    // 获取热门标签
    const popularTags = await User.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) }
    ]);

    const tags = popularTags.map(stat => ({
      tag: stat._id,
      count: stat.count
    }));

    res.json({
      success: true,
      data: {
        tags
      }
    });
  } catch (error) {
    console.error('Get popular tags error:', error);
    res.status(500).json({
      success: false,
      message: '获取热门标签失败',
      error: error.message
    });
  }
});

// 获取标签统计
router.get('/tags/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    const userTags = user.tags || [];
    
    // 获取每个标签的使用统计
    const tagStats = await User.aggregate([
      { $unwind: '$tags' },
      { $match: { tags: { $in: userTags } } },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const stats = tagStats.map(stat => ({
      tag: stat._id,
      count: stat.count,
      isUserTag: userTags.includes(stat._id)
    }));

    res.json({
      success: true,
      data: {
        userTags,
        tagStats: stats,
        totalTags: userTags.length
      }
    });
  } catch (error) {
    console.error('Get tag stats error:', error);
    res.status(500).json({
      success: false,
      message: '获取标签统计失败',
      error: error.message
    });
  }
});

module.exports = router;

