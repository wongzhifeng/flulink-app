"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { User, Mail, MapPin, Calendar, Edit, Save, Camera, Shield, Bell, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UserProfile {
  id: string
  username: string
  email: string
  displayName?: string
  bio?: string
  location?: string
  avatar?: string
  tier: 'free' | 'premium'
  joinDate: string
  stats: {
    strainsCreated: number
    totalInfections: number
    mutationCount: number
    regionsUnlocked: number
  }
  preferences: {
    notifications: boolean
    emailUpdates: boolean
    privacyLevel: 'public' | 'friends' | 'private'
    language: string
  }
}

interface UserProfileFormProps {
  user: UserProfile
  onSave?: (updatedProfile: UserProfile) => void
  onCancel?: () => void
  className?: string
}

export default function UserProfileForm({
  user,
  onSave,
  onCancel,
  className
}: UserProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<UserProfile>(user)
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePreferenceChange = (field: keyof UserProfile['preferences'], value: any) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value
      }
    }))
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      onSave?.(formData)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData(user)
    setIsEditing(false)
    onCancel?.()
  }

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'premium':
        return <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">高级用户</Badge>
      default:
        return <Badge variant="outline">免费用户</Badge>
    }
  }

  const getPrivacyIcon = (level: string) => {
    switch (level) {
      case 'public':
        return <Globe className="w-4 h-4" />
      case 'friends':
        return <User className="w-4 h-4" />
      case 'private':
        return <Shield className="w-4 h-4" />
      default:
        return <Shield className="w-4 h-4" />
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <User className="w-6 h-6 mr-2" />
                个人资料
              </CardTitle>
              <CardDescription>
                管理你的个人信息和偏好设置
              </CardDescription>
            </div>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} className="flex items-center">
                <Edit className="w-4 h-4 mr-2" />
                编辑资料
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                  取消
                </Button>
                <Button onClick={handleSave} disabled={isLoading} className="flex items-center">
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
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar and Basic Info */}
          <div className="flex items-start space-x-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                {formData.displayName?.[0] || formData.username[0]}
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md border">
                  <Camera className="w-4 h-4 text-gray-600" />
                </button>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-2">
                {isEditing ? (
                  <Input
                    value={formData.displayName || ''}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    placeholder="显示名称"
                    className="max-w-xs"
                  />
                ) : (
                  <h3 className="text-xl font-semibold">
                    {formData.displayName || formData.username}
                  </h3>
                )}
                {getTierBadge(formData.tier)}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <User className="w-4 h-4 mr-1" />
                <span>@{formData.username}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-1" />
                <span>加入于 {new Date(formData.joinDate).toLocaleDateString('zh-CN')}</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{formData.stats.strainsCreated}</div>
              <div className="text-sm text-blue-800">创建毒株</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{formData.stats.totalInfections}</div>
              <div className="text-sm text-green-800">总感染数</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{formData.stats.mutationCount}</div>
              <div className="text-sm text-purple-800">变异次数</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{formData.stats.regionsUnlocked}</div>
              <div className="text-sm text-orange-800">解锁区域</div>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">个人简介</Label>
            {isEditing ? (
              <Textarea
                id="bio"
                value={formData.bio || ''}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="介绍一下自己..."
                rows={3}
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-md min-h-[80px]">
                {formData.bio || '暂无个人简介'}
              </div>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              地理位置
            </Label>
            {isEditing ? (
              <Input
                id="location"
                value={formData.location || ''}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="输入你的位置"
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-md">
                {formData.location || '未设置位置'}
              </div>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              邮箱地址
            </Label>
            {isEditing ? (
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="邮箱地址"
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-md">
                {formData.email}
              </div>
            )}
          </div>

          {/* Preferences */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center">
              <Bell className="w-4 h-4 mr-2" />
              偏好设置
            </h4>

            {/* Notifications */}
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">推送通知</Label>
              {isEditing ? (
                <input
                  id="notifications"
                  type="checkbox"
                  checked={formData.preferences.notifications}
                  onChange={(e) => handlePreferenceChange('notifications', e.target.checked)}
                  className="rounded"
                />
              ) : (
                <Badge variant={formData.preferences.notifications ? "default" : "outline"}>
                  {formData.preferences.notifications ? "开启" : "关闭"}
                </Badge>
              )}
            </div>

            {/* Email Updates */}
            <div className="flex items-center justify-between">
              <Label htmlFor="emailUpdates">邮件更新</Label>
              {isEditing ? (
                <input
                  id="emailUpdates"
                  type="checkbox"
                  checked={formData.preferences.emailUpdates}
                  onChange={(e) => handlePreferenceChange('emailUpdates', e.target.checked)}
                  className="rounded"
                />
              ) : (
                <Badge variant={formData.preferences.emailUpdates ? "default" : "outline"}>
                  {formData.preferences.emailUpdates ? "开启" : "关闭"}
                </Badge>
              )}
            </div>

            {/* Privacy Level */}
            <div className="flex items-center justify-between">
              <Label htmlFor="privacyLevel" className="flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                隐私设置
              </Label>
              {isEditing ? (
                <select
                  id="privacyLevel"
                  value={formData.preferences.privacyLevel}
                  onChange={(e) => handlePreferenceChange('privacyLevel', e.target.value)}
                  className="px-3 py-1 border rounded-md"
                >
                  <option value="public">公开</option>
                  <option value="friends">仅好友</option>
                  <option value="private">私密</option>
                </select>
              ) : (
                <Badge className="flex items-center space-x-1">
                  {getPrivacyIcon(formData.preferences.privacyLevel)}
                  <span>
                    {formData.preferences.privacyLevel === 'public' ? '公开' :
                     formData.preferences.privacyLevel === 'friends' ? '仅好友' : '私密'}
                  </span>
                </Badge>
              )}
            </div>

            {/* Language */}
            <div className="flex items-center justify-between">
              <Label htmlFor="language">语言</Label>
              {isEditing ? (
                <select
                  id="language"
                  value={formData.preferences.language}
                  onChange={(e) => handlePreferenceChange('language', e.target.value)}
                  className="px-3 py-1 border rounded-md"
                >
                  <option value="zh-CN">简体中文</option>
                  <option value="en-US">English</option>
                </select>
              ) : (
                <Badge variant="outline">
                  {formData.preferences.language === 'zh-CN' ? '简体中文' : 'English'}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">账户操作</CardTitle>
          <CardDescription>
            危险操作，请谨慎使用
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
            导出个人数据
          </Button>
          <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
            删除账户
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}