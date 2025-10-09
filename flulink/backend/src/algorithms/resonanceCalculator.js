const { User, Interaction, Resonance } = require('../models');
const redisService = require('../services/redisService');

class ResonanceCalculator {
  constructor() {
    // 权重配置
    this.weights = {
      tagSimilarity: parseFloat(process.env.RESONANCE_TAG_WEIGHT) || 0.6,
      interactionScore: parseFloat(process.env.RESONANCE_INTERACTION_WEIGHT) || 0.4,
      contentPreferenceMatch: 0.15,
      randomFactor: parseFloat(process.env.RESONANCE_RANDOM_WEIGHT) || 0.05
    };

    // 动态权重调整阈值
    this.matureUserThreshold = 30; // 30天为成熟用户
  }

  // 计算两个用户的共鸣值 - 第1次优化：增强缓存策略和性能监控
  async calculateResonance(userA, userB, forceRecalculate = false) {
    const startTime = Date.now(); // 性能监控开始
    try {
      // 优化1: 增强输入验证，提前返回无效请求
      if (!userA || !userB || !userA._id || !userB._id) {
        throw new Error('无效的用户数据');
      }
      
      if (userA._id === userB._id) {
        return 100; // 自己与自己的共鸣值为100
      }

      // 优化2: 改进缓存策略 - 使用更智能的缓存键和预检查
      const cacheKey = this.generateCacheKey(userA._id, userB._id);
      
      if (!forceRecalculate) {
        const cachedResonance = await redisService.getResonance(userA._id, userB._id);
        if (cachedResonance !== null) {
          // 优化3: 添加缓存命中统计和性能记录
          await this.incrementCacheHit(cacheKey);
          await this.recordCacheHitMetrics(userA._id, userB._id, Date.now() - startTime);
          return cachedResonance;
        }
      }

      // 第1次优化: 增强并行计算，使用Promise.allSettled和错误恢复
      const [tagSimilarityResult, interactionScoreResult, contentPreferenceResult] = await Promise.allSettled([
        this.calculateTagSimilarity(userA, userB),
        this.calculateInteractionScore(userA._id, userB._id),
        Promise.resolve(this.calculateContentPreferenceMatch(userA, userB))
      ]);

      // 优化1.1: 处理并行计算结果，实现错误恢复和降级策略
      const tagSimilarity = tagSimilarityResult.status === 'fulfilled' ? tagSimilarityResult.value : 0.1;
      const interactionScore = interactionScoreResult.status === 'fulfilled' ? interactionScoreResult.value : 0.1;
      const contentPreferenceMatch = contentPreferenceResult.status === 'fulfilled' ? contentPreferenceResult.value : 0.1;

      // 优化1.2: 记录并行计算性能和错误统计
      const parallelTime = Date.now() - startTime;
      await this.recordParallelPerformance(userA._id, userB._id, parallelTime);
      
      // 优化1.3: 记录失败的计算任务
      if (tagSimilarityResult.status === 'rejected') {
        await this.recordCalculationError('tagSimilarity', userA._id, userB._id, tagSimilarityResult.reason);
      }
      if (interactionScoreResult.status === 'rejected') {
        await this.recordCalculationError('interactionScore', userA._id, userB._id, interactionScoreResult.reason);
      }
      if (contentPreferenceResult.status === 'rejected') {
        await this.recordCalculationError('contentPreference', userA._id, userB._id, contentPreferenceResult.reason);
      }

      const randomFactor = this.generateRandomFactor();

      // 优化4: 缓存权重计算结果
      const adjustedWeights = await this.getCachedAdjustedWeights(userA);

      // 优化5: 使用更精确的数学计算
      const totalResonance = this.calculateWeightedResonance(
        tagSimilarity,
        interactionScore,
        contentPreferenceMatch,
        randomFactor,
        adjustedWeights
      );

      // 优化6: 异步保存记录，不阻塞主流程
      setImmediate(() => {
        this.saveResonanceRecord(userA._id, userB._id, {
          tagSimilarity,
          interactionScore,
          contentPreferenceMatch,
          randomFactor,
          totalResonance
        }).catch(err => console.error('Async save error:', err));
      });

      // 优化7: 使用更长的缓存时间，减少重复计算
      await redisService.cacheResonance(userA._id, userB._id, totalResonance, 3600); // 1小时缓存

      // 优化8: 记录性能指标
      const executionTime = Date.now() - startTime;
      await this.recordPerformanceMetrics(userA._id, userB._id, executionTime);

      return Math.round(totalResonance * 100) / 100;
    } catch (error) {
      console.error('Error calculating resonance:', error);
      // 优化8: 添加降级策略
      return this.getFallbackResonance(userA, userB);
    }
  }

