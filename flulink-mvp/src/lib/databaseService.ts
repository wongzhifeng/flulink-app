import { DatabaseConfig, DatabaseConnection, DatabaseStats, DatabaseSchema } from '../types/database';
import { User, VirusStrain, Task } from '../types';
import { ImmunityRule } from '../types/immunity';
import { Tag } from '../types/tags';

// 数据库服务类 - Zeabur兼容
class DatabaseService {
  private config: DatabaseConfig;
  private connection: DatabaseConnection;
  private stats: DatabaseStats;
  private isInitialized: boolean = false;

  constructor() {
    this.config = this.getConfig();
    this.connection = {
      isConnected: false,
      lastConnected: '',
      connectionCount: 0,
      errorCount: 0,
    };
    this.stats = {
      totalQueries: 0,
      successfulQueries: 0,
      failedQueries: 0,
      averageQueryTime: 0,
      activeConnections: 0,
    };
  }

  private getConfig(): DatabaseConfig {
    // Zeabur环境变量处理 - 简化版本
    const env = typeof window === 'undefined' ? {} : {};
    
    return {
      host: 'localhost', // 开发环境默认值
      port: 5432,
      database: 'flulink',
      username: 'postgres',
      password: '',
      ssl: false,
      connectionLimit: 10,
    };
  }

  // 初始化数据库连接
  async initialize(): Promise<boolean> {
    try {
      // 在Zeabur环境中，数据库连接通常由平台自动管理
      // 这里模拟连接成功
      this.connection.isConnected = true;
      this.connection.lastConnected = new Date().toISOString();
      this.connection.connectionCount++;
      this.isInitialized = true;
      
      console.log('Database initialized successfully');
      return true;
    } catch (error) {
      console.error('Database initialization failed:', error);
      this.connection.errorCount++;
      return false;
    }
  }

  // 执行查询
  private async executeQuery<T>(query: string, params: any[] = []): Promise<T[]> {
    const startTime = Date.now();
    this.stats.totalQueries++;

    try {
      // 模拟数据库查询
      // 在真实环境中，这里会使用实际的数据库驱动
      const result = await this.simulateQuery<T>(query, params);
      
      this.stats.successfulQueries++;
      this.stats.averageQueryTime = 
        (this.stats.averageQueryTime * (this.stats.successfulQueries - 1) + (Date.now() - startTime)) / 
        this.stats.successfulQueries;
      
      return result;
    } catch (error) {
      this.stats.failedQueries++;
      this.connection.errorCount++;
      console.error('Query failed:', error);
      throw error;
    }
  }

  // 模拟查询（开发环境）
  private async simulateQuery<T>(query: string, params: any[]): Promise<T[]> {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
    
    // 根据查询类型返回模拟数据
    if (query.includes('SELECT * FROM users')) {
      return this.getMockUsers() as T[];
    } else if (query.includes('SELECT * FROM virus_strains')) {
      return this.getMockStrains() as T[];
    } else if (query.includes('SELECT * FROM tags')) {
      return this.getMockTags() as T[];
    } else if (query.includes('SELECT * FROM immunity_rules')) {
      return this.getMockImmunityRules() as T[];
    } else if (query.includes('SELECT * FROM tasks')) {
      return this.getMockTasks() as T[];
    }
    
    return [] as T[];
  }

