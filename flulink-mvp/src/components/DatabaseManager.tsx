'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  Activity, 
  BarChart3,
  RefreshCw,
  Server,
  HardDrive,
  Zap
} from 'lucide-react'
import { databaseService } from '../lib/databaseService'
import { DatabaseConnection, DatabaseStats } from '../types/database'

export default function DatabaseManager() {
  const [connectionStatus, setConnectionStatus] = useState<DatabaseConnection | null>(null)
  const [databaseStats, setDatabaseStats] = useState<DatabaseStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string>('')

  useEffect(() => {
    loadDatabaseStatus()
  }, [])

  const loadDatabaseStatus = async () => {
    setIsLoading(true)
    try {
      const status = databaseService.getConnectionStatus()
      const stats = databaseService.getDatabaseStats()
      const isHealthy = await databaseService.healthCheck()
      
      setConnectionStatus({ ...status, isConnected: isHealthy })
      setDatabaseStats(stats)
      setLastUpdate(new Date().toLocaleString())
    } catch (error) {
      console.error('Failed to load database status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    loadDatabaseStatus()
  }

  const getConnectionStatusColor = (isConnected: boolean) => {
    return isConnected ? 'text-green-600' : 'text-red-600'
  }

  const getConnectionStatusIcon = (isConnected: boolean) => {
    return isConnected ? (
      <CheckCircle className="h-5 w-5 text-green-600" />
    ) : (
      <XCircle className="h-5 w-5 text-red-600" />
    )
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  const formatTime = (ms: number) => {
    return `${ms.toFixed(2)}ms`
  }

  return (
    <div className="space-y-6">
      {/* 头部操作 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">数据库管理</h2>
          <p className="text-gray-600">监控和管理FluLink数据库状态</p>
        </div>
        <Button onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          刷新状态
        </Button>
      </div>

      {/* 连接状态卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Server className="h-4 w-4 mr-2" />
              连接状态
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {connectionStatus && getConnectionStatusIcon(connectionStatus.isConnected)}
              <span className={`font-medium ${getConnectionStatusColor(connectionStatus?.isConnected || false)}`}>
                {connectionStatus?.isConnected ? '已连接' : '未连接'}
              </span>
            </div>
            {connectionStatus && (
              <p className="text-xs text-gray-500 mt-1">
                连接次数: {formatNumber(connectionStatus.connectionCount)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Activity className="h-4 w-4 mr-2" />
              活跃连接
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {databaseStats?.activeConnections || 0}
            </div>
            <p className="text-xs text-gray-500">当前活跃</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              查询总数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              {formatNumber(databaseStats?.totalQueries || 0)}
            </div>
            <p className="text-xs text-gray-500">
              成功: {formatNumber(databaseStats?.successfulQueries || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              平均响应
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatTime(databaseStats?.averageQueryTime || 0)}
            </div>
            <p className="text-xs text-gray-500">查询时间</p>
          </CardContent>
        </Card>
      </div>

      {/* 详细状态信息 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 连接信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              连接信息
            </CardTitle>
            <CardDescription>
              数据库连接详细状态
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {connectionStatus ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">连接状态</span>
                  <Badge variant={connectionStatus.isConnected ? "default" : "destructive"}>
                    {connectionStatus.isConnected ? '已连接' : '未连接'}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">最后连接</span>
                  <span className="text-sm text-gray-600">
                    {connectionStatus.lastConnected ? 
                      new Date(connectionStatus.lastConnected).toLocaleString() : 
                      '未知'
                    }
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">连接次数</span>
                  <span className="text-sm text-gray-600">
                    {formatNumber(connectionStatus.connectionCount)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">错误次数</span>
                  <span className="text-sm text-gray-600">
                    {formatNumber(connectionStatus.errorCount)}
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">加载中...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 性能统计 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              性能统计
            </CardTitle>
            <CardDescription>
              数据库查询性能指标
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {databaseStats ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">总查询数</span>
                  <span className="text-sm text-gray-600">
                    {formatNumber(databaseStats.totalQueries)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">成功查询</span>
                  <span className="text-sm text-gray-600">
                    {formatNumber(databaseStats.successfulQueries)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">失败查询</span>
                  <span className="text-sm text-gray-600">
                    {formatNumber(databaseStats.failedQueries)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">成功率</span>
                  <span className="text-sm text-gray-600">
                    {databaseStats.totalQueries > 0 
                      ? `${((databaseStats.successfulQueries / databaseStats.totalQueries) * 100).toFixed(1)}%`
                      : '0%'
                    }
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">平均响应时间</span>
                  <span className="text-sm text-gray-600">
                    {formatTime(databaseStats.averageQueryTime)}
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">加载中...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Zeabur环境信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <HardDrive className="h-5 w-5 mr-2" />
            Zeabur环境信息
          </CardTitle>
          <CardDescription>
            部署环境配置和状态
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">环境</span>
                <Badge variant="outline">
                  {typeof window === 'undefined' ? (process.env.NODE_ENV || 'development') : 'client'}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">数据库主机</span>
                <span className="text-sm text-gray-600">
                  {typeof window === 'undefined' ? (process.env.DATABASE_HOST || 'localhost') : 'N/A'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">数据库端口</span>
                <span className="text-sm text-gray-600">
                  {typeof window === 'undefined' ? (process.env.DATABASE_PORT || '5432') : 'N/A'}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">SSL连接</span>
                <Badge variant={typeof window === 'undefined' && process.env.NODE_ENV === 'production' ? "default" : "outline"}>
                  {typeof window === 'undefined' && process.env.NODE_ENV === 'production' ? '启用' : '禁用'}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">连接限制</span>
                <span className="text-sm text-gray-600">
                  {typeof window === 'undefined' ? (process.env.DATABASE_CONNECTION_LIMIT || '10') : 'N/A'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">最后更新</span>
                <span className="text-sm text-gray-600">
                  {lastUpdate || '未知'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
