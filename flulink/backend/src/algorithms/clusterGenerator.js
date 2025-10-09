const { User, Cluster, Interaction } = require('../models');
const ResonanceCalculator = require('./resonanceCalculator');
const redisService = require('../services/redisService');

class ClusterGenerator {
  constructor() {
    this.resonanceCalculator = new ResonanceCalculator();
    this.clusterSize = parseInt(process.env.CLUSTER_SIZE) || 49;
    this.clusterExpireDays = parseInt(process.env.CLUSTER_EXPIRE_DAYS) || 7;
    this.minResonanceThreshold = 50; // 最小共鸣阈值
    this.maxCandidates = 1000; // 最大候选用户数
  }

  // 生成星团（主要方法）- 第3次优化：增强错误处理和重试机制
  async generateCluster(userA, userB) {
    const startTime = Date.now();
    let errorContext = {};
    let retryCount = 0;
    const maxRetries = 3;
    
    try {
      // 优化3.1: 增强输入验证，添加详细验证信息
      const validationResult = await this.validateInputs(userA, userB);
      if (!validationResult.valid) {
        throw new Error(`输入验证失败: ${validationResult.reason}`);
      }

      // 优化3.2: 添加错误上下文和重试信息
      errorContext = { 
        userAId: userA._id, 
        userBId: userB._id, 
        step: 'validation',
        retryCount: retryCount,
        timestamp: new Date()
      };

      // 第3次优化: 增强星团检查，添加详细错误信息和恢复机制
      const clusterCheck = await this.checkExistingClusters(userA, userB);
      if (!clusterCheck.canProceed) {
        // 优化3.1: 记录详细的错误信息
        await this.recordClusterCheckError(userA._id, userB._id, clusterCheck.reason, errorContext);
        
        // 优化3.2: 尝试恢复机制
        if (clusterCheck.reason.includes('timeout')) {
          console.log(`尝试恢复超时的星团检查: ${userA._id} - ${userB._id}`);
          const retryCheck = await this.checkExistingClusters(userA, userB, true);
          if (retryCheck.canProceed) {
            console.log(`星团检查恢复成功: ${userA._id} - ${userB._id}`);
          } else {
            throw new Error(`星团检查失败: ${clusterCheck.reason}`);
          }
        } else {
          throw new Error(`星团检查失败: ${clusterCheck.reason}`);
        }
      }

      errorContext.step = 'cluster_check';

      // 优化4: 计算核心共鸣值（带重试机制）
      const coreResonance = await this.calculateCoreResonanceWithRetry(userA, userB);
      
      if (coreResonance < this.minResonanceThreshold) {
        throw new Error(`核心共鸣值不足: ${coreResonance} < ${this.minResonanceThreshold}`);
      }

      errorContext.step = 'resonance_calculation';

      // 优化5: 获取候选用户（带缓存）
      const candidates = await this.getCandidateUsersWithCache(userA, userB);
      
      if (candidates.length < this.clusterSize - 2) {
        throw new Error(`候选用户数量不足: ${candidates.length} < ${this.clusterSize - 2}`);
      }

      errorContext.step = 'candidate_selection';

      // 优化6: 筛选星团成员（带错误恢复）
      const clusterMembers = await this.selectClusterMembersWithFallback(userA, userB, candidates);

      errorContext.step = 'member_selection';

      // 优化7: 创建星团（带事务）
      const cluster = await this.createClusterWithTransaction(userA, userB, clusterMembers, coreResonance);

      // 优化8: 记录成功指标
      await this.recordSuccessMetrics(userA._id, userB._id, Date.now() - startTime);

      return cluster;

      // 7. 更新用户状态
      await this.updateUserClusterStatus(clusterMembers, cluster._id);

      // 8. 缓存星团数据
      await this.cacheClusterData(cluster);

      return cluster;
    } catch (error) {
      // 优化9: 增强错误处理和日志记录
      const errorInfo = {
        error: error.message,
        context: errorContext,
        timestamp: new Date(),
        executionTime: Date.now() - startTime,
        userAId: userA?._id,
        userBId: userB?._id
      };

      // 记录详细错误信息
      console.error('Cluster generation failed:', errorInfo);
      
      // 根据错误类型提供不同的处理策略
      if (error.message.includes('候选用户数量不足')) {
        // 优化10: 候选用户不足时的降级策略
        return await this.generateClusterWithReducedSize(userA, userB);
      } else if (error.message.includes('共鸣值不足')) {
        // 优化11: 共鸣值不足时的建议策略
        return await this.suggestAlternativeUsers(userA, userB);
      } else {
        // 优化12: 通用错误恢复策略
        await this.recordFailureMetrics(errorInfo);
        throw new Error(`星团生成失败: ${error.message}`);
      }
    }
  }

