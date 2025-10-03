"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  LogOut,
  AlertTriangle,
  CheckCircle,
  X,
  Shield,
  User,
  Settings,
  Bell,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUserState } from '@/components/user/UserStateManager'

interface UserLogoutProps {
  onLogout?: () => void
  onCancel?: () => void
  showConfirmation?: boolean
  className?: string
}

interface LogoutOption {
  id: string
  label: string
  description: string
  selected: boolean
  icon: React.ReactNode
}

export default function UserLogout({
  onLogout,
  onCancel,
  showConfirmation = true,
  className
}: UserLogoutProps) {
  const { state, logout } = useUserState()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [confirmationText, setConfirmationText] = useState('')
  const [logoutOptions, setLogoutOptions] = useState<LogoutOption[]>([
    {
      id: 'clearCache',
      label: '清除缓存数据',
      description: '删除本地存储的临时数据',
      selected: true,
      icon: <Settings className="w-4 h-4" />
    },
    {
      id: 'notifySessions',
      label: '通知其他会话',
      description: '在其他设备上显示登出通知',
      selected: false,
      icon: <Bell className="w-4 h-4" />
    },
    {
      id: 'preserveSettings',
      label: '保留用户设置',
      description: '保持个人偏好和配置',
      selected: true,
      icon: <User className="w-4 h-4" />
    }
  ])

  const isConfirmed = confirmationText === '确认登出'

  const handleLogout = async () => {
    if (showConfirmation && !isConfirmed) return

    setIsLoggingOut(true)
    try {
      // Simulate logout process
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Execute selected logout options
      const selectedOptions = logoutOptions.filter(opt => opt.selected)
      console.log('Executing logout options:', selectedOptions)

      // Clear user state
      logout()

      // Call external logout handler
      onLogout?.()
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const toggleOption = (optionId: string) => {
    setLogoutOptions(prev =>
      prev.map(opt =>
        opt.id === optionId ? { ...opt, selected: !opt.selected } : opt
      )
    )
  }

  const getSessionDuration = () => {
    if (!state.user?.joinDate) return '未知'

    const joinDate = new Date(state.user.joinDate)
    const now = new Date()
    const diffMs = now.getTime() - joinDate.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays < 1) return '今天加入'
    if (diffDays < 30) return `${diffDays}天前加入`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}个月前加入`
    return `${Math.floor(diffDays / 365)}年前加入`
  }

  if (!showConfirmation) {
    return (
      <Button
        variant="outline"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={cn("flex items-center", className)}
      >
        {isLoggingOut ? (
          <>
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
            登出中...
          </>
        ) : (
          <>
            <LogOut className="w-4 h-4 mr-2" />
            登出
          </>
        )}
      </Button>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Warning Header */}
      <Card className="border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center text-yellow-600">
            <AlertTriangle className="w-6 h-6 mr-2" />
            确认登出
          </CardTitle>
          <CardDescription className="text-yellow-600">
            您即将退出当前账户
          </CardDescription>
        </CardHeader>
      </Card>

      {/* User Information */}
      {state.user && (
        <Card>
          <CardHeader>
            <CardTitle>账户信息</CardTitle>
            <CardDescription>
              当前登录的账户详情
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">
                  {state.user.displayName || state.user.username}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline" className={cn(
                    state.user.tier === 'premium'
                      ? "bg-purple-100 text-purple-800"
                      : "bg-gray-100 text-gray-800"
                  )}>
                    {state.user.tier === 'premium' ? '高级用户' : '免费用户'}
                  </Badge>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-1" />
                    {getSessionDuration()}
                  </div>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-lg font-semibold">
                {(state.user.displayName || state.user.username)[0]}
              </div>
            </div>

            {/* User Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">{state.user.stats.strainsCreated}</div>
                <div className="text-xs text-blue-800">创建毒株</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">{state.user.stats.totalInfections}</div>
                <div className="text-xs text-green-800">总感染数</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-600">{state.user.stats.mutationCount}</div>
                <div className="text-xs text-purple-800">变异次数</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-lg font-bold text-orange-600">{state.user.stats.regionsUnlocked}</div>
                <div className="text-xs text-orange-800">解锁区域</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Logout Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            登出选项
          </CardTitle>
          <CardDescription>
            选择登出时的处理方式
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {logoutOptions.map(option => (
            <div
              key={option.id}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors",
                option.selected
                  ? "bg-blue-50 border-blue-200"
                  : "bg-gray-50 border-gray-200"
              )}
              onClick={() => toggleOption(option.id)}
            >
              <div className="flex items-center space-x-3">
                <div className={cn(
                  "p-2 rounded",
                  option.selected ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"
                )}>
                  {option.icon}
                </div>
                <div>
                  <div className="font-medium text-sm">{option.label}</div>
                  <div className="text-xs text-gray-600">{option.description}</div>
                </div>
              </div>
              <div className={cn(
                "w-5 h-5 border-2 rounded transition-colors",
                option.selected
                  ? "bg-blue-500 border-blue-500"
                  : "border-gray-300"
              )}>
                {option.selected && (
                  <CheckCircle className="w-4 h-4 text-white" />
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Confirmation */}
      <Card>
        <CardHeader>
          <CardTitle>确认操作</CardTitle>
          <CardDescription>
            请输入 "确认登出" 以继续
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="confirmation">确认文本</Label>
            <Input
              id="confirmation"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="输入 确认登出"
              className={isConfirmed ? "border-green-500" : ""}
            />
            {isConfirmed && (
              <p className="text-sm text-green-600">✓ 确认文本匹配</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isLoggingOut}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
              disabled={!isConfirmed || isLoggingOut}
              className="flex-1"
            >
              {isLoggingOut ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  登出中...
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4 mr-2" />
                  确认登出
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-800">安全提示</h4>
              <ul className="text-sm text-blue-700 space-y-1 mt-1">
                <li>• 登出后需要重新登录才能访问账户</li>
                <li>• 未保存的数据可能会丢失</li>
                <li>• 其他设备的会话将保持活跃</li>
                <li>• 可以随时重新登录恢复访问</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}