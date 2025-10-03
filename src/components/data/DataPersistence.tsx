"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Database,
  Save,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  HardDrive,
  Cloud,
  Shield,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PersistentData {
  id: string
  type: 'user' | 'strain' | 'session' | 'settings'
  data: any
  version: number
  lastModified: string
  size: number
}

interface BackupInfo {
  id: string
  timestamp: string
  size: number
  items: number
  status: 'completed' | 'failed' | 'in_progress'
}

interface DataPersistenceContextType {
  isInitialized: boolean
  isSaving: boolean
  lastSave: string | null
  backupHistory: BackupInfo[]
  saveData: (key: string, data: any, type?: PersistentData['type']) => Promise<void>
  loadData: (key: string) => Promise<any>
  deleteData: (key: string) => Promise<void>
  createBackup: () => Promise<string>
  restoreBackup: (backupId: string) => Promise<void>
  clearAllData: () => Promise<void>
}

const DataPersistenceContext = createContext<DataPersistenceContextType | null>(null)

export function DataPersistenceProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSave, setLastSave] = useState<string | null>(null)
  const [backupHistory, setBackupHistory] = useState<BackupInfo[]>([])

  // Initialize persistence system
  useEffect(() => {
    const initialize = async () => {
      try {
        // Load backup history
        const storedHistory = localStorage.getItem('flulink_backup_history')
        if (storedHistory) {
          setBackupHistory(JSON.parse(storedHistory))
        }

        // Load last save timestamp
        const lastSaveTime = localStorage.getItem('flulink_last_save')
        if (lastSaveTime) {
          setLastSave(lastSaveTime)
        }

        setIsInitialized(true)
      } catch (error) {
        console.error('Failed to initialize data persistence:', error)
      }
    }

    initialize()
  }, [])

  const saveData = async (key: string, data: any, type: PersistentData['type'] = 'user') => {
    setIsSaving(true)
    try {
      const persistentData: PersistentData = {
        id: key,
        type,
        data,
        version: 1,
        lastModified: new Date().toISOString(),
        size: JSON.stringify(data).length
      }

      await new Promise(resolve => setTimeout(resolve, 300)) // Simulate save delay

      localStorage.setItem(`flulink_${key}`, JSON.stringify(persistentData))

      const saveTime = new Date().toISOString()
      setLastSave(saveTime)
      localStorage.setItem('flulink_last_save', saveTime)

      console.log(`Data saved: ${key} (${type})`)
    } catch (error) {
      console.error('Failed to save data:', error)
      throw error
    } finally {
      setIsSaving(false)
    }
  }

  const loadData = async (key: string) => {
    try {
      const stored = localStorage.getItem(`flulink_${key}`)
      if (!stored) return null

      const persistentData: PersistentData = JSON.parse(stored)
      return persistentData.data
    } catch (error) {
      console.error('Failed to load data:', error)
      return null
    }
  }

  const deleteData = async (key: string) => {
    try {
      localStorage.removeItem(`flulink_${key}`)
      console.log(`Data deleted: ${key}`)
    } catch (error) {
      console.error('Failed to delete data:', error)
      throw error
    }
  }

  const createBackup = async (): Promise<string> => {
    const backupId = `backup_${Date.now()}`
    const backupInfo: BackupInfo = {
      id: backupId,
      timestamp: new Date().toISOString(),
      size: 0,
      items: 0,
      status: 'in_progress'
    }

    setBackupHistory(prev => [backupInfo, ...prev])

    try {
      // Simulate backup process
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Collect all flulink data
      const allData: Record<string, PersistentData> = {}
      let totalSize = 0
      let itemCount = 0

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('flulink_')) {
          const data = localStorage.getItem(key)
          if (data) {
            const persistentData: PersistentData = JSON.parse(data)
            allData[key] = persistentData
            totalSize += persistentData.size
            itemCount++
          }
        }
      }

      // Save backup
      localStorage.setItem(`flulink_backup_${backupId}`, JSON.stringify(allData))

      // Update backup info
      const completedBackup: BackupInfo = {
        ...backupInfo,
        size: totalSize,
        items: itemCount,
        status: 'completed'
      }

      setBackupHistory(prev =>
        prev.map(b => b.id === backupId ? completedBackup : b)
      )

      // Save backup history
      const updatedHistory = [completedBackup, ...backupHistory.filter(b => b.id !== backupId)]
      localStorage.setItem('flulink_backup_history', JSON.stringify(updatedHistory))

      console.log(`Backup created: ${backupId} (${itemCount} items, ${totalSize} bytes)`)
      return backupId
    } catch (error) {
      console.error('Failed to create backup:', error)

      const failedBackup: BackupInfo = {
        ...backupInfo,
        status: 'failed'
      }

      setBackupHistory(prev =>
        prev.map(b => b.id === backupId ? failedBackup : b)
      )

      throw error
    }
  }

  const restoreBackup = async (backupId: string) => {
    try {
      const backupData = localStorage.getItem(`flulink_backup_${backupId}`)
      if (!backupData) {
        throw new Error('Backup not found')
      }

      const allData: Record<string, PersistentData> = JSON.parse(backupData)

      // Clear current data
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('flulink_') && !key.startsWith('flulink_backup_')) {
          localStorage.removeItem(key)
        }
      }

      // Restore backup data
      Object.entries(allData).forEach(([key, data]) => {
        localStorage.setItem(key, JSON.stringify(data))
      })

      console.log(`Backup restored: ${backupId}`)
    } catch (error) {
      console.error('Failed to restore backup:', error)
      throw error
    }
  }

  const clearAllData = async () => {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('flulink_')) {
          localStorage.removeItem(key)
        }
      }

      setBackupHistory([])
      setLastSave(null)
      setIsInitialized(false)

      console.log('All data cleared')
    } catch (error) {
      console.error('Failed to clear data:', error)
      throw error
    }
  }

  const value = {
    isInitialized,
    isSaving,
    lastSave,
    backupHistory,
    saveData,
    loadData,
    deleteData,
    createBackup,
    restoreBackup,
    clearAllData
  }

  return (
    <DataPersistenceContext.Provider value={value}>
      {children}
    </DataPersistenceContext.Provider>
  )
}

