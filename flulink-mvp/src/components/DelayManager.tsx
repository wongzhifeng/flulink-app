"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useFluLink } from '@/context/FluLinkContext'
import { VirusStrain } from '@/types/index'
import { Clock, Timer, AlertCircle, CheckCircle } from 'lucide-react'

interface DelayManagerProps {
  strain: VirusStrain
}

export default function DelayManager({ strain }: DelayManagerProps) {
  const [delayStatus, setDelayStatus] = useState({
    remainingTime: strain.spreadDelay * 60 * 60 * 1000, // 转换为毫秒
    isActive: true,
    nextSpreadTime: new Date(Date.now() + strain.spreadDelay * 60 * 60 * 1000),
    spreadCount: 0
  })
  const [delayHistory, setDelayHistory] = useState<Array<{
    id: string
    delayTime: number
    spreadTime: Date
    isCompleted: boolean
  }>>([])

  // 倒计时效果
  useEffect(() => {
    if (!delayStatus.isActive || delayStatus.remainingTime <= 0) return

    const timer = setInterval(() => {
      setDelayStatus(prev => {
        const newRemainingTime = Math.max(0, prev.remainingTime - 1000)
        
        if (newRemainingTime === 0) {
          // 延迟结束，触发传播
          const newSpreadTime = new Date(Date.now() + strain.spreadDelay * 60 * 60 * 1000)
          const newHistory = [...delayHistory, {
            id: `delay-${Date.now()}`,
            delayTime: strain.spreadDelay,
            spreadTime: new Date(),
            isCompleted: true
          }]
          
          setDelayHistory(newHistory)
          
          return {
            ...prev,
            remainingTime: strain.spreadDelay * 60 * 60 * 1000,
            nextSpreadTime: newSpreadTime,
            spreadCount: prev.spreadCount + 1
          }
        }
        
        return {
          ...prev,
          remainingTime: newRemainingTime
        }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [delayStatus.isActive, delayStatus.remainingTime, strain.spreadDelay, delayHistory])

  // 格式化时间
  const formatTime = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60))
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000)
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  // 暂停/恢复延迟
  const toggleDelay = () => {
    setDelayStatus(prev => ({
      ...prev,
      isActive: !prev.isActive
    }))
  }

  // 重置延迟
  const resetDelay = () => {
    setDelayStatus({
      remainingTime: strain.spreadDelay * 60 * 60 * 1000,
      isActive: true,
      nextSpreadTime: new Date(Date.now() + strain.spreadDelay * 60 * 60 * 1000),
      spreadCount: 0
    })
    setDelayHistory([])
  }

  // 调整延迟时间
  const adjustDelay = (newDelayHours: number) => {
    setDelayStatus(prev => ({
      ...prev,
      remainingTime: newDelayHours * 60 * 60 * 1000,
      nextSpreadTime: new Date(Date.now() + newDelayHours * 60 * 60 * 1000)
    }))
  }

  // 获取延迟状态
  const getDelayStatus = () => {
    if (!delayStatus.isActive) return 'paused'
    if (delayStatus.remainingTime > 0) return 'waiting'
    return 'ready'
  }

  const status = getDelayStatus()

  return (
    <div className="space-y-6">
      {/* 延迟状态卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            传播延迟管理
          </CardTitle>
          <CardDescription>
            控制毒株的传播延迟和时机
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* 倒计时显示 */}
            <div className="text-center">
              <div className={`text-4xl font-bold mb-2 ${
                status === 'ready' ? 'text-green-600' :
                status === 'waiting' ? 'text-blue-600' : 'text-gray-600'
              }`}>
                {formatTime(delayStatus.remainingTime)}
              </div>
              <div className="text-sm text-gray-600">
                {status === 'ready' ? '准备传播' :
                 status === 'waiting' ? '等待中' : '已暂停'}
              </div>
            </div>

            {/* 状态指示器 */}
            <div className="text-center">
              <div className="flex justify-center mb-2">
                {status === 'ready' ? (
                  <CheckCircle className="w-8 h-8 text-green-600" />
                ) : status === 'waiting' ? (
                  <Timer className="w-8 h-8 text-blue-600 animate-pulse" />
                ) : (
                  <AlertCircle className="w-8 h-8 text-gray-600" />
                )}
              </div>
              <div className="text-sm text-gray-600">
                {status === 'ready' ? '可以传播' :
                 status === 'waiting' ? '倒计时中' : '已暂停'}
              </div>
            </div>

            {/* 传播统计 */}
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600 mb-2">
                {delayStatus.spreadCount}
              </div>
              <div className="text-sm text-gray-600">已完成传播</div>
            </div>
          </div>

          {/* 进度条 */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>传播进度</span>
              <span>{((strain.spreadDelay * 60 * 60 * 1000 - delayStatus.remainingTime) / (strain.spreadDelay * 60 * 60 * 1000) * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-1000 ${
                  status === 'ready' ? 'bg-green-500' :
                  status === 'waiting' ? 'bg-blue-500' : 'bg-gray-400'
                }`}
                style={{ 
                  width: `${((strain.spreadDelay * 60 * 60 * 1000 - delayStatus.remainingTime) / (strain.spreadDelay * 60 * 60 * 1000) * 100)}%` 
                }}
              ></div>
            </div>
          </div>

          {/* 控制按钮 */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button 
              onClick={toggleDelay}
              variant={status === 'paused' ? 'default' : 'outline'}
              className="flex-1 min-w-0"
            >
              {status === 'paused' ? '恢复延迟' : '暂停延迟'}
            </Button>
            <Button onClick={resetDelay} variant="outline">
              重置
            </Button>
          </div>

          {/* 延迟调整 */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">调整延迟时间</h4>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 4, 6, 12, 24].map(hours => (
                <Button
                  key={hours}
                  variant="outline"
                  size="sm"
                  onClick={() => adjustDelay(hours)}
                  className={strain.spreadDelay === hours ? 'bg-blue-100 border-blue-300' : ''}
                >
                  {hours}小时
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 延迟详情 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Timer className="w-5 h-5 mr-2" />
            延迟详情
          </CardTitle>
          <CardDescription>
            延迟配置和统计信息
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">延迟配置</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">当前延迟:</span>
                  <span className="font-medium">{strain.spreadDelay}小时</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">下次传播:</span>
                  <span className="font-medium">
                    {delayStatus.nextSpreadTime.toLocaleString('zh-CN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">延迟状态:</span>
                  <span className={`font-medium ${
                    status === 'ready' ? 'text-green-600' :
                    status === 'waiting' ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {status === 'ready' ? '准备就绪' :
                     status === 'waiting' ? '等待中' : '已暂停'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">毒株类型:</span>
                  <span className="font-medium">{strain.type}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">传播统计</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">总传播次数:</span>
                  <span className="font-medium">{delayStatus.spreadCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">平均延迟:</span>
                  <span className="font-medium">{strain.spreadDelay}小时</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">延迟历史:</span>
                  <span className="font-medium">{delayHistory.length}条</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">创建时间:</span>
                  <span className="font-medium">
                    {strain.createdAt ? strain.createdAt.toLocaleString('zh-CN') : '未知'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 延迟历史 */}
      {delayHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              延迟历史
            </CardTitle>
            <CardDescription>
              延迟执行的历史记录
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {delayHistory.slice(-10).reverse().map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <div>
                      <div className="text-sm font-medium">
                        延迟 {record.delayTime} 小时
                      </div>
                      <div className="text-xs text-gray-600">
                        {record.spreadTime.toLocaleString('zh-CN')}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-green-600">
                    已完成
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

