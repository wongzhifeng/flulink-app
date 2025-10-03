import { VirusStrain } from '@/context/FluLinkContext'
import { MutationRule, MutationConfig, MutationResult, MutationRuleId } from '@/types/phase2/virus/mutation'
import { generateId } from '@/lib/utils'

class MutationService {
  private config: MutationConfig;

  constructor() {
    this.config = {
      rules: [
        {
          id: 'spread_acceleration',
          name: '传播加速',
          description: '提高毒株的传播速度和范围。',
          baseSuccessRate: 70,
          cost: 100,
        },
        {
          id: 'stealth_mode',
          name: '隐蔽模式',
          description: '降低毒株的可见性，使其更难被发现和免疫。',
          baseSuccessRate: 50,
          cost: 150,
        },
        {
          id: 'resistance_boost',
          name: '抗性增强',
          description: '增强毒株对免疫系统的抵抗力。',
          baseSuccessRate: 40,
          cost: 200,
        },
        {
          id: 'virulence_increase',
          name: '毒性增强',
          description: '增加毒株的感染强度和影响力。',
          baseSuccessRate: 60,
          cost: 120,
        },
        {
          id: 'tag_adaptability',
          name: '标签适应性',
          description: '使毒株更容易适应新的标签环境，扩大传播受众。',
          baseSuccessRate: 65,
          cost: 110,
        },
        {
          id: 'cost_reduction',
          name: '成本降低',
          description: '优化毒株的传播效率，降低其传播所需的资源成本。',
          baseSuccessRate: 80,
          cost: 80,
        },
      ],
    };
  }

  getMutationConfig(): MutationConfig {
    return this.config;
  }

  async startMutation(
    originalStrain: VirusStrain,
    rule: MutationRule,
    onProgress: (progress: number) => void
  ): Promise<MutationResult> {
    return new Promise(resolve => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        onProgress(progress);

        if (progress >= 100) {
          clearInterval(interval);
          const success = Math.random() * 100 < rule.baseSuccessRate;
          let message = success ? `${rule.name} 变异成功！` : `${rule.name} 变异失败。`;
          let mutatedStrain = { ...originalStrain };

          if (success) {
            // 模拟变异效果
            if (!mutatedStrain.mutations) {
              mutatedStrain.mutations = [];
            }
            mutatedStrain.mutations.push(rule.name); // 记录变异名称

            switch (rule.id) {
              case 'spread_acceleration':
                mutatedStrain.location.radius = Math.min(originalStrain.location.radius * 1.2, 10); // 范围扩大20%
                mutatedStrain.spreadDelay = Math.max(originalStrain.spreadDelay * 0.8, 0.5); // 延迟减少20%
                message += `传播半径变为 ${mutatedStrain.location.radius.toFixed(1)}km，传播延迟变为 ${mutatedStrain.spreadDelay.toFixed(1)}小时。`;
                break;
              case 'stealth_mode':
                // 模拟隐蔽性增强，例如降低被免疫的几率
                message += `毒株隐蔽性增强，更难被发现。`;
                break;
              case 'resistance_boost':
                // 模拟抗性增强
                message += `毒株抗性增强，免疫难度增加。`;
                break;
              case 'virulence_increase':
                // 模拟毒性增强
                message += `毒株毒性增强，感染强度提升。`;
                break;
              case 'tag_adaptability':
                // 模拟标签适应性增强
                message += `毒株标签适应性增强，可传播至更广的兴趣群体。`;
                break;
              case 'cost_reduction':
                // 模拟成本降低
                message += `毒株传播成本降低，更易于扩散。`;
                break;
            }
          } else {
            message += '请尝试其他规则或优化条件。';
          }

          resolve({
            id: generateId(),
            originalStrainId: originalStrain.id,
            ruleId: rule.id,
            success,
            message,
            timestamp: new Date(),
            mutatedStrain: success ? mutatedStrain : undefined,
          });
        }
      }, 100); // 每100ms更新一次进度
    });
  }
}

export const mutationService = new MutationService();
