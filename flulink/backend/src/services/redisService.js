const redis = require('redis');

class RedisService {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      // 允许通过环境变量禁用 Redis
      const redisEnabled = (process.env.REDIS_ENABLED || 'true').toLowerCase() === 'true';
      if (!redisEnabled) {
        console.log('Redis disabled via REDIS_ENABLED=false');
        this.client = null;
        this.isConnected = false;
        return false;
      }

      // 构造连接URL（优先 REDIS_URL，其次 host/port/password）
      const host = process.env.REDIS_HOST || '127.0.0.1'; // 避免 ::1 IPv6 回环导致连接拒绝
      const port = process.env.REDIS_PORT || '6379';
      const password = process.env.REDIS_PASSWORD ? `:${process.env.REDIS_PASSWORD}@` : '';
      const fallbackUrl = `redis://${password}${host}:${port}`;

      this.client = redis.createClient({
        url: process.env.REDIS_URL || fallbackUrl,
        socket: {
          reconnectStrategy: (retries) => {
            // 指数退避，最大 5 秒
            return Math.min(retries * 100, 5000);
          }
        }
      });

      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('Redis Client Connected');
        this.isConnected = true;
      });

      this.client.on('disconnect', () => {
        console.log('Redis Client Disconnected');
        this.isConnected = false;
      });

      await this.client.connect();
      return true;
    } catch (error) {
      console.error('Redis Connection Error:', error);
      return false;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.disconnect();
      this.isConnected = false;
    }
  }

  // 缓存星团数据
  async cacheCluster(clusterId, clusterData, ttl = 3600) {
    if (!this.isConnected) return false;
    try {
      await this.client.setEx(`cluster:${clusterId}`, ttl, JSON.stringify(clusterData));
      return true;
    } catch (error) {
      console.error('Cache Cluster Error:', error);
      return false;
    }
  }

  // 获取星团缓存
  async getCluster(clusterId) {
    if (!this.isConnected) return null;
    try {
      const data = await this.client.get(`cluster:${clusterId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Get Cluster Error:', error);
      return null;
    }
  }

  // 缓存用户活跃状态
  async cacheUserActive(userId, isActive, ttl = 300) {
    if (!this.isConnected) return false;
    try {
      await this.client.setEx(`user:active:${userId}`, ttl, isActive.toString());
      return true;
    } catch (error) {
      console.error('Cache User Active Error:', error);
      return false;
    }
  }

  // 获取用户活跃状态
  async getUserActive(userId) {
    if (!this.isConnected) return null;
    try {
      const data = await this.client.get(`user:active:${userId}`);
      return data === 'true';
    } catch (error) {
      console.error('Get User Active Error:', error);
      return null;
    }
  }

  // 缓存共鸣计算结果
  async cacheResonance(userA, userB, resonance, ttl = 1800) {
    if (!this.isConnected) return false;
    try {
      const key = `resonance:${userA}:${userB}`;
      await this.client.setEx(key, ttl, resonance.toString());
      return true;
    } catch (error) {
      console.error('Cache Resonance Error:', error);
      return false;
    }
  }

  // 获取共鸣缓存
  async getResonance(userA, userB) {
    if (!this.isConnected) return null;
    try {
      const key = `resonance:${userA}:${userB}`;
      const data = await this.client.get(key);
      return data ? parseFloat(data) : null;
    } catch (error) {
      console.error('Get Resonance Error:', error);
      return null;
    }
  }

  // 缓存星种热度
  async cacheSeedHotness(seedId, hotness, ttl = 600) {
    if (!this.isConnected) return false;
    try {
      await this.client.setEx(`seed:hot:${seedId}`, ttl, hotness.toString());
      return true;
    } catch (error) {
      console.error('Cache Seed Hotness Error:', error);
      return false;
    }
  }

  // 获取星种热度
  async getSeedHotness(seedId) {
    if (!this.isConnected) return null;
    try {
      const data = await this.client.get(`seed:hot:${seedId}`);
      return data ? parseFloat(data) : null;
    } catch (error) {
      console.error('Get Seed Hotness Error:', error);
      return null;
    }
  }

  // 缓存星团成员列表
  async cacheClusterMembers(clusterId, members, ttl = 1800) {
    if (!this.isConnected) return false;
    try {
      await this.client.setEx(`cluster:members:${clusterId}`, ttl, JSON.stringify(members));
      return true;
    } catch (error) {
      console.error('Cache Cluster Members Error:', error);
      return false;
    }
  }

  // 获取星团成员列表
  async getClusterMembers(clusterId) {
    if (!this.isConnected) return null;
    try {
      const data = await this.client.get(`cluster:members:${clusterId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Get Cluster Members Error:', error);
      return null;
    }
  }

  // 缓存用户标签
  async cacheUserTags(userId, tags, ttl = 3600) {
    if (!this.isConnected) return false;
    try {
      await this.client.setEx(`user:tags:${userId}`, ttl, JSON.stringify(tags));
      return true;
    } catch (error) {
      console.error('Cache User Tags Error:', error);
      return false;
    }
  }

  // 获取用户标签
  async getUserTags(userId) {
    if (!this.isConnected) return null;
    try {
      const data = await this.client.get(`user:tags:${userId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Get User Tags Error:', error);
      return null;
    }
  }

  // 删除缓存
  async deleteCache(pattern) {
    if (!this.isConnected) return false;
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
      return true;
    } catch (error) {
      console.error('Delete Cache Error:', error);
      return false;
    }
  }

  // 清空所有缓存
  async flushAll() {
    if (!this.isConnected) return false;
    try {
      await this.client.flushAll();
      return true;
    } catch (error) {
      console.error('Flush All Error:', error);
      return false;
    }
  }

  // 获取缓存统计
  async getStats() {
    if (!this.isConnected) return null;
    try {
      const info = await this.client.info('memory');
      const keys = await this.client.keys('*');
      return {
        connected: this.isConnected,
        keyCount: keys.length,
        memoryInfo: info
      };
    } catch (error) {
      console.error('Get Stats Error:', error);
      return null;
    }
  }
}

// 创建单例实例
const redisService = new RedisService();

module.exports = redisService;

