export type MutationRuleId = 'spread_acceleration' | 'stealth_mode' | 'resistance_boost' | 'virulence_increase' | 'tag_adaptability' | 'cost_reduction';

export interface MutationRule {
  id: MutationRuleId;
  name: string;
  description: string;
  baseSuccessRate: number; // 基础成功率 (0-100)
  cost: number; // 变异所需资源成本
}

export interface MutationConfig {
  rules: MutationRule[];
}

export interface MutationResult {
  id: string;
  originalStrainId: string;
  ruleId: MutationRuleId;
  success: boolean;
  message: string;
  timestamp: Date;
  mutatedStrain?: any; // 变异后的毒株数据，如果成功
}
