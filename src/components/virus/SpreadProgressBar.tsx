"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Clock, MapPin, Users, TrendingUp, Target, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SpreadProgressData {
  id: string
  title: string
  currentLevel: number
  totalLevels: number
  progress: number
  infectionRate: number
  totalInfections: number
  estimatedCompletionTime?: string
  currentPhase: '小区' | '街道' | '行政区' | '城市' | '国家' | '全球'
  nextPhase: '小区' | '街道' | '行政区' | '城市' | '国家' | '全球'
  phaseProgress: number
  unlockConditions: {
    requiredInfections: number
    currentInfections: number
    requiredTime?: string
    isUnlocked: boolean
  }
  spreadSpeed: 'slow' | 'normal' | 'fast' | 'viral'
  isBoosted: boolean
}

interface SpreadProgressBarProps {
  data: SpreadProgressData
  className?: string
  showDetails?: boolean
}

export default function SpreadProgressBar({ data, className, showDetails = true }: SpreadProgressBarProps) {
  const getPhaseColor = (phase: SpreadProgressData['currentPhase']) => {
    switch (phase) {
      case '小区':
        return 'bg-blue-100 text-blue-800'
      case '街道':
        return 'bg-green-100 text-green-800'
      case '行政区':
        return 'bg-yellow-100 text-yellow-800'
      case '城市':
        return 'bg-orange-100 text-orange-800'
      case '国家':
        return 'bg-red-100 text-red-800'
      case '全球':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getSpreadSpeedColor = (speed: SpreadProgressData['spreadSpeed']) => {
    switch (speed) {
      case 'slow':
        return 'text-gray-600'
      case 'normal':
        return 'text-green-600'
      case 'fast':
        return 'text-orange-600'
      case 'viral':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getSpreadSpeedIcon = (speed: SpreadProgressData['spreadSpeed']) => {
    switch (speed) {
      case 'slow':
        return <Clock className="w-4 h-4" />
      case 'normal':
        return <TrendingUp className="w-4 h-4" />
      case 'fast':
        return <Target className="w-4 h-4" />
      case 'viral':
        return <Users className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getSpreadSpeedText = (speed: SpreadProgressData['spreadSpeed']) => {
    switch (speed) {
      case 'slow':
        return '缓慢传播'
      case 'normal':
        return '正常传播'
      case 'fast':
        return '快速传播'
      case 'viral':
        return '病毒式传播'
      default:
        return '未知'
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const getTimeRemaining = (completionTime?: string) => {
    if (!completionTime) return '未知'

    const now = new Date()
    const target = new Date(completionTime)
    const diffMs = target.getTime() - now.getTime()

    if (diffMs <= 0) return '已完成'

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) return `${days}天${hours}小时`
    if (hours > 0) return `${hours}小时`
    return '小于1小时'
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{data.title}</CardTitle>
            <CardDescription className="flex items-center space-x-2 mt-1">
              <Badge className={getPhaseColor(data.currentPhase)}>
                <MapPin className="w-3 h-3 mr-1" />
                {data.currentPhase}
              </Badge>
              <Badge className={getSpreadSpeedColor(data.spreadSpeed)}>
                <div className="flex items-center space-x-1">
                  {getSpreadSpeedIcon(data.spreadSpeed)}
                  <span>{getSpreadSpeedText(data.spreadSpeed)}</span>
                </div>
              </Badge>
              {data.isBoosted && (
                <Badge className="bg-orange-100 text-orange-800">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  已加速
                </Badge>
              )}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{data.progress}%</div>
            <div className="text-sm text-gray-600">总体进度</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>总体传播进度</span>
            <span className="font-medium">
              等级 {data.currentLevel}/{data.totalLevels}
            </span>
          </div>
          <Progress value={data.progress} className="h-3" />
        </div>

        {/* Phase Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>当前阶段进度</span>
            <span className="font-medium">{data.phaseProgress}%</span>
          </div>
          <Progress value={data.phaseProgress} className="h-2" />
          <div className="flex justify-between text-xs text-gray-600">
            <span>{data.currentPhase}</span>
            <span>→ {data.nextPhase}</span>
          </div>
        </div>

        {showDetails && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="font-medium">{formatNumber(data.totalInfections)}</div>
                  <div className="text-xs text-gray-600">总感染人数</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <div>
                  <div className="font-medium">{data.infectionRate}%</div>
                  <div className="text-xs text-gray-600">感染率</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-purple-600" />
                <div>
                  <div className="font-medium">{getTimeRemaining(data.estimatedCompletionTime)}</div>
                  <div className="text-xs text-gray-600">预计完成</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-orange-600" />
                <div>
                  <div className="font-medium">
                    {formatNumber(data.unlockConditions.currentInfections)}/
                    {formatNumber(data.unlockConditions.requiredInfections)}
                  </div>
                  <div className="text-xs text-gray-600">解锁条件</div>
                </div>
              </div>
            </div>

            {/* Unlock Conditions */}
            <div className="border-t pt-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">解锁下一阶段</span>
                {data.unlockConditions.isUnlocked ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    已解锁
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    {Math.round((data.unlockConditions.currentInfections / data.unlockConditions.requiredInfections) * 100)}%
                  </Badge>
                )}
              </div>
              <div className="mt-2 text-xs text-gray-600">
                需要 {formatNumber(data.unlockConditions.requiredInfections)} 感染人数
                {data.unlockConditions.requiredTime && (
                  <span> • 或等待至 {data.unlockConditions.requiredTime}</span>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}