"use client"

import { useState } from 'react'
import { UserStateProvider, useAuth, UserStatus, UserStatsDisplay } from '@/components/user/UserStateManager'
import { SessionProvider, SessionManager } from '@/components/auth/SessionManager'
import { DataPersistenceProvider, DataPersistenceManager } from '@/components/data/DataPersistence'
import { DataSynchronizationProvider, DataSynchronizationManager } from '@/components/data/DataSynchronization'
import PermissionVerifier, { UserPermissionsDisplay } from '@/components/auth/PermissionVerifier'
import UserLogout from '@/components/auth/UserLogout'
import StrainPreview from '@/components/virus/StrainPreview'
import StrainDeleteConfirmation from '@/components/virus/StrainDeleteConfirmation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  User,
  Shield,
  Database,
  Cloud,
  Zap,
  Settings,
  LogOut,
  Home,
  BarChart3,
  Users,
  MapPin
} from 'lucide-react'

// Mock user data for demonstration
const mockUser = {
  id: 'user123',
  username: 'fluuser',
  email: 'user@example.com',
  displayName: '流感研究员',
  tier: 'premium' as const,
  isLoggedIn: true,
  joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
  stats: {
    strainsCreated: 15,
    totalInfections: 2450,
    mutationCount: 8,
    regionsUnlocked: 12
  }
}

// Mock strain data for demonstration
const mockStrains = [
  {
    id: '1',
    title: '冬季流感预警',
    type: '生活毒株' as const,
    description: '针对冬季流感季节的预防和应对策略',
    tags: ['流感', '冬季', '预防'],
    location: '北京',
    spreadDelay: 24,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    infectionRate: 75,
    currentLevel: 3,
    isActive: true,
    totalInfections: 1200,
    views: 4500,
    likes: 320
  },
  {
    id: '2',
    title: '疫苗接种观点',
    type: '观点毒株' as const,
    description: '关于疫苗接种重要性的讨论和观点分享',
    tags: ['疫苗', '健康', '观点'],
    location: '上海',
    spreadDelay: 12,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    infectionRate: 45,
    currentLevel: 2,
    isActive: true,
    totalInfections: 650,
    views: 2800,
    likes: 180
  },
  {
    id: '3',
    title: '健身健康习惯',
    type: '兴趣毒株' as const,
    description: '分享健身和健康生活习惯的毒株',
    tags: ['健身', '健康', '习惯'],
    location: '广州',
    spreadDelay: 48,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    infectionRate: 25,
    currentLevel: 1,
    isActive: true,
    totalInfections: 150,
    views: 800,
    likes: 95
  }
]

// Mock user permissions
const mockPermissions = {
  canCreateStrains: true,
  canEditStrains: true,
  canDeleteStrains: true,
  canAccessMutationLab: true,
  canUseSuperFlu: true,
  canAccessAdvancedFeatures: true,
  maxStrains: 50,
  maxTagsPerStrain: 10,
  maxSpreadDelay: 168,
  canAccessInternationalSpread: true
}

