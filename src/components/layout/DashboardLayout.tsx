"use client"

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Home,
  Settings,
  HelpCircle,
  LogOut,
  User,
  Bell,
  Search,
  Menu,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface DashboardLayoutProps {
  children: ReactNode
  title?: string
  subtitle?: string
  showSidebar?: boolean
  showHeader?: boolean
  currentTab?: string
  onTabChange?: (tab: string) => void
  tabs?: Array<{
    id: string
    name: string
    icon?: ReactNode
    badge?: string
  }>
}

export default function DashboardLayout({
  children,
  title = "FluLink Dashboard",
  subtitle = "流感传播模拟平台",
  showSidebar = true,
  showHeader = true,
  currentTab,
  onTabChange,
  tabs = []
}: DashboardLayoutProps) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigationItems = [
    {
      name: '首页',
      path: '/',
      icon: Home
    },
    {
      name: '仪表板',
      path: '/dashboard',
      icon: User,
      isActive: true
    },
    {
      name: '功能中心',
      path: '/features',
      icon: Settings
    }
  ]

  const dashboardTabs = [
    {
      id: 'overview',
      name: '概览',
      badge: '新'
    },
    {
      id: 'strains',
      name: '我的毒株'
    },
    {
      id: 'spread',
      name: '传播模拟'
    },
    {
      id: 'mutation',
      name: '变异实验室'
    },
    {
      id: 'lifecycle',
      name: '生命周期'
    }
  ]

  const userStats = [
    { label: '活跃毒株', value: '3' },
    { label: '总感染数', value: '2.1K' },
    { label: '传播率', value: '75%' },
    { label: '完成度', value: '45%' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      {showSidebar && (
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">🦠</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">FluLink</h1>
                <p className="text-xs text-gray-500">仪表板</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  测试用户
                </p>
                <p className="text-xs text-gray-500 truncate">
                  user@example.com
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2">
            {navigationItems.map((item) => (
              <Button
                key={item.name}
                variant={item.isActive ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => router.push(item.path)}
              >
                <item.icon className="w-4 h-4 mr-3" />
                {item.name}
              </Button>
            ))}
          </nav>

          {/* User Stats */}
          <div className="p-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">统计概览</h3>
            <div className="grid grid-cols-2 gap-3">
              {userStats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                  <div className="text-xs text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start">
                <Settings className="w-4 h-4 mr-3" />
                设置
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <HelpCircle className="w-4 h-4 mr-3" />
                帮助
              </Button>
              <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
                <LogOut className="w-4 h-4 mr-3" />
                退出登录
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={cn("flex-1 flex flex-col", showSidebar && "lg:ml-64")}>
        {/* Header */}
        {showHeader && (
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden mr-2"
                  >
                    <Menu className="w-5 h-5" />
                  </Button>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                    {subtitle && (
                      <p className="text-sm text-gray-500">{subtitle}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Search */}
                  <div className="hidden md:block">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="搜索..."
                      />
                    </div>
                  </div>

                  {/* Notifications */}
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      3
                    </span>
                  </Button>

                  {/* User Menu */}
                  <div className="flex items-center space-x-3">
                    <div className="hidden md:block text-right">
                      <p className="text-sm font-medium text-gray-900">测试用户</p>
                      <p className="text-xs text-gray-500">user@example.com</p>
                    </div>
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              {(tabs.length > 0 || dashboardTabs.length > 0) && (
                <div className="border-t border-gray-200">
                  <div className="flex space-x-8">
                    {(tabs.length > 0 ? tabs : dashboardTabs).map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => onTabChange?.(tab.id)}
                        className={cn(
                          "py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap",
                          currentTab === tab.id
                            ? "border-blue-500 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        )}
                      >
                        <div className="flex items-center space-x-2">
                          <span>{tab.name}</span>
                          {tab.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {tab.badge}
                            </Badge>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </header>
        )}

        {/* Main Content Area */}
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

// 导出可重用的组件部分
export const DashboardHeader = ({ title, subtitle, showSearch = true }: {
  title?: string
  subtitle?: string
  showSearch?: boolean
}) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title || "仪表板"}</h1>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
          )}
        </div>
        {showSearch && (
          <div className="w-64">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="搜索..."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export const DashboardCard = ({
  children,
  className,
  title,
  subtitle,
  action
}: {
  children: ReactNode
  className?: string
  title?: string
  subtitle?: string
  action?: ReactNode
}) => {
  return (
    <div className={cn("bg-white shadow rounded-lg", className)}>
      {(title || action) && (
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              )}
              {subtitle && (
                <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
              )}
            </div>
            {action && <div>{action}</div>}
          </div>
        </div>
      )}
      <div className="px-6 py-4">
        {children}
      </div>
    </div>
  )
}

export const DashboardGrid = ({
  children,
  className,
  cols = 1
}: {
  children: ReactNode
  className?: string
  cols?: 1 | 2 | 3 | 4
}) => {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
  }

  return (
    <div className={cn("grid gap-6", gridCols[cols], className)}>
      {children}
    </div>
  )
}