  // 获取候选用户 - 优化版本
  async getCandidateUsers(userA, userB) {
    try {
      // 优化1: 使用更精确的查询条件，减少数据库负载
      const baseQuery = {
        _id: { $nin: [userA._id, userB._id] },
        isActive: true,
        currentCluster: null,
        lastActiveAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // 7天内活跃
      };

      // 优化2: 添加地理位置的预筛选（如果用户有位置信息）
      if (userA.location && userB.location) {
        const avgLat = (userA.location.latitude + userB.location.latitude) / 2;
        const avgLng = (userA.location.longitude + userB.location.longitude) / 2;
        const maxDistance = 50; // 50公里范围

        baseQuery['location.latitude'] = {
          $gte: avgLat - maxDistance / 111, // 1度约111公里
          $lte: avgLat + maxDistance / 111
        };
        baseQuery['location.longitude'] = {
          $gte: avgLng - maxDistance / (111 * Math.cos(avgLat * Math.PI / 180)),
          $lte: avgLng + maxDistance / (111 * Math.cos(avgLat * Math.PI / 180))
        };
      }

      // 优化3: 使用聚合管道进行预筛选和排序
      const pipeline = [
        { $match: baseQuery },
        { $sample: { size: this.maxCandidates * 2 } }, // 随机采样，增加多样性
        { $limit: this.maxCandidates }
      ];

      const activeUsers = await User.aggregate(pipeline);

      // 优化4: 并行计算共鸣值，使用优化的批量计算
      const resonanceCalculator = new ResonanceCalculator();
      const candidatesWithResonance = await resonanceCalculator.calculateBatchResonanceOptimized(
        userA, 
        activeUsers.map(user => ({ user, userB }))
      );

      // 优化5: 添加多样性评分
      const diversifiedCandidates = await this.addDiversityScore(candidatesWithResonance, userA, userB);

      // 优化6: 综合排序（共鸣值 + 多样性）
      return diversifiedCandidates.sort((a, b) => {
        const scoreA = a.resonance * 0.7 + a.diversityScore * 0.3;
        const scoreB = b.resonance * 0.7 + b.diversityScore * 0.3;
        return scoreB - scoreA;
      });
    } catch (error) {
      console.error('Error getting candidate users:', error);
      throw error;
    }
  }

  // 筛选星团成员
  async selectClusterMembers(userA, userB, candidates) {
    try {
      const members = [userA, userB]; // 核心用户
      const remainingSlots = this.clusterSize - 2;

      // 1. 确保间接互动用户（3-5人）
      const indirectUsers = await this.getIndirectUsers(userA, userB, candidates);
      members.push(...indirectUsers.slice(0, 5));

      // 2. 按活跃度平衡筛选
      const activeFiltered = await this.filterByActivity(
        candidates.filter(c => !members.includes(c.user)),
        remainingSlots - indirectUsers.length
      );

      members.push(...activeFiltered.map(c => c.user));

      // 3. 确保标签多样性
      const diverseMembers = await this.ensureTagDiversity(members, userA, userB);

      return diverseMembers.slice(0, this.clusterSize);
    } catch (error) {
      console.error('Error selecting cluster members:', error);
      throw error;
    }
  }