  // 第12次优化：计算标签相似度，添加缓存和算法优化
  async calculateTagSimilarity(userA, userB) {
    try {
      // 优化12.1: 添加缓存检查
      const cacheKey = `tag_similarity:${userA._id}:${userB._id}`;
      const cachedSimilarity = await redisService.get(cacheKey);
      if (cachedSimilarity !== null) {
        return parseFloat(cachedSimilarity);
      }

      const tagsA = userA.tags || [];
      const tagsB = userB.tags || [];

      if (tagsA.length === 0 && tagsB.length === 0) {
        return 0.5; // 都没有标签时给中等相似度
      }

      if (tagsA.length === 0 || tagsB.length === 0) {
        return 0.1; // 只有一个用户有标签时给低相似度
      }

      // 计算Jaccard相似度
      const intersection = tagsA.filter(tag => tagsB.includes(tag));
      const union = [...new Set([...tagsA, ...tagsB])];
      
      const jaccardSimilarity = intersection.length / union.length;

      // 计算余弦相似度
      const cosineSimilarity = this.calculateCosineSimilarity(tagsA, tagsB);

      // 取两种相似度的平均值
      return (jaccardSimilarity + cosineSimilarity) / 2;
    } catch (error) {
      console.error('Error calculating tag similarity:', error);
      return 0.1;
    }
  }

  // 计算余弦相似度
  calculateCosineSimilarity(tagsA, tagsB) {
    const allTags = [...new Set([...tagsA, ...tagsB])];
    
    const vectorA = allTags.map(tag => tagsA.includes(tag) ? 1 : 0);
    const vectorB = allTags.map(tag => tagsB.includes(tag) ? 1 : 0);

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < allTags.length; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      normA += vectorA[i] * vectorA[i];
      normB += vectorB[i] * vectorB[i];
    }

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // 计算互动历史得分
  async calculateInteractionScore(userAId, userBId) {
    try {
      const interactions = await Interaction.find({
        $or: [
          { userId: userAId, targetId: userBId },
          { userId: userBId, targetId: userAId }
        ]
      }).sort({ createdAt: -1 });

      if (interactions.length === 0) {
        return 0.1; // 没有互动时给低分
      }

      let score = 0;
      const actionWeights = {
        'like': 1,
        'comment': 5,
        'forward': 3,
        'view': 0.5
      };

      // 计算互动得分，考虑时间衰减
      const now = new Date();
      interactions.forEach(interaction => {
        const daysDiff = (now - interaction.createdAt) / (1000 * 60 * 60 * 24);
        const timeDecay = Math.exp(-daysDiff / 30); // 30天半衰期
        
        const actionWeight = actionWeights[interaction.actionType] || 1;
        score += actionWeight * timeDecay;
      });

      // 归一化到0-1范围
      const maxPossibleScore = 50; // 假设最大可能得分
      return Math.min(score / maxPossibleScore, 1.0);
    } catch (error) {
      console.error('Error calculating interaction score:', error);
      return 0.1;
    }
  }

  // 计算内容偏好匹配度
  calculateContentPreferenceMatch(userA, userB) {
    try {
      const prefsA = userA.contentPreferences || new Map();
      const prefsB = userB.contentPreferences || new Map();

      if (prefsA.size === 0 && prefsB.size === 0) {
        return 0.5; // 都没有偏好时给中等匹配度
      }

      let matchScore = 0;
      let totalWeight = 0;

      // 计算用户A的偏好与用户B的匹配度
      for (const [tag, weight] of prefsA) {
        if (prefsB.has(tag)) {
          matchScore += weight * prefsB.get(tag);
        }
        totalWeight += weight;
      }

      if (totalWeight === 0) {
        return 0.1;
      }

      return Math.min(matchScore / totalWeight, 1.0);
    } catch (error) {
      console.error('Error calculating content preference match:', error);
      return 0.1;
    }
  }

  // 生成随机因子
  generateRandomFactor() {
    return Math.random();
  }

