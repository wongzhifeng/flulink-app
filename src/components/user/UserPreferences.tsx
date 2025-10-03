"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Bell,
  Mail,
  Shield,
  Globe,
  Moon,
  Eye,
  MapPin,
  Users,
  Zap,
  Save,
  RotateCcw,
  Volume2,
  Smartphone,
  Palette
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface UserPreferences {
  notifications: {
    push: boolean
    email: boolean
    sound: boolean
    vibration: boolean
  }
  privacy: {
    profile: 'public' | 'friends' | 'private'
    location: 'exact' | 'approximate' | 'hidden'
    activity: 'visible' | 'friends_only' | 'hidden'
    dataSharing: boolean
  }
  appearance: {
    theme: 'light' | 'dark' | 'auto'
    fontSize: 'small' | 'medium' | 'large'
    language: 'zh-CN' | 'en-US'
    reduceAnimations: boolean
  }
  spread: {
    autoBoost: boolean
    smartMatching: boolean
    locationBased: boolean
    tagPreferences: string[]
  }
  performance: {
    cacheSize: number
    dataSync: 'auto' | 'wifi' | 'manual'
    backgroundUpdates: boolean
    lowDataMode: boolean
  }
}

interface UserPreferencesProps {
  preferences: UserPreferences
  onSave?: (preferences: UserPreferences) => void
  onReset?: () => void
  className?: string
}