function DashboardContent() {
  const { isAuthenticated, user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [selectedStrain, setSelectedStrain] = useState<any>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleViewStrainDetails = (strainId: string) => {
    const strain = mockStrains.find(s => s.id === strainId)
    if (strain) {
      setSelectedStrain(strain)
      // In a real app, this would navigate to strain details page
      alert(`查看毒株详情: ${strain.title}`)
    }
  }

  const handleEditStrain = (strainId: string) => {
    const strain = mockStrains.find(s => s.id === strainId)
    if (strain) {
      // In a real app, this would open strain editor
      alert(`编辑毒株: ${strain.title}`)
    }
  }

  const handleShareStrain = (strainId: string) => {
    const strain = mockStrains.find(s => s.id === strainId)
    if (strain) {
      // In a real app, this would open share dialog
      alert(`分享毒株: ${strain.title}`)
    }
  }

  const handleDeleteStrain = (strainId: string) => {
    const strain = mockStrains.find(s => s.id === strainId)
    if (strain) {
      setSelectedStrain(strain)
      setShowDeleteConfirm(true)
    }
  }

  const handleConfirmDelete = (strainId: string) => {
    // In a real app, this would call API to delete strain
    alert(`删除毒株: ${strainId}`)
    setShowDeleteConfirm(false)
    setSelectedStrain(null)
  }

  const handleLogout = () => {
    // Logout logic is handled by UserStateProvider
    setShowLogoutConfirm(false)
    alert('已成功登出')
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">FluLink MVP</CardTitle>
            <CardDescription className="text-center">
              请先登录以访问完整功能
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-gray-500">
              <Zap className="w-16 h-16 mx-auto mb-4 text-blue-500" />
              <p>这是一个演示版本的 FluLink MVP</p>
              <p className="text-sm mt-2">所有组件已开发完成，等待后端集成</p>
            </div>
            <Button className="w-full" onClick={() => {
              // In a real app, this would trigger login flow
              alert('登录功能待集成')
            }}>
              立即登录
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Zap className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">FluLink</h1>
                <p className="text-sm text-gray-500">流感传播模拟平台</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <UserStatus />
              <UserLogout
                showConfirmation={false}
                onLogout={() => setShowLogoutConfirm(true)}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center">
              <Home className="w-4 h-4 mr-2" />
              概览
            </TabsTrigger>
            <TabsTrigger value="strains" className="flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              毒株管理
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              安全中心
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center">
              <Database className="w-4 h-4 mr-2" />
              数据管理
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              设置
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    用户统计
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <UserStatsDisplay />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    活跃毒株
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockStrains.slice(0, 2).map(strain => (
                      <StrainPreview
                        key={strain.id}
                        strain={strain}
                        compact
                        onViewDetails={handleViewStrainDetails}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    权限概览
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <UserPermissionsDisplay user={{ ...mockUser, permissions: mockPermissions }} />
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    传播地图
                  </CardTitle>
                  <CardDescription>
                    毒株传播范围和感染密度
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-600">
                      <MapPin className="w-12 h-12 mx-auto mb-2" />
                      <p>传播地图可视化</p>
                      <p className="text-sm">(地图组件待集成)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Cloud className="w-5 h-5 mr-2" />
                    数据同步
                  </CardTitle>
                  <CardDescription>
                    跨设备数据同步状态
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DataSynchronizationManager />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Strains Tab */}
          <TabsContent value="strains" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">毒株管理</h2>
                <p className="text-gray-600">创建、编辑和管理您的传播毒株</p>
              </div>
              <PermissionVerifier
                user={{ ...mockUser, permissions: mockPermissions }}
                requiredPermission="canCreateStrains"
              >
                <Button className="flex items-center">
                  <Zap className="w-4 h-4 mr-2" />
                  创建新毒株
                </Button>
              </PermissionVerifier>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {mockStrains.map(strain => (
                <StrainPreview
                  key={strain.id}
                  strain={strain}
                  onViewDetails={handleViewStrainDetails}
                  onEdit={handleEditStrain}
                  onShare={handleShareStrain}
                />
              ))}
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <SessionManager userId={mockUser.id} />
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="space-y-6">
            <DataPersistenceManager />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    账户设置
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <UserPermissionsDisplay user={{ ...mockUser, permissions: mockPermissions }} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    应用设置
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">自动保存</div>
                        <div className="text-sm text-gray-600">自动保存数据更改</div>
                      </div>
                      <Badge variant="default">已启用</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">推送通知</div>
                        <div className="text-sm text-gray-600">接收毒株传播通知</div>
                      </div>
                      <Badge variant="outline">已禁用</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">深色模式</div>
                        <div className="text-sm text-gray-600">启用深色主题</div>
                      </div>
                      <Badge variant="outline">系统</Badge>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <UserLogout
                      onLogout={handleLogout}
                      onCancel={() => setShowLogoutConfirm(false)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Modals */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <UserLogout
              onLogout={handleLogout}
              onCancel={() => setShowLogoutConfirm(false)}
            />
          </div>
        </div>
      )}

      {showDeleteConfirm && selectedStrain && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <StrainDeleteConfirmation
              strain={selectedStrain}
              onConfirm={handleConfirmDelete}
              onCancel={() => {
                setShowDeleteConfirm(false)
                setSelectedStrain(null)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default function MVPApp() {
  return (
    <UserStateProvider>
      <SessionProvider>
        <DataPersistenceProvider>
          <DataSynchronizationProvider>
            <DashboardContent />
          </DataSynchronizationProvider>
        </DataPersistenceProvider>
      </SessionProvider>
    </UserStateProvider>
  )
}
