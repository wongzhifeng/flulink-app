"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useFluLink } from '@/context/FluLinkContext'
import { VirusStrain, SpreadRecord } from '@/types'
import { calculateDistance, formatDate } from '@/lib/utils'
import { MapPin, Clock, Users, Activity } from 'lucide-react'

interface SpreadSimulationProps {
  strain: VirusStrain
}

export default function SpreadSimulation({ strain }: SpreadSimulationProps) {
  const { userLocation, addSpreadRecord } = useFluLink()
  const [spreadStatus, setSpreadStatus] = useState({
    isSpreading: false,
    currentRadius: 0,
    infectedUsers: 0,
    nextSpreadTime: new Date(Date.now() + strain.spreadDelay * 60 * 60 * 1000)
  })
  const [spreadHistory, setSpreadHistory] = useState<SpreadRecord[]>([])

  // 模拟传播过程
  useEffect(() => {
    if (!spreadStatus.isSpreading) return

    const interval = setInterval(() => {
      setSpreadStatus(prev => {
        const newRadius = Math.min(prev.currentRadius + 0.1, strain.location.radius)
        const newInfectedUsers = Math.floor(newRadius * 10) // 模拟感染用户数
        
        // 创建传播记录
        if (userLocation) {
          const record: SpreadRecord = {
            id: `spread-${Date.now()}`,
            strainId: strain.id,
            userId: 'simulated-user',
            location: {
              lat: userLocation.lat + (Math.random() - 0.5) * 0.01,
              lng: userLocation.lng + (Math.random() - 0.5) * 0.01,
              address: '模拟位置'
            },
            spreadTime: new Date(),
            isInfected: true
          }
          
          addSpreadRecord(record)
          setSpreadHistory(prev => [...prev, record])
        }

        return {
          ...prev,
          currentRadius: newRadius,
          infectedUsers: newInfectedUsers
        }
      })
    }, 2000) // 每2秒更新一次

    return () => clearInterval(interval)
  }, [spreadStatus.isSpreading, strain.id, strain.location.radius, userLocation, addSpreadRecord])

  const startSpread = () => {
    setSpreadStatus(prev => ({
      ...prev,
      isSpreading: true
    }))
  }

  const stopSpread = () => {
    setSpreadStatus(prev => ({
      ...prev,
      isSpreading: false
    }))
  }

  const resetSpread = () => {
    setSpreadStatus({
      isSpreading: false,
      currentRadius: 0,
      infectedUsers: 0,
      nextSpreadTime: new Date(Date.now() + strain.spreadDelay * 60 * 60 * 1000)
    })
    setSpreadHistory([])
  }

  const getSpreadProgress = () => {
    return (spreadStatus.currentRadius / strain.location.radius) * 100
  }

  const getSpreadIntensity = () => {
    if (spreadStatus.currentRadius < strain.location.radius * 0.3) return 'low'
    if (spreadStatus.currentRadius < strain.location.radius * 0.7) return 'medium'
    return 'high'
  }

  return (
    <div className="space-y-6">
      {/* 传播状态卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            传播状态
          </CardTitle>
          <CardDescription>
            实时监控毒株传播情况
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {spreadStatus.currentRadius.toFixed(1)}km
              </div>
              <div className="text-sm text-gray-600">当前半径</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {spreadStatus.infectedUsers}
              </div>
              <div className="text-sm text-gray-600">感染用户</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {getSpreadProgress().toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">传播进度</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                getSpreadIntensity() === 'high' ? 'text-red-600' :
                getSpreadIntensity() === 'medium' ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {getSpreadIntensity() === 'high' ? '高' :
                 getSpreadIntensity() === 'medium' ? '中' : '低'}
              </div>
              <div className="text-sm text-gray-600">传播强度</div>
            </div>
          </div>

          {/* 传播进度条 */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>传播进度</span>
              <span>{getSpreadProgress().toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-red-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${getSpreadProgress()}%` }}
              ></div>
            </div>
          </div>

          {/* 控制按钮 */}
          <div className="flex space-x-2">
            {!spreadStatus.isSpreading ? (
              <Button onClick={startSpread} className="flex-1">
                开始传播
              </Button>
            ) : (
              <Button onClick={stopSpread} variant="destructive" className="flex-1">
                停止传播
              </Button>
            )}
            <Button onClick={resetSpread} variant="outline">
              重置
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 传播详情 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            传播详情
          </CardTitle>
          <CardDescription>
            毒株传播的详细信息
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">传播参数</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">最大半径:</span>
                  <span className="font-medium">{strain.location.radius}km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">传播延迟:</span>
                  <span className="font-medium">{strain.spreadDelay}小时</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">毒株类型:</span>
                  <span className="font-medium">{strain.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">创建时间:</span>
                  <span className="font-medium">{formatDate(strain.createdAt)}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">传播统计</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">传播记录:</span>
                  <span className="font-medium">{spreadHistory.length}条</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">传播状态:</span>
                  <span className={`font-medium ${
                    spreadStatus.isSpreading ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {spreadStatus.isSpreading ? '传播中' : '已停止'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">下次传播:</span>
                  <span className="font-medium">{formatDate(spreadStatus.nextSpreadTime)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 传播历史 */}
      {spreadHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              传播历史
            </CardTitle>
            <CardDescription>
              最近的传播记录
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {spreadHistory.slice(-10).reverse().map((record) => (
                <div key={record.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <div>
                      <div className="text-sm font-medium">传播记录</div>
                      <div className="text-xs text-gray-600">
                        {formatDate(record.spreadTime)}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {record.location.address}
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

