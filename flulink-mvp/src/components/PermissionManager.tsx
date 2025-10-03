'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Users, 
  Settings,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  AlertTriangle,
  BarChart3,
  Clock,
  Lock,
  Unlock
} from 'lucide-react'
import { permissionService } from '../lib/permissionService'
import { UserRole, Role, Permission, PermissionCheck, PermissionStats } from '../types/permission'

export default function PermissionManager() {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [userRoles, setUserRoles] = useState<UserRole[]>([])
  const [permissionChecks, setPermissionChecks] = useState<PermissionCheck[]>([])
  const [stats, setStats] = useState<PermissionStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'overview' | 'roles' | 'permissions' | 'users' | 'checks'>('overview')
  
  // 测试数据
  const [testUserId, setTestUserId] = useState('test-user-1')
  const [testResource, setTestResource] = useState('content')
  const [testAction, setTestAction] = useState('read')
  const [testResult, setTestResult] = useState<string>('')

  useEffect(() => {
    loadPermissionData()
  }, [])

  const loadPermissionData = async () => {
    setIsLoading(true)
    try {
      const [rolesData, permissionsData, checksData, statsData] = await Promise.all([
        permissionService.getAllRoles(),
        permissionService.getAllPermissions(),
        permissionService.getPermissionCheckHistory(20),
        permissionService.getPermissionStats()
      ])

      setRoles(rolesData)
      setPermissions(permissionsData)
      setPermissionChecks(checksData)
      setStats(statsData)
      
      // 获取测试用户的角色
      const userRolesData = permissionService.getUserRoles(testUserId)
      setUserRoles(userRolesData)
      
      setLastUpdate(new Date().toLocaleString())
    } catch (error) {
      console.error('Failed to load permission data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    loadPermissionData()
  }

  const handleTestPermission = () => {
    try {
      const result = permissionService.checkPermission(testUserId, testResource, testAction)
      
      if (result.result.allowed) {
        setTestResult(`✅ 权限检查通过: ${result.result.reason}`)
      } else {
        setTestResult(`❌ 权限检查失败: ${result.result.reason}`)
      }
      
      loadPermissionData() // 刷新数据
    } catch (error) {
      setTestResult(`❌ 权限检查出错: ${error}`)
    }
  }

  const handleAssignRole = (userId: string, roleId: string) => {
    try {
      permissionService.assignRole(userId, roleId, 'admin')
      setTestResult(`✅ 角色分配成功`)
      loadPermissionData()
    } catch (error) {
      setTestResult(`❌ 角色分配失败: ${error}`)
    }
  }

  const handleRemoveRole = (userId: string, roleId: string) => {
    try {
      permissionService.removeRole(userId, roleId)
      setTestResult(`✅ 角色移除成功`)
      loadPermissionData()
    } catch (error) {
      setTestResult(`❌ 角色移除失败: ${error}`)
    }
  }

  const getRoleLevelColor = (level: number) => {
    if (level >= 8) return 'bg-red-100 text-red-800'
    if (level >= 6) return 'bg-orange-100 text-orange-800'
    if (level >= 4) return 'bg-blue-100 text-blue-800'
    if (level >= 2) return 'bg-green-100 text-green-800'
    return 'bg-gray-100 text-gray-800'
  }

  const getPermissionCategoryColor = (category: Permission['category']) => {
    switch (category) {
      case 'read': return 'bg-blue-100 text-blue-800'
      case 'write': return 'bg-green-100 text-green-800'
      case 'delete': return 'bg-red-100 text-red-800'
      case 'admin': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  const formatPercentage = (rate: number) => {
    return `${(rate * 100).toFixed(1)}%`
  }

  return (
    <div className="space-y-6">
      {/* 头部操作 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">权限管理</h2>
          <p className="text-gray-600">FluLink用户权限和角色管理系统</p>
        </div>
        <Button onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          刷新数据
        </Button>
      </div>

      {/* 导航标签 */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeTab === 'overview' ? 'default' : 'outline'}
          onClick={() => setActiveTab('overview')}
          className="flex items-center"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          总览
        </Button>
        <Button
          variant={activeTab === 'roles' ? 'default' : 'outline'}
          onClick={() => setActiveTab('roles')}
          className="flex items-center"
        >
          <Shield className="w-4 h-4 mr-2" />
          角色管理
        </Button>
        <Button
          variant={activeTab === 'permissions' ? 'default' : 'outline'}
          onClick={() => setActiveTab('permissions')}
          className="flex items-center"
        >
          <Settings className="w-4 h-4 mr-2" />
          权限管理
        </Button>
        <Button
          variant={activeTab === 'users' ? 'default' : 'outline'}
          onClick={() => setActiveTab('users')}
          className="flex items-center"
        >
          <Users className="w-4 h-4 mr-2" />
          用户角色
        </Button>
        <Button
          variant={activeTab === 'checks' ? 'default' : 'outline'}
          onClick={() => setActiveTab('checks')}
          className="flex items-center"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          权限检查
        </Button>
      </div>

      {/* 总览标签页 */}
      {activeTab === 'overview' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Users className="h-4 w-4 mr-2" />
                总用户数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatNumber(stats.totalUsers)}
              </div>
              <p className="text-xs text-gray-500">注册用户</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                角色数量
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatNumber(stats.totalRoles)}
              </div>
              <p className="text-xs text-gray-500">
                活跃: {formatNumber(stats.activeRoles)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                权限数量
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {formatNumber(stats.totalPermissions)}
              </div>
              <p className="text-xs text-gray-500">系统权限</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                检查成功率
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">
                {formatPercentage(stats.permissionChecks.successRate)}
              </div>
              <p className="text-xs text-gray-500">
                总检查: {formatNumber(stats.permissionChecks.total)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 角色管理标签页 */}
      {activeTab === 'roles' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">角色管理</h3>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              创建角色
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role) => (
              <Card key={role.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{role.name}</span>
                    <Badge className={getRoleLevelColor(role.level)}>
                      级别 {role.level}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{role.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">权限列表:</div>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 3).map((permission) => (
                        <Badge key={permission} variant="outline" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                      {role.permissions.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{role.permissions.length - 3}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <Badge variant={role.isSystem ? "default" : "secondary"}>
                        {role.isSystem ? '系统角色' : '自定义角色'}
                      </Badge>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline">
                          <Edit className="w-3 h-3" />
                        </Button>
                        {!role.isSystem && (
                          <Button size="sm" variant="outline">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 权限管理标签页 */}
      {activeTab === 'permissions' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">权限管理</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {permissions.map((permission) => (
              <Card key={permission.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{permission.name}</div>
                    <Badge className={getPermissionCategoryColor(permission.category)}>
                      {permission.category}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {permission.description}
                  </div>
                  <div className="text-xs text-gray-500">
                    资源: {permission.resource} | 操作: {permission.action}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 用户角色标签页 */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">用户角色管理</h3>
          
          <div className="space-y-4">
            {userRoles.map((userRole) => (
              <Card key={userRole.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{userRole.roleName}</div>
                      <div className="text-sm text-gray-600">
                        用户: {userRole.userId} | 分配时间: {new Date(userRole.assignedAt).toLocaleString()}
                      </div>
                      {userRole.expiresAt && (
                        <div className="text-xs text-gray-500">
                          过期时间: {new Date(userRole.expiresAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={userRole.isActive ? "default" : "secondary"}>
                        {userRole.isActive ? '活跃' : '禁用'}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveRole(userRole.userId, userRole.roleId)}
                      >
                        <UserX className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 权限检查标签页 */}
      {activeTab === 'checks' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">权限检查</h3>
          
          {/* 测试区域 */}
          <Card>
            <CardHeader>
              <CardTitle>权限测试</CardTitle>
              <CardDescription>测试用户权限检查功能</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    用户ID
                  </label>
                  <Input
                    value={testUserId}
                    onChange={(e) => setTestUserId(e.target.value)}
                    placeholder="输入用户ID"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    资源
                  </label>
                  <Input
                    value={testResource}
                    onChange={(e) => setTestResource(e.target.value)}
                    placeholder="输入资源名称"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    操作
                  </label>
                  <Input
                    value={testAction}
                    onChange={(e) => setTestAction(e.target.value)}
                    placeholder="输入操作名称"
                  />
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={handleTestPermission}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  检查权限
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleAssignRole(testUserId, 'premium')}
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  分配高级角色
                </Button>
              </div>
              
              {testResult && (
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-700">{testResult}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 检查历史 */}
          <Card>
            <CardHeader>
              <CardTitle>权限检查历史</CardTitle>
              <CardDescription>最近的权限检查记录</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {permissionChecks.length === 0 ? (
                  <div className="text-center py-4">
                    <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">暂无权限检查记录</p>
                  </div>
                ) : (
                  permissionChecks.map((check, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center space-x-3">
                        {check.result.allowed ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <div>
                          <div className="font-medium">
                            {check.userId} - {check.resource}:{check.action}
                          </div>
                          <div className="text-sm text-gray-600">
                            {check.result.reason}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={check.result.allowed ? "default" : "destructive"}>
                          {check.result.allowed ? '允许' : '拒绝'}
                        </Badge>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date().toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 最后更新时间 */}
      <div className="text-center text-sm text-gray-500">
        最后更新: {lastUpdate}
      </div>
    </div>
  )
}

