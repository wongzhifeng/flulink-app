export interface Tag {
  id: string;
  name: string;
  category: 'life' | 'opinion' | 'interest' | 'super';
  description?: string;
  color: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TagMatch {
  tagId: string;
  tagName: string;
  matchScore: number; // 0-100
  reason: string;
}

export interface TagRecommendation {
  tag: Tag;
  confidence: number; // 0-1
  reason: string;
}

export interface TagSearchResult {
  tags: Tag[];
  totalCount: number;
  searchTime: number;
}

