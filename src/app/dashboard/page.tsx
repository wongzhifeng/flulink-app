"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, MapPin, Clock, Users, Activity, TrendingUp, Tag, Shield, Database, Zap, Monitor, Lock, FlaskConical, BarChart3 } from 'lucide-react'
import { useFluLink } from '@/context/FluLinkContext'
import { FluLinkProvider } from '@/context/FluLinkContext'
import MutationLab from '@/components/phase2/virus/MutationLab'
import StrainCreationForm from '@/components/virus/StrainCreationForm'
import StrainLifecycleManager, { StrainLifecycleProvider } from '@/components/virus/StrainLifecycleManager'
import SpreadProgressBar from '@/components/virus/SpreadProgressBar'
import SpreadDelayVisualization from '@/components/virus/SpreadDelayVisualization'
import { generateId } from '@/lib/utils'

function DashboardPageContent() {
  const router = useRouter()
  const { strains, createStrain } = useFluLink()
  const [activeTab, setActiveTab] = useState<'create' | 'strains' | 'spread' | 'heatmap' | 'delay' | 'tags' | 'immunity' | 'database' | 'cache' | 'monitoring' | 'permissions' | 'mutation' | 'lifecycle'>('create')

  // 示例传播进度数据
  const spreadProgressData = {
    id: '1',
    title: '冬季流感预警',
    currentLevel: 3,
    totalLevels: 6,
    progress: 45,
    infectionRate: 75,
    totalInfections: 1200,
    estimatedCompletionTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    currentPhase: '街道',
    nextPhase: '行政区',
    phaseProgress: 65,
    unlockConditions: {
      requiredInfections: 2000,
      currentInfections: 1200,
      requiredTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      isUnlocked: false
    },
    spreadSpeed: 'normal' as const,
    isBoosted: false
  }

  // 示例传播延迟数据
  const spreadDelayData = {
    id: '1',
    title: '跨区域传播延迟',
    currentDelay: 36,
    maxDelay: 72,
    delayProgress: 50,
    estimatedCompletionTime: new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString(),
    affectedRegions: 8,
    totalRegions: 15,
    delayType: 'geographic' as const,
    delayFactors: [
      {
        name: '地理距离',
        impact: 'high',
        description: '区域间距离较远'
      },
      {
        name: '网络密度',
        impact: 'medium',
        description: '社交网络连接度中等'
      },
      {
        name: '免疫水平',
        impact: 'low',
        description: '目标区域免疫水平较低'
      }
    ],
    isAccelerated: false,
    accelerationOptions: [
      {
        name: '快速传播',
        cost: 50,
        effect: '减少12小时延迟',
        isAvailable: true
      },
      {
        name: '病毒式传播',
        cost: 100,
        effect: '减少24小时延迟',
        isAvailable: false
      }
    ]
  }

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const tabParam = urlParams.get('tab')
    if (tabParam && ['create', 'strains', 'spread', 'heatmap', 'delay', 'tags', 'immunity', 'database', 'cache', 'monitoring', 'permissions', 'mutation', 'lifecycle'].includes(tabParam)) {
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
            <Button
              variant={activeTab === 'lifecycle' ? 'default' : 'outline'}
              onClick={() => handleTabChange('lifecycle')}
              className="flex items-center"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              生命周期管理
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

          {activeTab === 'lifecycle' && (
            <StrainLifecycleManager />
          )}

          {activeTab === 'spread' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>传播进度监控</CardTitle>
                  <CardDescription>实时跟踪毒株传播进度和阶段解锁</CardDescription>
                </CardHeader>
                <CardContent>
                  <SpreadProgressBar data={spreadProgressData} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>传播模拟</CardTitle>
                  <CardDescription>高级传播模拟功能正在开发中...</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">高级传播算法和可视化功能开发中，敬请期待</p>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'delay' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>传播延迟监控</CardTitle>
                  <CardDescription>实时跟踪传播延迟和影响因素</CardDescription>
                </CardHeader>
                <CardContent>
                  <SpreadDelayVisualization
                    data={spreadDelayData}
                    onAccelerate={(optionId) => {
                      console.log(`加速选项: ${optionId}`)
                      // 这里可以添加实际的加速逻辑
                    }}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>延迟管理</CardTitle>
                  <CardDescription>高级延迟管理功能正在开发中...</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">高级延迟算法和优化功能开发中，敬请期待</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 其他标签页的内容可以在这里添加 */}
          {activeTab !== 'create' && activeTab !== 'strains' && activeTab !== 'mutation' && activeTab !== 'lifecycle' && activeTab !== 'spread' && activeTab !== 'delay' && (
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
