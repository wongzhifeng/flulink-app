"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  AlertTriangle,
  Trash2,
  X,
  Users,
  MapPin,
  Clock,
  Zap,
  BarChart3,
  Shield
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Strain {
  id: string
  title: string
  type: '生活毒株' | '观点毒株' | '兴趣毒株' | '超级毒株'
  description: string
  location: string
  spreadDelay: number
  currentLevel: number
  infectionRate: number
  totalInfections: number
  isActive: boolean
  createdAt: string
  stats: {
    views: number
    likes: number
    comments: number
    shares: number
  }
}

interface StrainDeleteConfirmationProps {
  strain: Strain
  onConfirm: (strainId: string) => void
  onCancel: () => void
  isDeleting?: boolean
  className?: string
}

export default function StrainDeleteConfirmation({
  strain,
  onConfirm,
  onCancel,
  isDeleting = false,
  className
}: StrainDeleteConfirmationProps) {
  const [confirmationText, setConfirmationText] = useState('')
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [deleteOptions, setDeleteOptions] = useState({
    deleteData: true,
    notifyFollowers: false,
    archiveInstead: false
  })

  const isConfirmed = confirmationText === strain.title

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

  const getImpactLevel = (): 'low' | 'medium' | 'high' => {
    if (strain.totalInfections < 10) return 'low'
    if (strain.totalInfections < 100) return 'medium'
    return 'high'
  }

  const impactLevel = getImpactLevel()

  const handleDelete = () => {
    if (isConfirmed) {
      onConfirm(strain.id)
    }
  }

  const getImpactColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'high':
        return 'bg-red-100 text-red-800'
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Warning Header */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertTriangle className="w-6 h-6 mr-2" />
            删除毒株确认
          </CardTitle>
          <CardDescription className="text-red-600">
            此操作无法撤销，请谨慎操作
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Strain Information */}
      <Card>
        <CardHeader>
          <CardTitle>毒株信息</CardTitle>
          <CardDescription>
            即将删除的毒株详情
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg">{strain.title}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline" className={getTypeColor(strain.type)}>
                  {strain.type}
                </Badge>
                {strain.isActive && (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    活跃中
                  </Badge>
                )}
              </div>
            </div>
            <Badge variant="outline" className={getImpactColor(impactLevel)}>
              {impactLevel === 'low' ? '低影响' :
               impactLevel === 'medium' ? '中影响' : '高影响'}
            </Badge>
          </div>

          <p className="text-gray-600">{strain.description}</p>

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
              <Zap className="w-4 h-4 mr-2 text-gray-500" />
              <span>{getLevelName(strain.currentLevel)}</span>
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2 text-gray-500" />
              <span>{strain.totalInfections} 感染</span>
            </div>
          </div>

          {/* Infection Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">传播进度</span>
              <span className="font-medium">{strain.infectionRate}%</span>
            </div>
            <Progress value={strain.infectionRate} className="h-2" />
          </div>

          {/* Engagement Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-2 bg-blue-50 rounded">
              <div className="text-lg font-bold text-blue-600">{strain.stats.views}</div>
              <div className="text-xs text-blue-800">浏览量</div>
            </div>
            <div className="text-center p-2 bg-green-50 rounded">
              <div className="text-lg font-bold text-green-600">{strain.stats.likes}</div>
              <div className="text-xs text-green-800">点赞数</div>
            </div>
            <div className="text-center p-2 bg-purple-50 rounded">
              <div className="text-lg font-bold text-purple-600">{strain.stats.comments}</div>
              <div className="text-xs text-purple-800">评论数</div>
            </div>
            <div className="text-center p-2 bg-orange-50 rounded">
              <div className="text-lg font-bold text-orange-600">{strain.stats.shares}</div>
              <div className="text-xs text-orange-800">分享数</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Impact Assessment */}
      <Card className="border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center text-yellow-600">
            <BarChart3 className="w-5 h-5 mr-2" />
            影响评估
          </CardTitle>
          <CardDescription>
            删除此毒株可能带来的影响
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">活跃感染用户</span>
              <span className="font-medium">{strain.totalInfections} 人</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">传播层级</span>
              <span className="font-medium">{getLevelName(strain.currentLevel)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">创建时间</span>
              <span className="font-medium">
                {new Date(strain.createdAt).toLocaleDateString('zh-CN')}
              </span>
            </div>
          </div>

          {impactLevel === 'high' && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-red-600" />
                <span className="text-sm font-medium text-red-800">
                  高影响警告：此毒株已感染大量用户
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation */}
      <Card>
        <CardHeader>
          <CardTitle>确认删除</CardTitle>
          <CardDescription>
            请输入毒株标题 "{strain.title}" 以确认删除
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="confirmation">毒株标题</Label>
            <Input
              id="confirmation"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder={`输入 "${strain.title}"`}
              className={isConfirmed ? "border-green-500" : ""}
            />
            {isConfirmed && (
              <p className="text-sm text-green-600">✓ 确认文本匹配</p>
            )}
          </div>

          {/* Advanced Options */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="flex items-center text-sm text-blue-600 hover:text-blue-700"
            >
              <Shield className="w-4 h-4 mr-1" />
              高级选项 {showAdvancedOptions ? '▲' : '▼'}
            </button>

            {showAdvancedOptions && (
              <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <Label htmlFor="deleteData" className="text-sm">
                    永久删除数据
                  </Label>
                  <input
                    id="deleteData"
                    type="checkbox"
                    checked={deleteOptions.deleteData}
                    onChange={(e) => setDeleteOptions(prev => ({
                      ...prev,
                      deleteData: e.target.checked
                    }))}
                    className="rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="notifyFollowers" className="text-sm">
                    通知关注者
                  </Label>
                  <input
                    id="notifyFollowers"
                    type="checkbox"
                    checked={deleteOptions.notifyFollowers}
                    onChange={(e) => setDeleteOptions(prev => ({
                      ...prev,
                      notifyFollowers: e.target.checked
                    }))}
                    className="rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="archiveInstead" className="text-sm">
                    归档而非删除
                  </Label>
                  <input
                    id="archiveInstead"
                    type="checkbox"
                    checked={deleteOptions.archiveInstead}
                    onChange={(e) => setDeleteOptions(prev => ({
                      ...prev,
                      archiveInstead: e.target.checked
                    }))}
                    className="rounded"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isDeleting}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={!isConfirmed || isDeleting}
              className="flex-1"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  删除中...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  确认删除
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Final Warning */}
      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-800">最终警告</h4>
              <ul className="text-sm text-red-700 space-y-1 mt-1">
                <li>• 此操作无法撤销</li>
                <li>• 所有传播数据将被永久删除</li>
                <li>• 感染用户将失去此毒株的传播记录</li>
                <li>• 变异历史将一并删除</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}