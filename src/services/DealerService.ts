// FluLink 流感发牌手服务

import { 
  UserCard, 
  DealerResponse,
  WorldRules,
  DynamicConfig,
  GeoLocation,
  ToxicityReport,
  GeographicPath,
  VirusStrain
} from '@/types/dealer';

export class FluDealerService {
  private worldRules: WorldRules;
  private dynamicConfig: DynamicConfig;
  
  constructor() {
    // 初始化世界规则 (不可修改)
    this.worldRules = {
      fairnessProtocol: '无论付费免费，每张牌都平等对待',
      naturalPropagation: '传播路径必须符合地理逻辑和社交常识',
      transparentOperation: '传播规则向用户公开，拒绝黑箱操作'
    };

    // 初始化动态配置 (管理员可修改)
    this.dynamicConfig = {
      propagationDelay: { min: 2000, max: 5000 }, // 2-5秒延迟
      locationPrecisionThreshold: {
        小区: 100, // 米
        街道: 500,
        城市: 5000
      },
      toxicityThresholds: {
        dormant: { min: 0, max: 3 },
        local: { min: 3.1, max: 6 },
        viral: { min: 6.1, max: 8 },
        superViral: { min: 8.1, max: 10 }
      },
      spreadFactors: {
        text: 0.4,
        image: 0.3,
        form: 0.2,
        userLevel: 0.1
      },
      maxAttachmentsSize: 800 * 1024, // 800KB
      dailySuperViralLimit: 3,
      communityImmunityThreshold: 0.6 // 60%
    };
  }

  // 管理员接口：更新动态配置
  public updateDynamicConfig(newConfig: Partial<DynamicConfig>): void {
    this.dynamicConfig = { ...this.dynamicConfig, ...newConfig };
    console.log('Dynamic config updated:', this.dynamicConfig);
  }

  // 管理员接口：获取当前动态配置
  public getDynamicConfig(): DynamicConfig {
    return this.dynamicConfig;
  }

  // 管理员接口：获取世界规则
  public getWorldRules(): WorldRules {
    return this.worldRules;
  }

  /**
   * 处理用户亮牌请求
   */
  public async processUserCard(userCard: UserCard): Promise<DealerResponse> {
    // 1. 位置精度验证 (世界规则)
    const locationStatus = this.verifyLocationPrecision(userCard.location);
    if (locationStatus === 'refused') {
      return this.createDealerResponse('refused', '位置精度不足，发牌手拒绝服务。请提供更精确的位置信息。');
    }
    if (locationStatus === 'confirm_required') {
      return this.createDealerResponse('confirm_required', '位置精度为街道级别，需要您确认是否继续。');
    }

    // 2. 模拟发牌手思考延迟
    await this.sleep(this.getRandomDelay(this.dynamicConfig.propagationDelay.min, this.dynamicConfig.propagationDelay.max));

    // 3. 毒性评分
    const toxicity = this.calculateToxicityScore(userCard);

    // 4. 传播路径预测
    const propagation = await this.predictPropagationPath(toxicity, userCard.location);

    // 5. 生成发牌手响应
    return this.createDealerResponse('success', `🔬 毒株分析完成！`, toxicity, propagation);
  }


  private verifyLocationPrecision(location: GeoLocation): 'success' | 'refused' | 'confirm_required' {
    // 简化逻辑，MVP阶段假设所有发送的位置都是精确的
    // 实际应根据location.precision和dynamicConfig.locationPrecisionThreshold进行判断
    if (location.precision === '城市') return 'refused';
    if (location.precision === '街道') return 'confirm_required';
    return 'success';
  }

  private calculateToxicityScore(userCard: UserCard): ToxicityReport {
    let baseScore = 0;
    const { text, image, form, userLevel } = this.dynamicConfig.spreadFactors;

    // 文本内容分析 (MVP简化为长度)
    if (userCard.content) {
      baseScore += Math.min(1, userCard.content.length / 100) * 4; // 0-4分
    }

    // 图片传播系数 (MVP简化为附件数量)
    if (userCard.attachments && userCard.attachments.length > 0) {
      baseScore += Math.min(1, userCard.attachments.length / 3) * 3; // 0-3分
    }

    // 表单结构化度 (MVP简化为是否存在)
    if (userCard.formData) {
      baseScore += 2; // 0-2分
    }

    // 用户等级加成 (MVP简化为固定值)
    baseScore += 1; // 0-1分

    const score = Math.min(10, Math.max(1, baseScore));
    let analysis = '';
    if (score >= this.dynamicConfig.toxicityThresholds.superViral.min) {
      analysis = '具备超级传播潜力！';
    } else if (score >= this.dynamicConfig.toxicityThresholds.viral.min) {
      analysis = '具备高传播力潜力！';
    } else if (score >= this.dynamicConfig.toxicityThresholds.local.min) {
      analysis = '具备本地传播潜力。';
    } else {
      analysis = '传播潜力有待提升。';
    }

    return { score: parseFloat(score.toFixed(1)), analysis };
  }

