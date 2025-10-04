"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, MapPin, Clock, Users, Activity, Tag, Shield, Database, Zap, Monitor, Lock } from 'lucide-react'

function DashboardPageContent() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'create' | 'strains' | 'spread' | 'heatmap' | 'delay' | 'tags' | 'immunity' | 'database' | 'cache' | 'monitoring' | 'permissions'>('create')

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const tabParam = urlParams.get('tab')
    if (tabParam && ['create', 'strains', 'spread', 'heatmap', 'delay', 'tags', 'immunity', 'database', 'cache', 'monitoring', 'permissions'].includes(tabParam)) {
      setActiveTab(tabParam as typeof activeTab)
    }
  }, [])

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab)
    const url = new URL(window.location.href)
    url.searchParams.set('tab', tab)


    window.history.pushState({}, '', url.toString())
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">🦠 FluLink Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={() => router.push('/features')} variant="outline">
                功能中心
              </Button>
              <Button onClick={() => router.push('/')} variant="outline">
                返回主页
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          </div>
        </div>

        <div className="space-y-6">
          {activeTab === 'create' && (
            <Card>
              <CardHeader>
                <CardTitle>创建毒株</CardTitle>
                <CardDescription>创建一个新的流感社交内容</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-500">毒株创建功能正在开发中...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'strains' && (
            <Card>
              <CardHeader>
                <CardTitle>我的毒株</CardTitle>
                <CardDescription>管理你创建的所有毒株</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-500">暂无毒株，点击"创建毒株"开始</p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'spread' && (
            <Card>
              <CardHeader>
                <CardTitle>传播模拟</CardTitle>
                <CardDescription>高级传播模拟功能正在开发中...</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">高级传播算法和可视化功能开发中，敬请期待</p>
              </CardContent>
            </Card>
          )}

          {activeTab === 'heatmap' && (
            <Card>
              <CardHeader>
                <CardTitle>热力图</CardTitle>
                <CardDescription>传播热力图功能正在开发中...</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">地理热力图功能开发中，敬请期待</p>
              </CardContent>
            </Card>
          )}

          {activeTab === 'delay' && (
            <Card>
              <CardHeader>
                <CardTitle>延迟管理</CardTitle>
                <CardDescription>传播延迟管理功能正在开发中...</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">高级延迟算法和优化功能开发中，敬请期待</p>
              </CardContent>
            </Card>
          )}

          {/* 其他功能卡片 */}
          {activeTab === 'tags' && (
            <Card>
              <CardHeader>
                <CardTitle>标签搜索</CardTitle>
                <CardDescription>此功能正在开发中...</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">功能开发中，敬请期待</p>
              </CardContent>
            </Card>
          )}

          {activeTab === 'immunity' && (
            <Card>
              <CardHeader>
                <CardTitle>免疫系统</CardTitle>
                <CardDescription>此功能正在开发中...</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">功能开发中，敬请期待</p>
              </CardContent>
            </Card>
          )}

          {activeTab === 'database' && (
            <Card>
              <CardHeader>
                <CardTitle>数据库管理</CardTitle>
                <CardDescription>此功能正在开发中...</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">功能开发中，敬请期待</p>
              </CardContent>
            </Card>
          )}

          {activeTab === 'cache' && (
            <Card>
              <CardHeader>
                <CardTitle>缓存系统</CardTitle>
                <CardDescription>此功能正在开发中...</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">功能开发中，敬请期待</p>
              </CardContent>
            </Card>
          )}

          {activeTab === 'monitoring' && (
            <Card>
              <CardHeader>
                <CardTitle>系统监控</CardTitle>
                <CardDescription>此功能正在开发中...</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">功能开发中，敬请期待</p>
              </CardContent>
            </Card>
          )}

          {activeTab === 'permissions' && (
            <Card>
              <CardHeader>
                <CardTitle>权限管理</CardTitle>
                <CardDescription>此功能正在开发中...</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">功能开发中，敬请期待</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return <DashboardPageContent />
}