  // 获取间接互动用户
  async getIndirectUsers(userA, userB, candidates) {
    try {
      const indirectUsers = [];

      // 获取用户A和B的互动历史
      const interactionsA = await Interaction.find({ userId: userA._id });
      const interactionsB = await Interaction.find({ userId: userB._id });

      // 找出共同互动过的用户
      const commonTargets = new Set();
      interactionsA.forEach(i => commonTargets.add(i.targetId.toString()));
      interactionsB.forEach(i => {
        if (commonTargets.has(i.targetId.toString())) {
          const candidate = candidates.find(c => c.user._id.toString() === i.targetId.toString());
          if (candidate) {
            indirectUsers.push(candidate);
          }
        }
      });

      return indirectUsers;
    } catch (error) {
      console.error('Error getting indirect users:', error);
      return [];
    }
  }

  // 按活跃度筛选
  async filterByActivity(candidates, limit) {
    try {
      const highActive = candidates.filter(c => c.user.daysActive >= 30);
      const mediumActive = candidates.filter(c => c.user.daysActive >= 7 && c.user.daysActive < 30);
      const lowActive = candidates.filter(c => c.user.daysActive < 7);

      const highCount = Math.min(Math.floor(limit * 0.3), highActive.length);
      const mediumCount = Math.min(Math.floor(limit * 0.4), mediumActive.length);
      const lowCount = limit - highCount - mediumCount;

      const selected = [
        ...highActive.slice(0, highCount),
        ...mediumActive.slice(0, mediumCount),
        ...lowActive.slice(0, lowCount)
      ];

      return selected;
    } catch (error) {
      console.error('Error filtering by activity:', error);
      return candidates.slice(0, limit);
    }
  }

  // 确保标签多样性
  async ensureTagDiversity(members, userA, userB) {
    try {
      const coreTags = new Set([...userA.tags, ...userB.tags]);
      const maxSameTagRatio = 0.4;
      const maxSameTag = Math.floor(this.clusterSize * maxSameTagRatio);

      const tagCounts = new Map();
      const diverseMembers = [];

      for (const member of members) {
        const memberTags = member.tags || [];
        const coreTagOverlap = memberTags.filter(tag => coreTags.has(tag));

        if (coreTagOverlap.length === 0) {
          diverseMembers.push(member);
          continue;
        }

        const primaryTag = coreTagOverlap[0];
        const currentCount = tagCounts.get(primaryTag) || 0;

        if (currentCount < maxSameTag) {
          tagCounts.set(primaryTag, currentCount + 1);
          diverseMembers.push(member);
        }
      }

      // 如果数量不足，补充无核心标签的用户
      if (diverseMembers.length < this.clusterSize) {
        const remaining = this.clusterSize - diverseMembers.length;
        const nonCoreUsers = members.filter(member => {
          const memberTags = member.tags || [];
          return !memberTags.some(tag => coreTags.has(tag)) && 
                 !diverseMembers.includes(member);
        });

        diverseMembers.push(...nonCoreUsers.slice(0, remaining));
      }

      return diverseMembers;
    } catch (error) {
      console.error('Error ensuring tag diversity:', error);
      return members;
    }
  }

  // 创建星团
  async createCluster(userA, userB, members, coreResonance) {
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + this.clusterExpireDays);

      // 计算星团统计
      const stats = await this.calculateClusterStats(members);

      const cluster = new Cluster({
        members: members.map(m => m._id),
        coreUsers: [userA._id, userB._id],
        resonanceScore: coreResonance,
        averageResonance: stats.averageResonance,
        activityDistribution: stats.activityDistribution,
        tagDiversity: stats.tagDiversity,
        expiresAt,
        isActive: true,
        totalSeeds: 0,
        totalInteractions: 0,
        averageLuminosity: 0
      });