export function useDataPersistence() {
  const context = useContext(DataPersistenceContext)
  if (!context) {
    throw new Error('useDataPersistence must be used within a DataPersistenceProvider')
  }
  return context
}

interface DataPersistenceManagerProps {
  className?: string
}

export default function DataPersistenceManager({ className }: DataPersistenceManagerProps) {
  const {
    isInitialized,
    isSaving,
    lastSave,
    backupHistory,
    saveData,
    createBackup,
    restoreBackup,
    clearAllData
  } = useDataPersistence()

  const [isCreatingBackup, setIsCreatingBackup] = useState(false)
  const [storageInfo, setStorageInfo] = useState({
    totalSize: 0,
    itemCount: 0,
    backupCount: 0
  })

  useEffect(() => {
    const calculateStorageInfo = () => {
      let totalSize = 0
      let itemCount = 0
      let backupCount = 0

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('flulink_')) {
          const data = localStorage.getItem(key)
          if (data) {
            totalSize += data.length
            itemCount++
            if (key.startsWith('flulink_backup_')) {
              backupCount++
            }
          }
        }
      }

      setStorageInfo({ totalSize, itemCount, backupCount })
    }

    calculateStorageInfo()
  }, [backupHistory, lastSave])

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true)
    try {
      await createBackup()
    } catch (error) {
      console.error('Backup creation failed:', error)
    } finally {
      setIsCreatingBackup(false)
    }
  }

  const handleRestoreBackup = async (backupId: string) => {
    try {
      await restoreBackup(backupId)
      alert('备份恢复成功！')
    } catch (error) {
      console.error('Backup restoration failed:', error)
      alert('备份恢复失败')
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getTimeAgo = (dateString: string) => {
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

  return (
    <div className={cn("space-y-6", className)}>
      {/* Storage Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <HardDrive className="w-5 h-5 mr-2" />
            数据存储概览
          </CardTitle>
          <CardDescription>
            本地数据存储状态和统计信息
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">{storageInfo.itemCount}</div>
              <div className="text-xs text-blue-800">数据项</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">{formatBytes(storageInfo.totalSize)}</div>
              <div className="text-xs text-green-800">存储空间</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-600">{storageInfo.backupCount}</div>
              <div className="text-xs text-purple-800">备份数量</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              {isSaving ? (
                <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 text-green-600" />
              )}
              <span className="text-sm font-medium">
                {isSaving ? '保存中...' : '系统就绪'}
              </span>
            </div>
            {lastSave && (
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-1" />
                {getTimeAgo(lastSave)}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Backup Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Cloud className="w-5 h-5 mr-2" />
            备份管理
          </CardTitle>
          <CardDescription>
            创建和管理数据备份
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Button
              onClick={handleCreateBackup}
              disabled={isCreatingBackup}
              className="flex items-center"
            >
              {isCreatingBackup ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  创建中...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  创建备份
                </>
              )}
            </Button>
            <Button variant="outline" className="flex items-center">
              <Upload className="w-4 h-4 mr-2" />
              导出数据
            </Button>
            <Button variant="outline" className="flex items-center">
              <Download className="w-4 h-4 mr-2" />
              导入数据
            </Button>
          </div>

          {/* Backup History */}
          {backupHistory.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">备份历史</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {backupHistory.map(backup => (
                  <div
                    key={backup.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <div className="font-medium text-sm">
                          {new Date(backup.timestamp).toLocaleString('zh-CN')}
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            backup.status === 'completed' && "bg-green-100 text-green-800",
                            backup.status === 'failed' && "bg-red-100 text-red-800",
                            backup.status === 'in_progress' && "bg-blue-100 text-blue-800"
                          )}
                        >
                          {backup.status === 'completed' && '已完成'}
                          {backup.status === 'failed' && '失败'}
                          {backup.status === 'in_progress' && '进行中'}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600">
                        {backup.items} 项数据 • {formatBytes(backup.size)}
                      </div>
                    </div>
                    {backup.status === 'completed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestoreBackup(backup.id)}
                      >
                        恢复
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="w-5 h-5 mr-2" />
            数据管理
          </CardTitle>
          <CardDescription>
            高级数据管理选项
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div>
                <div className="font-medium">清除缓存数据</div>
                <div className="text-sm text-yellow-700">删除所有临时和缓存数据</div>
              </div>
              <Button variant="outline" size="sm">
                清除
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
              <div>
                <div className="font-medium">重置所有数据</div>
                <div className="text-sm text-red-700">删除所有用户数据和设置</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllData}
                className="text-red-600 border-red-300"
              >
                重置
              </Button>
            </div>
          </div>

          {/* Security Notice */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-700">
                <strong>安全提示：</strong> 所有数据都存储在您的浏览器本地，不会上传到服务器。
                定期备份可以防止数据丢失。
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}