"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, MapPin, Clock, Users, Activity, TrendingUp, Tag, Shield, Database, Zap, Monitor, Lock, FlaskConical } from 'lucide-react'
import { useFluLink } from '@/context/FluLinkContext'
import { FluLinkProvider } from '@/context/FluLinkContext'
import MutationLab from '@/components/phase2/virus/MutationLab'
import StrainCreationForm from '@/components/virus/StrainCreationForm'
import { generateId } from '@/lib/utils'

function DashboardPageContent() {
  const router = useRouter()
  const { strains, createStrain } = useFluLink()
  const [activeTab, setActiveTab] = useState<'create' | 'strains' | 'spread' | 'heatmap' | 'delay' | 'tags' | 'immunity' | 'database' | 'cache' | 'monitoring' | 'permissions' | 'mutation'>('create')

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const tabParam = urlParams.get('tab')
    if (tabParam && ['create', 'strains', 'spread', 'heatmap', 'delay', 'tags', 'immunity', 'database', 'cache', 'monitoring', 'permissions', 'mutation'].includes(tabParam)) {
      setActiveTab(tabParam as typeof activeTab)
    }
  }, [])

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab)
    const url = new URL(window.location.href)
    url.searchParams.set('tab', tab)
    window.history.pushState({}, '', url.toString())
  }

  const handleCreateStrain = (strainData: any) => {
    const newStrain = {
      ...strainData,
      id: generateId(),
      mutations: []
    }
    createStrain(newStrain)
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
              <Activity className="w-4 h-4 mr-2" />
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
              variant={activeTab === 'mutation' ? 'default' : 'outline'}
              onClick={() => handleTabChange('mutation')}
              className="flex items-center"
            >
              <FlaskConical className="w-4 h-4 mr-2" />
              变异实验室
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {activeTab === 'create' && (
            <StrainCreationForm onCreateStrain={handleCreateStrain} />
          )}

          {activeTab === 'strains' && (
            <Card>
              <CardHeader>
                <CardTitle>我的毒株</CardTitle>
                <CardDescription>管理你创建的所有毒株</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {strains.length === 0 ? (
                    <p className="text-gray-500">暂无毒株，点击"创建毒株"开始</p>
                  ) : (
                    strains.map((strain) => (
                      <div key={strain.id} className="p-4 border rounded-lg">
                        <h3 className="font-semibold">{strain.title}</h3>
                        <p className="text-sm text-gray-600">{strain.type}</p>
                        <p className="text-sm text-gray-500">{strain.description}</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'mutation' && (
            <MutationLab />
          )}

          {/* 其他标签页的内容可以在这里添加 */}
          {activeTab !== 'create' && activeTab !== 'strains' && activeTab !== 'mutation' && (
            <Card>
              <CardHeader>
                <CardTitle>{activeTab} 功能</CardTitle>
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
  return (
    <FluLinkProvider>
      <DashboardPageContent />
    </FluLinkProvider>
  )
}
