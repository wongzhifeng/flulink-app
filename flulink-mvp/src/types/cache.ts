// 缓存配置 - Zeabur兼容
export interface CacheConfig {
  redis: {
    host: string;
    port: number;
    password?: string;
    db: number;
    ttl: number; // 默认TTL（秒）
  };
  memory: {
    maxSize: number; // 最大内存缓存条目数
    ttl: number; // 默认TTL（毫秒）
  };
  strategy: 'lru' | 'lfu' | 'fifo';
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number; // 命中率 0-1
  totalRequests: number;
  averageResponseTime: number; // 平均响应时间（毫秒）
  memoryUsage: number; // 内存使用量（字节）
  redisConnected: boolean;
}

export interface CacheEntry<T = any> {
  key: string;
  value: T;
  ttl: number;
  createdAt: number;
  lastAccessed: number;
  accessCount: number;
}

export interface CacheOptions {
  ttl?: number; // 生存时间（秒）
  tags?: string[]; // 缓存标签
  priority?: 'low' | 'normal' | 'high';
}

// Zeabur环境变量配置
export const getCacheConfig = (): CacheConfig => {
  return {
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      ttl: parseInt(process.env.CACHE_TTL || '3600'),
    },
    memory: {
      maxSize: parseInt(process.env.MEMORY_CACHE_SIZE || '1000'),
      ttl: parseInt(process.env.MEMORY_CACHE_TTL || '300000'), // 5分钟
    },
    strategy: (process.env.CACHE_STRATEGY as any) || 'lru',
  };
};

