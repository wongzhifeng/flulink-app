"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Cloud,
  Wifi,
  WifiOff,
  Upload,
  Download,
  Clock,
  Settings,
  Shield,
  Database
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SyncItem {
  id: string
  type: 'user' | 'strain' | 'session' | 'settings'
  localVersion: number
  remoteVersion: number | null
  lastSync: string | null
  status: 'synced' | 'pending' | 'conflict' | 'error'
  size: number
}

interface SyncStatus {
  isOnline: boolean
  isSyncing: boolean
  lastSync: string | null
  pendingItems: number
  totalItems: number
  syncProgress: number
  conflicts: number
  errors: number
}

interface DataSynchronizationContextType {
  syncStatus: SyncStatus
  syncItems: SyncItem[]
  syncAll: () => Promise<void>
  syncItem: (itemId: string) => Promise<void>
  resolveConflict: (itemId: string, useLocal: boolean) => Promise<void>
  retryFailed: () => Promise<void>
  setAutoSync: (enabled: boolean) => void
}

const DataSynchronizationContext = createContext<DataSynchronizationContextType | null>(null)

export function DataSynchronizationProvider({ children }: { children: ReactNode }) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: true,
    isSyncing: false,
    lastSync: null,
    pendingItems: 0,
    totalItems: 0,
    syncProgress: 0,
    conflicts: 0,
    errors: 0
  })

  const [syncItems, setSyncItems] = useState<SyncItem[]>([])
  const [autoSync, setAutoSync] = useState(true)

  // Check online status
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: true }))
      if (autoSync) {
        syncAll()
      }
    }

    const handleOffline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: false }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [autoSync])

  // Scan for sync items
  useEffect(() => {
    const scanSyncItems = () => {
      const items: SyncItem[] = []
      let pendingCount = 0
      let conflictCount = 0
      let errorCount = 0

      // Scan localStorage for flulink data
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('flulink_') && !key.startsWith('flulink_backup_')) {
          try {
            const data = localStorage.getItem(key)
            if (data) {
              const parsed = JSON.parse(data)
              const item: SyncItem = {
                id: key.replace('flulink_', ''),
                type: parsed.type || 'user',
                localVersion: parsed.version || 1,
                remoteVersion: null, // Would come from server in real implementation
                lastSync: parsed.lastModified || null,
                status: 'pending', // Default status
                size: parsed.size || data.length
              }
              items.push(item)
              pendingCount++
            }
          } catch (error) {
            console.error(`Failed to parse sync item ${key}:`, error)
            errorCount++
          }
        }
      }

      setSyncItems(items)
      setSyncStatus(prev => ({
        ...prev,
        pendingItems: pendingCount,
        totalItems: items.length,
        conflicts: conflictCount,
        errors: errorCount
      }))
    }

    scanSyncItems()

    // Auto-scan every 30 seconds
    const interval = setInterval(scanSyncItems, 30000)
    return () => clearInterval(interval)
  }, [])

  const syncAll = async () => {
    if (!syncStatus.isOnline || syncStatus.isSyncing) return

    setSyncStatus(prev => ({ ...prev, isSyncing: true, syncProgress: 0 }))

    try {
      const totalItems = syncItems.length
      let processed = 0

      for (const item of syncItems) {
        try {
          await syncItem(item.id)
          processed++
          setSyncStatus(prev => ({
            ...prev,
            syncProgress: Math.round((processed / totalItems) * 100)
          }))
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error)
        }

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        lastSync: new Date().toISOString(),
        pendingItems: 0,
        syncProgress: 100
      }))

      console.log(`Sync completed: ${processed}/${totalItems} items`)
    } catch (error) {
      console.error('Sync failed:', error)
      setSyncStatus(prev => ({ ...prev, isSyncing: false }))
    }
  }

  const syncItem = async (itemId: string) => {
    if (!syncStatus.isOnline) {
      throw new Error('Device is offline')
    }

    try {
      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Update item status
      setSyncItems(prev =>
        prev.map(item =>
          item.id === itemId
            ? { ...item, status: 'synced', lastSync: new Date().toISOString() }
            : item
        )
      )

      console.log(`Item synced: ${itemId}`)
    } catch (error) {
      console.error(`Failed to sync item ${itemId}:`, error)
      setSyncItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, status: 'error' } : item
        )
      )
      throw error
    }
  }

  const resolveConflict = async (itemId: string, useLocal: boolean) => {
    try {
      // Simulate conflict resolution
      await new Promise(resolve => setTimeout(resolve, 500))

      setSyncItems(prev =>
        prev.map(item =>
          item.id === itemId
            ? { ...item, status: 'synced', lastSync: new Date().toISOString() }
            : item
        )
      )

      console.log(`Conflict resolved for ${itemId} (useLocal: ${useLocal})`)
    } catch (error) {
      console.error(`Failed to resolve conflict for ${itemId}:`, error)
      throw error
    }
  }

  const retryFailed = async () => {
    const failedItems = syncItems.filter(item => item.status === 'error')

    for (const item of failedItems) {
      try {
        await syncItem(item.id)
      } catch (error) {
        console.error(`Retry failed for ${item.id}:`, error)
      }
    }
  }

  const value = {
    syncStatus,
    syncItems,
    syncAll,
    syncItem,
    resolveConflict,
    retryFailed,
    setAutoSync
  }

  return (
    <DataSynchronizationContext.Provider value={value}>
      {children}
    </DataSynchronizationContext.Provider>
  )
}

