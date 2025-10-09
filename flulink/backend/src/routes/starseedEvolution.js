const express = require('express');
const { StarSeed, User, Interaction } = require('../models');
const { authMiddleware } = require('../middleware/auth');
const StarSeedEvolutionEngine = require('../algorithms/starSeedEvolutionEngine');
const LuminosityCalculator = require('../algorithms/luminosityCalculator');
const SpectrumEvolutionEngine = require('../algorithms/spectrumEvolutionEngine');
const JumpConditionEvaluator = require('../algorithms/jumpConditionEvaluator');
const redisService = require('../services/redisService');

const router = express.Router();

// 手动触发星种演化
router.post('/:starSeedId/evolve', authMiddleware, async (req, res) => {
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

    // 检查权限（只有作者可以手动触发演化）
    if (starSeed.authorId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: '无权限触发此星种演化'
      });
    }

    // 执行星种演化
    const evolutionEngine = new StarSeedEvolutionEngine();
    const evolutionResult = await evolutionEngine.evolveStarSeed(starSeedId);

    res.json({
      success: true,
      message: '星种演化成功',
      data: {
        evolution: evolutionResult.evolution,
        starSeed: {
          id: starSeed._id,
          luminosity: evolutionResult.starSeed.luminosity,
          jumpEligible: evolutionResult.starSeed.jumpEligible,
          spectrum: Object.fromEntries(evolutionResult.starSeed.spectrum)
        }
      }
    });
  } catch (error) {
    console.error('Evolve star seed error:', error);
    res.status(500).json({
      success: false,
      message: '星种演化失败',
      error: error.message
    });
  }
});

// 获取星种演化历史
router.get('/:starSeedId/evolution-history', authMiddleware, async (req, res) => {
  try {
    const { starSeedId } = req.params;
    const { limit = 50 } = req.query;

    const starSeed = await StarSeed.findById(starSeedId);
    if (!starSeed) {
      return res.status(404).json({
        success: false,
        message: '星种不存在'
      });
    }

    const evolutionHistory = starSeed.evolutionHistory || [];
    const limitedHistory = evolutionHistory.slice(-parseInt(limit));

    res.json({
      success: true,
      data: {
        evolutionHistory: limitedHistory.map(record => ({
          timestamp: record.timestamp,
          luminosity: record.luminosity,
          spectrum: Object.fromEntries(record.spectrum || new Map())
        })),
        totalRecords: evolutionHistory.length
      }
    });
  } catch (error) {
    console.error('Get evolution history error:', error);
    res.status(500).json({
      success: false,
      message: '获取演化历史失败',
      error: error.message
    });
  }
});

// 获取星种光度信息
router.get('/:starSeedId/luminosity', authMiddleware, async (req, res) => {
  try {
    const { starSeedId } = req.params;

    const starSeed = await StarSeed.findById(starSeedId);
    if (!starSeed) {
      return res.status(404).json({
        success: false,
        message: '星种不存在'
      });
    }

    // 计算当前光度
    const luminosityCalculator = new LuminosityCalculator();
    const luminosityInfo = await luminosityCalculator.calculateLuminosity(starSeedId);

    // 获取光度等级信息
    const level = luminosityCalculator.calculateLuminosityLevel(luminosityInfo.luminosity);
    const levelInfo = luminosityCalculator.getLuminosityLevelInfo(level);

    res.json({
      success: true,
      data: {
        luminosity: {
          current: luminosityInfo.luminosity,
          level: level,
          levelInfo: levelInfo,
          factors: luminosityInfo.factors
        }
      }
    });
  } catch (error) {
    console.error('Get luminosity info error:', error);
    res.status(500).json({
      success: false,
      message: '获取光度信息失败',
      error: error.message
    });
  }
});

// 预测星种光度变化
router.get('/:starSeedId/luminosity/predict', authMiddleware, async (req, res) => {
  try {
    const { starSeedId } = req.params;
    const { timeHorizon = 24 } = req.query;

    const starSeed = await StarSeed.findById(starSeedId);
    if (!starSeed) {
      return res.status(404).json({
        success: false,
        message: '星种不存在'
      });
    }

    // 预测光度变化
    const luminosityCalculator = new LuminosityCalculator();
    const prediction = await luminosityCalculator.predictLuminosityChange(starSeedId, parseInt(timeHorizon));

    res.json({
      success: true,
      data: {
        prediction
      }
    });
  } catch (error) {
    console.error('Predict luminosity error:', error);
    res.status(500).json({
      success: false,
      message: '预测光度变化失败',
      error: error.message
    });
  }
});