export default function UserPreferences({
  preferences,
  onSave,
  onReset,
  className
}: UserPreferencesProps) {
  const [formData, setFormData] = useState<UserPreferences>(preferences)
  const [isLoading, setIsLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const handlePreferenceChange = (
    category: keyof UserPreferences,
    field: string,
    value: any
  ) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      onSave?.(formData)
      setHasChanges(false)
    } catch (error) {
      console.error('Failed to save preferences:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setFormData(preferences)
    setHasChanges(false)
    onReset?.()
  }

  const getPrivacyIcon = (level: string) => {
    switch (level) {
      case 'public':
        return <Globe className="w-4 h-4" />
      case 'friends':
        return <Users className="w-4 h-4" />
      case 'private':
        return <Shield className="w-4 h-4" />
      default:
        return <Shield className="w-4 h-4" />
    }
  }

  const getLocationIcon = (level: string) => {
    switch (level) {
      case 'exact':
        return <MapPin className="w-4 h-4" />
      case 'approximate':
        return <Eye className="w-4 h-4" />
      case 'hidden':
        return <Shield className="w-4 h-4" />
      default:
        return <MapPin className="w-4 h-4" />
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>偏好设置</CardTitle>
              <CardDescription>
                自定义你的 FluLink 体验
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              {hasChanges && (
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="flex items-center"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  重置
                </Button>
              )}
              <Button
                onClick={handleSave}
                disabled={!hasChanges || isLoading}
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
                    保存设置
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            通知设置
          </CardTitle>
          <CardDescription>
            管理应用通知和提醒
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="pushNotifications" className="flex items-center">
                <Bell className="w-4 h-4 mr-2" />
                推送通知
              </Label>
              <input
                id="pushNotifications"
                type="checkbox"
                checked={formData.notifications.push}
                onChange={(e) => handlePreferenceChange('notifications', 'push', e.target.checked)}
                className="rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="emailNotifications" className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                邮件通知
              </Label>
              <input
                id="emailNotifications"
                type="checkbox"
                checked={formData.notifications.email}
                onChange={(e) => handlePreferenceChange('notifications', 'email', e.target.checked)}
                className="rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="soundNotifications" className="flex items-center">
                <Volume2 className="w-4 h-4 mr-2" />
                声音提醒
              </Label>
              <input
                id="soundNotifications"
                type="checkbox"
                checked={formData.notifications.sound}
                onChange={(e) => handlePreferenceChange('notifications', 'sound', e.target.checked)}
                className="rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="vibrationNotifications" className="flex items-center">
                <Smartphone className="w-4 h-4 mr-2" />
                振动提醒
              </Label>
              <input
                id="vibrationNotifications"
                type="checkbox"
                checked={formData.notifications.vibration}
                onChange={(e) => handlePreferenceChange('notifications', 'vibration', e.target.checked)}
                className="rounded"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            隐私设置
          </CardTitle>
          <CardDescription>
            控制你的个人信息可见性
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>个人资料可见性</Label>
              <div className="flex space-x-2">
                {['public', 'friends', 'private'].map(level => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => handlePreferenceChange('privacy', 'profile', level)}
                    className={cn(
                      "flex-1 p-3 border rounded-lg text-center transition-all",
                      formData.privacy.profile === level
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-center justify-center space-x-1">
                      {getPrivacyIcon(level)}
                      <span className="text-sm">
                        {level === 'public' ? '公开' :
                         level === 'friends' ? '仅好友' : '私密'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>位置精度</Label>
              <div className="flex space-x-2">
                {['exact', 'approximate', 'hidden'].map(level => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => handlePreferenceChange('privacy', 'location', level)}
                    className={cn(
                      "flex-1 p-3 border rounded-lg text-center transition-all",
                      formData.privacy.location === level
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-center justify-center space-x-1">
                      {getLocationIcon(level)}
                      <span className="text-sm">
                        {level === 'exact' ? '精确' :
                         level === 'approximate' ? '模糊' : '隐藏'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="dataSharing">数据共享</Label>
              <input
                id="dataSharing"
                type="checkbox"
                checked={formData.privacy.dataSharing}
                onChange={(e) => handlePreferenceChange('privacy', 'dataSharing', e.target.checked)}
                className="rounded"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Palette className="w-5 h-5 mr-2" />
            外观设置
          </CardTitle>
          <CardDescription>
            自定义界面外观和语言
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>主题模式</Label>
              <div className="flex space-x-2">
                {['light', 'dark', 'auto'].map(theme => (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => handlePreferenceChange('appearance', 'theme', theme)}
                    className={cn(
                      "flex-1 p-3 border rounded-lg text-center transition-all",
                      formData.appearance.theme === theme
                        ? "border-purple-500 bg-purple-50 text-purple-700"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-center justify-center space-x-1">
                      {theme === 'dark' && <Moon className="w-4 h-4" />}
                      <span className="text-sm">
                        {theme === 'light' ? '浅色' :
                         theme === 'dark' ? '深色' : '自动'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>字体大小</Label>
              <div className="flex space-x-2">
                {['small', 'medium', 'large'].map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handlePreferenceChange('appearance', 'fontSize', size)}
                    className={cn(
                      "flex-1 p-3 border rounded-lg text-center transition-all",
                      formData.appearance.fontSize === size
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <span className="text-sm">
                      {size === 'small' ? '小' :
                       size === 'medium' ? '中' : '大'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>语言</Label>
              <select
                value={formData.appearance.language}
                onChange={(e) => handlePreferenceChange('appearance', 'language', e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="zh-CN">简体中文</option>
                <option value="en-US">English</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="reduceAnimations">减少动画效果</Label>
              <input
                id="reduceAnimations"
                type="checkbox"
                checked={formData.appearance.reduceAnimations}
                onChange={(e) => handlePreferenceChange('appearance', 'reduceAnimations', e.target.checked)}
                className="rounded"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spread Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            传播偏好
          </CardTitle>
          <CardDescription>
            优化毒株传播体验
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="autoBoost">自动传播加速</Label>
              <input
                id="autoBoost"
                type="checkbox"
                checked={formData.spread.autoBoost}
                onChange={(e) => handlePreferenceChange('spread', 'autoBoost', e.target.checked)}
                className="rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="smartMatching">智能匹配</Label>
              <input
                id="smartMatching"
                type="checkbox"
                checked={formData.spread.smartMatching}
                onChange={(e) => handlePreferenceChange('spread', 'smartMatching', e.target.checked)}
                className="rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="locationBased">基于位置的传播</Label>
              <input
                id="locationBased"
                type="checkbox"
                checked={formData.spread.locationBased}
                onChange={(e) => handlePreferenceChange('spread', 'locationBased', e.target.checked)}
                className="rounded"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance */}
      <Card>
        <CardHeader>
          <CardTitle>性能设置</CardTitle>
          <CardDescription>
            优化应用性能和资源使用
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>缓存大小: {formData.performance.cacheSize}MB</Label>
              <input
                type="range"
                min="50"
                max="500"
                step="50"
                value={formData.performance.cacheSize}
                onChange={(e) => handlePreferenceChange('performance', 'cacheSize', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>数据同步</Label>
              <select
                value={formData.performance.dataSync}
                onChange={(e) => handlePreferenceChange('performance', 'dataSync', e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="auto">自动同步</option>
                <option value="wifi">仅WiFi同步</option>
                <option value="manual">手动同步</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="backgroundUpdates">后台更新</Label>
              <input
                id="backgroundUpdates"
                type="checkbox"
                checked={formData.performance.backgroundUpdates}
                onChange={(e) => handlePreferenceChange('performance', 'backgroundUpdates', e.target.checked)}
                className="rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="lowDataMode">低数据模式</Label>
              <input
                id="lowDataMode"
                type="checkbox"
                checked={formData.performance.lowDataMode}
                onChange={(e) => handlePreferenceChange('performance', 'lowDataMode', e.target.checked)}
                className="rounded"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Storage Usage */}
      <Card>
        <CardHeader>
          <CardTitle>存储使用情况</CardTitle>
          <CardDescription>
            查看和管理应用存储空间
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>已使用: 128MB / 500MB</span>
                <span>25%</span>
              </div>
              <Progress value={25} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600">毒株数据</div>
                <div className="font-medium">45MB</div>
              </div>
              <div>
                <div className="text-gray-600">缓存数据</div>
                <div className="font-medium">32MB</div>
              </div>
              <div>
                <div className="text-gray-600">媒体文件</div>
                <div className="font-medium">28MB</div>
              </div>
              <div>
                <div className="text-gray-600">其他数据</div>
                <div className="font-medium">23MB</div>
              </div>
            </div>

            <Button variant="outline" className="w-full">
              清理缓存
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}