  /**
   * 传播路径预测
   */
  private async predictPropagationPath(toxicity: ToxicityReport, geoContext: GeoLocation): Promise<{ path: GeographicPath[]; estimatedReach: string; successRate: number; delay: number }> {
    const propagationPath: GeographicPath[] = [];
    let estimatedReach = '未知区域';
    let successRate = 0;
    let delay = 0;

    // 模拟地理传播逻辑
    propagationPath.push({ name: geoContext.address, type: geoContext.precision });

    if (toxicity.score >= this.dynamicConfig.toxicityThresholds.superViral.min) {
      // 超级病毒级传播
      propagationPath.push({ name: '翠苑街道', type: '街道' });
      propagationPath.push({ name: '西湖区中心', type: '行政区' });
      propagationPath.push({ name: '杭州市', type: '城市' });
      estimatedReach = '预计覆盖：12小时内影响500-1000人';
      successRate = 95;
      delay = 1000; // 1秒
    } else if (toxicity.score >= this.dynamicConfig.toxicityThresholds.viral.min) {
      // 病毒级传播
      propagationPath.push({ name: '翠苑街道', type: '街道' });
      propagationPath.push({ name: '西湖区中心', type: '行政区' });
      estimatedReach = '预计覆盖：3小时内影响100-300人';
      successRate = 85;
      delay = 3000; // 3秒
    } else if (toxicity.score >= this.dynamicConfig.toxicityThresholds.local.min) {
      // 本地传播
      propagationPath.push({ name: '翠苑街道', type: '街道' });
      estimatedReach = '预计覆盖：1小时内影响15-25人';
      successRate = 70;
      delay = 5000; // 5秒
    } else {
      // 休眠或低传播
      estimatedReach = '预计覆盖：本小区少量用户';
      successRate = 40;
      delay = 8000; // 8秒
    }

    // 模拟传播延迟
    await this.sleep(delay);

    return { path: propagationPath, estimatedReach, successRate, delay };
  }

