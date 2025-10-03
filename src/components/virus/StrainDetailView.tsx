"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  MapPin,
  Clock,
  Users,
  Activity,
  TrendingUp,
  Tag,
  Edit,
  Share,
  Zap,
  BarChart3,
  Calendar,
  Eye,
  Heart,
  MessageCircle,
  Copy
} from 'lucide-react'
import { cn } from '@/lib/utils'
import GeographicSpreadProgress from './GeographicSpreadProgress'

interface StrainDetail {
  id: string
  title: string
  type: '生活毒株' | '观点毒株' | '兴趣毒株' | '超级毒株'
  description: string
  content: string
  tags: string[]
  location: string
  spreadDelay: number
  createdAt: string
  updatedAt: string
  isActive: boolean

  // Stats
  infectionRate: number
  totalInfections: number
  currentLevel: number
  views: number
  likes: number
  comments: number
  shares: number

  // Spread Data
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

  // Author
  author: {
    id: string
    username: string
    displayName: string
    tier: 'free' | 'premium'
  }

  // Mutations
  mutations: Array<{
    id: string
    name: string
    description: string
    createdAt: string
    successRate: number
  }>
}

interface StrainDetailViewProps {
  strain: StrainDetail
  onEdit?: (strain: StrainDetail) => void
  onShare?: (strain: StrainDetail) => void
  onLike?: (strainId: string) => void
  onComment?: (strainId: string) => void
  className?: string
}

export default function StrainDetailView({
  strain,
  onEdit,
  onShare,
  onLike,
  onComment,
  className
}: StrainDetailViewProps) {
  const [isLiked, setIsLiked] = useState(false)

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

  const handleLike = () => {
    setIsLiked(!isLiked)
    onLike?.(strain.id)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    // TODO: Show success message
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div className="flex-1 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{strain.title}</h1>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="outline" className={getTypeColor(strain.type)}>
                      {strain.type}
                    </Badge>
                    {!strain.isActive && (
                      <Badge variant="outline" className="bg-gray-100 text-gray-600">
                        已结束
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit?.(strain)}
                    className="flex items-center"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    编辑
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onShare?.(strain)}
                    className="flex items-center"
                  >
                    <Share className="w-4 h-4 mr-1" />
                    分享
                  </Button>
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed">{strain.description}</p>

              {/* Content */}
              {strain.content && (
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{strain.content}</p>
                </div>
              )}

              {/* Tags */}
              {strain.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {strain.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                  <span>{strain.location}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-gray-500" />
                  <span>{strain.spreadDelay}小时延迟</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                  <span>{new Date(strain.createdAt).toLocaleDateString('zh-CN')}</span>
                </div>
                <div className="flex items-center">
                  <Zap className="w-4 h-4 mr-2 text-gray-500" />
                  <span>{getLevelName(strain.currentLevel)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Engagement Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            传播数据
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{strain.totalInfections}</div>
              <div className="text-sm text-gray-600">总感染数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{strain.infectionRate}%</div>
              <div className="text-sm text-gray-600">感染率</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{strain.views}</div>
              <div className="text-sm text-gray-600">浏览量</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{strain.likes}</div>
              <div className="text-sm text-gray-600">点赞数</div>
            </div>
          </div>

          {/* Engagement Actions */}
          <div className="flex justify-center space-x-4 mt-6 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleLike}
              className={cn("flex items-center", isLiked && "text-red-600 border-red-200")}
            >
              <Heart className={cn("w-4 h-4 mr-2", isLiked && "fill-current")} />
              {isLiked ? '已点赞' : '点赞'}
            </Button>
            <Button
              variant="outline"
              onClick={() => onComment?.(strain.id)}
              className="flex items-center"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              评论 ({strain.comments})
            </Button>
            <Button
              variant="outline"
              onClick={handleCopyLink}
              className="flex items-center"
            >
              <Copy className="w-4 h-4 mr-2" />
              复制链接
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Geographic Spread Progress */}
      <GeographicSpreadProgress
        strainId={strain.id}
        currentLevel={strain.currentLevel}
        infectionData={strain.infectionData}
        unlockConditions={strain.unlockConditions}
        spreadDelay={strain.spreadDelay}
        isSuperFlu={strain.type === '超级毒株'}
      />

      {/* Detailed Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            详细统计
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Infection Progress by Level */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">各层级感染进度</h4>
              {Object.entries(strain.infectionData).map(([level, count]) => (
                <div key={level} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 capitalize">
                      {level === 'neighborhood' ? '本小区' :
                       level === 'nearbyNeighborhoods' ? '临近小区' :
                       level === 'street' ? '所属街道' :
                       level === 'district' ? '行政区' :
                       level === 'city' ? '城市' : '跨国'}
                    </span>
                    <span className="text-gray-900 font-medium">
                      {count} 人
                    </span>
                  </div>
                  <Progress
                    value={(count / (strain.unlockConditions[level as keyof typeof strain.unlockConditions]?.required || 100)) * 100}
                    className="h-2"
                  />
                </div>
              ))}
            </div>

            {/* Growth Metrics */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">增长指标</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">日增长率</span>
                  <span className="text-green-600 font-medium">+12.5%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">传播速度</span>
                  <span className="text-blue-600 font-medium">中等</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">变异潜力</span>
                  <span className="text-purple-600 font-medium">高</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">生命周期</span>
                  <span className="text-orange-600 font-medium">7天</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mutations */}
      {strain.mutations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              变异历史
            </CardTitle>
            <CardDescription>
              此毒株的变异记录
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {strain.mutations.map((mutation) => (
                <div key={mutation.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="font-semibold">{mutation.name}</h5>
                      <p className="text-sm text-gray-600">{mutation.description}</p>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      {mutation.successRate}% 成功率
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {new Date(mutation.createdAt).toLocaleDateString('zh-CN')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Author Info */}
      <Card>
        <CardHeader>
          <CardTitle>创建者信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
              {strain.author.displayName[0]}
            </div>
            <div>
              <h4 className="font-semibold">{strain.author.displayName}</h4>
              <p className="text-sm text-gray-600">@{strain.author.username}</p>
              <Badge variant={strain.author.tier === 'premium' ? "default" : "outline"} className="mt-1">
                {strain.author.tier === 'premium' ? '高级用户' : '免费用户'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}