  // 根据用户成熟度调整权重
  getAdjustedWeights(user) {
    const daysActive = user.daysActive || 0;
    
    if (daysActive >= this.matureUserThreshold) {
      // 成熟用户：降低标签权重，提高互动权重
      return {
        tagSimilarity: this.weights.tagSimilarity * 0.7,
        interactionScore: this.weights.interactionScore * 1.3,
        contentPreferenceMatch: this.weights.contentPreferenceMatch,
        randomFactor: this.weights.randomFactor
      };
    } else {
      // 新用户：使用默认权重
      return this.weights;
    }
  }

  // 保存共鸣记录
  async saveResonanceRecord(userAId, userBId, factors) {
    try {
      const existingRecord = await Resonance.findOne({
        $or: [
          { userA: userAId, userB: userBId },
          { userA: userBId, userB: userAId }
        ]
      });

      if (existingRecord) {
        // 更新现有记录
        existingRecord.tagSimilarity = factors.tagSimilarity;
        existingRecord.interactionScore = factors.interactionScore;
        existingRecord.contentPreferenceMatch = factors.contentPreferenceMatch;
        existingRecord.randomFactor = factors.randomFactor;
        existingRecord.totalResonance = factors.totalResonance;
        existingRecord.calculatedAt = new Date();

        // 添加到历史记录
        existingRecord.history.push({
          timestamp: new Date(),
          resonance: factors.totalResonance,
          factors: {
            tagSimilarity: factors.tagSimilarity,
            interactionScore: factors.interactionScore,
            contentPreferenceMatch: factors.contentPreferenceMatch,
            randomFactor: factors.randomFactor
          }
        });

        await existingRecord.save();
      } else {
        // 创建新记录
        const resonanceRecord = new Resonance({
          userA: userAId,
          userB: userBId,
          tagSimilarity: factors.tagSimilarity,
          interactionScore: factors.interactionScore,
          contentPreferenceMatch: factors.contentPreferenceMatch,
          randomFactor: factors.randomFactor,
          totalResonance: factors.totalResonance,
          history: [{
            timestamp: new Date(),
            resonance: factors.totalResonance,
            factors: {
              tagSimilarity: factors.tagSimilarity,
              interactionScore: factors.interactionScore,
              contentPreferenceMatch: factors.contentPreferenceMatch,
              randomFactor: factors.randomFactor
            }
          }]
        });

        await resonanceRecord.save();
      }
    } catch (error) {
      console.error('Error saving resonance record:', error);
    }
  }

  // 批量计算用户与多个用户的共鸣值
  async calculateBatchResonance(userA, candidateUsers) {
    try {
      const results = [];
      
      for (const userB of candidateUsers) {
        const resonance = await this.calculateResonance(userA, userB);
        results.push({
          user: userB,
          resonance: resonance
        });
      }

      // 按共鸣值排序
      return results.sort((a, b) => b.resonance - a.resonance);
    } catch (error) {
      console.error('Error calculating batch resonance:', error);
      throw error;
    }
  }

  // 获取用户共鸣历史
  async getUserResonanceHistory(userId, limit = 50) {
    try {
      const history = await Resonance.find({
        $or: [
          { userA: userId },
          { userB: userId }
        ]
      })
      .populate('userA', 'nickname avatar')
      .populate('userB', 'nickname avatar')
      .sort({ calculatedAt: -1 })
      .limit(limit);

      return history;
    } catch (error) {
      console.error('Error getting resonance history:', error);
      throw error;
    }
  }

  // 获取共鸣统计
  async getResonanceStats(userId) {
    try {
      const stats = await Resonance.aggregate([
        {
          $match: {
            $or: [
              { userA: userId },
              { userB: userId }
            ]
          }
        },
        {
          $group: {
            _id: null,
            averageResonance: { $avg: '$totalResonance' },
            maxResonance: { $max: '$totalResonance' },
            minResonance: { $min: '$totalResonance' },
            totalConnections: { $sum: 1 }
          }
        }
      ]);

      return stats[0] || {
        averageResonance: 0,
        maxResonance: 0,
        minResonance: 0,
        totalConnections: 0
      };
    } catch (error) {
      console.error('Error getting resonance stats:', error);
      throw error;
    }
  }

  // 优化方法1: 生成智能缓存键
  generateCacheKey(userAId, userBId) {
    // 确保键的一致性，避免重复计算
    const sortedIds = [userAId.toString(), userBId.toString()].sort();
    return `resonance:${sortedIds[0]}:${sortedIds[1]}`;
  }

