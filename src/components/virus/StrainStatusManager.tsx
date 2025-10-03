"use client"

import { createContext, useContext, useState, ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Zap,
  Clock,
  Play,
  Pause,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Calendar,
  TrendingUp,
  Users,
  MapPin,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface StrainStatus {
  id: string
  title: string
  type: '生活毒株' | '观点毒株' | '兴趣毒株' | '超级毒株'
  status: 'active' | 'dormant' | 'completed' | 'expired' | 'paused'
  currentLevel: number
  totalLevels: number
  infectionRate: number
  totalInfections: number
  views: number
  likes: number
  createdAt: string
  lastActivity: string
  estimatedCompletion?: string
  progress: number
  isBoosted: boolean
  canBeModified: boolean
}

interface StrainStatusContextType {
  strains: StrainStatus[]
  updateStrainStatus: (strainId: string, status: StrainStatus['status']) => Promise<void>
  boostStrain: (strainId: string) => Promise<void>
  pauseStrain: (strainId: string) => Promise<void>
  resumeStrain: (strainId: string) => Promise<void>
  getStrainStats: (strainId: string) => StrainStats
}

interface StrainStats {
  dailyInfections: number
  weeklyGrowth: number
  completionTime: string
  successRate: number
}

const StrainStatusContext = createContext<StrainStatusContextType | null>(null)

export function StrainStatusProvider({ children }: { children: ReactNode }) {
  const [strains, setStrains] = useState<StrainStatus[]>([
    {
      id: '1',
      title: '冬季流感预警',
      type: '生活毒株',
      status: 'active',
      currentLevel: 3,
      totalLevels: 5,
      infectionRate: 75,
      totalInfections: 1200,
      views: 4500,
      likes: 320,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      lastActivity: new Date().toISOString(),
      estimatedCompletion: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      progress: 60,
      isBoosted: false,
      canBeModified: true
    },
    {
      id: '2',
      title: '疫苗接种观点',
      type: '观点毒株',
      status: 'dormant',
      currentLevel: 2,
      totalLevels: 4,
      infectionRate: 45,
      totalInfections: 650,
      views: 2800,
      likes: 180,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      estimatedCompletion: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
      progress: 50,
      isBoosted: false,
      canBeModified: true
    },
    {
      id: '3',
      title: '健身健康习惯',
      type: '兴趣毒株',
      status: 'completed',
      currentLevel: 5,
      totalLevels: 5,
      infectionRate: 25,
      totalInfections: 150,
      views: 800,
      likes: 95,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      lastActivity: new Date().toISOString(),
      progress: 100,
      isBoosted: false,
      canBeModified: false
    }
  ])

  const updateStrainStatus = async (strainId: string, status: StrainStatus['status']) => {
    setStrains(prev =>
      prev.map(strain =>
        strain.id === strainId
          ? { ...strain, status, lastActivity: new Date().toISOString() }
          : strain
      )
    )
    console.log(`Updated strain ${strainId} status to ${status}`)
  }

  const boostStrain = async (strainId: string) => {
    setStrains(prev =>
      prev.map(strain =>
        strain.id === strainId
          ? { ...strain, isBoosted: true, infectionRate: Math.min(strain.infectionRate + 20, 100) }
          : strain
      )
    )
    console.log(`Boosted strain ${strainId}`)
  }

  const pauseStrain = async (strainId: string) => {
    await updateStrainStatus(strainId, 'paused')
  }

  const resumeStrain = async (strainId: string) => {
    await updateStrainStatus(strainId, 'active')
  }

  const getStrainStats = (strainId: string): StrainStats => {
    const strain = strains.find(s => s.id === strainId)
    if (!strain) {
      return {
        dailyInfections: 0,
        weeklyGrowth: 0,
        completionTime: '未知',
        successRate: 0
      }
    }

    return {
      dailyInfections: Math.round(strain.totalInfections / 7),
      weeklyGrowth: 15,
      completionTime: strain.estimatedCompletion
        ? new Date(strain.estimatedCompletion).toLocaleDateString('zh-CN')
        : '未知',
      successRate: Math.min(strain.infectionRate + 20, 100)
    }
  }

  const value = {
    strains,
    updateStrainStatus,
    boostStrain,
    pauseStrain,
    resumeStrain,
    getStrainStats
  }

  return (
    <StrainStatusContext.Provider value={value}>
      {children}
    </StrainStatusContext.Provider>
  )
}

export function useStrainStatus() {
  const context = useContext(StrainStatusContext)
  if (!context) {
    throw new Error('useStrainStatus must be used within a StrainStatusProvider')
  }
  return context
}

interface StrainStatusManagerProps {
  className?: string
}

export default function StrainStatusManager({ className }: StrainStatusManagerProps) {
  const {
    strains,
    updateStrainStatus,
    boostStrain,
    pauseStrain,
    resumeStrain,
    getStrainStats
  } = useStrainStatus()

  const getStatusColor = (status: StrainStatus['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'dormant':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-purple-100 text-purple-800'
      case 'expired':
        return 'bg-red-100 text-red-800'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: StrainStatus['status']) => {
    switch (status) {
      case 'active':
        return <Play className="w-4 h-4" />
      case 'dormant':
        return <Clock className="w-4 h-4" />
      case 'completed':
        return <CheckCircle className="w-4 h-4" />
      case 'expired':
        return <AlertTriangle className="w-4 h-4" />
      case 'paused':
        return <Pause className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getStatusText = (status: StrainStatus['status']) => {
    switch (status) {
      case 'active':
        return '活跃中'
      case 'dormant':
        return '休眠中'
      case 'completed':
        return '已完成'
      case 'expired':
        return '已过期'
      case 'paused':
        return '已暂停'
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
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            毒株状态概览
          </CardTitle>
          <CardDescription>
            所有毒株的生命周期状态和统计信息
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">
                {strains.filter(s => s.status === 'active').length}
              </div>
              <div className="text-xs text-green-800">活跃中</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">
                {strains.filter(s => s.status === 'dormant').length}
              </div>
              <div className="text-xs text-blue-800">休眠中</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-600">
                {strains.filter(s => s.status === 'completed').length}
              </div>
              <div className="text-xs text-purple-800">已完成</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-lg font-bold text-yellow-600">
                {strains.filter(s => s.status === 'paused').length}
              </div>
              <div className="text-xs text-yellow-800">已暂停</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-lg font-bold text-red-600">
                {strains.filter(s => s.status === 'expired').length}
              </div>
              <div className="text-xs text-red-800">已过期</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strain Status List */}
      <Card>
        <CardHeader>
          <CardTitle>毒株状态管理</CardTitle>
          <CardDescription>
            管理每个毒株的生命周期状态
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {strains.map(strain => {
              const stats = getStrainStats(strain.id)

              return (
                <div
                  key={strain.id}
                  className="p-4 border rounded-lg space-y-3"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-lg">{strain.title}</h3>
                        <Badge variant="outline">{strain.type}</Badge>
                        <Badge className={getStatusColor(strain.status)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(strain.status)}
                            <span>{getStatusText(strain.status)}</span>
                          </div>
                        </Badge>
                        {strain.isBoosted && (
                          <Badge className="bg-orange-100 text-orange-800">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            已加速
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        创建于 {new Date(strain.createdAt).toLocaleDateString('zh-CN')} •
                        最后活动 {getTimeAgo(strain.lastActivity)}
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>传播进度</span>
                      <span className="font-medium">{strain.progress}%</span>
                    </div>
                    <Progress value={strain.progress} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>等级 {strain.currentLevel}/{strain.totalLevels}</span>
                      <span>感染率 {strain.infectionRate}%</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <div>
                        <div className="font-medium">{formatNumber(strain.totalInfections)}</div>
                        <div className="text-xs text-gray-600">总感染</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <div>
                        <div className="font-medium">{stats.dailyInfections}</div>
                        <div className="text-xs text-gray-600">日均感染</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      <div>
                        <div className="font-medium">{stats.completionTime}</div>
                        <div className="text-xs text-gray-600">预计完成</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-orange-600" />
                      <div>
                        <div className="font-medium">{stats.successRate}%</div>
                        <div className="text-xs text-gray-600">成功率</div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 pt-2">
                    {strain.status === 'active' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => pauseStrain(strain.id)}
                        >
                          <Pause className="w-4 h-4 mr-1" />
                          暂停
                        </Button>
                        {!strain.isBoosted && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => boostStrain(strain.id)}
                          >
                            <TrendingUp className="w-4 h-4 mr-1" />
                            加速传播
                          </Button>
                        )}
                      </>
                    )}
                    {strain.status === 'paused' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resumeStrain(strain.id)}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        恢复传播
                      </Button>
                    )}
                    {strain.status === 'dormant' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateStrainStatus(strain.id, 'active')}
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        激活
                      </Button>
                    )}
                    {strain.canBeModified && (
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