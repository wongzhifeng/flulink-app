// 权限配置 - Zeabur兼容
export interface PermissionConfig {
  roles: {
    [key: string]: {
      name: string;
      description: string;
      permissions: string[];
      level: number; // 权限级别 1-10
    };
  };
  permissions: {
    [key: string]: {
      name: string;
      description: string;
      category: 'read' | 'write' | 'delete' | 'admin';
      resource: string;
    };
  };
  resources: {
    [key: string]: {
      name: string;
      description: string;
      actions: string[];
    };
  };
}

export interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  roleName: string;
  assignedAt: string;
  assignedBy: string;
  expiresAt?: string;
  isActive: boolean;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'read' | 'write' | 'delete' | 'admin';
  resource: string;
  action: string;
  conditions?: {
    timeRange?: { start: string; end: string };
    location?: { lat: number; lng: number; radius: number };
    frequency?: { maxPerDay: number };
  };
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  level: number;
  isSystem: boolean; // 系统角色不可删除
  createdAt: string;
  updatedAt: string;
}

export interface PermissionCheck {
  userId: string;
  resource: string;
  action: string;
  context?: {
    time?: string;
    location?: { lat: number; lng: number };
    data?: any;
  };
  result: {
    allowed: boolean;
    reason: string;
    role?: string;
    permission?: string;
    expiresAt?: string;
  };
}

export interface PermissionStats {
  totalUsers: number;
  totalRoles: number;
  totalPermissions: number;
  activeRoles: number;
  permissionChecks: {
    total: number;
    allowed: number;
    denied: number;
    successRate: number;
  };
  roleDistribution: {
    [roleName: string]: number;
  };
}

// Zeabur环境变量配置
export const getPermissionConfig = (): PermissionConfig => {
  return {
    roles: {
      'admin': {
        name: '管理员',
        description: '系统管理员，拥有所有权限',
        permissions: ['*'],
        level: 10,
      },
      'moderator': {
        name: '版主',
        description: '内容版主，可以管理内容和用户',
        permissions: ['content:read', 'content:write', 'content:delete', 'user:read', 'user:moderate'],
        level: 8,
      },
      'premium': {
        name: '高级用户',
        description: '高级用户，拥有更多功能权限',
        permissions: ['content:read', 'content:write', 'advanced:features', 'analytics:read'],
        level: 6,
      },
      'user': {
        name: '普通用户',
        description: '普通用户，基础功能权限',
        permissions: ['content:read', 'content:write', 'profile:manage'],
        level: 4,
      },
      'guest': {
        name: '访客',
        description: '访客用户，只读权限',
        permissions: ['content:read'],
        level: 2,
      },
    },
    permissions: {
      'content:read': {
        name: '内容查看',
        description: '查看毒株和内容',
        category: 'read',
        resource: 'content',
      },
      'content:write': {
        name: '内容创建',
        description: '创建和编辑毒株',
        category: 'write',
        resource: 'content',
      },
      'content:delete': {
        name: '内容删除',
        description: '删除毒株和内容',
        category: 'delete',
        resource: 'content',
      },
      'user:read': {
        name: '用户查看',
        description: '查看用户信息',
        category: 'read',
        resource: 'user',
      },
      'user:moderate': {
        name: '用户管理',
        description: '管理用户状态',
        category: 'admin',
        resource: 'user',
      },
      'advanced:features': {
        name: '高级功能',
        description: '使用高级功能',
        category: 'write',
        resource: 'features',
      },
      'analytics:read': {
        name: '数据分析',
        description: '查看数据分析',
        category: 'read',
        resource: 'analytics',
      },
      'profile:manage': {
        name: '个人资料',
        description: '管理个人资料',
        category: 'write',
        resource: 'profile',
      },
    },
    resources: {
      'content': {
        name: '内容',
        description: '毒株和内容资源',
        actions: ['read', 'write', 'delete'],
      },
      'user': {
        name: '用户',
        description: '用户资源',
        actions: ['read', 'moderate', 'ban'],
      },
      'features': {
        name: '功能',
        description: '系统功能',
        actions: ['use', 'configure'],
      },
      'analytics': {
        name: '分析',
        description: '数据分析',
        actions: ['read', 'export'],
      },
      'profile': {
        name: '资料',
        description: '个人资料',
        actions: ['read', 'write', 'delete'],
      },
    },
  };
};

