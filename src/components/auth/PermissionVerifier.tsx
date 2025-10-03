"use client"

import { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Lock, Shield, Crown, Users, MapPin, Zap, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface User {
  id: string
  tier: 'free' | 'premium'
  permissions: {
    canCreateStrains: boolean
    canEditStrains: boolean
    canDeleteStrains: boolean
    canAccessMutationLab: boolean
    canUseSuperFlu: boolean
    canAccessAdvancedFeatures: boolean
    maxStrains: number
    maxTagsPerStrain: number
    maxSpreadDelay: number
    canAccessInternationalSpread: boolean
  }
}

interface PermissionVerifierProps {
  user: User | null
  requiredPermission: string
  fallback?: ReactNode
  children: ReactNode
  showUpgradePrompt?: boolean
  className?: string
}

interface PermissionRule {
  key: string
  name: string
  description: string
  requiredTier: 'free' | 'premium'
  icon: ReactNode
}

const permissionRules: PermissionRule[] = [
  {
    key: 'canCreateStrains',
    name: '创建毒株',
    description: '创建新的毒株进行传播',
    requiredTier: 'free',
    icon: <Zap className="w-4 h-4" />
  },
  {
    key: 'canEditStrains',
    name: '编辑毒株',
    description: '修改已创建的毒株信息',
    requiredTier: 'free',
    icon: <Shield className="w-4 h-4" />
  },
  {
    key: 'canDeleteStrains',
    name: '删除毒株',
    description: '删除不再需要的毒株',
    requiredTier: 'free',
    icon: <Shield className="w-4 h-4" />
  },
  {
    key: 'canAccessMutationLab',
    name: '变异实验室',
    description: '访问毒株变异和进化功能',
    requiredTier: 'free',
    icon: <Zap className="w-4 h-4" />
  },
  {
    key: 'canUseSuperFlu',
    name: '超级流感模式',
    description: '创建超级毒株进行快速传播',
    requiredTier: 'premium',
    icon: <Crown className="w-4 h-4" />
  },
  {
    key: 'canAccessAdvancedFeatures',
    name: '高级功能',
    description: '访问所有高级传播功能',
    requiredTier: 'premium',
    icon: <Crown className="w-4 h-4" />
  },
  {
    key: 'canAccessInternationalSpread',
    name: '跨国传播',
    description: '解锁跨国传播层级',
    requiredTier: 'premium',
    icon: <MapPin className="w-4 h-4" />
  }
]

export default function PermissionVerifier({
  user,
  requiredPermission,
  fallback,
  children,
  showUpgradePrompt = true,
  className
}: PermissionVerifierProps) {
  const hasPermission = (): boolean => {
    if (!user) return false

    const rule = permissionRules.find(r => r.key === requiredPermission)
    if (!rule) return false

    // Check tier requirement
    if (rule.requiredTier === 'premium' && user.tier !== 'premium') {
      return false
    }

    // Check specific permission
    return user.permissions[requiredPermission as keyof User['permissions']] === true
  }

  const getCurrentRule = () => {
    return permissionRules.find(r => r.key === requiredPermission)
  }

  const getUpgradePrompt = () => {
    const rule = getCurrentRule()
    if (!rule || rule.requiredTier === 'free') return null

    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Crown className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-yellow-800">
                需要高级账户
              </h4>
              <p className="text-sm text-yellow-700 mt-1">
                {rule.description}
              </p>
              <div className="flex space-x-2 mt-3">
                <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                  升级账户
                </Button>
                <Button variant="outline" size="sm">
                  了解更多
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getDefaultFallback = () => {
    const rule = getCurrentRule()

    return (
      <Card className={cn("border-gray-200", className)}>
        <CardHeader>
          <CardTitle className="flex items-center text-gray-600">
            <Lock className="w-5 h-5 mr-2" />
            权限不足
          </CardTitle>
          <CardDescription>
            {rule ? rule.description : '您没有访问此功能的权限'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {showUpgradePrompt && getUpgradePrompt()}

          {/* Current User Status */}
          {user && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">
                    {user.tier === 'premium' ? '高级用户' : '免费用户'}
                  </div>
                  <div className="text-sm text-gray-600">
                    当前账户类型
                  </div>
                </div>
                <Badge variant={user.tier === 'premium' ? "default" : "outline"}>
                  {user.tier === 'premium' ? '高级版' : '免费版'}
                </Badge>
              </div>
            </div>
          )}

          {/* Available Permissions */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">可用功能</h4>
            <div className="grid gap-2">
              {permissionRules
                .filter(rule =>
                  user?.permissions[rule.key as keyof User['permissions']] === true
                )
                .map(rule => (
                  <div key={rule.key} className="flex items-center space-x-2 p-2 bg-green-50 rounded">
                    <div className="text-green-600">{rule.icon}</div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{rule.name}</div>
                      <div className="text-xs text-green-700">{rule.description}</div>
                    </div>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      已解锁
                    </Badge>
                  </div>
                ))}
            </div>
          </div>

          {/* Upgrade Benefits */}
          {user?.tier === 'free' && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">升级高级版可解锁</h4>
              <div className="grid gap-2">
                {permissionRules
                  .filter(rule => rule.requiredTier === 'premium')
                  .map(rule => (
                    <div key={rule.key} className="flex items-center space-x-2 p-2 bg-purple-50 rounded">
                      <div className="text-purple-600">{rule.icon}</div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{rule.name}</div>
                        <div className="text-xs text-purple-700">{rule.description}</div>
                      </div>
                      <Crown className="w-4 h-4 text-purple-600" />
                    </div>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  if (hasPermission()) {
    return <>{children}</>
  }

  return fallback || getDefaultFallback()
}

// Hook for checking permissions
export function usePermission(user: User | null, permission: string): boolean {
  const rule = permissionRules.find(r => r.key === permission)
  if (!rule || !user) return false

  if (rule.requiredTier === 'premium' && user.tier !== 'premium') {
    return false
  }

  return user.permissions[permission as keyof User['permissions']] === true
}

// Component for displaying user permissions
export function UserPermissionsDisplay({ user }: { user: User | null }) {
  if (!user) {
    return (
      <Card>
        <CardContent className="p-4 text-center text-gray-500">
          请先登录查看权限
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          账户权限
        </CardTitle>
        <CardDescription>
          您的账户类型和可用功能
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Account Tier */}
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div>
            <div className="font-semibold">
              {user.tier === 'premium' ? '高级账户' : '免费账户'}
            </div>
            <div className="text-sm text-blue-700">
              {user.tier === 'premium'
                ? '享受所有高级功能'
                : '基础功能已解锁'
              }
            </div>
          </div>
          <Badge variant={user.tier === 'premium' ? "default" : "outline"}>
            {user.tier === 'premium' ? '高级版' : '免费版'}
          </Badge>
        </div>

        {/* Permissions Grid */}
        <div className="grid gap-3">
          {permissionRules.map(rule => {
            const hasAccess = usePermission(user, rule.key)
            return (
              <div
                key={rule.key}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border",
                  hasAccess
                    ? "bg-green-50 border-green-200"
                    : "bg-gray-50 border-gray-200"
                )}
              >
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    "p-2 rounded",
                    hasAccess ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                  )}>
                    {rule.icon}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{rule.name}</div>
                    <div className="text-xs text-gray-600">{rule.description}</div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    variant={hasAccess ? "default" : "outline"}
                    className={hasAccess ? "bg-green-100 text-green-800" : ""}
                  >
                    {hasAccess ? "已解锁" : "需要高级版"}
                  </Badge>
                </div>
              </div>
            )
          })}
        </div>

        {/* Limits */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-orange-50 rounded-lg">
            <div className="text-lg font-bold text-orange-600">{user.permissions.maxStrains}</div>
            <div className="text-xs text-orange-800">最大毒株数</div>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">{user.permissions.maxTagsPerStrain}</div>
            <div className="text-xs text-blue-800">标签数/毒株</div>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="text-lg font-bold text-purple-600">{user.permissions.maxSpreadDelay}</div>
            <div className="text-xs text-purple-800">最大延迟(小时)</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}