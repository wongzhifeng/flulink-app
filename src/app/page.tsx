"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, ExternalLink, Star, Users, Zap, Shield, Database, Monitor, Lock, FlaskConical, BarChart3, MapPin, Clock, Tag, Activity } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const projects = [
    {
      id: 'flulink-mvp',
      title: '🦠 FluLink MVP',
      description: '流感病毒传播模拟平台 - 完整MVP实现',
      status: 'production',
      features: ['毒株创建', '传播模拟', '生命周期管理', '变异实验室'],
      link: '/dashboard',
      icon: <Activity className="w-6 h-6" />
    },
    {
      id: 'features-center',
      title: '🚀 功能中心',
      description: '展示FluLink所有核心功能和组件',
      status: 'production',
      features: ['功能展示', '组件预览', '技术文档'],
      link: '/features',
      icon: <Zap className="w-6 h-6" />
    },
    {
      id: 'mutation-lab',
      title: '🧪 变异实验室',
      description: '高级病毒变异和进化模拟系统',
      status: 'development',
      features: ['基因编辑', '变异模拟', '适应性分析'],
      link: '/dashboard?tab=mutation',
      icon: <FlaskConical className="w-6 h-6" />
    },
    {
      id: 'lifecycle-manager',
      title: '📊 生命周期管理',
      description: '毒株完整生命周期跟踪和管理',
      status: 'production',
      features: ['阶段管理', '数据分析', '趋势预测'],
      link: '/dashboard?tab=lifecycle',
      icon: <BarChart3 className="w-6 h-6" />
    },
    {
      id: 'spread-simulation',
      title: '🌍 传播模拟',
      description: '实时传播进度和延迟监控',
      status: 'production',
      features: ['进度跟踪', '延迟管理', '热力图'],
      link: '/dashboard?tab=spread',
      icon: <MapPin className="w-6 h-6" />
    },
    {
      id: 'delay-management',
      title: '⏰ 延迟管理',
      description: '跨区域传播延迟优化系统',
      status: 'production',
      features: ['延迟监控', '加速选项', '影响因素'],
      link: '/dashboard?tab=delay',
      icon: <Clock className="w-6 h-6" />
    },
    {
      id: 'tag-system',
      title: '🏷️ 标签系统',
      description: '智能标签分类和搜索功能',
      status: 'development',
      features: ['标签管理', '智能搜索', '分类推荐'],
      link: '/dashboard?tab=tags',
      icon: <Tag className="w-6 h-6" />
    },
    {
      id: 'immunity-system',
      title: '🛡️ 免疫系统',
      description: '群体免疫和抗性模拟',
      status: 'planned',
      features: ['免疫建模', '抗性分析', '群体免疫'],
      link: '/dashboard?tab=immunity',
      icon: <Shield className="w-6 h-6" />
    },
    {
      id: 'database-system',
      title: '💾 数据库系统',
      description: '毒株数据和传播记录存储',
      status: 'planned',
      features: ['数据存储', '查询优化', '备份恢复'],
      link: '/dashboard?tab=database',
      icon: <Database className="w-6 h-6" />
    },
    {
      id: 'cache-system',
      title: '⚡ 缓存系统',
      description: '高性能缓存和加速机制',
      status: 'planned',
      features: ['缓存策略', '性能优化', '实时同步'],
      link: '/dashboard?tab=cache',
      icon: <Zap className="w-6 h-6" />
    },
    {
      id: 'monitoring-system',
      title: '📈 系统监控',
      description: '实时系统性能和健康监控',
      status: 'planned',
      features: ['性能监控', '健康检查', '告警系统'],
      link: '/dashboard?tab=monitoring',
      icon: <Monitor className="w-6 h-6" />
    },
    {
      id: 'permissions-system',
      title: '🔐 权限管理',
      description: '多级权限和访问控制系统',
      status: 'planned',
      features: ['角色管理', '权限控制', '审计日志'],
      link: '/dashboard?tab=permissions',
      icon: <Lock className="w-6 h-6" />
    }
  ]

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.features.some(feature => feature.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'production': return 'bg-green-100 text-green-800'
      case 'development': return 'bg-blue-100 text-blue-800'
      case 'planned': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'production': return '已上线'
      case 'development': return '开发中'
      case 'planned': return '规划中'
      default: return '未知'
    }
  }

  return (
    <MainLayout currentPage="home" showNavigation={true} showFooter={true}>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            欢迎来到 FluLink 生态系统
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            探索我们完整的流感病毒传播模拟平台，包含多个模块和功能组件
          </p>

          {/* Search */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="搜索项目或功能..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Star className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">已上线项目</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {projects.filter(p => p.status === 'production').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">开发中项目</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {projects.filter(p => p.status === 'development').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Zap className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">规划中项目</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {projects.filter(p => p.status === 'planned').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">总功能数</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {projects.reduce((sum, p) => sum + p.features.length, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      {project.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{project.title}</CardTitle>
                      <Badge className={getStatusColor(project.status)}>
                        {getStatusText(project.status)}
                      </Badge>
                    </div>
                  </div>
                </div>
                <CardDescription className="mt-2">
                  {project.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {project.features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    onClick={() => router.push(project.link)}
                    className="w-full"
                    disabled={project.status === 'planned'}
                  >
                    {project.status === 'planned' ? '即将推出' : '立即体验'}
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              没有找到匹配的项目
            </h3>
            <p className="text-gray-600">
              尝试使用不同的关键词搜索
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  )
}