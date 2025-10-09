const express = require('express');
const bcrypt = require('bcrypt');
const { User } = require('../models');
const { AuthService, validatePhone, validatePassword } = require('../middleware/auth');
const redisService = require('../services/redisService');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - phone
 *         - password
 *       properties:
 *         phone:
 *           type: string
 *           description: 手机号
 *           example: "13800138000"
 *         password:
 *           type: string
 *           description: 密码
 *           example: "password123"
 *         nickname:
 *           type: string
 *           description: 昵称
 *           example: "星尘探索者"
 *         motto:
 *           type: string
 *           description: 座右铭
 *           example: "探索无限可能"
 *         poem:
 *           type: string
 *           description: 个人诗句
 *           example: "星光点点，共鸣无限"
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: 用户标签
 *           example: ["技术", "艺术", "音乐"]
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: 用户注册
 *     description: 注册新用户账户
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: 注册成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: 用户已存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { phone, password, nickname, motto, poem, tags } = req.body;

    // 验证输入
    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: '手机号和密码不能为空'
      });
    }

    if (!validatePhone(phone)) {
      return res.status(400).json({
        success: false,
        message: '手机号格式不正确'
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        message: '密码必须至少8位，包含字母和数字'
      });
    }

    // 检查用户是否已存在
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: '该手机号已注册'
      });
    }

    // 加密密码
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 创建用户
    const user = new User({
      phone,
      password: hashedPassword,
      nickname: nickname || '星际旅人',
      motto: motto || '在星海中寻找共鸣',
      poem: poem || '宇宙即我心，我心即宇宙',
      tags: tags || [],
      isActive: true,
      lastActiveAt: new Date(),
      daysActive: 0
    });

    await user.save();

    // 生成JWT Token
    const authService = new AuthService();
    const token = authService.generateToken({
      userId: user._id,
      phone: user.phone
    });

    // 缓存用户活跃状态
    await redisService.cacheUserActive(user._id, true);

    res.status(201).json({
      success: true,
      message: '注册成功',
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
          createdAt: user.createdAt
        },
        token
      }
    });
  } catch (error) {
    console.error('User registration error:', error);
    res.status(500).json({
      success: false,
      message: '注册失败',
      error: error.message
    });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    // 验证输入
    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: '手机号和密码不能为空'
      });
    }

    // 查找用户
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 检查用户是否被禁用
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: '账户已被禁用'
      });
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '密码错误'
      });
    }

    // 更新最后活跃时间
    user.lastActiveAt = new Date();
    user.daysActive = Math.floor((new Date() - user.createdAt) / (1000 * 60 * 60 * 24));
    await user.save();

    // 生成JWT Token
    const authService = new AuthService();
    const token = authService.generateToken({
      userId: user._id,
      phone: user.phone
    });

    // 缓存用户活跃状态
    await redisService.cacheUserActive(user._id, true);

    res.json({
      success: true,
      message: '登录成功',
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
          createdAt: user.createdAt
        },
        token
      }
    });
  } catch (error) {
    console.error('User login error:', error);
    res.status(500).json({
      success: false,
      message: '登录失败',
      error: error.message
    });
  }
});

// 手机号验证码登录
router.post('/login/sms', async (req, res) => {
  try {
    const { phone, code } = req.body;

    // 验证输入
    if (!phone || !code) {
      return res.status(400).json({
        success: false,
        message: '手机号和验证码不能为空'
      });
    }

    if (!validatePhone(phone)) {
      return res.status(400).json({
        success: false,
        message: '手机号格式不正确'
      });
    }

    // 验证验证码（这里应该调用短信服务验证）
    // 暂时使用固定验证码进行测试
    if (code !== '123456') {
      return res.status(401).json({
        success: false,
        message: '验证码错误'
      });
    }

    // 查找或创建用户
    let user = await User.findOne({ phone });
    if (!user) {
      // 自动注册
      user = new User({
        phone,
        nickname: '星际旅人',
        motto: '在星海中寻找共鸣',
        poem: '宇宙即我心，我心即宇宙',
        tags: [],
        isActive: true,
        lastActiveAt: new Date(),
        daysActive: 0
      });
      await user.save();
    } else {
      // 更新活跃状态
      user.lastActiveAt = new Date();
      user.daysActive = Math.floor((new Date() - user.createdAt) / (1000 * 60 * 60 * 24));
      await user.save();
    }

    // 生成JWT Token
    const authService = new AuthService();
    const token = authService.generateToken({
      userId: user._id,
      phone: user.phone
    });

    // 缓存用户活跃状态
    await redisService.cacheUserActive(user._id, true);

    res.json({
      success: true,
      message: '登录成功',
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
          createdAt: user.createdAt
        },
        token
      }
    });
  } catch (error) {
    console.error('SMS login error:', error);
    res.status(500).json({
      success: false,
      message: '登录失败',
      error: error.message
    });
  }
});

// 发送验证码
router.post('/send-code', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || !validatePhone(phone)) {
      return res.status(400).json({
        success: false,
        message: '手机号格式不正确'
      });
    }

    // 这里应该调用短信服务发送验证码
    // 暂时返回成功
    console.log(`发送验证码到 ${phone}: 123456`);

    res.json({
      success: true,
      message: '验证码已发送',
      data: {
        phone,
        code: '123456' // 测试环境返回验证码
      }
    });
  } catch (error) {
    console.error('Send code error:', error);
    res.status(500).json({
      success: false,
      message: '发送验证码失败',
      error: error.message
    });
  }
});

// 刷新Token
router.post('/refresh-token', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token不能为空'
      });
    }

    const authService = new AuthService();
    const newToken = authService.refreshToken(token);

    res.json({
      success: true,
      message: 'Token刷新成功',
      data: {
        token: newToken
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: 'Token刷新失败',
      error: error.message
    });
  }
});

// 用户登出
router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
      const authService = new AuthService();
      const token = authService.extractTokenFromHeader(authHeader);
      const decoded = authService.verifyToken(token);
      
      // 清除用户活跃状态缓存
      await redisService.cacheUserActive(decoded.userId, false);
    }

    res.json({
      success: true,
      message: '登出成功'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: '登出失败',
      error: error.message
    });
  }
});

// 检查手机号是否已注册
router.get('/check-phone/:phone', async (req, res) => {
  try {
    const { phone } = req.params;

    if (!validatePhone(phone)) {
      return res.status(400).json({
        success: false,
        message: '手机号格式不正确'
      });
    }

    const user = await User.findOne({ phone });
    
    res.json({
      success: true,
      data: {
        exists: !!user,
        phone
      }
    });
  } catch (error) {
    console.error('Check phone error:', error);
    res.status(500).json({
      success: false,
      message: '检查手机号失败',
      error: error.message
    });
  }
});

module.exports = router;

