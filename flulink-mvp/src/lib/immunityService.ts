import { ImmunityRule, ImmunityStatus, ImmunityEffect, ImmunityRecommendation } from '@/types/immunity';
import { generateId } from '@/lib/utils';

class ImmunityService {
  private immunityRules: Map<string, ImmunityRule[]> = new Map(); // userId -> rules
  private immunityEffects: Map<string, ImmunityEffect[]> = new Map(); // userId -> effects

  // 创建免疫规则
  createImmunityRule(
    userId: string,
    tagId: string,
    tagName: string,
    ruleType: ImmunityRule['ruleType'],
    strength: number = 80,
    conditions?: ImmunityRule['conditions']
  ): ImmunityRule {
    const rule: ImmunityRule = {
      id: generateId(),
      userId,
      tagId,
      tagName,
      ruleType,
      strength: Math.min(Math.max(strength, 0), 100),
      conditions: conditions || {},
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const userRules = this.immunityRules.get(userId) || [];
    userRules.push(rule);
    this.immunityRules.set(userId, userRules);

    return rule;
  }

  // 获取用户免疫规则
  getUserImmunityRules(userId: string): ImmunityRule[] {
    return this.immunityRules.get(userId) || [];
  }

  // 更新免疫规则
  updateImmunityRule(ruleId: string, updates: Partial<ImmunityRule>): ImmunityRule | null {
    for (const [userId, rules] of this.immunityRules.entries()) {
      const ruleIndex = rules.findIndex(rule => rule.id === ruleId);
      if (ruleIndex !== -1) {
        rules[ruleIndex] = {
          ...rules[ruleIndex],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        return rules[ruleIndex];
      }
    }
    return null;
  }

  // 删除免疫规则
  deleteImmunityRule(ruleId: string): boolean {
    for (const [userId, rules] of this.immunityRules.entries()) {
      const ruleIndex = rules.findIndex(rule => rule.id === ruleId);
      if (ruleIndex !== -1) {
        rules.splice(ruleIndex, 1);
        return true;
      }
    }
    return false;
  }

  // 获取用户免疫状态
  getUserImmunityStatus(userId: string): ImmunityStatus {
    const rules = this.getUserImmunityRules(userId);
    const activeRules = rules.filter(rule => rule.isActive);

    const blockedTags = activeRules
      .filter(rule => rule.ruleType === 'block')
      .map(rule => rule.tagName);

    const filteredTags = activeRules
      .filter(rule => rule.ruleType === 'filter')
      .map(rule => rule.tagName);

    const delayedTags = activeRules
      .filter(rule => rule.ruleType === 'delay')
      .map(rule => rule.tagName);

    // 计算免疫分数
    const immunityScore = this.calculateImmunityScore(activeRules);

    return {
      userId,
      totalRules: rules.length,
      activeRules: activeRules.length,
      blockedTags,
      filteredTags,
      delayedTags,
      immunityScore,
      lastUpdated: new Date().toISOString(),
    };
  }

  // 计算免疫分数
  private calculateImmunityScore(rules: ImmunityRule[]): number {
    if (rules.length === 0) return 0;

    const totalStrength = rules.reduce((sum, rule) => sum + rule.strength, 0);
    const averageStrength = totalStrength / rules.length;

    // 基于规则数量和平均强度计算分数
    const ruleCountScore = Math.min(rules.length * 10, 50); // 最多50分
    const strengthScore = averageStrength * 0.5; // 最多50分

    return Math.min(ruleCountScore + strengthScore, 100);
  }

  // 检查标签免疫效果
  checkImmunityEffect(
    userId: string,
    tagId: string,
    tagName: string,
    context?: {
      time?: string;
      location?: { lat: number; lng: number };
    }
  ): ImmunityEffect {
    const rules = this.getUserImmunityRules(userId);
    const applicableRules = rules.filter(rule => 
      rule.isActive && 
      rule.tagId === tagId &&
      this.isRuleApplicable(rule, context)
    );

    if (applicableRules.length === 0) {
      return {
        tagId,
        tagName,
        effectType: 'allowed',
        reason: '无免疫规则',
        timestamp: new Date().toISOString(),
      };
    }

    // 选择最强的规则
    const strongestRule = applicableRules.reduce((strongest, current) => 
      current.strength > strongest.strength ? current : strongest
    );

    const effect: ImmunityEffect = {
      tagId,
      tagName,
      effectType: strongestRule.ruleType === 'block' ? 'blocked' : 
                 strongestRule.ruleType === 'filter' ? 'filtered' : 'delayed',
      reason: this.getEffectReason(strongestRule),
      appliedRule: strongestRule,
      timestamp: new Date().toISOString(),
    };

    // 记录免疫效果
    const userEffects = this.immunityEffects.get(userId) || [];
    userEffects.push(effect);
    this.immunityEffects.set(userId, userEffects.slice(-100)); // 保留最近100条

    return effect;
  }

  // 检查规则是否适用
  private isRuleApplicable(rule: ImmunityRule, context?: any): boolean {
    if (!context) return true;

    // 检查时间条件
    if (rule.conditions.timeRange && context.time) {
      const currentTime = new Date(context.time);
      const startTime = new Date(rule.conditions.timeRange.start);
      const endTime = new Date(rule.conditions.timeRange.end);
      
      if (currentTime < startTime || currentTime > endTime) {
        return false;
      }
    }

    // 检查位置条件
    if (rule.conditions.location && context.location) {
      const distance = this.calculateDistance(
        rule.conditions.location.lat,
        rule.conditions.location.lng,
        context.location.lat,
        context.location.lng
      );
      
      if (distance > rule.conditions.location.radius) {
        return false;
      }
    }

    return true;
  }

  // 计算距离（简单实现）
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // 地球半径（公里）
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // 获取效果原因
  private getEffectReason(rule: ImmunityRule): string {
    switch (rule.ruleType) {
      case 'block':
        return `完全屏蔽 "${rule.tagName}" 标签内容`;
      case 'filter':
        return `过滤 "${rule.tagName}" 标签内容`;
      case 'delay':
        return `延迟显示 "${rule.tagName}" 标签内容`;
      default:
        return '未知免疫效果';
    }
  }

  // 获取免疫推荐
  getImmunityRecommendations(userId: string, limit: number = 5): ImmunityRecommendation[] {
    const userRules = this.getUserImmunityRules(userId);
    const userTagIds = userRules.map(rule => rule.tagId);

    // 模拟推荐逻辑（实际应用中会基于用户行为分析）
    const recommendations: ImmunityRecommendation[] = [
      {
        tagId: 'rec1',
        tagName: '广告',
        reason: '检测到用户对广告内容敏感',
        confidence: 0.8,
        suggestedRule: {
          ruleType: 'block',
          strength: 90,
        },
      },
      {
        tagId: 'rec2',
        tagName: '政治',
        reason: '用户很少与政治内容互动',
        confidence: 0.6,
        suggestedRule: {
          ruleType: 'filter',
          strength: 70,
        },
      },
      {
        tagId: 'rec3',
        tagName: '深夜内容',
        reason: '建议在夜间屏蔽某些内容',
        confidence: 0.7,
        suggestedRule: {
          ruleType: 'block',
          strength: 85,
          conditions: {
            timeRange: {
              start: '22:00',
              end: '06:00',
            },
          },
        },
      },
    ];

    return recommendations
      .filter(rec => !userTagIds.includes(rec.tagId))
      .slice(0, limit);
  }

  // 获取用户免疫效果历史
  getUserImmunityEffects(userId: string, limit: number = 20): ImmunityEffect[] {
    const effects = this.immunityEffects.get(userId) || [];
    return effects.slice(-limit).reverse();
  }

  // 批量检查多个标签的免疫效果
  batchCheckImmunityEffects(
    userId: string,
    tags: { id: string; name: string }[],
    context?: any
  ): ImmunityEffect[] {
    return tags.map(tag => 
      this.checkImmunityEffect(userId, tag.id, tag.name, context)
    );
  }

  // 获取免疫统计
  getImmunityStats(userId: string) {
    const rules = this.getUserImmunityRules(userId);
    const effects = this.getUserImmunityEffects(userId, 100);

    const stats = {
      totalRules: rules.length,
      activeRules: rules.filter(rule => rule.isActive).length,
      ruleTypes: {
        block: rules.filter(rule => rule.ruleType === 'block').length,
        filter: rules.filter(rule => rule.ruleType === 'filter').length,
        delay: rules.filter(rule => rule.ruleType === 'delay').length,
      },
      recentEffects: effects.slice(0, 10),
      averageStrength: rules.length > 0 
        ? rules.reduce((sum, rule) => sum + rule.strength, 0) / rules.length 
        : 0,
    };

    return stats;
  }
}

// 创建单例实例
export const immunityService = new ImmunityService();

