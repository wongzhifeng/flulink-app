"use client"

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Zap, 
  MapPin, 
  Users, 
  Shield, 
  Database, 
  FlaskConical,
  ArrowRight,
  CheckCircle,
  Star,
  Play,
  BarChart3,
  Globe
} from 'lucide-react'

export default function HomePage() {
  const router = useRouter()

  const features = [
    {
      icon: Zap,
      title: "毒株创建系统",
      description: "支持四种毒株类型：生活、观点、兴趣、超级毒株",
      status: "已完成"
    },
    {
      icon: MapPin,
      title: "地理传播系统",
      description: "基于地理位置的传播模拟和热力图可视化",
      status: "已完成"
    },
    {
      icon: Users,
      title: "用户认证系统",
      description: "完整的用户注册、登录、权限管理",
      status: "已完成"
    },
    {
      icon: FlaskConical,
      title: "变异实验室",
      description: "第二阶段功能：病毒变异模拟和实验",
      status: "已完成"
    },
    {
      icon: Shield,
      title: "安全防护系统",
      description: "用户权限控制和数据安全保护",
      status: "已完成"
    },
    {
      icon: Database,
      title: "数据管理系统",
      description: "数据持久化和跨设备同步",
      status: "已完成"
    }
  ]

  const stats = [
    { label: "核心功能", value: "19/19", status: "100%" },
    { label: "技术栈", value: "Next.js 15.5.4", status: "最新" },
    { label: "部署状态", value: "Zeabur", status: "已部署" },
    { label: "开发阶段", value: "MVP完成", status: "扩展中" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">🦠 FluLink</h1>
                <p className="text-sm text-gray-500">流感传播模拟平台</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="flex items-center">
                <Star className="w-3 h-3 mr-1" />
                MVP v1.0.0
              </Badge>
              <Button 
                onClick={() => router.push('/dashboard')}
                className="flex items-center"
              >
                <Play className="w-4 h-4 mr-2" />
                进入应用
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <Badge className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CheckCircle className="w-3 h-3 mr-1" />
              MVP 开发完成
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              如流感般扩散
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                连接你在意的每个角落
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              FluLink是一个创新的异步社交平台，通过"流感传播"的隐喻，
              构建内容、情绪、兴趣的异步扩散型社交网络。
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              onClick={() => router.push('/dashboard')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Play className="w-5 h-5 mr-2" />
              立即体验 MVP
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => router.push('/features')}
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              查看功能列表
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                  <Badge variant="secondary" className="mt-2">{stat.status}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">核心功能</h2>
            <p className="text-lg text-gray-600">完整的MVP功能已开发完成，支持完整的社交传播体验</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <feature.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {feature.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">技术栈</h2>
            <p className="text-lg text-gray-600">现代化的技术栈，确保应用的性能和可扩展性</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "Next.js 15.5.4", desc: "React框架" },
              { name: "TypeScript", desc: "类型安全" },
              { name: "Tailwind CSS", desc: "样式框架" },
              { name: "Radix UI", desc: "组件库" },
              { name: "Zeabur", desc: "云部署" },
              { name: "Docker", desc: "容器化" },
              { name: "PostgreSQL", desc: "数据库" },
              { name: "Redis", desc: "缓存" }
            ].map((tech, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="text-lg font-semibold text-gray-900">{tech.name}</div>
                  <div className="text-sm text-gray-600">{tech.desc}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">准备体验 FluLink MVP？</h2>
          <p className="text-xl mb-8 opacity-90">
            完整的异步社交平台已准备就绪，立即开始您的传播之旅
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => router.push('/dashboard')}
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              <Play className="w-5 h-5 mr-2" />
              进入应用
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => router.push('/login')}
              className="border-white text-white hover:bg-white hover:text-blue-600"
            >
              <Users className="w-5 h-5 mr-2" />
              用户登录
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold">FluLink</h3>
              </div>
              <p className="text-gray-400">
                如流感般扩散，连接你在意的每个角落
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">快速链接</h4>
              <div className="space-y-2">
                <Button variant="link" className="p-0 h-auto text-gray-400 hover:text-white" onClick={() => router.push('/dashboard')}>
                  应用入口
                </Button>
                <br />
                <Button variant="link" className="p-0 h-auto text-gray-400 hover:text-white" onClick={() => router.push('/features')}>
                  功能列表
                </Button>
                <br />
                <Button variant="link" className="p-0 h-auto text-gray-400 hover:text-white" onClick={() => router.push('/login')}>
                  用户登录
                </Button>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">项目信息</h4>
              <div className="space-y-2 text-gray-400">
                <div>版本: MVP v1.0.0</div>
                <div>状态: 开发完成</div>
                <div>部署: Zeabur云端</div>
                <div>技术: Next.js + TypeScript</div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 FluLink MVP. 异步社交平台演示版本.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}