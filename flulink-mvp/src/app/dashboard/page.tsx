"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useFluLink } from '@/context/FluLinkContext'
import { VirusStrain } from '@/types'
import { generateId, formatDate } from '@/lib/utils'
import { Plus, MapPin, Clock, Users, Activity, TrendingUp, Tag, Shield, Database, Zap, Monitor, Lock, Security, Bell } from 'lucide-react'
import SpreadSimulation from '@/components/SpreadSimulation'
import HeatmapVisualization from '@/components/HeatmapVisualization'
import DelayManager from '@/components/DelayManager'
import TagSearch from '@/components/TagSearch'
import ImmunityManager from '@/components/ImmunityManager'
import DatabaseManager from '@/components/DatabaseManager'
import CacheManager from '@/components/CacheManager'
import MonitoringManager from '@/components/MonitoringManager'
import PermissionManager from '@/components/PermissionManager'
import SecurityManager from '@/components/SecurityManager'
import NotificationManager from '@/components/NotificationManager'
import { Tag as TagType } from '@/types/tags'

export default function DashboardPage() {
  const { user, strains, addStrain, userLocation } = useFluLink()
  const [newStrain, setNewStrain] = useState({
    title: '',
    content: '',
    type: 'life' as const,
    tags: '',
    radius: 1
  })
  const [isCreating, setIsCreating] = useState(false)
  const [selectedTags, setSelectedTags] = useState<TagType[]>([])
  
  // 支持URL查询参数，Zeabur兼容
  const [activeTab, setActiveTab] = useState<'create' | 'strains' | 'spread' | 'heatmap' | 'delay' | 'tags' | 'immunity' | 'database' | 'cache' | 'monitoring' | 'permissions' | 'security' | 'notifications'>('create')

  // 从URL查询参数获取tab参数
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const tabParam = urlParams.get('tab')
    if (tabParam && ['create', 'strains', 'spread', 'heatmap', 'delay', 'tags', 'immunity', 'database', 'cache', 'monitoring', 'permissions', 'security', 'notifications'].includes(tabParam)) {
      setActiveTab(tabParam as any)
    }
  }, [])

  // 更新URL查询参数
  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab)
    const url = new URL(window.location.href)
    url.searchParams.set('tab', tab)
    window.history.replaceState({}, '', url.toString())
  }

  const handleCreateStrain = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !userLocation) return

    setIsCreating(true)
    try {
      const strain: VirusStrain = {
        id: generateId(),
        title: newStrain.title,
        content: newStrain.content,
        type: newStrain.type,
        tags: selectedTags.map(tag => tag.name),
        authorId: user.id,
        location: {
          lat: userLocation.lat,
          lng: userLocation.lng,
          address: '当前位置',
          radius: newStrain.radius
        },
        spreadDelay: 2, // 默认2小时延迟
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      addStrain(strain)
      setNewStrain({ title: '', content: '', type: 'life', tags: '', radius: 1 })
      setSelectedTags([])
    } catch (error) {
      console.error('创建毒株失败:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'life': return 'bg-green-100 text-green-800'
      case 'opinion': return 'bg-blue-100 text-blue-800'
      case 'interest': return 'bg-purple-100 text-purple-800'
      case 'super': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'life': return '生活'
      case 'opinion': return '观点'
      case 'interest': return '兴趣'
      case 'super': return '超级'
      default: return '未知'
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">请先登录</h1>
          <Button onClick={() => window.location.href = '/login'}>
            前往登录
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-indigo-600">🦠 FluLink</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">欢迎，{user.username}</span>
              <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 导航标签 */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeTab === 'create' ? 'default' : 'outline'}
              onClick={() => handleTabChange('create')}
              className="flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              创建毒株
            </Button>
            <Button
              variant={activeTab === 'strains' ? 'default' : 'outline'}
              onClick={() => handleTabChange('strains')}
              className="flex items-center"
            >
              <Users className="w-4 h-4 mr-2" />
              我的毒株
            </Button>
            <Button
              variant={activeTab === 'spread' ? 'default' : 'outline'}
              onClick={() => handleTabChange('spread')}
              className="flex items-center"
            >
              <Activity className="w-4 h-4 mr-2" />
              传播模拟
            </Button>
            <Button
              variant={activeTab === 'heatmap' ? 'default' : 'outline'}
              onClick={() => handleTabChange('heatmap')}
              className="flex items-center"
            >
              <MapPin className="w-4 h-4 mr-2" />
              热力图
            </Button>
            <Button
              variant={activeTab === 'delay' ? 'default' : 'outline'}
              onClick={() => handleTabChange('delay')}
              className="flex items-center"
            >
              <Clock className="w-4 h-4 mr-2" />
              延迟管理
            </Button>
            <Button
              variant={activeTab === 'tags' ? 'default' : 'outline'}
              onClick={() => handleTabChange('tags')}
              className="flex items-center"
            >
              <Tag className="w-4 h-4 mr-2" />
              标签搜索
            </Button>
            <Button
              variant={activeTab === 'immunity' ? 'default' : 'outline'}
              onClick={() => handleTabChange('immunity')}
              className="flex items-center"
            >
              <Shield className="w-4 h-4 mr-2" />
              免疫系统
            </Button>
            <Button
              variant={activeTab === 'database' ? 'default' : 'outline'}
              onClick={() => handleTabChange('database')}
              className="flex items-center"
            >
              <Database className="w-4 h-4 mr-2" />
              数据库
            </Button>
            <Button
              variant={activeTab === 'cache' ? 'default' : 'outline'}
              onClick={() => handleTabChange('cache')}
              className="flex items-center"
            >
              <Zap className="w-4 h-4 mr-2" />
              缓存系统
            </Button>
            <Button
              variant={activeTab === 'monitoring' ? 'default' : 'outline'}
              onClick={() => handleTabChange('monitoring')}
              className="flex items-center"
            >
              <Monitor className="w-4 h-4 mr-2" />
              系统监控
            </Button>
                    <Button
                      variant={activeTab === 'permissions' ? 'default' : 'outline'}
                      onClick={() => handleTabChange('permissions')}
                      className="flex items-center"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      权限管理
                    </Button>
                    <Button
                      variant={activeTab === 'security' ? 'default' : 'outline'}
                      onClick={() => handleTabChange('security')}
                      className="flex items-center"
                    >
                      <Security className="w-4 h-4 mr-2" />
                      安全防火墙
                    </Button>
                    <Button
                      variant={activeTab === 'notifications' ? 'default' : 'outline'}
                      onClick={() => handleTabChange('notifications')}
                      className="flex items-center"
                    >
                      <Bell className="w-4 h-4 mr-2" />
                      推送通知
                    </Button>
          </div>
        </div>

        {/* 内容区域 */}
        {activeTab === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 创建毒株 */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  创建新毒株
                </CardTitle>
                <CardDescription>
                  发布你的想法，让它像流感一样传播
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateStrain} className="space-y-4">
                  <div>
                    <Input
                      placeholder="毒株标题"
                      value={newStrain.title}
                      onChange={(e) => setNewStrain(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-md resize-none"
                      placeholder="毒株内容"
                      rows={4}
                      value={newStrain.content}
                      onChange={(e) => setNewStrain(prev => ({ ...prev, content: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <select
                      className="w-full p-3 border border-gray-300 rounded-md"
                      value={newStrain.type}
                      onChange={(e) => setNewStrain(prev => ({ ...prev, type: e.target.value as any }))}
                    >
                      <option value="life">生活毒株</option>
                      <option value="opinion">观点毒株</option>
                      <option value="interest">兴趣毒株</option>
                      <option value="super">超级毒株</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      选择标签
                    </label>
                    <div className="border border-gray-300 rounded-md p-3 min-h-[100px]">
                      {selectedTags.length === 0 ? (
                        <p className="text-gray-500 text-sm">点击"标签搜索"选择标签</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {selectedTags.map((tag) => (
                            <span
                              key={tag.id}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs flex items-center gap-1"
                            >
                              <div 
                                className="w-2 h-2 rounded-full" 
                                style={{ backgroundColor: tag.color }}
                              />
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      传播半径（公里）
                    </label>
                    <Input
                      type="number"
                      min="0.1"
                      max="10"
                      step="0.1"
                      value={newStrain.radius}
                      onChange={(e) => setNewStrain(prev => ({ ...prev, radius: parseFloat(e.target.value) }))}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isCreating}>
                    {isCreating ? '创建中...' : '发布毒株'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* 毒株列表 */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">我的毒株</h2>
              <p className="text-gray-600">管理你创建和感染的毒株</p>
            </div>
            
            <div className="space-y-4">
              {strains.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500">还没有毒株，创建第一个吧！</p>
                  </CardContent>
                </Card>
              ) : (
                strains.map((strain) => (
                  <Card key={strain.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{strain.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {strain.content}
                          </CardDescription>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(strain.type)}`}>
                          {getTypeLabel(strain.type)}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {strain.location.radius}km
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {strain.spreadDelay}小时延迟
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          活跃
                        </div>
                      </div>
                      
                      {strain.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {strain.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="mt-3 text-xs text-gray-500">
                        创建于 {formatDate(strain.createdAt)}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
        )}

        {/* 毒株列表标签页 */}
        {activeTab === 'strains' && (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">我的毒株</h2>
              <p className="text-gray-600">管理你创建和感染的毒株</p>
            </div>
            
            <div className="space-y-4">
              {strains.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500">还没有毒株，创建第一个吧！</p>
                  </CardContent>
                </Card>
              ) : (
                strains.map((strain) => (
                  <Card key={strain.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{strain.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {strain.content}
                          </CardDescription>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(strain.type)}`}>
                          {getTypeLabel(strain.type)}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {strain.location.radius}km
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {strain.spreadDelay}小时延迟
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          活跃
                        </div>
                      </div>
                      
                      {strain.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {strain.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="mt-3 text-xs text-gray-500">
                        创建于 {formatDate(strain.createdAt)}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* 传播模拟标签页 */}
        {activeTab === 'spread' && strains.length > 0 && (
          <SpreadSimulation strain={strains[0]} />
        )}

        {/* 热力图标签页 */}
        {activeTab === 'heatmap' && (
          <HeatmapVisualization />
        )}

        {/* 延迟管理标签页 */}
        {activeTab === 'delay' && strains.length > 0 && (
          <DelayManager strain={strains[0]} />
        )}

        {/* 标签搜索标签页 */}
        {activeTab === 'tags' && (
          <TagSearch 
            onTagSelect={(tag) => {
              const isSelected = selectedTags.some(t => t.id === tag.id)
              if (isSelected) {
                setSelectedTags(prev => prev.filter(t => t.id !== tag.id))
              } else {
                setSelectedTags(prev => [...prev, tag])
              }
            }}
            selectedTags={selectedTags}
          />
        )}

        {/* 免疫系统标签页 */}
        {activeTab === 'immunity' && (
          <ImmunityManager />
        )}

        {/* 数据库管理标签页 */}
        {activeTab === 'database' && (
          <DatabaseManager />
        )}

        {/* 缓存管理标签页 */}
        {activeTab === 'cache' && (
          <CacheManager />
        )}

        {/* 系统监控标签页 */}
        {activeTab === 'monitoring' && (
          <MonitoringManager />
        )}

        {/* 权限管理标签页 */}
        {activeTab === 'permissions' && (
          <PermissionManager />
        )}

        {/* 安全防火墙标签页 */}
        {activeTab === 'security' && (
          <SecurityManager />
        )}

        {/* 推送通知标签页 */}
        {activeTab === 'notifications' && (
          <NotificationManager />
        )}
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useFluLink } from '@/context/FluLinkContext'
import { VirusStrain } from '@/types'
import { generateId, formatDate } from '@/lib/utils'
import { Plus, MapPin, Clock, Users, Activity, TrendingUp, Tag, Shield, Database, Zap, Monitor, Lock, Security, Bell } from 'lucide-react'
import SpreadSimulation from '@/components/SpreadSimulation'
import HeatmapVisualization from '@/components/HeatmapVisualization'
import DelayManager from '@/components/DelayManager'
import TagSearch from '@/components/TagSearch'
import ImmunityManager from '@/components/ImmunityManager'
import DatabaseManager from '@/components/DatabaseManager'
import CacheManager from '@/components/CacheManager'
import MonitoringManager from '@/components/MonitoringManager'
import PermissionManager from '@/components/PermissionManager'
import SecurityManager from '@/components/SecurityManager'
import NotificationManager from '@/components/NotificationManager'
import { Tag as TagType } from '@/types/tags'

export default function DashboardPage() {
  const { user, strains, addStrain, userLocation } = useFluLink()
  const [newStrain, setNewStrain] = useState({
    title: '',
    content: '',
    type: 'life' as const,
    tags: '',
    radius: 1
  })
  const [isCreating, setIsCreating] = useState(false)
  const [selectedTags, setSelectedTags] = useState<TagType[]>([])
  
  // 支持URL查询参数，Zeabur兼容
  const [activeTab, setActiveTab] = useState<'create' | 'strains' | 'spread' | 'heatmap' | 'delay' | 'tags' | 'immunity' | 'database' | 'cache' | 'monitoring' | 'permissions' | 'security' | 'notifications'>('create')

  // 从URL查询参数获取tab参数
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const tabParam = urlParams.get('tab')
    if (tabParam && ['create', 'strains', 'spread', 'heatmap', 'delay', 'tags', 'immunity', 'database', 'cache', 'monitoring', 'permissions', 'security', 'notifications'].includes(tabParam)) {
      setActiveTab(tabParam as any)
    }
  }, [])

  // 更新URL查询参数
  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab)
    const url = new URL(window.location.href)
    url.searchParams.set('tab', tab)
    window.history.replaceState({}, '', url.toString())
  }

  const handleCreateStrain = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !userLocation) return

    setIsCreating(true)
    try {
      const strain: VirusStrain = {
        id: generateId(),
        title: newStrain.title,
        content: newStrain.content,
        type: newStrain.type,
        tags: selectedTags.map(tag => tag.name),
        authorId: user.id,
        location: {
          lat: userLocation.lat,
          lng: userLocation.lng,
          address: '当前位置',
          radius: newStrain.radius
        },
        spreadDelay: 2, // 默认2小时延迟
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      addStrain(strain)
      setNewStrain({ title: '', content: '', type: 'life', tags: '', radius: 1 })
      setSelectedTags([])
    } catch (error) {
      console.error('创建毒株失败:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'life': return 'bg-green-100 text-green-800'
      case 'opinion': return 'bg-blue-100 text-blue-800'
      case 'interest': return 'bg-purple-100 text-purple-800'
      case 'super': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'life': return '生活'
      case 'opinion': return '观点'
      case 'interest': return '兴趣'
      case 'super': return '超级'
      default: return '未知'
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">请先登录</h1>
          <Button onClick={() => window.location.href = '/login'}>
            前往登录
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-indigo-600">🦠 FluLink</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">欢迎，{user.username}</span>
              <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 导航标签 */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeTab === 'create' ? 'default' : 'outline'}
              onClick={() => handleTabChange('create')}
              className="flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              创建毒株
            </Button>
            <Button
              variant={activeTab === 'strains' ? 'default' : 'outline'}
              onClick={() => handleTabChange('strains')}
              className="flex items-center"
            >
              <Users className="w-4 h-4 mr-2" />
              我的毒株
            </Button>
            <Button
              variant={activeTab === 'spread' ? 'default' : 'outline'}
              onClick={() => handleTabChange('spread')}
              className="flex items-center"
            >
              <Activity className="w-4 h-4 mr-2" />
              传播模拟
            </Button>
            <Button
              variant={activeTab === 'heatmap' ? 'default' : 'outline'}
              onClick={() => handleTabChange('heatmap')}
              className="flex items-center"
            >
              <MapPin className="w-4 h-4 mr-2" />
              热力图
            </Button>
            <Button
              variant={activeTab === 'delay' ? 'default' : 'outline'}
              onClick={() => handleTabChange('delay')}
              className="flex items-center"
            >
              <Clock className="w-4 h-4 mr-2" />
              延迟管理
            </Button>
            <Button
              variant={activeTab === 'tags' ? 'default' : 'outline'}
              onClick={() => handleTabChange('tags')}
              className="flex items-center"
            >
              <Tag className="w-4 h-4 mr-2" />
              标签搜索
            </Button>
            <Button
              variant={activeTab === 'immunity' ? 'default' : 'outline'}
              onClick={() => handleTabChange('immunity')}
              className="flex items-center"
            >
              <Shield className="w-4 h-4 mr-2" />
              免疫系统
            </Button>
            <Button
              variant={activeTab === 'database' ? 'default' : 'outline'}
              onClick={() => handleTabChange('database')}
              className="flex items-center"
            >
              <Database className="w-4 h-4 mr-2" />
              数据库
            </Button>
            <Button
              variant={activeTab === 'cache' ? 'default' : 'outline'}
              onClick={() => handleTabChange('cache')}
              className="flex items-center"
            >
              <Zap className="w-4 h-4 mr-2" />
              缓存系统
            </Button>
            <Button
              variant={activeTab === 'monitoring' ? 'default' : 'outline'}
              onClick={() => handleTabChange('monitoring')}
              className="flex items-center"
            >
              <Monitor className="w-4 h-4 mr-2" />
              系统监控
            </Button>
                    <Button
                      variant={activeTab === 'permissions' ? 'default' : 'outline'}
                      onClick={() => handleTabChange('permissions')}
                      className="flex items-center"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      权限管理
                    </Button>
                    <Button
                      variant={activeTab === 'security' ? 'default' : 'outline'}
                      onClick={() => handleTabChange('security')}
                      className="flex items-center"
                    >
                      <Security className="w-4 h-4 mr-2" />
                      安全防火墙
                    </Button>
                    <Button
                      variant={activeTab === 'notifications' ? 'default' : 'outline'}
                      onClick={() => handleTabChange('notifications')}
                      className="flex items-center"
                    >
                      <Bell className="w-4 h-4 mr-2" />
                      推送通知
                    </Button>
          </div>
        </div>

        {/* 内容区域 */}
        {activeTab === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 创建毒株 */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  创建新毒株
                </CardTitle>
                <CardDescription>
                  发布你的想法，让它像流感一样传播
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateStrain} className="space-y-4">
                  <div>
                    <Input
                      placeholder="毒株标题"
                      value={newStrain.title}
                      onChange={(e) => setNewStrain(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-md resize-none"
                      placeholder="毒株内容"
                      rows={4}
                      value={newStrain.content}
                      onChange={(e) => setNewStrain(prev => ({ ...prev, content: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <select
                      className="w-full p-3 border border-gray-300 rounded-md"
                      value={newStrain.type}
                      onChange={(e) => setNewStrain(prev => ({ ...prev, type: e.target.value as any }))}
                    >
                      <option value="life">生活毒株</option>
                      <option value="opinion">观点毒株</option>
                      <option value="interest">兴趣毒株</option>
                      <option value="super">超级毒株</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      选择标签
                    </label>
                    <div className="border border-gray-300 rounded-md p-3 min-h-[100px]">
                      {selectedTags.length === 0 ? (
                        <p className="text-gray-500 text-sm">点击"标签搜索"选择标签</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {selectedTags.map((tag) => (
                            <span
                              key={tag.id}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs flex items-center gap-1"
                            >
                              <div 
                                className="w-2 h-2 rounded-full" 
                                style={{ backgroundColor: tag.color }}
                              />
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      传播半径（公里）
                    </label>
                    <Input
                      type="number"
                      min="0.1"
                      max="10"
                      step="0.1"
                      value={newStrain.radius}
                      onChange={(e) => setNewStrain(prev => ({ ...prev, radius: parseFloat(e.target.value) }))}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isCreating}>
                    {isCreating ? '创建中...' : '发布毒株'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* 毒株列表 */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">我的毒株</h2>
              <p className="text-gray-600">管理你创建和感染的毒株</p>
            </div>
            
            <div className="space-y-4">
              {strains.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500">还没有毒株，创建第一个吧！</p>
                  </CardContent>
                </Card>
              ) : (
                strains.map((strain) => (
                  <Card key={strain.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{strain.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {strain.content}
                          </CardDescription>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(strain.type)}`}>
                          {getTypeLabel(strain.type)}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {strain.location.radius}km
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {strain.spreadDelay}小时延迟
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          活跃
                        </div>
                      </div>
                      
                      {strain.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {strain.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="mt-3 text-xs text-gray-500">
                        创建于 {formatDate(strain.createdAt)}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
        )}

        {/* 毒株列表标签页 */}
        {activeTab === 'strains' && (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">我的毒株</h2>
              <p className="text-gray-600">管理你创建和感染的毒株</p>
            </div>
            
            <div className="space-y-4">
              {strains.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500">还没有毒株，创建第一个吧！</p>
                  </CardContent>
                </Card>
              ) : (
                strains.map((strain) => (
                  <Card key={strain.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{strain.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {strain.content}
                          </CardDescription>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(strain.type)}`}>
                          {getTypeLabel(strain.type)}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {strain.location.radius}km
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {strain.spreadDelay}小时延迟
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          活跃
                        </div>
                      </div>
                      
                      {strain.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {strain.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="mt-3 text-xs text-gray-500">
                        创建于 {formatDate(strain.createdAt)}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* 传播模拟标签页 */}
        {activeTab === 'spread' && strains.length > 0 && (
          <SpreadSimulation strain={strains[0]} />
        )}

        {/* 热力图标签页 */}
        {activeTab === 'heatmap' && (
          <HeatmapVisualization />
        )}

        {/* 延迟管理标签页 */}
        {activeTab === 'delay' && strains.length > 0 && (
          <DelayManager strain={strains[0]} />
        )}

        {/* 标签搜索标签页 */}
        {activeTab === 'tags' && (
          <TagSearch 
            onTagSelect={(tag) => {
              const isSelected = selectedTags.some(t => t.id === tag.id)
              if (isSelected) {
                setSelectedTags(prev => prev.filter(t => t.id !== tag.id))
              } else {
                setSelectedTags(prev => [...prev, tag])
              }
            }}
            selectedTags={selectedTags}
          />
        )}

        {/* 免疫系统标签页 */}
        {activeTab === 'immunity' && (
          <ImmunityManager />
        )}

        {/* 数据库管理标签页 */}
        {activeTab === 'database' && (
          <DatabaseManager />
        )}

        {/* 缓存管理标签页 */}
        {activeTab === 'cache' && (
          <CacheManager />
        )}

        {/* 系统监控标签页 */}
        {activeTab === 'monitoring' && (
          <MonitoringManager />
        )}

        {/* 权限管理标签页 */}
        {activeTab === 'permissions' && (
          <PermissionManager />
        )}

        {/* 安全防火墙标签页 */}
        {activeTab === 'security' && (
          <SecurityManager />
        )}

        {/* 推送通知标签页 */}
        {activeTab === 'notifications' && (
          <NotificationManager />
        )}
      </div>
    </div>
  )
}