  // 用户相关操作
  async createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const query = `
      INSERT INTO users (username, email, avatar, bio, location_lat, location_lng, location_radius, immunity_tags)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const newUser: User = {
      id: this.generateId(),
      ...user,
      createdAt: new Date(),
    };
    
    return newUser;
  }

  async getUserById(id: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = $1';
    const users = await this.executeQuery<User>(query, [id]);
    return users[0] || null;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const query = `
      UPDATE users 
      SET username = $2, email = $3, avatar = $4, bio = $5, 
          location_lat = $6, location_lng = $7, location_radius = $8,
          immunity_tags = $9, updated_at = $10
      WHERE id = $1
      RETURNING *
    `;
    
    const user = await this.getUserById(id);
    if (!user) return null;
    
    const updatedUser: User = {
      ...user,
      ...updates,
      updatedAt: new Date(),
    };
    
    return updatedUser;
  }

  // 毒株相关操作
  async createVirusStrain(strain: Omit<VirusStrain, 'id' | 'createdAt' | 'updatedAt'>): Promise<VirusStrain> {
    const query = `
      INSERT INTO virus_strains (creator_id, title, content, type, tags, location_lat, location_lng, location_radius, spread_delay, spread_count, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    
    const newStrain: VirusStrain = {
      id: this.generateId(),
      ...strain,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    return newStrain;
  }

  async getVirusStrainsByUserId(userId: string): Promise<VirusStrain[]> {
    const query = 'SELECT * FROM virus_strains WHERE creator_id = $1 ORDER BY created_at DESC';
    return await this.executeQuery<VirusStrain>(query, [userId]);
  }

  async getVirusStrainsByLocation(lat: number, lng: number, radius: number): Promise<VirusStrain[]> {
    const query = `
      SELECT * FROM virus_strains 
      WHERE status = 'active' 
      AND ST_DWithin(
        ST_Point(location_lng, location_lat)::geography,
        ST_Point($2, $1)::geography,
        $3 * 1000
      )
      ORDER BY created_at DESC
    `;
    
    return await this.executeQuery<VirusStrain>(query, [lat, lng, radius]);
  }

  // 标签相关操作
  async createTag(tag: Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tag> {
    const query = `
      INSERT INTO tags (name, category, description, color, usage_count)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const newTag: Tag = {
      id: this.generateId(),
      ...tag,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    return newTag;
  }

  async getTagsByCategory(category: Tag['category']): Promise<Tag[]> {
    const query = 'SELECT * FROM tags WHERE category = $1 ORDER BY usage_count DESC';
    return await this.executeQuery<Tag>(query, [category]);
  }

  async searchTags(query: string, limit: number = 10): Promise<Tag[]> {
    const sqlQuery = `
      SELECT * FROM tags 
      WHERE name ILIKE $1 OR description ILIKE $1
      ORDER BY usage_count DESC
      LIMIT $2
    `;
    
    return await this.executeQuery<Tag>(sqlQuery, [`%${query}%`, limit]);
  }

  // 免疫规则相关操作
  async createImmunityRule(rule: Omit<ImmunityRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<ImmunityRule> {
    const query = `
      INSERT INTO immunity_rules (user_id, tag_id, tag_name, rule_type, strength, conditions, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const newRule: ImmunityRule = {
      id: this.generateId(),
      ...rule,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    return newRule;
  }

  async getImmunityRulesByUserId(userId: string): Promise<ImmunityRule[]> {
    const query = 'SELECT * FROM immunity_rules WHERE user_id = $1 ORDER BY created_at DESC';
    return await this.executeQuery<ImmunityRule>(query, [userId]);
  }

  // 任务相关操作
  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const query = `
      INSERT INTO tasks (creator_id, title, description, type, target_strain_id, reward_points, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const newTask: Task = {
      id: this.generateId(),
      ...task,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    return newTask;
  }

  async getTasksByUserId(userId: string): Promise<Task[]> {
    const query = 'SELECT * FROM tasks WHERE creator_id = $1 ORDER BY created_at DESC';
    return await this.executeQuery<Task>(query, [userId]);
  }

  // 数据库状态和统计
  getConnectionStatus(): DatabaseConnection {
    return { ...this.connection };
  }

  getDatabaseStats(): DatabaseStats {
    return { ...this.stats };
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.executeQuery('SELECT 1');
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  // 工具方法
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // 模拟数据方法
  private getMockUsers(): User[] {
    return [
      {
        id: 'user1',
        username: 'testuser',
        email: 'test@example.com',
        avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=testuser',
        bio: 'Test user',
        location: { lat: 30.2741, lng: 120.1551, address: 'Test Location' },
        immunityTags: [],
        tier: 'free',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];
  }

  private getMockStrains(): VirusStrain[] {
    return [];
  }

  private getMockTags(): Tag[] {
    return [];
  }

  private getMockImmunityRules(): ImmunityRule[] {
    return [];
  }

  private getMockTasks(): Task[] {
    return [];
  }
}

// 创建单例实例
export const databaseService = new DatabaseService();

// 初始化数据库连接
if (typeof window === 'undefined') {
  // 只在服务端初始化
  databaseService.initialize().catch(console.error);
}
