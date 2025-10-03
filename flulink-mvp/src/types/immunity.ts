export interface ImmunityRule {
  id: string;
  userId: string;
  tagId: string;
  tagName: string;
  ruleType: 'block' | 'filter' | 'delay';
  strength: number; // 0-100, 免疫强度
  conditions: {
    timeRange?: { start: string; end: string };
    location?: { lat: number; lng: number; radius: number };
    frequency?: { maxPerDay: number };
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ImmunityStatus {
  userId: string;
  totalRules: number;
  activeRules: number;
  blockedTags: string[];
  filteredTags: string[];
  delayedTags: string[];
  immunityScore: number; // 0-100, 总体免疫分数
  lastUpdated: string;
}

export interface ImmunityEffect {
  tagId: string;
  tagName: string;
  effectType: 'blocked' | 'filtered' | 'delayed' | 'allowed';
  reason: string;
  appliedRule?: ImmunityRule;
  timestamp: string;
}

export interface ImmunityRecommendation {
  tagId: string;
  tagName: string;
  reason: string;
  confidence: number; // 0-1
  suggestedRule: Partial<ImmunityRule>;
}

