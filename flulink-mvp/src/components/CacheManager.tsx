'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Zap, 
  CheckCircle, 
  XCircle, 
  Activity, 
  BarChart3,
  RefreshCw,
  Database,
  HardDrive,
  Trash2,
  Play,
  Pause,
  Settings
} from 'lucide-react'
import { cacheService } from '../lib/cacheService'
import { CacheStats } from '../types/cache'

export default function CacheManager() {
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [testKey, setTestKey] = useState('test:key')
  const [testValue, setTestValue] = useState('test value')
  const [testResult, setTestResult] = useState<string>('')
  const [isWarmingUp, setIsWarmingUp] = useState(false)

  useEffect(() => {
    loadCacheStats()
  }, [])

  const loadCacheStats = async () => {
    setIsLoading(true)
    try {
      const stats = cacheService.getStats()
      const isHealthy = await cacheService.healthCheck()
      
      setCacheStats({ ...stats, redisConnected: isHealthy })
      setLastUpdate(new Date().toLocaleString())
    } catch (error) {
      console.error('Failed to load cache stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    loadCacheStats()
  }

  const handleTestCache = async () => {
    try {
      // 设置测试值
      await cacheService.set(testKey, testValue, { ttl: 60 })
      
      // 获取测试值
      const retrieved = await cacheService.get(testKey)
      
      if (retrieved === testValue) {
        setTestResult('✅ 缓存测试成功！')
      } else {
        setTestResult('❌ 缓存测试失败！')
      }
      
      // 清理测试数据
      await cacheService.delete(testKey)
      
      // 刷新统计
      loadCacheStats()
    } catch (error) {
      setTestResult('❌ 缓存测试出错：' + error)
    }
  }

  const handleWarmup = async () => {
    setIsWarmingUp(true)
    try {
      await cacheService.warmup()
      setTestResult('✅ 缓存预热完成！')
      loadCacheStats()
    } catch (error) {
      setTestResult('❌ 缓存预热失败：' + error)
    } finally {
      setIsWarmingUp(false)
    }
  }

  const handleClearCache = async () => {
    try {
      await cacheService.clear()
      setTestResult('✅ 缓存已清空！')
      loadCacheStats()
    } catch (error) {
      setTestResult('❌ 清空缓存失败：' + error)
    }
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

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatTime = (ms: number) => {
    return `${ms.toFixed(2)}ms`
  }

  const formatPercentage = (rate: number) => {
    return `${(rate * 100).toFixed(1)}%`
  }

  return (
    <div className="space-y-6">
      {/* 头部操作 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">缓存管理</h2>
          <p className="text-gray-600">监控和管理FluLink缓存系统</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            刷新状态
          </Button>
          <Button onClick={handleWarmup} disabled={isWarmingUp}>
            <Play className={`w-4 h-4 mr-2 ${isWarmingUp ? 'animate-spin' : ''}`} />
            缓存预热
          </Button>
        </div>
      </div>

      {/* 缓存状态卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              命中率
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {cacheStats ? formatPercentage(cacheStats.hitRate) : '0%'}
            </div>
            <p className="text-xs text-gray-500">
              命中: {formatNumber(cacheStats?.hits || 0)} / 未命中: {formatNumber(cacheStats?.misses || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Activity className="h-4 h-4 mr-2" />
              总请求
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatNumber(cacheStats?.totalRequests || 0)}
            </div>
            <p className="text-xs text-gray-500">缓存请求总数</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              响应时间
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              {formatTime(cacheStats?.averageResponseTime || 0)}
            </div>
            <p className="text-xs text-gray-500">平均响应时间</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <HardDrive className="h-4 w-4 mr-2" />
              内存使用
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatBytes(cacheStats?.memoryUsage || 0)}
            </div>
            <p className="text-xs text-gray-500">缓存内存占用</p>
          </CardContent>
        </Card>
      </div>

      {/* 详细状态和操作 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 缓存状态 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              缓存状态
            </CardTitle>
            <CardDescription>
              缓存系统详细状态信息
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {cacheStats ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Redis连接</span>
                  <div className="flex items-center space-x-2">
                    {getConnectionStatusIcon(cacheStats.redisConnected)}
                    <Badge variant={cacheStats.redisConnected ? "default" : "destructive"}>
                      {cacheStats.redisConnected ? '已连接' : '未连接'}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">缓存命中</span>
                  <span className="text-sm text-gray-600">
                    {formatNumber(cacheStats.hits)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">缓存未命中</span>
                  <span className="text-sm text-gray-600">
                    {formatNumber(cacheStats.misses)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">命中率</span>
                  <span className="text-sm text-gray-600">
                    {formatPercentage(cacheStats.hitRate)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">最后更新</span>
                  <span className="text-sm text-gray-600">
                    {lastUpdate || '未知'}
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

        {/* 缓存测试 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              缓存测试
            </CardTitle>
            <CardDescription>
              测试缓存系统功能
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                测试键
              </label>
              <Input
                value={testKey}
                onChange={(e) => setTestKey(e.target.value)}
                placeholder="输入缓存键"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                测试值
              </label>
              <Input
                value={testValue}
                onChange={(e) => setTestValue(e.target.value)}
                placeholder="输入缓存值"
              />
            </div>
            
            <div className="flex space-x-2">
              <Button onClick={handleTestCache} className="flex-1">
                <Zap className="w-4 h-4 mr-2" />
                测试缓存
              </Button>
              <Button onClick={handleClearCache} variant="outline">
                <Trash2 className="w-4 h-4 mr-2" />
                清空缓存
              </Button>
            </div>
            
            {testResult && (
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-700">{testResult}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 缓存配置信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            缓存配置
          </CardTitle>
          <CardDescription>
            当前缓存系统配置信息
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">缓存策略</span>
                <Badge variant="outline">LRU</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">内存缓存大小</span>
                <span className="text-sm text-gray-600">1000 条目</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">内存TTL</span>
                <span className="text-sm text-gray-600">5 分钟</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Redis主机</span>
                <span className="text-sm text-gray-600">localhost</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Redis端口</span>
                <span className="text-sm text-gray-600">6379</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Redis TTL</span>
                <span className="text-sm text-gray-600">1 小时</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

