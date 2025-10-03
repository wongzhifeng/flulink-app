import { 
  PermissionConfig, 
  UserRole, 
  Permission, 
  Role, 
  PermissionCheck, 
  PermissionStats 
} from '../types/permission';

// 权限服务类 - Zeabur兼容
class PermissionService {
  private config: PermissionConfig;
  private userRoles: Map<string, UserRole[]> = new Map(); // userId -> roles
  private roles: Map<string, Role> = new Map();
  private permissions: Map<string, Permission> = new Map();
  private permissionChecks: PermissionCheck[] = [];
  private stats: PermissionStats;

  constructor() {
    this.config = this.getConfig();
    this.stats = this.getDefaultStats();
    this.initializeDefaultData();
  }

  private getConfig(): PermissionConfig {
    // Zeabur环境变量处理
    const env = typeof window === 'undefined' ? {} : {};
    
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
  }

  // 初始化默认数据
  private initializeDefaultData(): void {
    // 初始化角色
    Object.entries(this.config.roles).forEach(([id, roleData]) => {
      const role: Role = {
        id,
        name: roleData.name,
        description: roleData.description,
        permissions: roleData.permissions,
        level: roleData.level,
        isSystem: ['admin', 'user', 'guest'].includes(id),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.roles.set(id, role);
    });

    // 初始化权限
    Object.entries(this.config.permissions).forEach(([id, permData]) => {
      const permission: Permission = {
        id,
        name: permData.name,
        description: permData.description,
        category: permData.category,
        resource: permData.resource,
        action: id.split(':')[1],
      };
      this.permissions.set(id, permission);
    });

    // 为测试用户分配默认角色
    this.assignRole('test-user-1', 'admin', 'system');
    this.assignRole('test-user-2', 'premium', 'system');
    this.assignRole('test-user-3', 'user', 'system');
  }

  // 分配角色给用户
  assignRole(userId: string, roleId: string, assignedBy: string, expiresAt?: string): UserRole {
    const role = this.roles.get(roleId);
    if (!role) {
      throw new Error(`Role ${roleId} not found`);
    }

    const userRole: UserRole = {
      id: this.generateId(),
      userId,
      roleId,
      roleName: role.name,
      assignedAt: new Date().toISOString(),
      assignedBy,
      expiresAt,
      isActive: true,
    };

    const userRoles = this.userRoles.get(userId) || [];
    userRoles.push(userRole);
    this.userRoles.set(userId, userRoles);

    return userRole;
  }

  // 移除用户角色
  removeRole(userId: string, roleId: string): boolean {
    const userRoles = this.userRoles.get(userId) || [];
    const roleIndex = userRoles.findIndex(role => role.roleId === roleId);
    
    if (roleIndex !== -1) {
      userRoles.splice(roleIndex, 1);
      this.userRoles.set(userId, userRoles);
      return true;
    }
    
    return false;
  }

  // 获取用户角色
  getUserRoles(userId: string): UserRole[] {
    return this.userRoles.get(userId) || [];
  }

  // 获取用户有效角色
  getActiveUserRoles(userId: string): UserRole[] {
    const userRoles = this.getUserRoles(userId);
    const now = new Date();
    
    return userRoles.filter(role => {
      if (!role.isActive) return false;
      if (role.expiresAt && new Date(role.expiresAt) < now) return false;
      return true;
    });
  }

  // 检查用户权限
  checkPermission(
    userId: string, 
    resource: string, 
    action: string, 
    context?: any
  ): PermissionCheck {
    const startTime = Date.now();
    
    try {
      const userRoles = this.getActiveUserRoles(userId);
      const permissionKey = `${resource}:${action}`;
      
      // 检查是否有管理员权限
      const hasAdminRole = userRoles.some(role => {
        const roleData = this.roles.get(role.roleId);
        return roleData?.permissions.includes('*');
      });
      
      if (hasAdminRole) {
        const result: PermissionCheck = {
          userId,
          resource,
          action,
          context,
          result: {
            allowed: true,
            reason: '管理员权限',
            role: 'admin',
            permission: '*',
          },
        };
        
        this.permissionChecks.push(result);
        this.updateStats(true);
        return result;
      }
      
      // 检查具体权限
      for (const userRole of userRoles) {
        const roleData = this.roles.get(userRole.roleId);
        if (!roleData) continue;
        
        const hasPermission = roleData.permissions.includes(permissionKey);
        if (hasPermission) {
          const result: PermissionCheck = {
            userId,
            resource,
            action,
            context,
            result: {
              allowed: true,
              reason: `角色 ${roleData.name} 拥有权限`,
              role: roleData.name,
              permission: permissionKey,
            },
          };
          
          this.permissionChecks.push(result);
          this.updateStats(true);
          return result;
        }
      }
      
      // 权限被拒绝
      const result: PermissionCheck = {
        userId,
        resource,
        action,
        context,
        result: {
          allowed: false,
          reason: '没有相应权限',
        },
      };
      
      this.permissionChecks.push(result);
      this.updateStats(false);
      return result;
      
    } catch (error) {
      const result: PermissionCheck = {
        userId,
        resource,
        action,
        context,
        result: {
          allowed: false,
          reason: `权限检查错误: ${error}`,
        },
      };
      
      this.permissionChecks.push(result);
      this.updateStats(false);
      return result;
    }
  }

  // 批量检查权限
  checkMultiplePermissions(
    userId: string, 
    permissions: { resource: string; action: string }[],
    context?: any
  ): PermissionCheck[] {
    return permissions.map(perm => 
      this.checkPermission(userId, perm.resource, perm.action, context)
    );
  }

  // 获取所有角色
  getAllRoles(): Role[] {
    return Array.from(this.roles.values());
  }

  // 获取所有权限
  getAllPermissions(): Permission[] {
    return Array.from(this.permissions.values());
  }

  // 创建自定义角色
  createRole(
    name: string, 
    description: string, 
    permissions: string[], 
    level: number = 5
  ): Role {
    const roleId = this.generateId();
    const role: Role = {
      id: roleId,
      name,
      description,
      permissions,
      level,
      isSystem: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    this.roles.set(roleId, role);
    return role;
  }

  // 更新角色
  updateRole(roleId: string, updates: Partial<Role>): Role | null {
    const role = this.roles.get(roleId);
    if (!role) return null;
    
    if (role.isSystem && updates.permissions) {
      throw new Error('Cannot modify system role permissions');
    }
    
    const updatedRole: Role = {
      ...role,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    this.roles.set(roleId, updatedRole);
    return updatedRole;
  }

  // 删除角色
  deleteRole(roleId: string): boolean {
    const role = this.roles.get(roleId);
    if (!role) return false;
    
    if (role.isSystem) {
      throw new Error('Cannot delete system role');
    }
    
    // 检查是否有用户使用此角色
    for (const userRoles of this.userRoles.values()) {
      if (userRoles.some(ur => ur.roleId === roleId)) {
        throw new Error('Cannot delete role that is assigned to users');
      }
    }
    
    this.roles.delete(roleId);
    return true;
  }

  // 获取权限统计
  getPermissionStats(): PermissionStats {
    this.stats.totalUsers = this.userRoles.size;
    this.stats.totalRoles = this.roles.size;
    this.stats.totalPermissions = this.permissions.size;
    this.stats.activeRoles = Array.from(this.roles.values()).filter(role => !role.isSystem).length;
    
    // 计算角色分布
    this.stats.roleDistribution = {};
    for (const userRoles of this.userRoles.values()) {
      for (const userRole of userRoles) {
        if (userRole.isActive) {
          this.stats.roleDistribution[userRole.roleName] = 
            (this.stats.roleDistribution[userRole.roleName] || 0) + 1;
        }
      }
    }
    
    return { ...this.stats };
  }

  // 获取权限检查历史
  getPermissionCheckHistory(limit: number = 100): PermissionCheck[] {
    return this.permissionChecks
      .slice(-limit)
      .reverse();
  }

  // 工具方法
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private getDefaultStats(): PermissionStats {
    return {
      totalUsers: 0,
      totalRoles: 0,
      totalPermissions: 0,
      activeRoles: 0,
      permissionChecks: {
        total: 0,
        allowed: 0,
        denied: 0,
        successRate: 0,
      },
      roleDistribution: {},
    };
  }

  private updateStats(allowed: boolean): void {
    this.stats.permissionChecks.total++;
    if (allowed) {
      this.stats.permissionChecks.allowed++;
    } else {
      this.stats.permissionChecks.denied++;
    }
    
    this.stats.permissionChecks.successRate = 
      this.stats.permissionChecks.allowed / this.stats.permissionChecks.total;
  }

  // 健康检查
  async healthCheck(): Promise<boolean> {
    try {
      // 测试权限检查功能
      const testResult = this.checkPermission('test-user', 'content', 'read');
      return testResult !== null;
    } catch (error) {
      console.error('Permission service health check failed:', error);
      return false;
    }
  }
}

// 创建单例实例
export const permissionService = new PermissionService();