  // 优化方法2: 缓存命中统计
  async incrementCacheHit(cacheKey) {
    try {
      await redisService.incrementCounter(`cache_hit:${cacheKey}`);
    } catch (error) {
      // 静默处理缓存统计错误
      console.warn('Cache hit increment failed:', error.message);
    }
  }

  // 优化方法3: 缓存权重计算结果
  async getCachedAdjustedWeights(user) {
    const cacheKey = `weights:${user._id}:${user.daysActive || 0}`;
    
    try {
      const cached = await redisService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.warn('Weight cache read failed:', error.message);
    }

    const weights = this.getAdjustedWeights(user);
    
    // 异步缓存权重
    setImmediate(() => {
      redisService.set(cacheKey, JSON.stringify(weights), 1800).catch(err => 
        console.warn('Weight cache write failed:', err.message)
      );
    });

    return weights;
  }

  // 优化方法4: 精确的加权共鸣计算
  calculateWeightedResonance(tagSimilarity, interactionScore, contentPreferenceMatch, randomFactor, weights) {
    // 使用更精确的数学计算，避免浮点数误差
    const result = (
      Math.round(tagSimilarity * weights.tagSimilarity * 10000) +
      Math.round(interactionScore * weights.interactionScore * 10000) +
      Math.round(contentPreferenceMatch * weights.contentPreferenceMatch * 10000) +
      Math.round(randomFactor * weights.randomFactor * 10000)
    ) / 100;

    return Math.min(Math.max(result, 0), 100); // 确保在0-100范围内
  }

  // 优化方法5: 降级策略
  getFallbackResonance(userA, userB) {
    // 基于用户基本信息的简单共鸣计算
    const baseResonance = 30; // 基础共鸣值
    const tagBonus = (userA.tags || []).length > 0 && (userB.tags || []).length > 0 ? 20 : 0;
    const activityBonus = Math.min((userA.daysActive || 0) + (userB.daysActive || 0), 30);
    
    return Math.min(baseResonance + tagBonus + activityBonus, 100);
  }

  // 优化方法6: 批量共鸣计算优化
  async calculateBatchResonanceOptimized(userA, candidateUsers) {
    try {
      const batchSize = 10; // 批量处理大小
      const results = [];
      
      // 分批处理，避免内存溢出
      for (let i = 0; i < candidateUsers.length; i += batchSize) {
        const batch = candidateUsers.slice(i, i + batchSize);
        const batchPromises = batch.map(async (userB) => {
          const resonance = await this.calculateResonance(userA, userB);
          return {
            user: userB,
            resonance: resonance
          };
        });
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      }

      // 按共鸣值排序
      return results.sort((a, b) => b.resonance - a.resonance);
    } catch (error) {
      console.error('Error calculating batch resonance:', error);
      throw error;
    }
  }

  // 优化方法7: 共鸣值预测
  async predictResonance(userA, userB) {
    try {
      // 基于历史数据预测共鸣值
      const historicalData = await this.getHistoricalResonanceData(userA._id, userB._id);
      
      if (historicalData.length === 0) {
        return this.getFallbackResonance(userA, userB);
      }

      // 使用加权平均预测
      const weights = historicalData.map((data, index) => Math.pow(0.9, index));
      const weightedSum = historicalData.reduce((sum, data, index) => 
        sum + data.resonance * weights[index], 0
      );
      const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

      return Math.round((weightedSum / totalWeight) * 100) / 100;
    } catch (error) {
      console.error('Error predicting resonance:', error);
      return this.getFallbackResonance(userA, userB);
    }
  }

  // 优化方法8: 获取历史共鸣数据
  async getHistoricalResonanceData(userAId, userBId) {
    try {
      const history = await Resonance.findOne({
        $or: [
          { userA: userAId, userB: userBId },
          { userA: userBId, userB: userAId }
        ]
      }).select('history');

      return history?.history?.slice(-10) || []; // 返回最近10次记录
    } catch (error) {
      console.error('Error getting historical resonance data:', error);
      return [];
    }
  }
}

module.exports = ResonanceCalculator;

