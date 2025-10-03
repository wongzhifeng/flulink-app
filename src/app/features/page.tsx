"use client"

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FlaskConical, Atom, Shield, Users, MapPin, Clock, Tag, Database, Zap, Monitor, Lock, Activity, TrendingUp } from 'lucide-react'

export default function FeaturesPage() {
  const router = useRouter()

  const features = [
    {
      id: 'mutation',
      name: '变异实验室',
      description: '通过科学实验改变毒株特性，提升传播效果或隐蔽性。',
      icon: <FlaskConical className="w-6 h-6 text-indigo-600" />,
      link: '/dashboard?tab=mutation',
      phase: '第二阶段'
    },
    {
      id: 'evolution',
      name: '自然演化系统',
      description: '模拟毒株在自然环境中的演化过程，适应性增强。',
      icon: <Atom className="w-6 h-6 text-green-600" />,
      link: '#', // 待开发
      phase: '第二阶段'
    },
    {
      id: 'immunity',
      name: '免疫系统',
      description: '管理个人免疫规则，抵御不感兴趣的毒株传播。',
      icon: <Shield className="w-6 h-6 text-blue-600" />,
      link: '/dashboard?tab=immunity',
      phase: 'MVP'
    },
    {
      id: 'profile',
      name: '用户档案',
      description: '管理个人信息、偏好设置和社交关系。',
      icon: <Users className="w-6 h-6 text-purple-600" />,
      link: '/dashboard?tab=profile', // 假设有profile tab
      phase: 'MVP'
    },
    {
      id: 'heatmap',
      name: '热力图',
      description: '可视化毒株的地理传播热点和密度。',
      icon: <MapPin className="w-6 h-6 text-red-600" />,
      link: '/dashboard?tab=heatmap',
      phase: 'MVP'
    },
    {
      id: 'delay',
      name: '延迟管理',
      description: '控制毒株的传播延迟时间，实现慢扩散。',
      icon: <Clock className="w-6 h-6 text-yellow-600" />,
      link: '/dashboard?tab=delay',
      phase: 'MVP'
    },
    {
      id: 'tags',
      name: '标签搜索',
      description: '通过标签精准搜索和筛选感兴趣的毒株。',
      icon: <Tag className="w-6 h-6 text-pink-600" />,
      link: '/dashboard?tab=tags',
      phase: 'MVP'
    },
    {
      id: 'database',
      name: '数据库管理',
      description: '查看和管理项目后端数据库的模拟数据。',
      icon: <Database className="w-6 h-6 text-gray-600" />,
      link: '/dashboard?tab=database',
      phase: 'MVP'
    },
    {
      id: 'cache',
      name: '缓存系统',
      description: '监控和管理应用缓存，优化性能。',
      icon: <Zap className="w-6 h-6 text-orange-600" />,
      link: '/dashboard?tab=cache',
      phase: 'MVP'
    },
    {
      id: 'monitoring',
      name: '系统监控',
      description: '实时监控系统性能和业务指标。',
      icon: <Monitor className="w-6 h-6 text-cyan-600" />,
      link: '/dashboard?tab=monitoring',
      phase: 'MVP'
    },
    {
      id: 'permissions',
      name: '权限管理',
      description: '配置和管理用户角色及访问权限。',
      icon: <Lock className="w-6 h-6 text-teal-600" />,
      link: '/dashboard?tab=permissions',
      phase: 'MVP'
    },
    {
      id: 'spread',
      name: '传播模拟',
      description: '模拟毒株的传播过程和影响范围。',
      icon: <Activity className="w-6 h-6 text-lime-600" />,
      link: '/dashboard?tab=spread',
      phase: 'MVP'
    },
    {
      id: 'analytics',
      name: '基础分析',
      description: '对毒株传播和用户行为进行基础数据分析。',
      icon: <TrendingUp className="w-6 h-6 text-fuchsia-600" />,
      link: '/dashboard?tab=analytics', // 假设有analytics tab
      phase: 'MVP'
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-6">
          FluLink 功能中心
        </h1>
        <p className="text-xl text-gray-600 text-center mb-12">
          探索FluLink的所有核心功能和高级模块
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card
              key={feature.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(feature.link)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">
                  {feature.name}
                </CardTitle>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${feature.phase === 'MVP' ? 'bg-blue-100 text-blue-800' : 'bg-indigo-100 text-indigo-800'}`}>
                  {feature.phase}
                </span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-3">{feature.icon}</div>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button onClick={() => router.push('/')} variant="outline">
            返回主页
          </Button>
        </div>
      </div>
    </div>
  )
}
