"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Clock, MapPin, Users, TrendingUp, AlertTriangle, CheckCircle, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SpreadDelayData {
  id: string
  title: string
  currentDelay: number // 小时
  maxDelay: number // 小时
  delayProgress: number // 百分比
  estimatedCompletionTime: string
  affectedRegions: number
  totalRegions: number
  delayType: 'geographic' | 'temporal' | 'network' | 'immunity'
  delayFactors: {
    name: string
    impact: 'low' | 'medium' | 'high' | 'critical'
    description: string
  }[]
  isAccelerated: boolean
  accelerationOptions: {
    name: string
    cost: number
    effect: string
    isAvailable: boolean
  }[]
}

interface SpreadDelayVisualizationProps {
  data: SpreadDelayData
  className?: string
  onAccelerate?: (optionId: string) => void
}

export default function SpreadDelayVisualization({
  data,
  className,
  onAccelerate
}: SpreadDelayVisualizationProps) {
  const getDelayTypeColor = (type: SpreadDelayData['delayType']) => {
    switch (type) {
      case 'geographic':
        return 'bg-blue-100 text-blue-800'
      case 'temporal':
        return 'bg-green-100 text-green-800'
      case 'network':
        return 'bg-purple-100 text-purple-800'
      case 'immunity':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getDelayTypeText = (type: SpreadDelayData['delayType']) => {
    switch (type) {
      case 'geographic':
        return '地理延迟'
      case 'temporal':
        return '时间延迟'
      case 'network':
        return '网络延迟'
      case 'immunity':
        return '免疫延迟'
      default:
        return '未知延迟'
    }
  }

  const getImpactColor = (impact: 'low' | 'medium' | 'high' | 'critical') => {
    switch (impact) {
      case 'low':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'critical':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getImpactIcon = (impact: 'low' | 'medium' | 'high' | 'critical') => {
    switch (impact) {
      case 'low':
        return <CheckCircle className="w-3 h-3" />
      case 'medium':
        return <AlertTriangle className="w-3 h-3" />
      case 'high':
        return <AlertTriangle className="w-3 h-3" />
      case 'critical':
        return <AlertTriangle className="w-3 h-3" />
      default:
        return <Clock className="w-3 h-3" />
    }
  }

  const formatTimeRemaining = (completionTime: string) => {
    const now = new Date()
    const target = new Date(completionTime)
    const diffMs = target.getTime() - now.getTime()

    if (diffMs <= 0) return '已完成'

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) return `${days}天${hours}小时`
    if (hours > 0) return `${hours}小时${minutes}分钟`
    return `${minutes}分钟`
  }

  const formatDelayTime = (hours: number) => {
    if (hours >= 24) {
      const days = Math.floor(hours / 24)
      const remainingHours = hours % 24
      return `${days}天${remainingHours > 0 ? `${remainingHours}小时` : ''}`
    }
    return `${hours}小时`
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{data.title}</CardTitle>
            <CardDescription className="flex items-center space-x-2 mt-1">
              <Badge className={getDelayTypeColor(data.delayType)}>
                <Clock className="w-3 h-3 mr-1" />
                {getDelayTypeText(data.delayType)}
              </Badge>
              {data.isAccelerated && (
                <Badge className="bg-orange-100 text-orange-800">
                  <Zap className="w-3 h-3 mr-1" />
                  已加速
                </Badge>
              )}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {formatDelayTime(data.currentDelay)}
            </div>
            <div className="text-sm text-gray-600">剩余延迟</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Delay Progress */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>延迟进度</span>
            <span className="font-medium">{data.delayProgress}%</span>
          </div>
          <Progress value={data.delayProgress} className="h-3" />
          <div className="flex justify-between text-xs text-gray-600">
            <span>开始</span>
            <span>预计完成: {formatTimeRemaining(data.estimatedCompletionTime)}</span>
          </div>
        </div>

        {/* Affected Regions */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <div>
              <div className="font-medium">
                {data.affectedRegions}/{data.totalRegions}
              </div>
              <div className="text-xs text-gray-600">受影响区域</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-green-600" />
            <div>
              <div className="font-medium">
                {Math.round((data.affectedRegions / data.totalRegions) * 100)}%
              </div>
              <div className="text-xs text-gray-600">覆盖比例</div>
            </div>
          </div>
        </div>

        {/* Delay Factors */}
        <div className="border-t pt-4">
          <h4 className="font-medium text-sm mb-3">延迟因素</h4>
          <div className="space-y-2">
            {data.delayFactors.map((factor, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Badge className={getImpactColor(factor.impact)}>
                    <div className="flex items-center space-x-1">
                      {getImpactIcon(factor.impact)}
                      <span className="capitalize">{factor.impact}</span>
                    </div>
                  </Badge>
                  <span>{factor.name}</span>
                </div>
                <div className="text-xs text-gray-600 max-w-[200px] text-right">
                  {factor.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Acceleration Options */}
        {data.accelerationOptions.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="font-medium text-sm mb-3">加速选项</h4>
            <div className="space-y-2">
              {data.accelerationOptions.map((option, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-3 border rounded-lg cursor-pointer transition-colors",
                    option.isAvailable
                      ? "hover:bg-gray-50"
                      : "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => option.isAvailable && onAccelerate?.(option.name)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">{option.name}</div>
                      <div className="text-xs text-gray-600">{option.effect}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{option.cost} 点数</Badge>
                      {option.isAvailable ? (
                        <Zap className="w-4 h-4 text-orange-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timeline Visualization */}
        <div className="border-t pt-4">
          <h4 className="font-medium text-sm mb-3">传播时间线</h4>
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="text-center">
              <div className="font-medium">开始</div>
              <div>现在</div>
            </div>
            <div className="flex-1 mx-4">
              <div className="relative">
                <div className="h-1 bg-gray-200 rounded-full">
                  <div
                    className="h-1 bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${data.delayProgress}%` }}
                  />
                </div>
                <div
                  className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-sm"
                  style={{ left: `${data.delayProgress}%` }}
                />
              </div>
            </div>
            <div className="text-center">
              <div className="font-medium">完成</div>
              <div>{formatTimeRemaining(data.estimatedCompletionTime)}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}