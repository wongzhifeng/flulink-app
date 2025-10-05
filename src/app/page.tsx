'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Smartphone, 
  Users, 
  Settings, 
  BarChart3, 
  Zap, 
  Trophy,
  Monitor,
  ChevronRight,
  Home
} from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  const navigationCards = [
    {
      id: 'user-app',
      title: '用户端应用',
      description: '发布毒株、发牌手分析、实时聊天',
      icon: Smartphone,
      path: '/user-app',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      features: ['毒株发布', '发牌手分析', '实时聊天', '位置服务']
    },
    {
      id: 'multi-user',
      title: '多用户模拟',
      description: '三用户联动、毒株传播演示',
      icon: Users,
      path: '/multi-user',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      features: ['三用户模拟', '联动演示', '传播测试', '实时同步']
    },
    {
      id: 'admin',
      title: '管理后台',
      description: '系统监控、数据管理、配置设置',
      icon: Settings,
      path: '/admin',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      features: ['系统监控', '数据管理', '配置设置', '用户管理']
    },
    {
      id: 'monitor',
      title: '实时监控',
      description: '系统状态、性能指标、实时数据',
      icon: Monitor,
      path: '/monitor',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      features: ['实时监控', '性能指标', '系统状态', '数据统计']
    },
    {
      id: 'achievements',
      title: '成就系统',
      description: '用户成就、排行榜、激励机制',
      icon: Trophy,
      path: '/achievements',
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      features: ['用户成就', '排行榜', '激励机制', '进度追踪']
    },
    {
      id: 'propagation',
      title: '传播演示',
      description: '传播模拟、可视化分析、数据展示',
      icon: BarChart3,
      path: '/propagation',
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      features: ['传播模拟', '可视化分析', '数据展示', '热力图']
    }
  ]

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* 顶部导航 */}
      <nav className="flex justify-between items-center p-6 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xl font-bold">🦠</span>
            </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">FluLink</h1>
            <p className="text-sm text-gray-500">如流感般扩散，连接你在意的每个角落</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.reload()}
            className="flex items-center space-x-1"
          >
            <Home className="w-4 h-4" />
            <span>刷新</span>
          </Button>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="container mx-auto px-6 py-12">
        {/* 标题区域 */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            选择功能模块
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            欢迎使用FluLink Dealer MVP！请选择您要访问的功能模块，体验不同的交互界面和功能特性。
          </p>
        </div>

        {/* 功能卡片网格 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {navigationCards.map((card) => {
            const IconComponent = card.icon
            const isHovered = hoveredCard === card.id
            
            return (
              <Card 
                key={card.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${card.bgColor} border-0`}
                onMouseEnter={() => setHoveredCard(card.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => handleNavigation(card.path)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${card.color} flex items-center justify-center`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <ChevronRight className={`w-5 h-5 transition-colors ${isHovered ? card.iconColor : 'text-gray-400'}`} />
                  </div>
                  <CardTitle className={`text-xl font-bold ${card.iconColor}`}>
                    {card.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {card.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {card.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${card.color}`} />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
            </div>
            
        {/* 底部信息 */}
        <div className="text-center mt-16">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">🚀 快速开始</h3>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-600">1. 用户端应用</h4>
                <p className="text-sm text-gray-600">体验完整的用户界面，发布毒株内容，与发牌手AI进行实时交互。</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-green-600">2. 多用户模拟</h4>
                <p className="text-sm text-gray-600">观看三用户联动演示，了解毒株传播的实时联动效果。</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-purple-600">3. 管理功能</h4>
                <p className="text-sm text-gray-600">访问管理后台，监控系统状态，管理数据和配置。</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 底部状态栏 */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 p-4">
        <div className="container mx-auto flex justify-between items-center text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span>FluLink Dealer MVP v1.0</span>
            <span>•</span>
            <span>本地开发: http://localhost:8080</span>
            <span>•</span>
            <span>生产环境: https://flulink-app.zeabur.app</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>系统运行正常</span>
          </div>
        </div>
      </footer>
    </div>
  )
}