"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X, Plus, MapPin, Clock, Tag } from 'lucide-react'
import { VirusStrain } from '@/context/FluLinkContext'

interface StrainCreationFormProps {
  onCreateStrain: (strain: Omit<VirusStrain, 'id'>) => void
  onCancel?: () => void
  initialData?: Partial<VirusStrain>
}

const STRAIN_TYPES = [
  { value: '生活毒株', label: '生活毒株', description: '日常内容，传播范围窄但互动率高' },
  { value: '观点毒株', label: '观点毒株', description: '话题内容，传播范围广且易引发二次创作' },
  { value: '兴趣毒株', label: '兴趣毒株', description: '垂直内容，传播精准且用户粘性强' },
  { value: '超级毒株', label: '超级毒株', description: '跨国内容，支持跨国传播和休眠唤醒' }
]

const POPULAR_TAGS = [
  '咖啡爱好者', '徒步党', '编程学习', '加班中', '周末宅家', 'emo',
  '同公司', '校友', '同城好友', '职场人', '宝妈', '相机爱好者'
]

export default function StrainCreationForm({
  onCreateStrain,
  onCancel,
  initialData
}: StrainCreationFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    type: initialData?.type || '生活毒株',
    description: initialData?.description || '',
    location: initialData?.location || {
      lat: 39.9042,
      lng: 116.4074,
      radius: 2
    },
    spreadDelay: initialData?.spreadDelay || 24,
    tags: initialData?.tags || []
  })
  const [newTag, setNewTag] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const strainData = {
        ...formData,
        mutations: initialData?.mutations || []
      }

      onCreateStrain(strainData)

      // 重置表单
      setFormData({
        title: '',
        type: '生活毒株',
        description: '',
        location: {
          lat: 39.9042,
          lng: 116.4074,
          radius: 2
        },
        spreadDelay: 24,
        tags: []
      })
    } catch (error) {
      console.error('创建毒株失败:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const addPopularTag = (tag: string) => {
    if (!formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
    }
  }

  const selectedStrainType = STRAIN_TYPES.find(type => type.value === formData.type)

  return (
    <Card>
      <CardHeader>
        <CardTitle>创建新毒株</CardTitle>
        <CardDescription>
          创建一个新的病毒株，开始你的传播之旅
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 毒株基本信息 */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">毒株名称</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="请输入毒株名称"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="type">毒株类型</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择毒株类型" />
                </SelectTrigger>
                <SelectContent>
                  {STRAIN_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-gray-500">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedStrainType && (
                <p className="text-sm text-gray-600 mt-1">
                  {selectedStrainType.description}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description">毒株描述</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="请描述这个毒株的内容和特点"
                rows={3}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* 传播设置 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              传播设置
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lat">纬度</Label>
                <Input
                  id="lat"
                  type="number"
                  step="0.0001"
                  value={formData.location.lat}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, lat: parseFloat(e.target.value) }
                  }))}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label htmlFor="lng">经度</Label>
                <Input
                  id="lng"
                  type="number"
                  step="0.0001"
                  value={formData.location.lng}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, lng: parseFloat(e.target.value) }
                  }))}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="radius">传播半径 (公里)</Label>
              <Input
                id="radius"
                type="number"
                min="1"
                max="100"
                value={formData.location.radius}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  location: { ...prev.location, radius: parseInt(e.target.value) }
                }))}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="spreadDelay" className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                传播延迟 (小时)
              </Label>
              <Input
                id="spreadDelay"
                type="number"
                min="1"
                max="168"
                value={formData.spreadDelay}
                onChange={(e) => setFormData(prev => ({ ...prev, spreadDelay: parseInt(e.target.value) }))}
                disabled={isSubmitting}
              />
              <p className="text-sm text-gray-600 mt-1">
                毒株传播到其他区域的延迟时间
              </p>
            </div>
          </div>

          {/* 标签系统 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Tag className="w-4 h-4 mr-2" />
              易感人群标签
            </h3>

            {/* 已选标签 */}
            {formData.tags.length > 0 && (
              <div>
                <Label>已选标签</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* 添加新标签 */}
            <div>
              <Label htmlFor="newTag">添加标签</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="newTag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="输入新标签"
                  disabled={isSubmitting}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                />
                <Button type="button" onClick={addTag} disabled={isSubmitting || !newTag.trim()}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* 热门标签推荐 */}
            <div>
              <Label>热门标签</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {POPULAR_TAGS.map(tag => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => addPopularTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting || !formData.title.trim()}>
              {isSubmitting ? '创建中...' : '创建毒株'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                取消
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}