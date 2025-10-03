"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { MapPin, Clock, Users, CheckCircle, Lock, Zap } from 'lucide-react'

interface GeographicLevel {
  level: number
  name: string
  description: string
  delay: string
  unlockCondition: string
  isUnlocked: boolean
  isCurrent: boolean
  infectionRate?: number
  requiredInfectionRate?: number
}

interface GeographicSpreadProgressProps {
  strainId: string
  currentLevel: number
  infectionData: {
    neighborhood: number
    nearbyNeighborhoods: number
    street: number
    district: number
    city: number
    international: number
  }
  unlockConditions: {
    neighborhood: { required: number; current: number }
    nearbyNeighborhoods: { required: number; current: number }
    street: { required: number; current: number }
    district: { required: number; current: number }
    city: { required: number; current: number }
    international: { required: number; current: number }
  }
  spreadDelay: number
  isSuperFlu?: boolean
}

export default function GeographicSpreadProgress({
  strainId,
  currentLevel,
  infectionData,
  unlockConditions,
  spreadDelay,
  isSuperFlu = false
}: GeographicSpreadProgressProps) {
  const geographicLevels: GeographicLevel[] = [
    {
      level: 1,
      name: '本小区',
      description: '用户实时定位所属小区',
      delay: '0延迟',
      unlockCondition: '发布即可解锁',
      isUnlocked: true,
      isCurrent: currentLevel === 1,
      infectionRate: infectionData.neighborhood,
      requiredInfectionRate: unlockConditions.neighborhood.required
    },
    {
      level: 2,
      name: '临近小区',
      description: '步行15分钟可达的小区',
      delay: '5-15分钟',
      unlockCondition: `本小区感染人数≥${unlockConditions.nearbyNeighborhoods.required}人或感染率≥30%`,
      isUnlocked: currentLevel >= 2,
      isCurrent: currentLevel === 2,
      infectionRate: infectionData.nearbyNeighborhoods,
      requiredInfectionRate: unlockConditions.nearbyNeighborhoods.required
    },
    {
      level: 3,
      name: '所属街道',
      description: '小区所在行政街道',
      delay: '30-60分钟',
      unlockCondition: `临近小区中≥2个感染人数≥${unlockConditions.street.required}人`,
      isUnlocked: currentLevel >= 3,
      isCurrent: currentLevel === 3,
      infectionRate: infectionData.street,
      requiredInfectionRate: unlockConditions.street.required
    },
    {
      level: 4,
      name: '行政区/城市',
      description: '街道所属行政区或直辖市',
      delay: '2-4小时',
      unlockCondition: `街道内≥3个小区完成传播`,
      isUnlocked: currentLevel >= 4,
      isCurrent: currentLevel === 4,
      infectionRate: infectionData.district,
      requiredInfectionRate: unlockConditions.district.required
    },
    {
      level: 5,
      name: '跨国传播',
      description: '跨城市或国家传播',
      delay: isSuperFlu ? '12-24小时' : '24-48小时',
      unlockCondition: isSuperFlu
        ? '付费用户解锁'
        : `城市层级感染率≥${unlockConditions.international.required}%`,
      isUnlocked: currentLevel >= 5,
      isCurrent: currentLevel === 5,
      infectionRate: infectionData.international,
      requiredInfectionRate: unlockConditions.international.required
    }
  ]

  const getLevelIcon = (level: GeographicLevel) => {
    if (level.isCurrent) {
      return <Zap className="w-4 h-4 text-yellow-500" />
    }
    if (level.isUnlocked) {
      return <CheckCircle className="w-4 h-4 text-green-500" />
    }
    return <Lock className="w-4 h-4 text-gray-400" />
  }

  const getInfectionProgress = (level: GeographicLevel) => {
    if (!level.infectionRate || !level.requiredInfectionRate) return 0
    return Math.min((level.infectionRate / level.requiredInfectionRate) * 100, 100)
  }

  const getLevelStatus = (level: GeographicLevel) => {
    if (level.isCurrent) return '当前传播中'
    if (level.isUnlocked) return '已解锁'
    return '待解锁'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="w-5 h-5 mr-2" />
          地理传播进度
        </CardTitle>
        <CardDescription>
          毒株的地理层级传播进度和状态
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 传播延迟信息 */}
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              当前传播延迟: {spreadDelay}小时
            </span>
          </div>
          {isSuperFlu && (
            <Badge variant="default" className="bg-purple-100 text-purple-800">
              超级流感模式
            </Badge>
          )}
        </div>

        {/* 传播层级进度 */}
        <div className="space-y-4">
          {geographicLevels.map((level) => (
            <div
              key={level.level}
              className={`p-4 rounded-lg border-2 transition-all ${
                level.isCurrent
                  ? 'border-yellow-400 bg-yellow-50'
                  : level.isUnlocked
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-current">
                    {getLevelIcon(level)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      {level.name}
                      {level.isCurrent && (
                        <Badge variant="outline" className="ml-2 text-yellow-600 border-yellow-300">
                          当前
                        </Badge>
                      )}
                    </h3>
                    <p className="text-sm text-gray-600">{level.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <Clock className="w-3 h-3 mr-1" />
                    {level.delay}
                  </div>
                  <Badge
                    variant={level.isUnlocked ? "default" : "outline"}
                    className={level.isUnlocked ? "bg-green-100 text-green-800" : ""}
                  >
                    {getLevelStatus(level)}
                  </Badge>
                </div>
              </div>

              {/* 感染进度 */}
              {level.infectionRate !== undefined && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      感染人数: {level.infectionRate}
                      {level.requiredInfectionRate && ` / ${level.requiredInfectionRate}`}
                    </span>
                    {level.requiredInfectionRate && (
                      <span className="text-gray-500">
                        {Math.round(getInfectionProgress(level))}%
                      </span>
                    )}
                  </div>
                  {level.requiredInfectionRate && (
                    <Progress
                      value={getInfectionProgress(level)}
                      className="h-2"
                    />
                  )}
                </div>
              )}

              {/* 解锁条件 */}
              {!level.isUnlocked && (
                <div className="mt-3 p-2 bg-white rounded border border-gray-200">
                  <p className="text-xs text-gray-600">
                    <strong>解锁条件:</strong> {level.unlockCondition}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 特殊机制提示 */}
        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <h4 className="text-sm font-semibold text-orange-800 mb-1">特殊传播机制</h4>
          <ul className="text-xs text-orange-700 space-y-1">
            <li>• 免疫封锁: 小区24小时不互动，外来毒株延迟翻倍</li>
            <li>• 传播加速: 1小时内本小区感染≥50人，跨层级延迟减半</li>
            <li>• 虚拟定位: 消耗免疫点数切换位置参与目标区域传播</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}