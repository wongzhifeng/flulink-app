"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  MapPin,
  Clock,
  Users,
  Tag,
  Zap,
  Eye,
  Edit,
  Share,
  BarChart3,
  Calendar
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface StrainPreviewProps {
  strain: {
    id: string
    title: string
    type: '生活毒株' | '观点毒株' | '兴趣毒株' | '超级毒株'
    description: string
    tags: string[]
    location: string
    spreadDelay: number
    createdAt: string
    infectionRate: number
    currentLevel: number
    isActive: boolean
    totalInfections: number
    views: number
    likes: number
  }
  onViewDetails?: (strainId: string) => void
  onEdit?: (strainId: string) => void
  onShare?: (strainId: string) => void
  compact?: boolean
  className?: string
}

export default function StrainPreview({
  strain,
  onViewDetails,
  onEdit,
  onShare,
  compact = false,
  className
}: StrainPreviewProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case '生活毒株':
        return 'bg-blue-100 text-blue-800'
      case '观点毒株':
        return 'bg-purple-100 text-purple-800'
      case '兴趣毒株':
        return 'bg-green-100 text-green-800'
      case '超级毒株':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getLevelName = (level: number) => {
    switch (level) {
      case 1:
        return '本小区'
      case 2:
        return '临近小区'
      case 3:
        return '所属街道'
      case 4:
        return '行政区/城市'
      case 5:
        return '跨国传播'
      default:
        return '未知'
    }
  }

  const getInfectionProgressColor = (rate: number) => {
    if (rate < 30) return 'bg-red-500'
    if (rate < 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  if (compact) {
    return (
      <Card className={cn("hover:shadow-md transition-shadow cursor-pointer", className)}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-semibold text-sm truncate">{strain.title}</h3>
                <Badge variant="outline" className={cn("text-xs", getTypeColor(strain.type))}>
                  {strain.type}
                </Badge>
              </div>

              <div className="flex items-center space-x-4 text-xs text-gray-600">
                <div className="flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  <span>{strain.location}</span>
                </div>
                <div className="flex items-center">
                  <Zap className="w-3 h-3 mr-1" />
                  <span>{getLevelName(strain.currentLevel)}</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-3 h-3 mr-1" />
                  <span>{strain.totalInfections}</span>
                </div>
              </div>

              {/* Infection Progress */}
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">传播进度</span>
                  <span className="font-medium">{strain.infectionRate}%</span>
                </div>
                <Progress
                  value={strain.infectionRate}
                  className={cn("h-1", getInfectionProgressColor(strain.infectionRate))}
                />
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDetails?.(strain.id)}
              className="ml-2"
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center">
              {strain.title}
              <Badge variant="outline" className={cn("ml-2", getTypeColor(strain.type))}>
                {strain.type}
              </Badge>
              {!strain.isActive && (
                <Badge variant="outline" className="ml-2 bg-gray-100 text-gray-600">
                  已结束
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-1">
              {strain.description}
            </CardDescription>
          </div>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDetails?.(strain.id)}
              className="flex items-center"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit?.(strain.id)}
              className="flex items-center"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onShare?.(strain.id)}
              className="flex items-center"
            >
              <Share className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Tags */}
        {strain.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {strain.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs flex items-center">
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-gray-500" />
            <div>
              <div className="font-medium">{strain.location}</div>
              <div className="text-xs text-gray-500">位置</div>
            </div>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2 text-gray-500" />
            <div>
              <div className="font-medium">{strain.spreadDelay}小时</div>
              <div className="text-xs text-gray-500">传播延迟</div>
            </div>
          </div>
          <div className="flex items-center">
            <Zap className="w-4 h-4 mr-2 text-gray-500" />
            <div>
              <div className="font-medium">{getLevelName(strain.currentLevel)}</div>
              <div className="text-xs text-gray-500">当前层级</div>
            </div>
          </div>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-gray-500" />
            <div>
              <div className="font-medium">
                {new Date(strain.createdAt).toLocaleDateString('zh-CN')}
              </div>
              <div className="text-xs text-gray-500">创建时间</div>
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-xl font-bold text-blue-600">{strain.totalInfections}</div>
            <div className="text-xs text-blue-800">总感染数</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-xl font-bold text-green-600">{strain.infectionRate}%</div>
            <div className="text-xs text-green-800">感染率</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-xl font-bold text-purple-600">{strain.views}</div>
            <div className="text-xs text-purple-800">浏览量</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-xl font-bold text-orange-600">{strain.likes}</div>
            <div className="text-xs text-orange-800">点赞数</div>
          </div>
        </div>

        {/* Infection Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm">
              <BarChart3 className="w-4 h-4 mr-2 text-gray-500" />
              <span className="font-medium">传播进度</span>
            </div>
            <span className="text-sm font-medium">{strain.infectionRate}%</span>
          </div>
          <Progress
            value={strain.infectionRate}
            className={cn("h-3", getInfectionProgressColor(strain.infectionRate))}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>开始传播</span>
            <span>完全传播</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex justify-center space-x-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails?.(strain.id)}
            className="flex items-center"
          >
            <Eye className="w-4 h-4 mr-1" />
            查看详情
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit?.(strain.id)}
            className="flex items-center"
          >
            <Edit className="w-4 h-4 mr-1" />
            编辑
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onShare?.(strain.id)}
            className="flex items-center"
          >
            <Share className="w-4 h-4 mr-1" />
            分享
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}