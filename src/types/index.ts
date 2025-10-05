// FluLink 流感发牌手服务核心类型定义

export interface GeoLocation {
  latitude: number;
  longitude: number;
  address?: string;
  precision: 'exact' | 'street' | 'district' | 'city';
  district?: string;
  city: string;
  province?: string;
}

export interface UserProfile {
  id: string;
  nickname: string;
  avatar?: string;
  location: GeoLocation;
  tier: 'free' | 'premium' | 'super';
  credits: number; // 传播点数
  achievements: Achievement[];
  createTime: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface UserCard {
  id: string;
  userId: string;
  location: GeoLocation;
  content: {
    text: string;
    attachments?: Attachment[];
    formData?: FormData;
  };
  timestamp: Date;
  cardType: 'initial' | 'followup';
  status: 'processing' | 'completed' | 'failed';
}

export interface Attachment {
  id: string;
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  name: string;
  size: number;
  uploadedAt: Date;
}

export interface DealerResponse {
  cardId: string;
  toxicityScore: number; // 1-10 毒性评分
  analysisReport: {
    contentStrengths: string[];
    optimizationSuggestions: string[];
    categoryClassification: StrainCategory;
    geoRelevance: number; // 地理相关性
    viralityPotential: number; // 传播潜力
  };
  propagationPrediction: {
    estimatedReach: number;
    propagationPath: GeographicPath[];
    expectedTimeline: TimeEstimate;
    successProbability: number;
  };
  dealerPersonality: string; // 发牌手回复内容
  worldRulesReference: RuleReference[];
  processingTime: number; // 处理时间（毫秒）
}

export interface StrainCategory {
  primary: 'life' | 'opinion' | 'interest' | 'service' | 'emergency';
  secondary: string[];
  tags: string[];
}

export interface GeographicPath {
  level: 'community' | 'neighborhood' | 'district' | 'city';
  targetArea: string;
  estimatedInfections: number;
  propagationDelay: number; // 传播延迟（毫秒）
  unlockConditions: string[];
}

export interface TimeEstimate {
  immediate: number; // 0 立即
  shortTerm: number; // 短期（分钟）
  mediumTerm: number; // 中期（小时）
  longTerm: number; // 长期（天）
}

export interface RuleReference {
  ruleId: string;
  ruleName: string;
  description: string;
  appliedWeight: number;
  isWorldRule: boolean; // 是否是世界规则（不可修改）
}

// 发牌手世界规则（不可修改）
export interface WorldRules {
  fairnessProtocol: Rule; // 公平性协议
  geographicLogic: Rule; // 地理逻辑
  contentQuality: Rule; // 内容质量标准
  transparencyRequirement: Rule; // 透明度要求
}

export interface Rule {
  id: string;
  name: string;
  description: string;
  parameters: RuleParameter[];
  immutable: boolean; // 是否不可修改
}

export interface RuleParameter {
  name: string;
  type: 'boolean' | 'number' | 'string' | 'array';
  value: any;
  minValue?: number;
  maxValue?: number;
  options?: string[];
}

// 动态配置系统（管理员可调节）
export interface DynamicConfig {
  propagationDelayMultiplier: ConfigParameter<number>;
  maxInfectionsPerRegion: ConfigParameter<number>;
  contentFilterLevel: ConfigParameter<number>;
  geoPrecisionRequirement: ConfigParameter<GeoPrecision>;
  toxinThresholds: {
    low: ConfigThreshold;
    medium: ConfigThreshold;
    high: ConfigThreshold;
    viral: ConfigThreshold;
  };
  premiumUserBonuses: ConfigParameter<number>;
}

export interface ConfigParameter<T> {
  current: T;
  range?: [T, T];
  description: string;
  defaultValue: T;
  lastModified: Date;
}

export interface ConfigThreshold {
  min: number;
  max: number;
  description: string;
}

export type GeoPrecision = 'exact' | 'street' | 'district' | 'city';

export interface RuleControlPanel {
  propagationRules: any[];
  toxicityThresholds: any;
  systemSettings: any;
}

// 管理员界面相关
export interface AdminDashboard {
  realTimeMetrics: RealTimeMetrics;
  ruleControlPanel: RuleControlPanel;
  systemHealth: SystemHealth;
  userManagement: UserManagement;
}

export interface RealTimeMetrics {
  dailyActiveUsers: number;
  cardsProcessedToday: number;
  averageResponseTime: number;
  systemUptime: number;
  toxicityDistribution: {
    low: number;
    medium: number;
    high: number;
    viral: number;
  };
}

export interface SystemHealth {
  cpuUsage: number;
  memoryUsage: number;
  networkLatency: number;
  databaseConnections: number;
  queueSize: number;
  errorRate: number;
  responseTime95Percentile: number;
}

export interface UserManagement {
  totalUsers: number;
  freeUsers: number;
  premiumUsers: number;
  superUsers: number;
  activeToday: number;
  newRegistrationsToday: number;
}

// 传播追踪
export interface PropagationTracking {
  cardId: string;
  propagationPath: PropagationEntry[];
  totalInfections: number;
  propagationSpeed: number;
  geographicSpread: GeographicSpread[];
  userEngagement: EngagementMetrics;
}

export interface PropagationEntry {
  timestamp: Date;
  location: string;
  infections: number;
  level: 'community' | 'neighborhood' | 'district' | 'city';
}

export interface GeographicSpread {
  region: string;
  infectionCount: number;
  infectionRate: number;
  populationDensity: number;
}

export interface EngagementMetrics {
  views: number;
  likes: number;
  shares: number;
  comments: number;
  followUps: number;
  conversionRate: number;
}

// API 响应类型
export interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  timestamp: Date;
}

export interface DealerServiceError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

// 扩展接口
export interface ServiceProvider {
  id: string;
  name: string;
  category: string;
  location: GeoLocation;
  description: string;
  contactInfo: ContactInfo;
  rating: number;
  activeUsers: number;
  isActivated: boolean;
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  wechat?: string;
  address?: string;
  businessHours?: string;
}