  private getRandomDelay(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * 检测附近毒株并生成系统消息
   */
  public detectNearbyVirusStrains(): DealerResponse {
    const virusStrains = this.generateMockVirusStrains();
    const randomStrain = virusStrains[Math.floor(Math.random() * virusStrains.length)];
    
    return this.createDealerResponse(
      'success',
      `🔬 检测到附近有新的毒株传播，传播力评分${randomStrain.toxicityScore}`,
      { score: randomStrain.toxicityScore, analysis: '附近毒株检测' },
      {
        path: [{ name: randomStrain.location, type: '街道' }],
        estimatedReach: `预计影响${randomStrain.propagationCount}人`,
        successRate: 85,
        delay: 2000
      },
      ['👁️ 查看详情', '📊 关注传播动态'],
      randomStrain
    );
  }

  /**
   * 生成模拟毒株数据
   */
  private generateMockVirusStrains(): VirusStrain[] {
    return [
      {
        id: 'strain-001',
        title: '杭州西湖区美食推荐',
        content: '发现了一家超棒的川菜馆，味道正宗，价格实惠！',
        author: '美食达人小王',
        location: '西湖区文三路',
        toxicityScore: 7.2,
        propagationCount: 156,
        timestamp: Date.now() - 300000, // 5分钟前
        isClickable: true
      },
      {
        id: 'strain-002',
        title: '周末活动召集',
        content: '明天下午2点，西湖边野餐活动，有兴趣的朋友一起来！',
        author: '户外爱好者小李',
        location: '西湖区翠苑街道',
        toxicityScore: 6.8,
        propagationCount: 89,
        timestamp: Date.now() - 600000, // 10分钟前
        isClickable: true
      },
      {
        id: 'strain-003',
        title: '求助：猫咪走失',
        content: '我的橘猫在学院路附近走丢了，有看到的请联系我！',
        author: '爱猫人士小张',
        location: '西湖区学院路',
        toxicityScore: 8.5,
        propagationCount: 234,
        timestamp: Date.now() - 180000, // 3分钟前
        isClickable: true
      },
      {
        id: 'strain-004',
        title: '文三路咖啡店探店',
        content: '新开的咖啡店环境很棒，咖啡香浓，适合工作学习',
        author: '咖啡控小陈',
        location: '西湖区文三路',
        toxicityScore: 5.9,
        propagationCount: 67,
        timestamp: Date.now() - 900000, // 15分钟前
        isClickable: true
      },
      {
        id: 'strain-005',
        title: '突发：交通事故提醒',
        content: '文三路与学院路交叉口发生交通事故，请大家绕行！',
        author: '热心市民',
        location: '西湖区文三路',
        toxicityScore: 9.1,
        propagationCount: 445,
        timestamp: Date.now() - 120000, // 2分钟前
        isClickable: true
      }
    ];
  }

  /**
   * 处理毒株点击传播
   */
  public async propagateVirusStrain(strainId: string): Promise<DealerResponse> {
    const strains = this.generateMockVirusStrains();
    const strain = strains.find(s => s.id === strainId);
    
    if (!strain) {
      return this.createDealerResponse('refused', '毒株信息不存在');
    }

    // 模拟传播延迟
    await this.sleep(1500);

    // 增加传播计数
    strain.propagationCount += 1;

    return this.createDealerResponse(
      'success',
      `📋 毒株详情："${strain.title}"`,
      { score: strain.toxicityScore, analysis: '毒株详情查看' },
      {
        path: [{ name: strain.location, type: '街道' }],
        estimatedReach: `当前传播数：${strain.propagationCount}人`,
        successRate: 100,
        delay: 0
      },
      ['🦠 立即传播', '📤 分享给朋友', '⭐ 收藏毒株'],
      strain
    );
  }

  private createDealerResponse(
    status: 'success' | 'refused' | 'confirm_required',
    content: string,
    toxicityReport?: ToxicityReport,
    propagationPrediction?: { path: GeographicPath[]; estimatedReach: string; successRate: number; delay: number },
    suggestions?: string[],
    virusStrain?: VirusStrain
  ): DealerResponse {
    return {
      id: `dealer-response-${Date.now()}`,
      type: 'dealer',
      timestamp: Date.now(),
      content,
      status,
      toxicityReport: toxicityReport || { score: 0, analysis: '' },
      propagationPrediction: propagationPrediction || { path: [], estimatedReach: '', successRate: 0, delay: 0 },
      suggestions: suggestions || [],
      virusStrain
    };
  }

  // 模拟用户发布毒株
  generateMockUserStrains(): VirusStrain[] {
    return [
      {
        id: 'user-strain-1',
        title: '杭州美食推荐',
        content: '西湖边的这家餐厅真的太好吃了！环境优雅，菜品精致，特别是那道西湖醋鱼，酸酸甜甜的很开胃。服务也很周到，推荐大家来试试！',
        author: '美食达人小王',
        location: '杭州市西湖区',
        toxicityScore: 8.5,
        propagationCount: 23,
        timestamp: Date.now() - 300000, // 5分钟前
        isClickable: true
      },
      {
        id: 'user-strain-2',
        title: '上海周末活动',
        content: '这周末在上海外滩有个很棒的市集活动，有很多手工艺品和美食摊位。现场还有乐队表演，气氛超级棒！大家有空可以去逛逛。',
        author: '上海生活家',
        location: '上海市黄浦区',
        toxicityScore: 7.2,
        propagationCount: 18,
        timestamp: Date.now() - 600000, // 10分钟前
        isClickable: true
      },
      {
        id: 'user-strain-3',
        title: '北京交通提醒',
        content: '今天北京地铁2号线有故障，建议绕行。另外，三环路上有交通事故，堵车比较严重。大家出行要注意安全，提前规划路线。',
        author: '北京通勤族',
        location: '北京市朝阳区',
        toxicityScore: 9.1,
        propagationCount: 31,
        timestamp: Date.now() - 180000, // 3分钟前
        isClickable: true
      },
      {
        id: 'user-strain-4',
        title: '深圳科技资讯',
        content: '深圳南山科技园今天有个AI技术分享会，邀请了多位行业专家。内容涵盖机器学习、深度学习等前沿技术，对技术人来说是个很好的学习机会。',
        author: '深圳码农',
        location: '深圳市南山区',
        toxicityScore: 6.8,
        propagationCount: 12,
        timestamp: Date.now() - 900000, // 15分钟前
        isClickable: true
      },
      {
        id: 'user-strain-5',
        title: '广州天气预警',
        content: '广州今天下午有雷阵雨，风力较大。大家出门记得带伞，注意安全。特别是珠江新城一带，雨势可能会比较急。',
        author: '广州气象员',
        location: '广州市天河区',
        toxicityScore: 8.9,
        propagationCount: 27,
        timestamp: Date.now() - 120000, // 2分钟前
        isClickable: true
      }
    ];
  }

  // 创建模拟用户毒株消息
  createMockUserStrainMessage(strain: VirusStrain): DealerResponse {
    return {
      id: `mock-user-${strain.id}`,
      type: 'dealer',
      timestamp: strain.timestamp,
      content: `🦠 检测到附近用户发布新毒株："${strain.title}"`,
      toxicityReport: { 
        score: strain.toxicityScore, 
        analysis: `传播力评分: ${strain.toxicityScore}/10` 
      },
      propagationPrediction: { 
        path: [{ name: strain.location, type: '区域' }], 
        estimatedReach: `预计影响${strain.propagationCount * 2}-${strain.propagationCount * 3}人`, 
        successRate: Math.min(95, strain.toxicityScore * 10), 
        delay: Math.max(1000, 10000 - strain.toxicityScore * 1000) 
      },
      suggestions: ['👁️ 查看详情', '🦠 关注传播', '📊 分析数据'],
      virusStrain: strain
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}