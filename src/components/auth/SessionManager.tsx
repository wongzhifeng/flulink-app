"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Shield,
  Clock,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  User,
  LogOut,
  Eye,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Session {
  id: string
  userId: string
  device: string
  browser: string
  ipAddress: string
  location: string
  lastActive: string
  isCurrent: boolean
  expiresAt: string
}

interface SessionManagerProps {
  userId: string
  onLogout?: (sessionId?: string) => void
  onRefresh?: () => void
  className?: string
}

interface SessionContextType {
  sessions: Session[]
  currentSession: Session | null
  isLoading: boolean
  refreshSessions: () => void
  terminateSession: (sessionId: string) => void
  terminateAllSessions: () => void
}

const SessionContext = createContext<SessionContextType | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const refreshSessions = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock session data
      const mockSessions: Session[] = [
        {
          id: '1',
          userId: 'user123',
          device: 'MacBook Pro',
          browser: 'Chrome 119',
          ipAddress: '192.168.1.100',
          location: '上海, 中国',
          lastActive: new Date().toISOString(),
          isCurrent: true,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          userId: 'user123',
          device: 'iPhone 15',
          browser: 'Safari 17',
          ipAddress: '192.168.1.101',
          location: '上海, 中国',
          lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          isCurrent: false,
          expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          userId: 'user123',
          device: 'Windows PC',
          browser: 'Firefox 120',
          ipAddress: '203.0.113.50',
          location: '北京, 中国',
          lastActive: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          isCurrent: false,
          expiresAt: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString()
        }
      ]

      setSessions(mockSessions)
    } catch (error) {
      console.error('Failed to refresh sessions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const terminateSession = async (sessionId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setSessions(prev => prev.filter(session => session.id !== sessionId))
    } catch (error) {
      console.error('Failed to terminate session:', error)
    }
  }

  const terminateAllSessions = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setSessions(prev => prev.filter(session => session.isCurrent))
    } catch (error) {
      console.error('Failed to terminate all sessions:', error)
    }
  }

  useEffect(() => {
    refreshSessions()
  }, [])

  const value = {
    sessions,
    currentSession: sessions.find(session => session.isCurrent) || null,
    isLoading,
    refreshSessions,
    terminateSession,
    terminateAllSessions
  }

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSessions() {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSessions must be used within a SessionProvider')
  }
  return context
}

export default function SessionManager({
  userId,
  onLogout,
  onRefresh,
  className
}: SessionManagerProps) {
  const { sessions, currentSession, isLoading, refreshSessions, terminateSession, terminateAllSessions } = useSessions()

  const getSessionStatus = (session: Session) => {
    const lastActive = new Date(session.lastActive)
    const now = new Date()
    const hoursSinceActive = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60)

    if (session.isCurrent) return 'current'
    if (hoursSinceActive < 1) return 'recent'
    if (hoursSinceActive < 24) return 'active'
    return 'inactive'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'current':
        return 'bg-green-100 text-green-800'
      case 'recent':
        return 'bg-blue-100 text-blue-800'
      case 'active':
        return 'bg-yellow-100 text-yellow-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'current':
        return <CheckCircle className="w-4 h-4" />
      case 'recent':
        return <Zap className="w-4 h-4" />
      case 'active':
        return <Clock className="w-4 h-4" />
      case 'inactive':
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return '刚刚'
    if (diffMins < 60) return `${diffMins}分钟前`
    if (diffHours < 24) return `${diffHours}小时前`
    return `${diffDays}天前`
  }

  const handleRefresh = () => {
    refreshSessions()
    onRefresh?.()
  }

  const handleTerminateAll = () => {
    terminateAllSessions()
    if (sessions.length === 1 && sessions[0].isCurrent) {
      onLogout?.()
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Current Session */}
      {currentSession && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              当前会话
            </CardTitle>
            <CardDescription>
              您当前的活动会话信息
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600">设备</div>
                <div className="font-medium">{currentSession.device}</div>
              </div>
              <div>
                <div className="text-gray-600">浏览器</div>
                <div className="font-medium">{currentSession.browser}</div>
              </div>
              <div>
                <div className="text-gray-600">IP地址</div>
                <div className="font-medium">{currentSession.ipAddress}</div>
              </div>
              <div>
                <div className="text-gray-600">位置</div>
                <div className="font-medium">{currentSession.location}</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  当前活跃会话
                </span>
              </div>
              <Badge variant="default" className="bg-green-100 text-green-800">
                安全
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                活跃会话 ({sessions.length})
              </CardTitle>
              <CardDescription>
                您的账户在所有设备上的登录状态
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center"
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
              刷新
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-500">加载会话中...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Shield className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>暂无活跃会话</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => {
                const status = getSessionStatus(session)
                return (
                  <div
                    key={session.id}
                    className={cn(
                      "p-4 border rounded-lg",
                      session.isCurrent ? "border-green-200 bg-green-50" : "border-gray-200"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold">{session.device}</h4>
                          <Badge variant="outline" className={getStatusColor(status)}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(status)}
                              <span>
                                {status === 'current' ? '当前' :
                                 status === 'recent' ? '最近' :
                                 status === 'active' ? '活跃' : '非活跃'}
                              </span>
                            </div>
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-gray-600">浏览器</div>
                            <div className="font-medium">{session.browser}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">位置</div>
                            <div className="font-medium">{session.location}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">IP地址</div>
                            <div className="font-medium">{session.ipAddress}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">最后活动</div>
                            <div className="font-medium">{getTimeAgo(session.lastActive)}</div>
                          </div>
                        </div>
                      </div>

                      {!session.isCurrent && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => terminateSession(session.id)}
                          className="flex items-center text-red-600 hover:text-red-700"
                        >
                          <LogOut className="w-4 h-4 mr-1" />
                          退出
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="w-5 h-5 mr-2" />
            会话安全
          </CardTitle>
          <CardDescription>
            管理您的账户安全设置
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">会话超时</div>
                <div className="text-sm text-gray-600">24小时后自动登出</div>
              </div>
              <Badge variant="outline">标准</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">异地登录保护</div>
                <div className="text-sm text-gray-600">检测异常登录行为</div>
              </div>
              <Badge variant="default" className="bg-green-100 text-green-800">
                已启用
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">设备管理</div>
                <div className="text-sm text-gray-600">管理信任的设备</div>
              </div>
              <Badge variant="outline">{sessions.length} 设备</Badge>
            </div>
          </div>

          {/* Security Actions */}
          <div className="flex space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={handleTerminateAll}
              disabled={sessions.length <= 1}
              className="flex-1"
            >
              <LogOut className="w-4 h-4 mr-2" />
              退出所有设备
            </Button>
            <Button variant="outline" className="flex-1">
              <Shield className="w-4 h-4 mr-2" />
              安全设置
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-semibold text-blue-800 mb-2">安全提示</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 定期检查活跃会话，确保没有异常登录</li>
            <li>• 在不常用的设备上及时退出登录</li>
            <li>• 使用强密码并定期更换</li>
            <li>• 启用双重验证增强账户安全</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}