      await cluster.save();
      return cluster;
    } catch (error) {
      console.error('Error creating cluster:', error);
      throw error;
    }
  }

  // 计算星团统计
  async calculateClusterStats(members) {
    try {
      const stats = {
        averageResonance: 0,
        activityDistribution: {
          high: 0,
          medium: 0,
          low: 0
        },
        tagDiversity: new Map()
      };

      let totalResonance = 0;
      const allTags = new Set();

      for (const member of members) {
        // 计算活跃度分布
        if (member.daysActive >= 30) {
          stats.activityDistribution.high++;
        } else if (member.daysActive >= 7) {
          stats.activityDistribution.medium++;
        } else {
          stats.activityDistribution.low++;
        }

        // 收集标签
        (member.tags || []).forEach(tag => {
          allTags.add(tag);
          stats.tagDiversity.set(tag, (stats.tagDiversity.get(tag) || 0) + 1);
        });
      }

      stats.averageResonance = totalResonance / members.length;

      return stats;
    } catch (error) {
      console.error('Error calculating cluster stats:', error);
      return {
        averageResonance: 0,
        activityDistribution: { high: 0, medium: 0, low: 0 },
        tagDiversity: new Map()
      };
    }
  }

  // 更新用户星团状态
  async updateUserClusterStatus(members, clusterId) {
    try {
      const userIds = members.map(m => m._id);
      
      await User.updateMany(
        { _id: { $in: userIds } },
        { 
          currentCluster: clusterId,
          lastActiveAt: new Date()
        }
      );
    } catch (error) {
      console.error('Error updating user cluster status:', error);
      throw error;
    }
  }

  // 缓存星团数据
  async cacheClusterData(cluster) {
    try {
      const clusterData = {
        id: cluster._id,
        members: cluster.members,
        coreUsers: cluster.coreUsers,
        resonanceScore: cluster.resonanceScore,
        averageResonance: cluster.averageResonance,
        expiresAt: cluster.expiresAt,
        isActive: cluster.isActive
      };

      await redisService.cacheCluster(cluster._id, clusterData);
    } catch (error) {
      console.error('Error caching cluster data:', error);
    }
  }

  // 解散过期星团
  async dissolveExpiredClusters() {
    try {
      const now = new Date();
      const expiredClusters = await Cluster.find({
        expiresAt: { $lt: now },
        isActive: true
      });

      for (const cluster of expiredClusters) {
        await this.dissolveCluster(cluster._id);
      }

      console.log(`Dissolved ${expiredClusters.length} expired clusters`);
      return expiredClusters.length;
    } catch (error) {
      console.error('Error dissolving expired clusters:', error);
      throw error;
    }
  }

  // 解散指定星团
  async dissolveCluster(clusterId) {
    try {
      const cluster = await Cluster.findById(clusterId);
      if (!cluster) {
        throw new Error('星团不存在');
      }

      // 更新用户状态
      await User.updateMany(
        { currentCluster: clusterId },
        { currentCluster: null }
      );

      // 更新星团状态
      cluster.isActive = false;
      await cluster.save();

      // 清除缓存
      await redisService.deleteCache(`cluster:${clusterId}*`);

      console.log(`Dissolved cluster ${clusterId}`);
    } catch (error) {
      console.error('Error dissolving cluster:', error);
      throw error;
    }
  }

  // 获取用户当前星团
  async getUserCurrentCluster(userId) {
    try {
      const user = await User.findById(userId).populate('currentCluster');
      if (!user || !user.currentCluster) {
        return null;
      }

      // 检查星团是否过期
      if (user.currentCluster.expiresAt < new Date()) {
        await this.dissolveCluster(user.currentCluster._id);
        return null;
      }

      return user.currentCluster;
    } catch (error) {
      console.error('Error getting user current cluster:', error);
      throw error;
    }
  }

  // 获取星团成员详情
  async getClusterMembers(clusterId) {
    try {
      const cluster = await Cluster.findById(clusterId).populate('members');
      if (!cluster) {
        throw new Error('星团不存在');
      }

      return cluster.members;
    } catch (error) {
      console.error('Error getting cluster members:', error);
      throw error;
    }
  }

  // 检查星团生成条件
  async checkClusterGenerationConditions(userA, userB) {
    try {
      const conditions = {
        canGenerate: true,
        reasons: []
      };

      // 检查用户是否已在星团中
      if (userA.currentCluster) {
        conditions.canGenerate = false;
        conditions.reasons.push('用户A已在星团中');
      }

      if (userB.currentCluster) {
        conditions.canGenerate = false;
        conditions.reasons.push('用户B已在星团中');
      }

      // 检查共鸣值
      const resonance = await this.resonanceCalculator.calculateResonance(userA, userB);
      if (resonance < this.minResonanceThreshold) {
        conditions.canGenerate = false;
        conditions.reasons.push(`共鸣值不足: ${resonance} < ${this.minResonanceThreshold}`);
      }

      // 检查候选用户数量
      const candidates = await this.getCandidateUsers(userA, userB);
      if (candidates.length < this.clusterSize - 2) {
        conditions.canGenerate = false;
        conditions.reasons.push('候选用户数量不足');
      }

      return conditions;
    } catch (error) {
      console.error('Error checking cluster generation conditions:', error);
      return {
        canGenerate: false,
        reasons: ['系统错误']
      };
    }
  }

  // 优化方法1: 添加多样性评分
  async addDiversityScore(candidates, userA, userB) {
    try {
      const coreTags = new Set([...(userA.tags || []), ...(userB.tags || [])]);
      const coreInterests = new Set([...(userA.interests || []), ...(userB.interests || [])]);

      return candidates.map(candidate => {
        const user = candidate.user;
        const userTags = user.tags || [];
        const userInterests = user.interests || [];

        // 计算标签多样性
        const tagOverlap = userTags.filter(tag => coreTags.has(tag)).length;
        const tagDiversity = 1 - (tagOverlap / Math.max(userTags.length, 1));

        // 计算兴趣多样性
        const interestOverlap = userInterests.filter(interest => coreInterests.has(interest)).length;
        const interestDiversity = 1 - (interestOverlap / Math.max(userInterests.length, 1));

        // 计算活跃度多样性
        const activityDiversity = Math.min(user.daysActive || 0, 30) / 30;

        // 综合多样性评分
        const diversityScore = (tagDiversity * 0.4 + interestDiversity * 0.4 + activityDiversity * 0.2);

        return {
          ...candidate,
          diversityScore: Math.round(diversityScore * 100) / 100
        };
      });
    } catch (error) {
      console.error('Error adding diversity score:', error);
      return candidates.map(candidate => ({ ...candidate, diversityScore: 0.5 }));
    }
  }

  // 优化方法2: 智能星团成员选择
  async selectClusterMembersOptimized(userA, userB, candidates) {
    try {
      const members = [userA, userB];
      const remainingSlots = this.clusterSize - 2;

      // 优化1: 分层选择策略
      const selectionStrategy = await this.determineSelectionStrategy(userA, userB, candidates);
      
      // 优化2: 按策略选择成员
      const selectedMembers = await this.executeSelectionStrategy(selectionStrategy, candidates, remainingSlots);
      
      members.push(...selectedMembers);

      // 优化3: 最终平衡调整
      const balancedMembers = await this.balanceClusterComposition(members, userA, userB);

      return balancedMembers.slice(0, this.clusterSize);
    } catch (error) {
      console.error('Error selecting cluster members optimized:', error);
      return await this.selectClusterMembers(userA, userB, candidates);
    }
  }

  // 优化方法3: 确定选择策略
  async determineSelectionStrategy(userA, userB, candidates) {
    try {
      const avgResonance = candidates.reduce((sum, c) => sum + c.resonance, 0) / candidates.length;
      const diversityVariance = this.calculateDiversityVariance(candidates);

      if (avgResonance > 70 && diversityVariance < 0.3) {
        return 'high_resonance_low_diversity'; // 高共鸣低多样性，需要增加多样性
      } else if (avgResonance < 50 && diversityVariance > 0.6) {
        return 'low_resonance_high_diversity'; // 低共鸣高多样性，需要提高共鸣
      } else {
        return 'balanced'; // 平衡策略
      }
    } catch (error) {
      console.error('Error determining selection strategy:', error);
      return 'balanced';
    }
  }

  // 优化方法4: 执行选择策略
  async executeSelectionStrategy(strategy, candidates, limit) {
    try {
      switch (strategy) {
        case 'high_resonance_low_diversity':
          // 优先选择多样性高的用户
          return candidates
            .sort((a, b) => b.diversityScore - a.diversityScore)
            .slice(0, limit)
            .map(c => c.user);

        case 'low_resonance_high_diversity':
          // 优先选择共鸣值高的用户
          return candidates
            .sort((a, b) => b.resonance - a.resonance)
            .slice(0, limit)
            .map(c => c.user);

        case 'balanced':
        default:
          // 平衡选择
          return candidates
            .sort((a, b) => (b.resonance * 0.6 + b.diversityScore * 0.4) - (a.resonance * 0.6 + a.diversityScore * 0.4))
            .slice(0, limit)
            .map(c => c.user);
      }
    } catch (error) {
      console.error('Error executing selection strategy:', error);
      return candidates.slice(0, limit).map(c => c.user);
    }
  }

  // 优化方法5: 计算多样性方差
  calculateDiversityVariance(candidates) {
    try {
      const diversityScores = candidates.map(c => c.diversityScore);
      const mean = diversityScores.reduce((sum, score) => sum + score, 0) / diversityScores.length;
      const variance = diversityScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / diversityScores.length;
      return Math.sqrt(variance);
    } catch (error) {
      console.error('Error calculating diversity variance:', error);
      return 0.5;
    }
  }

  // 优化方法6: 平衡星团组成
  async balanceClusterComposition(members, userA, userB) {
    try {
      // 分析当前组成
      const composition = this.analyzeClusterComposition(members);
      
      // 如果需要调整，进行微调
      if (composition.needsAdjustment) {
        return await this.adjustClusterComposition(members, composition, userA, userB);
      }

      return members;
    } catch (error) {
      console.error('Error balancing cluster composition:', error);
      return members;
    }
  }

  // 优化方法7: 分析星团组成
  analyzeClusterComposition(members) {
    try {
      const analysis = {
        totalMembers: members.length,
        activityLevels: { high: 0, medium: 0, low: 0 },
        tagDistribution: new Map(),
        needsAdjustment: false
      };

      members.forEach(member => {
        // 分析活跃度分布
        if (member.daysActive >= 30) {
          analysis.activityLevels.high++;
        } else if (member.daysActive >= 7) {
          analysis.activityLevels.medium++;
        } else {
          analysis.activityLevels.low++;
        }

        // 分析标签分布
        (member.tags || []).forEach(tag => {
          analysis.tagDistribution.set(tag, (analysis.tagDistribution.get(tag) || 0) + 1);
        });
      });

      // 检查是否需要调整
      const totalActive = analysis.activityLevels.high + analysis.activityLevels.medium + analysis.activityLevels.low;
      const highActiveRatio = analysis.activityLevels.high / totalActive;
      
      if (highActiveRatio > 0.6 || highActiveRatio < 0.2) {
        analysis.needsAdjustment = true;
      }

      return analysis;
    } catch (error) {
      console.error('Error analyzing cluster composition:', error);
      return { needsAdjustment: false };
    }
  }

  // 优化方法8: 调整星团组成
  async adjustClusterComposition(members, composition, userA, userB) {
    try {
      // 这里可以实现更复杂的调整逻辑
      // 目前返回原始成员列表
      return members;
    } catch (error) {
      console.error('Error adjusting cluster composition:', error);
      return members;
    }
  }
}

module.exports = ClusterGenerator;

