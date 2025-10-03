import { Tag, TagMatch, TagRecommendation, TagSearchResult } from '@/types/tags';
import { generateId } from '@/lib/utils';

// 预定义标签库 - 种子标签和衍生标签
const PREDEFINED_TAGS: Omit<Tag, 'id' | 'usageCount' | 'createdAt' | 'updatedAt'>[] = [
  // 种子标签 - 小区/区域
  { name: '某某小区', category: 'life', description: '某某小区相关话题', color: '#FF6B6B' },
  { name: '某某小区维修', category: 'life', description: '某某小区维修服务', color: '#FF6B6B' },
  { name: '某某小区物业', category: 'life', description: '某某小区物业管理', color: '#FF6B6B' },
  { name: '某某小区停车', category: 'life', description: '某某小区停车管理', color: '#FF6B6B' },
  { name: '某某小区绿化', category: 'life', description: '某某小区绿化环境', color: '#FF6B6B' },
  
  { name: '阳光花园', category: 'life', description: '阳光花园相关话题', color: '#4ECDC4' },
  { name: '阳光花园维修', category: 'life', description: '阳光花园维修服务', color: '#4ECDC4' },
  { name: '阳光花园物业', category: 'life', description: '阳光花园物业管理', color: '#4ECDC4' },
  
  { name: '绿城小区', category: 'life', description: '绿城小区相关话题', color: '#45B7D1' },
  { name: '绿城小区维修', category: 'life', description: '绿城小区维修服务', color: '#45B7D1' },
  { name: '绿城小区物业', category: 'life', description: '绿城小区物业管理', color: '#45B7D1' },
  
  // 种子标签 - 兴趣领域
  { name: '美食', category: 'life', description: '美食分享与推荐', color: '#96CEB4' },
  { name: '美食推荐', category: 'life', description: '美食推荐分享', color: '#96CEB4' },
  { name: '美食制作', category: 'life', description: '美食制作教程', color: '#96CEB4' },
  { name: '美食探店', category: 'life', description: '美食探店体验', color: '#96CEB4' },
  
  { name: '旅行', category: 'life', description: '旅行经历与攻略', color: '#FFEAA7' },
  { name: '旅行攻略', category: 'life', description: '旅行攻略分享', color: '#FFEAA7' },
  { name: '旅行摄影', category: 'life', description: '旅行摄影作品', color: '#FFEAA7' },
  
  // 种子标签 - 观点领域
  { name: '科技', category: 'opinion', description: '科技观点与讨论', color: '#DDA0DD' },
  { name: '科技新闻', category: 'opinion', description: '科技新闻讨论', color: '#DDA0DD' },
  { name: '科技产品', category: 'opinion', description: '科技产品评测', color: '#DDA0DD' },
  
  { name: '教育', category: 'opinion', description: '教育理念与方法', color: '#98D8C8' },
  { name: '教育政策', category: 'opinion', description: '教育政策讨论', color: '#98D8C8' },
  { name: '教育方法', category: 'opinion', description: '教育方法分享', color: '#98D8C8' },
  
  // 种子标签 - 兴趣领域
  { name: '编程', category: 'interest', description: '编程技术与分享', color: '#F7DC6F' },
  { name: '编程学习', category: 'interest', description: '编程学习心得', color: '#F7DC6F' },
  { name: '编程项目', category: 'interest', description: '编程项目分享', color: '#F7DC6F' },
  
  // 超级标签
  { name: '热门', category: 'super', description: '当前热门话题', color: '#E74C3C' },
  { name: '推荐', category: 'super', description: '精选推荐内容', color: '#F39C12' },
  { name: '紧急', category: 'super', description: '紧急重要信息', color: '#C0392B' },
  { name: '活动', category: 'super', description: '线上线下活动', color: '#8E44AD' },
];

class TagService {
  private tags: Tag[] = [];
  private userTags: Map<string, string[]> = new Map(); // userId -> tagIds

  constructor() {
    this.initializeTags();
  }

