const express = require('express');
const { User } = require('../models');
const { authMiddleware } = require('../middleware/auth');
const redisService = require('../services/redisService');

const router = express.Router();

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: 获取用户资料
 *     description: 获取当前登录用户的详细资料信息
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取用户资料
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
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: 用户不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// 获取用户资料
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          phone: user.phone,
          nickname: user.nickname,
          motto: user.motto,
          poem: user.poem,
          tags: user.tags,
          avatar: user.avatar,
          starColor: user.starColor,
          contentPreferences: user.contentPreferences,
          daysActive: user.daysActive,
          currentCluster: user.currentCluster,
          clusterHistory: user.clusterHistory,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: '获取用户资料失败',
      error: error.message
    });
  }
});

// 更新用户资料
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { nickname, motto, poem, avatar, starColor } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 更新字段
    if (nickname !== undefined) {
      if (nickname.length > 20) {
        return res.status(400).json({
          success: false,
          message: '昵称不能超过20个字符'
        });
      }
      user.nickname = nickname;
    }

    if (motto !== undefined) {
      if (motto.length > 100) {
        return res.status(400).json({
          success: false,
          message: '个人签名不能超过100个字符'
        });
      }
      user.motto = motto;
    }

    if (poem !== undefined) {
      if (poem.length > 200) {
        return res.status(400).json({
          success: false,
          message: '代表诗句不能超过200个字符'
        });
      }
      user.poem = poem;
    }

    if (avatar !== undefined) {
      user.avatar = avatar;
    }

    if (starColor !== undefined) {
      // 验证颜色格式
      const colorRegex = /^#[0-9A-Fa-f]{6}$/;
      if (!colorRegex.test(starColor)) {
        return res.status(400).json({
          success: false,
          message: '星球颜色格式不正确'
        });
      }
      user.starColor = starColor;
    }

    user.updatedAt = new Date();
    await user.save();

    res.json({
      success: true,
      message: '用户资料更新成功',
      data: {
        user: {
          id: user._id,
          phone: user.phone,
          nickname: user.nickname,
          motto: user.motto,
          poem: user.poem,
          tags: user.tags,
          avatar: user.avatar,
          starColor: user.starColor,
          daysActive: user.daysActive,
          currentCluster: user.currentCluster,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: '更新用户资料失败',
      error: error.message
    });
  }
});

// 获取用户统计信息
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 计算用户统计信息
    const stats = {
      daysActive: user.daysActive,
      totalInteractions: user.interactions.length,
      currentCluster: user.currentCluster,
      clusterHistory: user.clusterHistory.length,
      tags: user.tags.length,
      createdAt: user.createdAt,
      lastActiveAt: user.lastActiveAt
    };

    res.json({
      success: true,
      data: {
        stats
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: '获取用户统计失败',
      error: error.message
    });
  }
});

// 获取用户活跃状态
router.get('/active-status', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 从缓存获取活跃状态
    const isActive = await redisService.getUserActive(userId);
    
    res.json({
      success: true,
      data: {
        isActive: isActive !== null ? isActive : true,
        userId
      }
    });
  } catch (error) {
    console.error('Get active status error:', error);
    res.status(500).json({
      success: false,
      message: '获取活跃状态失败',
      error: error.message
    });
  }
});

// 更新用户活跃状态
router.put('/active-status', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { isActive } = req.body;

    // 更新数据库
    await User.findByIdAndUpdate(userId, {
      isActive: isActive,
      lastActiveAt: new Date()
    });

    // 更新缓存
    await redisService.cacheUserActive(userId, isActive);

    res.json({
      success: true,
      message: '活跃状态更新成功',
      data: {
        isActive,
        userId
      }
    });
  } catch (error) {
    console.error('Update active status error:', error);
    res.status(500).json({
      success: false,
      message: '更新活跃状态失败',
      error: error.message
    });
  }
});

// 获取用户内容偏好
router.get('/preferences', authMiddleware, async (req, res) => {
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
        preferences: user.contentPreferences || new Map()
      }
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({
      success: false,
      message: '获取内容偏好失败',
      error: error.message
    });
  }
});

// 更新用户内容偏好
router.put('/preferences', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { preferences } = req.body;

    if (!preferences || typeof preferences !== 'object') {
      return res.status(400).json({
        success: false,
        message: '偏好设置格式不正确'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 更新内容偏好
    user.contentPreferences = new Map(Object.entries(preferences));
    user.updatedAt = new Date();
    await user.save();

    res.json({
      success: true,
      message: '内容偏好更新成功',
      data: {
        preferences: Object.fromEntries(user.contentPreferences)
      }
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: '更新内容偏好失败',
      error: error.message
    });
  }
});

// 删除用户账户
router.delete('/account', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 验证密码
    if (password) {
      const bcrypt = require('bcrypt');
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: '密码错误'
        });
      }
    }

    // 软删除：禁用账户而不是真正删除
    user.isActive = false;
    user.updatedAt = new Date();
    await user.save();

    // 清除缓存
    await redisService.cacheUserActive(userId, false);

    res.json({
      success: true,
      message: '账户已删除'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: '删除账户失败',
      error: error.message
    });
  }
});

// 获取用户信息（公开接口）
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select('-password -phone');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          nickname: user.nickname,
          motto: user.motto,
          poem: user.poem,
          tags: user.tags,
          avatar: user.avatar,
          starColor: user.starColor,
          daysActive: user.daysActive,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Get user info error:', error);
    res.status(500).json({
      success: false,
      message: '获取用户信息失败',
      error: error.message
    });
  }
});

module.exports = router;

