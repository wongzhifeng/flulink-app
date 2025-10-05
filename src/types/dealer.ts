// src/types/dealer.ts

export interface GeoLocation {
  latitude: number;
  longitude: number;
  precision: '小区' | '街道' | '城市' | '未知';
  address: string;
}

export interface Attachment {
  type: 'image' | 'video' | 'document';
  url: string;
  size: number; // bytes
}

export interface FormData {
  [key: string]: any;
}

export interface UserCard {
  content: string;
  location: GeoLocation;
  attachments?: Attachment[];
  formData?: FormData;
  userLevel?: 'free' | 'premium' | 'enterprise';
}

export interface ToxicityReport {
  score: number; // 1-10
  analysis: string;
}

export interface GeographicPath {
  name: string;
  type: '小区' | '街道' | '行政区' | '城市' | '国家';
}

export interface VirusStrain {
  id: string;
  title: string;
  content: string;
  author: string;
  location: string;
  toxicityScore: number;
  propagationCount: number;
  timestamp: number;
  isClickable?: boolean;
}

export interface DealerResponse {
  id: string;
  type: 'user' | 'dealer';
  timestamp: number;
  content: string;
  status?: 'success' | 'refused' | 'confirm_required';
  toxicityReport: ToxicityReport;
  propagationPrediction: {
    path: GeographicPath[];
    estimatedReach: string;
    successRate: number; // 0-100%
    delay: number; // ms
  };
  suggestions: string[];
  virusStrain?: VirusStrain; // 毒株信息
}

export interface WorldRules {
  fairnessProtocol: string;
  naturalPropagation: string;
  transparentOperation: string;
}

export interface DynamicConfig {
  propagationDelay: { min: number; max: number; };
  locationPrecisionThreshold: {
    小区: number; // meters
    街道: number;
    城市: number;
  };
  toxicityThresholds: {
    dormant: { min: number; max: number; };
    local: { min: number; max: number; };
    viral: { min: number; max: number; };
    superViral: { min: number; max: number; };
  };
  spreadFactors: {
    text: number;
    image: number;
    form: number;
    userLevel: number;
  };
  maxAttachmentsSize: number;
  dailySuperViralLimit: number;
  communityImmunityThreshold: number;
}