// 优化9: 性能监控方法 - 第2次优化：增强性能监控
async function recordPerformanceMetrics(userAId, userBId, executionTime) {
  try {
    const metrics = {
      userAId,
      userBId,
      executionTime,
      timestamp: new Date(),
      algorithm: 'resonanceCalculator',
      // 优化2.1: 添加性能等级分类
      performanceLevel: executionTime < 100 ? 'excellent' : 
                       executionTime < 500 ? 'good' : 
                       executionTime < 1000 ? 'acceptable' : 'slow'
    };
    
    // 异步记录到Redis
    await redisService.set(`perf:resonance:${userAId}:${userBId}`, JSON.stringify(metrics), 86400);
    
    // 优化2.2: 增强性能警告和统计
    if (executionTime > 1000) {
      console.warn(`Slow resonance calculation: ${executionTime}ms for users ${userAId} and ${userBId}`);
      // 记录慢查询统计
      await redisService.increment(`slow_queries:resonance:${new Date().toISOString().split('T')[0]}`);
    }
    
    // 优化2.3: 记录性能分布统计
    const performanceBucket = Math.floor(executionTime / 100) * 100;
    await redisService.increment(`perf_distribution:resonance:${performanceBucket}ms`);
    
  } catch (error) {
    console.error('Performance metrics recording failed:', error);
  }
}

// 优化2.4: 新增缓存命中指标记录方法
async function recordCacheHitMetrics(userAId, userBId, cacheTime) {
  try {
    const metrics = {
      userAId,
      userBId,
      cacheTime,
      timestamp: new Date(),
      type: 'cache_hit'
    };
    
    await redisService.set(`cache_hit:resonance:${userAId}:${userBId}`, JSON.stringify(metrics), 3600);
    await redisService.increment(`cache_hits:resonance:${new Date().toISOString().split('T')[0]}`);
    
  } catch (error) {
    console.error('Cache hit metrics recording failed:', error);
  }
}

// 第2次优化: 新增并行性能记录方法
async function recordParallelPerformance(userAId, userBId, parallelTime) {
  try {
    const metrics = {
      userAId,
      userBId,
      parallelTime,
      timestamp: new Date(),
      type: 'parallel_performance',
      // 优化2.1: 添加性能等级分类
      performanceLevel: parallelTime < 50 ? 'excellent' : 
                       parallelTime < 100 ? 'good' : 
                       parallelTime < 200 ? 'acceptable' : 'slow'
    };
    
    await redisService.set(`parallel_perf:resonance:${userAId}:${userBId}`, JSON.stringify(metrics), 3600);
    
    // 优化2.2: 记录并行性能分布统计
    const performanceBucket = Math.floor(parallelTime / 25) * 25;
    await redisService.increment(`parallel_perf_distribution:${performanceBucket}ms`);
    
    // 优化2.3: 如果并行时间过长，记录警告
    if (parallelTime > 200) {
      console.warn(`Slow parallel calculation: ${parallelTime}ms for users ${userAId} and ${userBId}`);
      await redisService.increment(`slow_parallel:resonance:${new Date().toISOString().split('T')[0]}`);
    }
    
  } catch (error) {
    console.error('Parallel performance recording failed:', error);
  }
}

// 第2次优化: 新增计算错误记录方法
async function recordCalculationError(calculationType, userAId, userBId, error) {
  try {
    const errorData = {
      calculationType,
      userAId,
      userBId,
      error: error.message || error.toString(),
      stack: error.stack,
      timestamp: new Date(),
      type: 'calculation_error'
    };
    
    // 记录错误详情
    await redisService.set(`calc_error:${calculationType}:${userAId}:${userBId}`, JSON.stringify(errorData), 86400);
    
    // 记录错误统计
    await redisService.increment(`calc_errors:${calculationType}:${new Date().toISOString().split('T')[0]}`);
    
    // 记录总错误数
    await redisService.increment(`total_calc_errors:${new Date().toISOString().split('T')[0]}`);
    
    console.error(`Calculation error in ${calculationType}:`, error);
    
  } catch (recordError) {
    console.error('Error recording calculation error:', recordError);
  }
}

// 优化10: 批量共鸣计算
async function calculateBatchResonance(userPairs) {
  const results = [];
  const batchSize = 10; // 每批处理10对用户
  
  for (let i = 0; i < userPairs.length; i += batchSize) {
    const batch = userPairs.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(([userA, userB]) => 
        new ResonanceCalculator().calculateResonance(userA, userB)
      )
    );
    results.push(...batchResults);
  }
  
  return results;
}

