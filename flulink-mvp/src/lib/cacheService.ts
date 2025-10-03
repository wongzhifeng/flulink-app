import { CacheConfig, CacheStats, CacheEntry, CacheOptions } from '../types/cache';

// 缓存服务类 - Zeabur兼容
class CacheService {
  private config: CacheConfig;
  private memoryCache: Map<string, CacheEntry> = new Map();
  private stats: CacheStats;
  private isRedisConnected: boolean = false;

  constructor() {
    this.config = this.getConfig();
    this.stats = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalRequests: 0,
      averageResponseTime: 0,
      memoryUsage: 0,
      redisConnected: false,
    };
  }

  private getConfig(): CacheConfig {
    // Zeabur环境变量处理
    const env = typeof window === 'undefined' ? {} : {};
    
    return {
      redis: {
        host: 'localhost', // 开发环境默认值
        port: 6379,
        password: undefined,
        db: 0,
        ttl: 3600,
      },
      memory: {
        maxSize: 1000,
        ttl: 300000, // 5分钟
      },
      strategy: 'lru',
    };
  }

  // 初始化缓存服务
  async initialize(): Promise<boolean> {
    try {
      // 在Zeabur环境中，Redis连接通常由平台自动管理
      // 这里模拟连接成功
      this.isRedisConnected = true;
      this.stats.redisConnected = true;
      
      console.log('Cache service initialized successfully');
      return true;
    } catch (error) {
      console.error('Cache initialization failed:', error);
      return false;
    }
  }

  // 获取缓存
  async get<T>(key: string): Promise<T | null> {
    const startTime = Date.now();
    this.stats.totalRequests++;

    try {
      // 先检查内存缓存
      const memoryResult = this.getFromMemory<T>(key);
      if (memoryResult !== null) {
        this.stats.hits++;
        this.updateStats(startTime);
        return memoryResult;
      }

      // 再检查Redis缓存（模拟）
      const redisResult = await this.getFromRedis<T>(key);
      if (redisResult !== null) {
        // 将Redis结果存入内存缓存
        this.setToMemory(key, redisResult, this.config.memory.ttl);
        this.stats.hits++;
        this.updateStats(startTime);
        return redisResult;
      }

      this.stats.misses++;
      this.updateStats(startTime);
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      this.stats.misses++;
      this.updateStats(startTime);
      return null;
    }
  }

  // 设置缓存
  async set<T>(key: string, value: T, options?: CacheOptions): Promise<boolean> {
    const startTime = Date.now();
    const ttl = options?.ttl ? options.ttl * 1000 : this.config.memory.ttl;

    try {
      // 设置到内存缓存
      this.setToMemory(key, value, ttl);

      // 设置到Redis缓存（模拟）
      await this.setToRedis(key, value, options?.ttl || this.config.redis.ttl);

      this.updateStats(startTime);
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  // 删除缓存
  async delete(key: string): Promise<boolean> {
    try {
      // 从内存缓存删除
      this.memoryCache.delete(key);

      // 从Redis删除（模拟）
      await this.deleteFromRedis(key);

      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  // 清空缓存
  async clear(): Promise<boolean> {
    try {
      this.memoryCache.clear();
      await this.clearRedis();
      return true;
    } catch (error) {
      console.error('Cache clear error:', error);
      return false;
    }
  }

  // 获取缓存统计
  getStats(): CacheStats {
    this.stats.hitRate = this.stats.totalRequests > 0 
      ? this.stats.hits / this.stats.totalRequests 
      : 0;
    
    this.stats.memoryUsage = this.calculateMemoryUsage();
    this.stats.redisConnected = this.isRedisConnected;
    
    return { ...this.stats };
  }

  // 内存缓存操作
  private getFromMemory<T>(key: string): T | null {
    const entry = this.memoryCache.get(key);
    if (!entry) return null;

    // 检查是否过期
    if (Date.now() - entry.createdAt > entry.ttl) {
      this.memoryCache.delete(key);
      return null;
    }

    // 更新访问信息
    entry.lastAccessed = Date.now();
    entry.accessCount++;

    return entry.value as T;
  }

  private setToMemory<T>(key: string, value: T, ttl: number): void {
    // 检查缓存大小限制
    if (this.memoryCache.size >= this.config.memory.maxSize) {
      this.evictOldestEntry();
    }

    const entry: CacheEntry<T> = {
      key,
      value,
      ttl,
      createdAt: Date.now(),
      lastAccessed: Date.now(),
      accessCount: 1,
    };

    this.memoryCache.set(key, entry);
  }

  private evictOldestEntry(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.memoryCache.delete(oldestKey);
    }
  }

  // Redis缓存操作（模拟）
  private async getFromRedis<T>(key: string): Promise<T | null> {
    // 模拟Redis查询
    await new Promise(resolve => setTimeout(resolve, Math.random() * 10));
    
    // 模拟一些缓存数据
    const mockData: Record<string, any> = {
      'user:1': { id: '1', username: 'testuser', email: 'test@example.com' },
      'strains:popular': [{ id: '1', title: 'Test Strain', content: 'Test content' }],
      'tags:categories': ['life', 'opinion', 'interest', 'super'],
    };

    return mockData[key] || null;
  }

  private async setToRedis<T>(key: string, value: T, ttl: number): Promise<boolean> {
    // 模拟Redis设置
    await new Promise(resolve => setTimeout(resolve, Math.random() * 5));
    return true;
  }

  private async deleteFromRedis(key: string): Promise<boolean> {
    // 模拟Redis删除
    await new Promise(resolve => setTimeout(resolve, Math.random() * 5));
    return true;
  }

  private async clearRedis(): Promise<boolean> {
    // 模拟Redis清空
    await new Promise(resolve => setTimeout(resolve, Math.random() * 10));
    return true;
  }

  // 工具方法
  private updateStats(startTime: number): void {
    const responseTime = Date.now() - startTime;
    this.stats.averageResponseTime = 
      (this.stats.averageResponseTime * (this.stats.totalRequests - 1) + responseTime) / 
      this.stats.totalRequests;
  }

  private calculateMemoryUsage(): number {
    let totalSize = 0;
    for (const entry of this.memoryCache.values()) {
      totalSize += JSON.stringify(entry).length * 2; // 粗略估算
    }
    return totalSize;
  }

  // 缓存预热
  async warmup(): Promise<void> {
    const warmupData = [
      { key: 'user:1', value: { id: '1', username: 'testuser' } },
      { key: 'strains:popular', value: [] },
      { key: 'tags:categories', value: ['life', 'opinion', 'interest', 'super'] },
    ];

    for (const item of warmupData) {
      await this.set(item.key, item.value, { ttl: 3600 });
    }
  }

  // 缓存标签管理
  async getByTag(tag: string): Promise<Record<string, any>> {
    const results: Record<string, any> = {};
    
    for (const [key, entry] of this.memoryCache.entries()) {
      // 简单的标签匹配逻辑
      if (key.includes(tag)) {
        results[key] = entry.value;
      }
    }
    
    return results;
  }

  async deleteByTag(tag: string): Promise<number> {
    let deletedCount = 0;
    const keysToDelete: string[] = [];
    
    for (const [key] of this.memoryCache.entries()) {
      if (key.includes(tag)) {
        keysToDelete.push(key);
      }
    }
    
    for (const key of keysToDelete) {
      this.memoryCache.delete(key);
      deletedCount++;
    }
    
    return deletedCount;
  }

  // 健康检查
  async healthCheck(): Promise<boolean> {
    try {
      // 测试内存缓存
      const testKey = 'health:check';
      const testValue = { timestamp: Date.now() };
      
      await this.set(testKey, testValue, { ttl: 10 });
      const retrieved = await this.get(testKey);
      
      if (!retrieved) return false;
      
      await this.delete(testKey);
      return true;
    } catch (error) {
      console.error('Cache health check failed:', error);
      return false;
    }
  }
}

// 创建单例实例
export const cacheService = new CacheService();

// 初始化缓存服务
if (typeof window === 'undefined') {
  // 只在服务端初始化
  cacheService.initialize().catch(console.error);
}

