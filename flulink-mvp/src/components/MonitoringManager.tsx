'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Monitor, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Activity, 
  BarChart3,
  RefreshCw,
  Server,
  HardDrive,
  Zap,
  Users,
  TrendingUp,
  AlertCircle,
  Clock,
  Cpu,
  MemoryStick
} from 'lucide-react'
import { monitoringService } from '../lib/monitoringService'
import { SystemMetrics, PerformanceMetrics, BusinessMetrics, MonitoringStats, Alert } from '../types/monitoring'

export default function MonitoringManager() {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null)
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null)
  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetrics | null>(null)
  const [monitoringStats, setMonitoringStats] = useState<MonitoringStats | null>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'overview' | 'system' | 'performance' | 'business' | 'alerts'>('overview')

  useEffect(() => {
    loadMonitoringData()
    // 每30秒自动刷新
    const interval = setInterval(loadMonitoringData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadMonitoringData = async () => {
    setIsLoading(true)
    try {
      const [system, performance, business, stats, alertsList] = await Promise.all([
        monitoringService.getSystemMetrics(),
        monitoringService.getPerformanceMetrics(),
        monitoringService.getBusinessMetrics(),
        monitoringService.getMonitoringStats(),
        monitoringService.getAlerts(20)
      ])

      setSystemMetrics(system)
      setPerformanceMetrics(performance)
      setBusinessMetrics(business)
      setMonitoringStats(stats)
      setAlerts(alertsList)
      setLastUpdate(new Date().toLocaleString())
    } catch (error) {
      console.error('Failed to load monitoring data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    loadMonitoringData()
  }

  const handleResolveAlert = (alertId: string) => {
    monitoringService.resolveAlert(alertId)
    loadMonitoringData()
  }

  const getHealthColor = (health: 'healthy' | 'warning' | 'critical') => {
    switch (health) {
      case 'healthy': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'critical': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getHealthIcon = (health: 'healthy' | 'warning' | 'critical') => {
    switch (health) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'critical': return <XCircle className="h-5 w-5 text-red-600" />
      default: return <Monitor className="h-5 w-5 text-gray-600" />
    }
  }

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatTime = (ms: number) => {
    return `${ms.toFixed(0)}ms`
  }

  const formatPercentage = (rate: number) => {
    return `${(rate * 100).toFixed(1)}%`
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${days}d ${hours}h ${minutes}m`
  }

  return (
    <div className="space-y-6">
      {/* 头部操作 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">系统监控</h2>
          <p className="text-gray-600">FluLink系统全方位监控面板</p>
        </div>
        <Button onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          刷新数据
        </Button>
      </div>

      {/* 导航标签 */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeTab === 'overview' ? 'default' : 'outline'}
          onClick={() => setActiveTab('overview')}
          className="flex items-center"
        >
          <Monitor className="w-4 h-4 mr-2" />
          总览
        </Button>
        <Button
          variant={activeTab === 'system' ? 'default' : 'outline'}
          onClick={() => setActiveTab('system')}
          className="flex items-center"
        >
          <Server className="w-4 h-4 mr-2" />
          系统监控
        </Button>
        <Button
          variant={activeTab === 'performance' ? 'default' : 'outline'}
          onClick={() => setActiveTab('performance')}
          className="flex items-center"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          性能监控
        </Button>
        <Button
          variant={activeTab === 'business' ? 'default' : 'outline'}
          onClick={() => setActiveTab('business')}
          className="flex items-center"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          业务监控
        </Button>
        <Button
          variant={activeTab === 'alerts' ? 'default' : 'outline'}
          onClick={() => setActiveTab('alerts')}
          className="flex items-center"
        >
          <AlertCircle className="w-4 h-4 mr-2" />
          告警中心
        </Button>
      </div>

      {/* 总览标签页 */}
      {activeTab === 'overview' && monitoringStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Monitor className="h-4 w-4 mr-2" />
                整体健康
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                {getHealthIcon(monitoringStats.overallHealth)}
                <span className={`font-medium ${getHealthColor(monitoringStats.overallHealth)}`}>
                  {monitoringStats.overallHealth === 'healthy' ? '健康' : 
                   monitoringStats.overallHealth === 'warning' ? '警告' : '严重'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                系统运行时间: {formatUptime(monitoringStats.uptime)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                活跃告警
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {monitoringStats.activeAlerts}
              </div>
              <p className="text-xs text-gray-500">
                总告警: {monitoringStats.totalAlerts}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Server className="h-4 w-4 mr-2" />
                系统状态
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                {getHealthIcon(monitoringStats.systemHealth)}
                <span className={`font-medium ${getHealthColor(monitoringStats.systemHealth)}`}>
                  {monitoringStats.systemHealth === 'healthy' ? '正常' : 
                   monitoringStats.systemHealth === 'warning' ? '警告' : '异常'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <BarChart3 className="h-4 w-4 mr-2" />
                性能状态
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                {getHealthIcon(monitoringStats.performanceHealth)}
                <span className={`font-medium ${getHealthColor(monitoringStats.performanceHealth)}`}>
                  {monitoringStats.performanceHealth === 'healthy' ? '良好' : 
                   monitoringStats.performanceHealth === 'warning' ? '警告' : '异常'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 系统监控标签页 */}
      {activeTab === 'system' && systemMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Cpu className="h-4 w-4 mr-2" />
                CPU使用率
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {systemMetrics.cpu.usage.toFixed(1)}%
              </div>
              <p className="text-xs text-gray-500">
                {systemMetrics.cpu.cores} 核心
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <MemoryStick className="h-4 w-4 mr-2" />
                内存使用
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {systemMetrics.memory.usage.toFixed(1)}%
              </div>
              <p className="text-xs text-gray-500">
                {formatBytes(systemMetrics.memory.used)} / {formatBytes(systemMetrics.memory.total)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <HardDrive className="h-4 w-4 mr-2" />
                磁盘使用
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {systemMetrics.disk.usage.toFixed(1)}%
              </div>
              <p className="text-xs text-gray-500">
                {formatBytes(systemMetrics.disk.used)} / {formatBytes(systemMetrics.disk.total)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Activity className="h-4 w-4 mr-2" />
                网络流量
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">
                {formatBytes(systemMetrics.network.bytesIn + systemMetrics.network.bytesOut)}
              </div>
              <p className="text-xs text-gray-500">
                入: {formatBytes(systemMetrics.network.bytesIn)} / 出: {formatBytes(systemMetrics.network.bytesOut)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 性能监控标签页 */}
      {activeTab === 'performance' && performanceMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">响应时间</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">平均</span>
                  <span className="font-medium">{formatTime(performanceMetrics.responseTime.average)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">P50</span>
                  <span className="font-medium">{formatTime(performanceMetrics.responseTime.p50)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">P95</span>
                  <span className="font-medium">{formatTime(performanceMetrics.responseTime.p95)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">P99</span>
                  <span className="font-medium">{formatTime(performanceMetrics.responseTime.p99)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">吞吐量</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">每秒</span>
                  <span className="font-medium">{formatNumber(performanceMetrics.throughput.requestsPerSecond)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">每分钟</span>
                  <span className="font-medium">{formatNumber(performanceMetrics.throughput.requestsPerMinute)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">每小时</span>
                  <span className="font-medium">{formatNumber(performanceMetrics.throughput.requestsPerHour)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">错误率</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">总错误</span>
                  <span className="font-medium">{formatNumber(performanceMetrics.errorRate.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">错误率</span>
                  <span className="font-medium">{formatPercentage(performanceMetrics.errorRate.rate)}</span>
                </div>
                <div className="space-y-1">
                  {Object.entries(performanceMetrics.errorRate.byType).map(([type, count]) => (
                    <div key={type} className="flex justify-between text-xs">
                      <span>{type}</span>
                      <span>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 业务监控标签页 */}
      {activeTab === 'business' && businessMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Users className="h-4 w-4 mr-2" />
                用户统计
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">总用户</span>
                  <span className="font-medium">{formatNumber(businessMetrics.users.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">活跃用户</span>
                  <span className="font-medium">{formatNumber(businessMetrics.users.active)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">新用户</span>
                  <span className="font-medium">{formatNumber(businessMetrics.users.new)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">留存率</span>
                  <span className="font-medium">{formatPercentage(businessMetrics.users.retention)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Zap className="h-4 w-4 mr-2" />
                毒株统计
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">总毒株</span>
                  <span className="font-medium">{formatNumber(businessMetrics.strains.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">活跃毒株</span>
                  <span className="font-medium">{formatNumber(businessMetrics.strains.active)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">传播中</span>
                  <span className="font-medium">{formatNumber(businessMetrics.strains.spread)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">已完成</span>
                  <span className="font-medium">{formatNumber(businessMetrics.strains.completed)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                任务统计
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">总任务</span>
                  <span className="font-medium">{formatNumber(businessMetrics.tasks.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">待处理</span>
                  <span className="font-medium">{formatNumber(businessMetrics.tasks.pending)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">进行中</span>
                  <span className="font-medium">{formatNumber(businessMetrics.tasks.active)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">完成率</span>
                  <span className="font-medium">{formatPercentage(businessMetrics.tasks.completionRate)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 告警中心标签页 */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">告警中心</h3>
            <Badge variant="outline">
              活跃告警: {alerts.filter(alert => !alert.resolved).length}
            </Badge>
          </div>
          
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <p className="text-gray-500">暂无告警</p>
                  <p className="text-sm text-gray-400">系统运行正常</p>
                </CardContent>
              </Card>
            ) : (
              alerts.map((alert) => (
                <Card key={alert.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                        <div>
                          <div className="font-medium">{alert.title}</div>
                          <div className="text-sm text-gray-500">{alert.message}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(alert.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {alert.resolved ? (
                          <Badge variant="outline" className="text-green-600">
                            已解决
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleResolveAlert(alert.id)}
                          >
                            解决
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* 最后更新时间 */}
      <div className="text-center text-sm text-gray-500">
        最后更新: {lastUpdate}
      </div>
    </div>
  )
}

