"use client"

import { createContext, useContext, useState, ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Calendar,
  Clock,
  TrendingUp,
  Users,
  MapPin,
  Zap,
  Pause,
  Play,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Settings,
  BarChart3,
  Target,
  Shield
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface StrainLifecycle {
  id: string
  title: string
  type: '生活毒株' | '观点毒株' | '兴趣毒株' | '超级毒株'
  currentPhase: 'creation' | 'spread' | 'peak' | 'decline' | 'dormant' | 'completed'
  totalPhases: number
  infectionRate: number
  totalInfections: number
  views: number
  likes: number
  createdAt: string
  lastActivity: string
  estimatedPeakTime?: string
  estimatedCompletionTime?: string
  currentLevel: number
  totalLevels: number
  progress: number
  isBoosted: boolean
  canBeModified: boolean
  phaseHistory: LifecyclePhase[]
}

interface LifecyclePhase {
  phase: StrainLifecycle['currentPhase']
  startTime: string
  endTime?: string
  infectionRate: number
  totalInfections: number
  description: string
}

interface StrainLifecycleContextType {
  lifecycles: StrainLifecycle[]
  updateLifecyclePhase: (strainId: string, phase: StrainLifecycle['currentPhase']) => Promise<void>
  boostLifecycle: (strainId: string) => Promise<void>
  pauseLifecycle: (strainId: string) => Promise<void>
  resumeLifecycle: (strainId: string) => Promise<void>
  getLifecycleStats: (strainId: string) => LifecycleStats
  getPhaseDuration: (strainId: string, phase: StrainLifecycle['currentPhase']) => string
}

interface LifecycleStats {
  currentPhaseDuration: string
  nextPhaseEstimate: string
  phaseCompletionRate: number
  infectionGrowthRate: number
  successProbability: number
}

const StrainLifecycleContext = createContext<StrainLifecycleContextType | null>(null)

export function StrainLifecycleProvider({ children }: { children: ReactNode }) {
  const [lifecycles, setLifecycles] = useState<StrainLifecycle[]>([
    {
      id: '1',
      title: '冬季流感预警',
      type: '生活毒株',
      currentPhase: 'spread',
      totalPhases: 5,
      infectionRate: 75,
      totalInfections: 1200,
      views: 4500,
      likes: 320,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      lastActivity: new Date().toISOString(),
      estimatedPeakTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      estimatedCompletionTime: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
      currentLevel: 3,
      totalLevels: 5,
      progress: 60,
      isBoosted: false,
      canBeModified: true,
      phaseHistory: [
        {
          phase: 'creation',
          startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          infectionRate: 25,
          totalInfections: 150,
          description: '创建阶段 - 初始传播'
        },
        {
          phase: 'spread',
          startTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          infectionRate: 75,
          totalInfections: 1200,
          description: '传播阶段 - 快速扩散'
        }
      ]
    },
    {
      id: '2',
      title: '疫苗接种观点',
      type: '观点毒株',
      currentPhase: 'peak',
      totalPhases: 4,
      infectionRate: 45,
      totalInfections: 650,
      views: 2800,
      likes: 180,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      estimatedCompletionTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      currentLevel: 2,
      totalLevels: 4,
      progress: 50,
      isBoosted: false,
      canBeModified: true,
      phaseHistory: [
        {
          phase: 'creation',
          startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          infectionRate: 20,
          totalInfections: 80,
          description: '创建阶段 - 观点形成'
        },
        {
          phase: 'spread',
          startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          infectionRate: 45,
          totalInfections: 650,
          description: '传播阶段 - 观点扩散'
        },
        {
          phase: 'peak',
          startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          infectionRate: 45,
          totalInfections: 650,
          description: '高峰期 - 观点影响力最大'
        }
      ]
    },
    {
      id: '3',
      title: '健身健康习惯',
      type: '兴趣毒株',
      currentPhase: 'completed',
      totalPhases: 3,
      infectionRate: 25,
      totalInfections: 150,
      views: 800,
      likes: 95,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      lastActivity: new Date().toISOString(),
      currentLevel: 3,
      totalLevels: 3,
      progress: 100,
      isBoosted: false,
      canBeModified: false,
      phaseHistory: [
        {
          phase: 'creation',
          startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString(),
          infectionRate: 15,
          totalInfections: 30,
          description: '创建阶段 - 兴趣形成'
        },
        {
          phase: 'spread',
          startTime: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() - 0.1 * 24 * 60 * 60 * 1000).toISOString(),
          infectionRate: 25,
          totalInfections: 150,
          description: '传播阶段 - 兴趣扩散'
        },
        {
          phase: 'completed',
          startTime: new Date(Date.now() - 0.1 * 24 * 60 * 60 * 1000).toISOString(),
          infectionRate: 25,
          totalInfections: 150,
          description: '完成阶段 - 兴趣稳定'
        }
      ]
    }
  ])

  const updateLifecyclePhase = async (strainId: string, phase: StrainLifecycle['currentPhase']) => {
    setLifecycles(prev =>
      prev.map(lifecycle => {
        if (lifecycle.id === strainId) {
          const currentPhase = lifecycle.phaseHistory.find(p => !p.endTime)
          if (currentPhase) {
            currentPhase.endTime = new Date().toISOString()
          }

          return {
            ...lifecycle,
            currentPhase: phase,
            lastActivity: new Date().toISOString(),
            phaseHistory: [
              ...lifecycle.phaseHistory,
              {
                phase,
                startTime: new Date().toISOString(),
                infectionRate: lifecycle.infectionRate,
                totalInfections: lifecycle.totalInfections,
                description: getPhaseDescription(phase)
              }
            ]
          }
        }
        return lifecycle
      })
    )
    console.log(`Updated strain ${strainId} lifecycle phase to ${phase}`)
  }

  const boostLifecycle = async (strainId: string) => {
    setLifecycles(prev =>
      prev.map(lifecycle =>
        lifecycle.id === strainId
          ? {
              ...lifecycle,
              isBoosted: true,
              infectionRate: Math.min(lifecycle.infectionRate + 20, 100),
              lastActivity: new Date().toISOString()
            }
          : lifecycle
      )
    )
    console.log(`Boosted strain ${strainId} lifecycle`)
  }

  const pauseLifecycle = async (strainId: string) => {
    await updateLifecyclePhase(strainId, 'dormant')
  }

  const resumeLifecycle = async (strainId: string) => {
    const lifecycle = lifecycles.find(l => l.id === strainId)
    if (lifecycle) {
      const nextPhase = getNextPhase(lifecycle.currentPhase)
      if (nextPhase) {
        await updateLifecyclePhase(strainId, nextPhase)
      }
    }
  }

  const getLifecycleStats = (strainId: string): LifecycleStats => {
    const lifecycle = lifecycles.find(l => l.id === strainId)
    if (!lifecycle) {
      return {
        currentPhaseDuration: '未知',
        nextPhaseEstimate: '未知',
        phaseCompletionRate: 0,
        infectionGrowthRate: 0,
        successProbability: 0
      }
    }

    const currentPhase = lifecycle.phaseHistory.find(p => !p.endTime)
    const currentPhaseStart = currentPhase ? new Date(currentPhase.startTime) : new Date()
    const currentPhaseDuration = Date.now() - currentPhaseStart.getTime()

    return {
      currentPhaseDuration: formatDuration(currentPhaseDuration),
      nextPhaseEstimate: lifecycle.estimatedCompletionTime
        ? new Date(lifecycle.estimatedCompletionTime).toLocaleDateString('zh-CN')
        : '未知',
      phaseCompletionRate: lifecycle.progress,
      infectionGrowthRate: 15,
      successProbability: Math.min(lifecycle.infectionRate + 25, 100)
    }
  }

  const getPhaseDuration = (strainId: string, phase: StrainLifecycle['currentPhase']) => {
    const lifecycle = lifecycles.find(l => l.id === strainId)
    if (!lifecycle) return '未知'

    const phaseEntry = lifecycle.phaseHistory.find(p => p.phase === phase)
    if (!phaseEntry || !phaseEntry.endTime) return '进行中'

    const start = new Date(phaseEntry.startTime)
    const end = new Date(phaseEntry.endTime)
    const duration = end.getTime() - start.getTime()

    return formatDuration(duration)
  }

  const getPhaseDescription = (phase: StrainLifecycle['currentPhase']) => {
    switch (phase) {
      case 'creation': return '创建阶段 - 初始传播'
      case 'spread': return '传播阶段 - 快速扩散'
      case 'peak': return '高峰期 - 影响力最大'
      case 'decline': return '衰退期 - 影响力减弱'
      case 'dormant': return '休眠期 - 暂停传播'
      case 'completed': return '完成阶段 - 传播结束'
      default: return '未知阶段'
    }
  }

  const getNextPhase = (currentPhase: StrainLifecycle['currentPhase']) => {
    switch (currentPhase) {
      case 'creation': return 'spread'
      case 'spread': return 'peak'
      case 'peak': return 'decline'
      case 'decline': return 'completed'
      case 'dormant': return 'spread'
      default: return null
    }
  }

  const formatDuration = (ms: number) => {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24))
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) return `${days}天${hours}小时`
    if (hours > 0) return `${hours}小时`
    return '小于1小时'
  }

  const value = {
    lifecycles,
    updateLifecyclePhase,
    boostLifecycle,
    pauseLifecycle,
    resumeLifecycle,
    getLifecycleStats,
    getPhaseDuration
  }

  return (
    <StrainLifecycleContext.Provider value={value}>
      {children}
    </StrainLifecycleContext.Provider>
  )
}

