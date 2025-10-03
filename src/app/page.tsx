"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Smartphone, 
  Globe, 
  Zap, 
  Users, 
  MapPin, 
  Clock, 
  Shield,
  ArrowRight,
  CheckCircle,
  Star,
  Download
} from 'lucide-react'

export default function LandingPage() {
  const [activeDemo, setActiveDemo] = useState<'web' | 'mobile'>('web')
  
  const features = [
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "地理层级传播",
      description: "基于地理位置的多级传播机制，从社区到城市的自然扩散"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "异步社交",
      description: "内容传播不依赖实时互动，让连接在时空维度自然发生"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "兴趣标签匹配",
      description: "智能标签系统，精准连接同好，建立有意义的关系"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "延迟传播机制",
      description: "模拟真实疫情的传播节奏，给内容有机的传播时间"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "免疫系统",
      description: "用户个性化抗体机制，避免信息过载"
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "传播可视化",
      description: "直观的热力图和传播进度，让社交关系可视化"
    }
  ]

  const mvps = [
    {
      platform: "Web MVP",
      status: "🚀 已上线",
      description: "完整的Web版FluLink社交平台",
      features: ["用户认证", "毒株创建", "传播模拟", "热力图可视化", "标签系统"],
      link: "/dashboard",
      type: "web"
    },
    {
      platform: "Mobile MVP",
      status: "📱 开发中",
      description: "移动端轻量化社交应用",
      features: ["快速传播", "地理定位", "推送通知", "离线模式"],
      link: "/mobile",
      type: "mobile"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🦠</span>
              <h1 className="text-xl font-bold text-indigo-600">FluLink</h1>
              <Badge variant="outline" className="text-xs">MVP</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => setActiveDemo('web')}>
                Web版
              </Button>
              <Button variant="ghost" onClick={() => setActiveDemo('mobile')}>
                移动版
              </Button>
              <Button variant="outline" href="/login">
                登录
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            如流感般<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              扩散连接
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            基于"流感传播"隐喻的异步社交平台，通过地理层级传播+标签双向筛选，
            实现轻互动、慢扩散、强关联的新时代社交体验
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-6" onClick={() => window.location.href = '/dashboard'}>
              <Globe className="w-5 h-5 mr-2" />
              体验Web版
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6" onClick={() => window.location.href = '/mobile'}>
              <Smartphone className="w-5 h-5 mr-2" />
              体验移动版
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* MVP Selection */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            选择您的FluLink体验
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {mvps.map((mvp, index) => (
              <Card key={index} className={`transition-all duration-300 ${
              (activeDemo === 'web' && mvp.type === 'web') || 
              (activeDemo === 'mobile' && mvp.type === 'mobile')
                  ? 'ring-2 ring-indigo-500 shadow-lg' : ''
              }`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl flex items-center">
                      {mvp.type === 'web' ? <Globe className="w-5 h-5 mr-2" /> : <Smartphone className="w-5 h-5 mr-2" />}
                      {mvp.platform}
                    </CardTitle>
                    <Badge variant={mvp.type === 'web' ? 'default' : 'secondary'}>
                      {mvp.status}
                    </Badge>
                  </div>
                  <CardDescription className="text-base">
                    {mvp.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-6">
                    <h4 className="font-semibold text-sm text-gray-700">核心功能:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {mvp.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button 
                    className="w-full"
                    variant={mvp.type === 'web' ? 'default' : 'outline'}
                    onClick={() => window.location.href = mvp.link}
                  >
                    立即体验
                    </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              革命性社交机制
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              不同于传统社交平台的即时交流模式，FluLink采用异步传播机制，
              让社交关系更加自然、持久且有意义
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center mb-3">
                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                      {feature.icon}
                    </div>
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            开始您的FluLink之旅
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            现在就加入我们，体验全新的异步社交方式
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              注册免费账号
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-indigo-600">
              了解更多
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-2xl">🦠</span>
                <h3 className="text-xl font-bold">FluLink</h3>
              </div>
              <p className="text-gray-400">
                如流感般扩散，连接你在意的每个角落
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">产品</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/dashboard" className="hover:text-white">Web版</a></li>
                <li><a href="/mobile" className="hover:text-white">移动版</a></li>
                <li><a href="/features" className="hover:text-white">功能特色</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">支持</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">帮助中心</a></li>
                <li><a href="#" className="hover:text-white">用户指南</a></li>
                <li><a href="#" className="hover:text-white">联系我们</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">关于</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">公司简介</a></li>
                <li><a href="#" className="hover:text-white">隐私政策</a></li>
                <li><a href="#" className="hover:text-white">服务条款</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 FluLink. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}