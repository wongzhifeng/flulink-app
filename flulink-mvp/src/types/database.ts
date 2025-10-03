// 数据库配置 - Zeabur兼容
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  connectionLimit: number;
}

export interface DatabaseConnection {
  isConnected: boolean;
  lastConnected: string;
  connectionCount: number;
  errorCount: number;
}

export interface DatabaseStats {
  totalQueries: number;
  successfulQueries: number;
  failedQueries: number;
  averageQueryTime: number;
  activeConnections: number;
}

// Zeabur环境变量配置
export const getDatabaseConfig = (): DatabaseConfig => {
  return {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    database: process.env.DATABASE_NAME || 'flulink',
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || '',
    ssl: process.env.NODE_ENV === 'production',
    connectionLimit: parseInt(process.env.DATABASE_CONNECTION_LIMIT || '10'),
  };
};

// 数据库表结构定义
export interface DatabaseSchema {
  users: {
    id: string;
    username: string;
    email: string;
    avatar: string;
    bio: string;
    location_lat: number;
    location_lng: number;
    location_radius: number;
    immunity_tags: string[];
    created_at: string;
    updated_at: string;
  };
  
  virus_strains: {
    id: string;
    creator_id: string;
    title: string;
    content: string;
    type: 'life' | 'opinion' | 'interest' | 'super';
    tags: string[];
    location_lat: number;
    location_lng: number;
    location_radius: number;
    spread_delay: number;
    spread_count: number;
    status: 'active' | 'dormant' | 'archived';
    created_at: string;
    updated_at: string;
  };
  
  immunity_rules: {
    id: string;
    user_id: string;
    tag_id: string;
    tag_name: string;
    rule_type: 'block' | 'filter' | 'delay';
    strength: number;
    conditions: string; // JSON string
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
  
  tags: {
    id: string;
    name: string;
    category: 'life' | 'opinion' | 'interest' | 'super';
    description: string;
    color: string;
    usage_count: number;
    created_at: string;
    updated_at: string;
  };
  
  tasks: {
    id: string;
    creator_id: string;
    title: string;
    description: string;
    type: 'propagation' | 'collection' | 'mutation';
    target_strain_id: string;
    reward_points: number;
    status: 'pending' | 'active' | 'completed' | 'cancelled';
    created_at: string;
    updated_at: string;
  };
}

