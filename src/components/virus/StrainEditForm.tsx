"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Save,
  X,
  Trash2,
  Eye,
  MapPin,
  Clock,
  Users,
  Tag,
  AlertTriangle,
  CheckCircle,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Strain {
  id: string
  title: string
  type: '生活毒株' | '观点毒株' | '兴趣毒株' | '超级毒株'
  description: string
  content: string
  tags: string[]
  location: string
  spreadDelay: number
  isActive: boolean
  infectionRate: number
  currentLevel: number
  createdAt: string
  updatedAt: string
}

interface StrainEditFormProps {
  strain: Strain
  onSave?: (updatedStrain: Strain) => void
  onCancel?: () => void
  onDelete?: (strainId: string) => void
  onPreview?: (strain: Strain) => void
  className?: string
}

export default function StrainEditForm({
  strain,
  onSave,
  onCancel,
  onDelete,
  onPreview,
  className
}: StrainEditFormProps) {
  const [formData, setFormData] = useState<Strain>(strain)
  const [isLoading, setIsLoading] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.title.trim()) {
      errors.title = '毒株标题不能为空'
    } else if (formData.title.length < 3) {
      errors.title = '标题至少需要3个字符'
    }

    if (!formData.description.trim()) {
      errors.description = '描述不能为空'
    } else if (formData.description.length < 10) {
      errors.description = '描述至少需要10个字符'
    }

    if (!formData.location.trim()) {
      errors.location = '地理位置不能为空'
    }

    if (formData.spreadDelay < 0) {
      errors.spreadDelay = '传播延迟不能为负数'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (field: keyof Strain, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      const updatedStrain = {
        ...formData,
        updatedAt: new Date().toISOString()
      }

      onSave?.(updatedStrain)
    } catch (error) {
      console.error('Failed to save strain:', error)
    } finally {
      setIsLoading(false)
    }
  }

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

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>编辑毒株</CardTitle>
              <CardDescription>
                修改毒株信息和管理传播设置
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => onPreview?.(formData)}
                className="flex items-center"
              >
                <Eye className="w-4 h-4 mr-2" />
                预览
              </Button>
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                取消
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="flex items-center"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    保存
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>基本信息</CardTitle>
          <CardDescription>
            设置毒株的基本属性和描述
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">毒株标题 *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="输入毒株标题"
              className={validationErrors.title ? "border-red-500" : ""}
            />
            {validationErrors.title && (
              <p className="text-sm text-red-500">{validationErrors.title}</p>
            )}
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label>毒株类型</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {['生活毒株', '观点毒株', '兴趣毒株', '超级毒株'].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleInputChange('type', type as Strain['type'])}
                  className={cn(
                    "p-3 border rounded-lg text-center transition-all",
                    formData.type === type
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className="text-sm font-medium">{type}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">描述 *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="描述毒株的内容和特点"
              rows={3}
              className={validationErrors.description ? "border-red-500" : ""}
            />
            {validationErrors.description && (
              <p className="text-sm text-red-500">{validationErrors.description}</p>
            )}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">详细内容</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="输入毒株的详细内容..."
              rows={6}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Tag className="w-5 h-5 mr-2" />
            标签管理
          </CardTitle>
          <CardDescription>
            添加标签帮助用户更好地发现你的毒株
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="输入新标签"
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
            />
            <Button onClick={handleAddTag} variant="outline">
              添加
            </Button>
          </div>

          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center">
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Spread Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            传播设置
          </CardTitle>
          <CardDescription>
            配置毒株的地理传播参数
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">地理位置 *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="输入传播起始位置"
              className={validationErrors.location ? "border-red-500" : ""}
            />
            {validationErrors.location && (
              <p className="text-sm text-red-500">{validationErrors.location}</p>
            )}
          </div>

          {/* Spread Delay */}
          <div className="space-y-2">
            <Label htmlFor="spreadDelay">传播延迟 (小时) *</Label>
            <div className="flex items-center space-x-3">
              <Input
                id="spreadDelay"
                type="number"
                min="0"
                max="168"
                value={formData.spreadDelay}
                onChange={(e) => handleInputChange('spreadDelay', parseInt(e.target.value) || 0)}
                className={validationErrors.spreadDelay ? "border-red-500" : ""}
              />
              <span className="text-sm text-gray-600">小时</span>
            </div>
            {validationErrors.spreadDelay && (
              <p className="text-sm text-red-500">{validationErrors.spreadDelay}</p>
            )}
            <p className="text-xs text-gray-500">
              设置毒株在不同层级间传播的时间间隔
            </p>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>毒株状态</Label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={formData.isActive}
                  onChange={() => handleInputChange('isActive', true)}
                  className="rounded"
                />
                <span className="flex items-center text-green-600">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  活跃中
                </span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={!formData.isActive}
                  onChange={() => handleInputChange('isActive', false)}
                  className="rounded"
                />
                <span className="flex items-center text-gray-600">
                  <X className="w-4 h-4 mr-1" />
                  已结束
                </span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            当前统计
          </CardTitle>
          <CardDescription>
            毒株的传播数据和状态（只读）
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>感染率</Label>
              <div className="flex items-center space-x-2">
                <Progress value={formData.infectionRate} className="flex-1" />
                <span className="text-sm font-medium">{formData.infectionRate}%</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>传播层级</Label>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium">{getLevelName(formData.currentLevel)}</span>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-600 space-y-1">
            <div>创建时间: {new Date(formData.createdAt).toLocaleString('zh-CN')}</div>
            <div>最后更新: {new Date(formData.updatedAt).toLocaleString('zh-CN')}</div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertTriangle className="w-5 h-5 mr-2" />
            危险操作
          </CardTitle>
          <CardDescription>
            这些操作无法撤销，请谨慎使用
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-red-800">删除毒株</h4>
              <p className="text-sm text-red-600">
                永久删除此毒株及其所有传播数据
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => onDelete?.(strain.id)}
              className="flex items-center"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              删除毒株
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}