export function useStrainLifecycle() {
  const context = useContext(StrainLifecycleContext)
  if (!context) {
    throw new Error('useStrainLifecycle must be used within a StrainLifecycleProvider')
  }
  return context
}

interface StrainLifecycleManagerProps {
  className?: string
}

export default function StrainLifecycleManager({ className }: StrainLifecycleManagerProps) {
  const {
    lifecycles,
    updateLifecyclePhase,
    boostLifecycle,
    pauseLifecycle,
    resumeLifecycle,
    getLifecycleStats,
    getPhaseDuration
  } = useStrainLifecycle()

  const getPhaseColor = (phase: StrainLifecycle['currentPhase']) => {
    switch (phase) {
      case 'creation':
        return 'bg-blue-100 text-blue-800'
      case 'spread':
        return 'bg-green-100 text-green-800'
      case 'peak':
        return 'bg-yellow-100 text-yellow-800'
      case 'decline':
        return 'bg-orange-100 text-orange-800'
      case 'dormant':
        return 'bg-gray-100 text-gray-800'
      case 'completed':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPhaseIcon = (phase: StrainLifecycle['currentPhase']) => {
    switch (phase) {
      case 'creation':
        return <Zap className="w-4 h-4" />
      case 'spread':
        return <TrendingUp className="w-4 h-4" />
      case 'peak':
        return <Target className="w-4 h-4" />
      case 'decline':
        return <AlertTriangle className="w-4 h-4" />
      case 'dormant':
        return <Pause className="w-4 h-4" />
      case 'completed':
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getPhaseText = (phase: StrainLifecycle['currentPhase']) => {
    switch (phase) {
      case 'creation':
        return '创建阶段'
      case 'spread':
        return '传播阶段'
      case 'peak':
        return '高峰期'
      case 'decline':
        return '衰退期'
      case 'dormant':
        return '休眠期'
      case 'completed':
        return '已完成'
      default:
        return '未知'
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

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Lifecycle Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            毒株生命周期概览
          </CardTitle>
          <CardDescription>
            所有毒株的生命周期阶段分布和统计信息
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">
                {lifecycles.filter(l => l.currentPhase === 'creation').length}
              </div>
              <div className="text-xs text-blue-800">创建阶段</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">
                {lifecycles.filter(l => l.currentPhase === 'spread').length}
              </div>
              <div className="text-xs text-green-800">传播阶段</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-lg font-bold text-yellow-600">
                {lifecycles.filter(l => l.currentPhase === 'peak').length}
              </div>
              <div className="text-xs text-yellow-800">高峰期</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-lg font-bold text-orange-600">
                {lifecycles.filter(l => l.currentPhase === 'decline').length}
              </div>
              <div className="text-xs text-orange-800">衰退期</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-600">
                {lifecycles.filter(l => l.currentPhase === 'dormant').length}
              </div>
              <div className="text-xs text-gray-800">休眠期</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-600">
                {lifecycles.filter(l => l.currentPhase === 'completed').length}
              </div>
              <div className="text-xs text-purple-800">已完成</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lifecycle Management */}
      <Card>
        <CardHeader>
          <CardTitle>毒株生命周期管理</CardTitle>
          <CardDescription>
            管理每个毒株的完整生命周期阶段
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {lifecycles.map(lifecycle => {
              const stats = getLifecycleStats(lifecycle.id)

              return (
                <div
                  key={lifecycle.id}
                  className="p-4 border rounded-lg space-y-4"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-lg">{lifecycle.title}</h3>
                        <Badge variant="outline">{lifecycle.type}</Badge>
                        <Badge className={getPhaseColor(lifecycle.currentPhase)}>
                          <div className="flex items-center space-x-1">
                            {getPhaseIcon(lifecycle.currentPhase)}
                            <span>{getPhaseText(lifecycle.currentPhase)}</span>
                          </div>
                        </Badge>
                        {lifecycle.isBoosted && (
                          <Badge className="bg-orange-100 text-orange-800">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            已加速
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        创建于 {new Date(lifecycle.createdAt).toLocaleDateString('zh-CN')} •
                        最后活动 {getTimeAgo(lifecycle.lastActivity)}
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>生命周期进度</span>
                      <span className="font-medium">{lifecycle.progress}%</span>
                    </div>
                    <Progress value={lifecycle.progress} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>等级 {lifecycle.currentLevel}/{lifecycle.totalLevels}</span>
                      <span>感染率 {lifecycle.infectionRate}%</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <div>
                        <div className="font-medium">{formatNumber(lifecycle.totalInfections)}</div>
                        <div className="text-xs text-gray-600">总感染</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-green-600" />
                      <div>
                        <div className="font-medium">{stats.currentPhaseDuration}</div>
                        <div className="text-xs text-gray-600">当前阶段</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      <div>
                        <div className="font-medium">{stats.nextPhaseEstimate}</div>
                        <div className="text-xs text-gray-600">预计完成</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-orange-600" />
                      <div>
                        <div className="font-medium">{stats.successProbability}%</div>
                        <div className="text-xs text-gray-600">成功率</div>
                      </div>
                    </div>
                  </div>

                  {/* Phase History */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-sm mb-3">阶段历史</h4>
                    <div className="space-y-2">
                      {lifecycle.phaseHistory.map((phase, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <Badge className={getPhaseColor(phase.phase)}>
                              {getPhaseText(phase.phase)}
                            </Badge>
                            <span className="text-gray-600">{phase.description}</span>
                          </div>
                          <div className="text-gray-500 text-xs">
                            {getPhaseDuration(lifecycle.id, phase.phase)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 pt-2">
                    {lifecycle.currentPhase === 'spread' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateLifecyclePhase(lifecycle.id, 'peak')}
                        >
                          <Target className="w-4 h-4 mr-1" />
                          进入高峰期
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => pauseLifecycle(lifecycle.id)}
                        >
                          <Pause className="w-4 h-4 mr-1" />
                          暂停传播
                        </Button>
                      </>
                    )}
                    {lifecycle.currentPhase === 'peak' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateLifecyclePhase(lifecycle.id, 'decline')}
                      >
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        进入衰退期
                      </Button>
                    )}
                    {lifecycle.currentPhase === 'dormant' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resumeLifecycle(lifecycle.id)}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        恢复传播
                      </Button>
                    )}
                    {!lifecycle.isBoosted && lifecycle.currentPhase !== 'completed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => boostLifecycle(lifecycle.id)}
                      >
                        <TrendingUp className="w-4 h-4 mr-1" />
                        加速传播
                      </Button>
                    )}
                    {lifecycle.canBeModified && (
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4 mr-1" />
                        设置
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}