// 获取星种光谱信息
router.get('/:starSeedId/spectrum', authMiddleware, async (req, res) => {
  try {
    const { starSeedId } = req.params;

    const starSeed = await StarSeed.findById(starSeedId);
    if (!starSeed) {
      return res.status(404).json({
        success: false,
        message: '星种不存在'
      });
    }

    // 计算光谱统计
    const spectrumEngine = new SpectrumEvolutionEngine();
    const spectrumStats = spectrumEngine.getSpectrumStatistics(starSeed.spectrum);

    res.json({
      success: true,
      data: {
        spectrum: {
          tags: Object.fromEntries(starSeed.spectrum || new Map()),
          stats: spectrumStats
        }
      }
    });
  } catch (error) {
    console.error('Get spectrum info error:', error);
    res.status(500).json({
      success: false,
      message: '获取光谱信息失败',
      error: error.message
    });
  }
});

// 预测星种光谱演化
router.get('/:starSeedId/spectrum/predict', authMiddleware, async (req, res) => {
  try {
    const { starSeedId } = req.params;
    const { timeHorizon = 24 } = req.query;

    const starSeed = await StarSeed.findById(starSeedId);
    if (!starSeed) {
      return res.status(404).json({
        success: false,
        message: '星种不存在'
      });
    }

    // 预测光谱演化
    const spectrumEngine = new SpectrumEvolutionEngine();
    const prediction = await spectrumEngine.predictSpectrumEvolution(starSeedId, parseInt(timeHorizon));

    res.json({
      success: true,
      data: {
        prediction
      }
    });
  } catch (error) {
    console.error('Predict spectrum evolution error:', error);
    res.status(500).json({
      success: false,
      message: '预测光谱演化失败',
      error: error.message
    });
  }
});

// 检查星种跃迁条件
router.get('/:starSeedId/jump-conditions', authMiddleware, async (req, res) => {
  try {
    const { starSeedId } = req.params;

    const starSeed = await StarSeed.findById(starSeedId);
    if (!starSeed) {
      return res.status(404).json({
        success: false,
        message: '星种不存在'
      });
    }

    // 评估跃迁条件
    const jumpEvaluator = new JumpConditionEvaluator();
    const evaluation = await jumpEvaluator.evaluateJumpConditions(starSeedId);

    res.json({
      success: true,
      data: {
        evaluation
      }
    });
  } catch (error) {
    console.error('Check jump conditions error:', error);
    res.status(500).json({
      success: false,
      message: '检查跃迁条件失败',
      error: error.message
    });
  }
});

// 检查星种是否可以跃迁到目标星团
router.post('/:starSeedId/jump-to-cluster', authMiddleware, async (req, res) => {
  try {
    const { starSeedId } = req.params;
    const { targetClusterId } = req.body;

    if (!targetClusterId) {
      return res.status(400).json({
        success: false,
        message: '目标星团ID不能为空'
      });
    }

    // 检查跃迁条件
    const jumpEvaluator = new JumpConditionEvaluator();
    const jumpCheck = await jumpEvaluator.checkJumpToCluster(starSeedId, targetClusterId);

    res.json({
      success: true,
      data: {
        jumpCheck
      }
    });
  } catch (error) {
    console.error('Check jump to cluster error:', error);
    res.status(500).json({
      success: false,
      message: '检查跃迁条件失败',
      error: error.message
    });
  }
});

// 批量演化星种
router.post('/batch-evolve', authMiddleware, async (req, res) => {
  try {
    const { starSeedIds } = req.body;

    if (!starSeedIds || !Array.isArray(starSeedIds)) {
      return res.status(400).json({
        success: false,
        message: '星种ID列表格式不正确'
      });
    }

    // 批量演化
    const evolutionEngine = new StarSeedEvolutionEngine();
    const results = await evolutionEngine.evolveBatchStarSeeds(starSeedIds);

    res.json({
      success: true,
      message: '批量演化完成',
      data: {
        results
      }
    });
  } catch (error) {
    console.error('Batch evolve error:', error);
    res.status(500).json({
      success: false,
      message: '批量演化失败',
      error: error.message
    });
  }
});

// 获取星种演化统计
router.get('/:starSeedId/evolution-stats', authMiddleware, async (req, res) => {
  try {
    const { starSeedId } = req.params;

    const starSeed = await StarSeed.findById(starSeedId);
    if (!starSeed) {
      return res.status(404).json({
        success: false,
        message: '星种不存在'
      });
    }

    // 获取演化统计
    const evolutionEngine = new StarSeedEvolutionEngine();
    const stats = await evolutionEngine.getStarSeedEvolutionStats(starSeedId);

    res.json({
      success: true,
      data: {
        stats
      }
    });
  } catch (error) {
    console.error('Get evolution stats error:', error);
    res.status(500).json({
      success: false,
      message: '获取演化统计失败',
      error: error.message
    });
  }
});

module.exports = router;