export function useDataSynchronization() {
  const context = useContext(DataSynchronizationContext)
  if (!context) {
    throw new Error('useDataSynchronization must be used within a DataSynchronizationProvider')
  }
  return context
}

interface DataSynchronizationManagerProps {
  className?: string
}

export default function DataSynchronizationManager({ className }: DataSynchronizationManagerProps) {
  const {
    syncStatus,
    syncItems,
    syncAll,
    syncItem,
    resolveConflict,
    retryFailed,
    setAutoSync
  } = useDataSynchronization()

  const getStatusColor = (status: SyncItem['status']) => {
    switch (status) {
      case 'synced':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'conflict':
        return 'bg-red-100 text-red-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: SyncItem['status']) => {
    switch (status) {
      case 'synced':
        return <CheckCircle className="w-4 h-4" />
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'conflict':
        return <AlertTriangle className="w-4 h-4" />
      case 'error':
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getTimeAgo = (dateString: string | null) => {
    if (!dateString) return '从未同步'

    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return '刚刚'
    if (diffMins < 60) return `${diffMins}分钟前`
    if (diffHours < 24) return `${diffHours}小时前`
    return `${diffDays}天前`
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getTypeIcon = (type: SyncItem['type']) => {
    switch (type) {
      case 'user':
        return <Shield className="w-4 h-4" />
      case 'strain':
        return <Database className="w-4 h-4" />
      case 'session':
        return <Clock className="w-4 h-4" />
      case 'settings':
        return <Settings className="w-4 h-4" />
      default:
        return <Database className="w-4 h-4" />
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Sync Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Cloud className="w-5 h-5 mr-2" />
            数据同步状态
          </CardTitle>
          <CardDescription>
            跨设备数据同步状态和统计信息
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              {syncStatus.isOnline ? (
                <>
                  <Wifi className="w-4 h-4 text-green-600" />
                  <span className="font-medium">在线</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-red-600" />
                  <span className="font-medium">离线</span>
                </>
              )}
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div>待同步: {syncStatus.pendingItems}</div>
              <div>冲突: {syncStatus.conflicts}</div>
              <div>错误: {syncStatus.errors}</div>
            </div>
          </div>

          {/* Sync Progress */}
          {syncStatus.isSyncing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">同步进度</span>
                <span className="font-medium">{syncStatus.syncProgress}%</span>
              </div>
              <Progress value={syncStatus.syncProgress} className="h-2" />
            </div>
          )}

          {/* Last Sync */}
          {syncStatus.lastSync && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">最后同步</span>
              <span className="font-medium">{getTimeAgo(syncStatus.lastSync)}</span>
            </div>
          )}

          {/* Sync Actions */}
          <div className="flex space-x-2">
            <Button
              onClick={syncAll}
              disabled={!syncStatus.isOnline || syncStatus.isSyncing}
              className="flex items-center flex-1"
            >
              {syncStatus.isSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  同步中...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  立即同步
                </>
              )}
            </Button>
            <Button variant="outline" className="flex items-center">
              <Upload className="w-4 h-4 mr-2" />
              上传
            </Button>
            <Button variant="outline" className="flex items-center">
              <Download className="w-4 h-4 mr-2" />
              下载
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sync Items */}
      <Card>
        <CardHeader>
          <CardTitle>同步项目</CardTitle>
          <CardDescription>
            所有需要同步的数据项目
          </CardDescription>
        </CardHeader>
        <CardContent>
          {syncItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Cloud className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>暂无需要同步的数据</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {syncItems.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <div className={cn(
                      "p-2 rounded",
                      item.status === 'synced' ? "bg-green-100 text-green-600" :
                      item.status === 'pending' ? "bg-yellow-100 text-yellow-600" :
                      "bg-red-100 text-red-600"
                    )}>
                      {getTypeIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <div className="font-medium text-sm truncate">{item.id}</div>
                        <Badge variant="outline" className={getStatusColor(item.status)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(item.status)}
                            <span>
                              {item.status === 'synced' ? '已同步' :
                               item.status === 'pending' ? '待同步' :
                               item.status === 'conflict' ? '冲突' : '错误'}
                            </span>
                          </div>
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600">
                        {formatBytes(item.size)} • {item.type}
                        {item.lastSync && ` • ${getTimeAgo(item.lastSync)}`}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-1">
                    {item.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => syncItem(item.id)}
                        disabled={!syncStatus.isOnline}
                      >
                        同步
                      </Button>
                    )}
                    {item.status === 'conflict' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resolveConflict(item.id, true)}
                        >
                          使用本地
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resolveConflict(item.id, false)}
                        >
                          使用远程
                        </Button>
                      </>
                    )}
                    {item.status === 'error' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => syncItem(item.id)}
                        disabled={!syncStatus.isOnline}
                      >
                        重试
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sync Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            同步设置
          </CardTitle>
          <CardDescription>
            配置数据同步行为
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">自动同步</div>
                <div className="text-sm text-gray-600">在线时自动同步数据</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={true}
                  onChange={(e) => setAutoSync(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">仅WiFi同步</div>
                <div className="text-sm text-gray-600">仅在WiFi网络下同步</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  defaultChecked
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">同步图片</div>
                <div className="text-sm text-gray-600">同步毒株相关图片</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  defaultChecked
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* Retry Failed */}
          {syncStatus.errors > 0 && (
            <Button
              variant="outline"
              onClick={retryFailed}
              disabled={!syncStatus.isOnline}
              className="w-full"
            >
              重试所有失败项目
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}