  private initializeTags() {
    this.tags = PREDEFINED_TAGS.map(tag => ({
      ...tag,
      id: generateId(),
      usageCount: Math.floor(Math.random() * 100),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }

  // 获取种子标签（顶级标签）
  getSeedTags(): Tag[] {
    return this.tags.filter(tag => {
      // 种子标签：不包含其他标签名称前缀的标签
      return !this.tags.some(otherTag => 
        otherTag.id !== tag.id && 
        tag.name.toLowerCase().startsWith(otherTag.name.toLowerCase())
      );
    });
  }

  // 获取子标签（基于种子标签的衍生标签）
  getChildTags(seedTagName: string): Tag[] {
    return this.tags.filter(tag => 
      tag.name.toLowerCase().startsWith(seedTagName.toLowerCase()) &&
      tag.name.toLowerCase() !== seedTagName.toLowerCase()
    );
  }

  // 获取所有标签（包含种子和子标签）
  getAllTagsWithHierarchy(): { seed: Tag; children: Tag[] }[] {
    const seedTags = this.getSeedTags();
    return seedTags.map(seedTag => ({
      seed: seedTag,
      children: this.getChildTags(seedTag.name),
    }));
  }

  // 根据分类获取标签
  getTagsByCategory(category: Tag['category']): Tag[] {
    return this.tags.filter(tag => tag.category === category);
  }

  // 标签搜索 - 本地标签库的子目录快速过滤匹配
  searchTags(parentTagId: string, query: string, limit: number = 10): TagSearchResult {
    const startTime = Date.now();
    const normalizedQuery = query.toLowerCase().trim();
    
    // 获取父标签
    const parentTag = this.tags.find(tag => tag.id === parentTagId);
    if (!parentTag) {
      return {
        tags: [],
        totalCount: 0,
        searchTime: Date.now() - startTime,
      };
    }

    // 在父标签下搜索子标签（过滤匹配）
    const childTags = this.tags.filter(tag => 
      tag.name.toLowerCase().startsWith(parentTag.name.toLowerCase()) &&
      tag.name.toLowerCase().includes(normalizedQuery)
    );

    // 如果没有搜索词，返回所有子标签
    const results = normalizedQuery 
      ? childTags.filter(tag => tag.name.toLowerCase().includes(normalizedQuery))
      : childTags;

    return {
      tags: results.slice(0, limit),
      totalCount: results.length,
      searchTime: Date.now() - startTime,
    };
  }

  // 创建新标签
  createTag(name: string, category: Tag['category'], description?: string, color?: string): Tag {
    const existingTag = this.tags.find(tag => tag.name.toLowerCase() === name.toLowerCase());
    if (existingTag) {
      return existingTag;
    }

    const newTag: Tag = {
      id: generateId(),
      name,
      category,
      description,
      color: color || this.getRandomColor(),
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.tags.push(newTag);
    return newTag;
  }

  // 获取用户标签
  getUserTags(userId: string): Tag[] {
    const userTagIds = this.userTags.get(userId) || [];
    return this.tags.filter(tag => userTagIds.includes(tag.id));
  }

  // 设置用户标签
  setUserTags(userId: string, tagIds: string[]): void {
    this.userTags.set(userId, tagIds);
    
    // 更新标签使用次数
    tagIds.forEach(tagId => {
      const tag = this.tags.find(t => t.id === tagId);
      if (tag) {
        tag.usageCount++;
        tag.updatedAt = new Date().toISOString();
      }
    });
  }

  // 标签匹配算法
  matchTags(content: string, userTags: string[]): TagMatch[] {
    const matches: TagMatch[] = [];
    const normalizedContent = content.toLowerCase();

    this.tags.forEach(tag => {
      let score = 0;
      let reason = '';

      // 基于标签名称匹配
      if (normalizedContent.includes(tag.name.toLowerCase())) {
        score += 40;
        reason += `内容包含"${tag.name}"`;
      }

      // 基于描述匹配
      if (tag.description && normalizedContent.includes(tag.description.toLowerCase())) {
        score += 20;
        reason += reason ? `，描述匹配` : `描述匹配`;
      }

      // 基于用户标签偏好
      if (userTags.includes(tag.id)) {
        score += 30;
        reason += reason ? `，用户偏好` : `用户偏好`;
      }

      // 基于使用频率
      score += Math.min(tag.usageCount / 10, 10);

      if (score > 0) {
        matches.push({
          tagId: tag.id,
          tagName: tag.name,
          matchScore: Math.min(score, 100),
          reason: reason || '相关性匹配',
        });
      }
    });

    return matches.sort((a, b) => b.matchScore - a.matchScore);
  }

  // 标签推荐算法
  getRecommendations(userId: string, limit: number = 5): TagRecommendation[] {
    const userTagIds = this.userTags.get(userId) || [];
    const userTags = this.tags.filter(tag => userTagIds.includes(tag.id));
    
    const recommendations: TagRecommendation[] = [];

    this.tags.forEach(tag => {
      if (userTagIds.includes(tag.id)) return; // 跳过用户已有的标签

      let confidence = 0;
      let reason = '';

      // 基于用户现有标签的相似性
      userTags.forEach(userTag => {
        if (userTag.category === tag.category) {
          confidence += 0.3;
          reason = `同类标签推荐`;
        }
      });

      // 基于使用频率
      confidence += Math.min(tag.usageCount / 200, 0.4);

      // 基于随机性（探索新标签）
      confidence += Math.random() * 0.3;

      if (confidence > 0.2) {
        recommendations.push({
          tag,
          confidence: Math.min(confidence, 1),
          reason: reason || '热门标签推荐',
        });
      }
    });

    return recommendations
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);
  }

  // 获取随机颜色
  private getRandomColor(): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#85C1E9', '#F8C471',
      '#82E0AA', '#F1948A', '#BB8FCE', '#58D68D', '#F39C12',
      '#E74C3C', '#9B59B6', '#1ABC9C', '#27AE60', '#8E44AD'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // 获取标签统计
  getTagStats() {
    const stats = {
      total: this.tags.length,
      byCategory: {
        life: this.tags.filter(t => t.category === 'life').length,
        opinion: this.tags.filter(t => t.category === 'opinion').length,
        interest: this.tags.filter(t => t.category === 'interest').length,
        super: this.tags.filter(t => t.category === 'super').length,
      },
      mostUsed: this.tags
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, 5)
        .map(tag => ({ name: tag.name, usageCount: tag.usageCount })),
    };

    return stats;
  }
}

// 创建单例实例
export const tagService = new TagService();
