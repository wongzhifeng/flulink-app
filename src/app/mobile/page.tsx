"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Smartphone, 
  MapPin, 
  Zap, 
  Users, 
  Clock, 
  Shield,
  Plus,
  Activity,
  Tag,
  Database,
  Bell,
  CheckCircle,
  ArrowLeft
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function MobileApp() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'home' | 'create' | 'spread' | 'profile'>('home')
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [notifications, setNotifications] = useState([
    { id: 1, title: "新毒株传播中", message: "冬季流感在您的区域活跃", time: "2分钟前", unread: true },
    { id: 2, title: "传播进度更新", message: "您的兴趣标签有新的连接", time: "15分钟前", unread: true },
    { id: 3, title: "地理位置获取", message: "需要位置权限以优化传播", time: "30分钟前", unread: false }
  ])

  // 获取地理位置
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.log('Location access denied or failed:', error)
        }
      )
    }
  }, [])

  const quickActions = [
    { icon: <Plus className="w-5 h-5" />, label: "创建毒株", action: () => setActiveTab('create') },
    { icon: <Activity className="w-5 h-5" />, label: "查看传播", action: () => setActiveTab('spread') },
    { icon: <Users className="w-5 h-5" />, label: "附近用户", action: () => console.log('Nearby users') },
    { icon: <Bell className="w-5 h-5" />, label: "通知", action: () => console.log('Notifications') }
  ]

  const recentActivity = [
    { type: "传播", title: "冬季流感预警", location: "西湖区", time: "刚刚", status: "active" },
    { type: "连接", title: "科技爱好者", location: "拱墅区", time: "5分钟前", status: "completed" },
    { type: "创建", title: "编程讨论组", location: "下城区", time: "10分钟前" }
  ]

  const handleBackToWeb = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={handleBackToWeb}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <span className="text-lg">🦠</span>
            <h1 className="text-lg font-bold text-indigo-600">FluLink Mobile</h1>
          </div>
          <Badge variant="outline" className="text-xs">MVP</Badge>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 px-4 pb-2">
          {[
            { id: 'home', label: '首页', icon: <Smartphone className="w-4 h-4" /> },
            { id: 'create', label: '创建', icon: <Plus className="w-4 h-4" /> },
            { id: 'spread', label: '传播', icon: <Activity className="w-4 h-4" /> },
            { id: 'profile', label: '我的', icon: <Users className="w-4 h-4" /> }
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab.id as any)}
              className="flex-1 flex flex-col items-center py-2"
            >
              {tab.icon}
              <span className="text-xs mt-1">{tab.label}</span>
            </Button>
          ))}
        </div>
      </header>

      <div className="pb-20">
        {/* Home Tab */}
        {activeTab === 'home' && (
          <div className="p-4 space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">附近活动</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">12</div>
                    <div className="text-sm text-gray-600">活跃毒株</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">8</div>
                    <div className="text-sm text-gray-600">附近用户</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Status */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-green-500" />
                  <div>
                    <div className="font-semibold">位置已获取</div>
                    <div className="text-sm text-gray-600">
                      {userLocation 
                        ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`
                        : "正在获取位置..."
                      }
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div>
              <h3 className="text-lg font-semibold mb-3">快速操作</h3>
              <div className="grid grid-cols-4 gap-3">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="flex flex-col items-center py-4 h-auto"
                    onClick={action.action}
                  >
                    {action.icon}
                    <span className="text-xs mt-2">{action.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h3 className="text-lg font-semibold mb-3">最近活动</h3>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{activity.title}</div>
                          <div className="text-sm text-gray-600">{activity.location} • {activity.time}</div>
                        </div>
                        <Badge variant={activity.status === 'active' ? 'default' : 'secondary'}>
                          {activity.status === 'active' ? '进行中' : '已完成'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Create Tab */}
        {activeTab === 'create' && (
          <div className="p-4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">创建新毒株</CardTitle>
                <CardDescription>创建一个新的兴趣传播内容</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">标题</label>
                  <Input placeholder="输入毒株标题..." className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">描述</label>
                  <Input placeholder="描述您想要传播的内容..." className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">标签</label>
                  <Input placeholder="添加标签，用逗号分隔..." className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline">预览</Button>
                  <Button>发布</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">快速创建</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="flex flex-col py-6">
                    <Tag className="w-6 h-6 mb-2" />
                    <span>兴趣爱好</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col py-6">
                    <Users className="w-6 h-6 mb-2" />
                    <span>社群讨论</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col py-6">
                    <Clock className="w-6 h-6 mb-2" />
                    <span>活动聚会</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col py-6">
                    <Shield className="w-6 h-6'll mb-2" />
                    <span>技能分享</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Spread Tab */}
        {activeTab === 'spread' && (
          <div className="p-4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">我的传播</CardTitle>
                <CardDescription>查看您创建的毒株传播情况</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold">冬季流感预警</div>
                      <div className="text-sm text-gray-600">科技爱好者 • 创建于2小时前</div>
                    </div>
                    <Badge variant="default">活跃</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold">编程讨论组</div>
                      <div className="text-sm text-gray-600">编程 • 创建于昨天</div>
                    </div>
                    <Badge variant="secondary">已暂停</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">附近传播</CardTitle>
                <CardDescription>您附近正在进行的传播活动</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="font-semibold">摄影爱好者聚会</div>
                      <div className="text-sm text-gray-600">距离您1.2km • 5分钟前更新</div>
                    </div>
                    <Button size="sm" variant="outline">关注</Button>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="font-semibold">咖啡文化分享</div>
                      <div className="text-sm text-gray-600">距离您2.5km • 10分钟前更新</div>
                    </div>
                    <Button size="sm" variant="outline">关注</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="p-4 space-y-6">
            <Card>
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">👤</span>
                </div>
                <CardTitle>FluLink用户</CardTitle>
                <CardDescription>通过位置和经验连接社区</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-indigo-600">5</div>
                    <div className="text-sm text-gray-600">创建的毒株</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">23</div>
                    <div className="text-sm text-gray-600">参与传播</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">12</div>
                    <div className="text-sm text-gray-600">关注标签</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">通知设置</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Bell className={`w-5 h-5 ${notification.unread ? 'text-indigo-600' : 'text-gray-400'}`} />
                      <div className="flex-1">
                        <div className="font-semibold">{notification.title}</div>
                        <div className="text-sm text-gray-600">{notification.message}</div>
                        <div className="text-xs text-gray-500">{notification.time}</div>
                      </div>
                      {notification.unread && <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">设置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button size="lg" variant="ghost" className="w-full justify-start">
                  账户设置
                </Button>
                <Button size="lg" variant="ghost" className="w-full justify-start">
                  隐私设置
                </Button>
                <Button size="lg" variant="ghost" className="w-full justify-start">
                  通知偏好
                </Button>
                <Button size="lg" variant="ghost" className="w-full justify-start" onClick={handleBackToWeb}>
                  返回Web版
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Bottom Navigation Space */}
      <div className="h-16"></div>
    </div>
  )
}
