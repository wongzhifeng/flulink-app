"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useFluLink } from '@/context/FluLinkContext'
import { GeoHeatmapData } from '@/types/index'
import { MapPin, Activity, TrendingUp } from 'lucide-react'

export default function HeatmapVisualization() {
  const { strains, spreadRecords, userLocation } = useFluLink()
  const [heatmapData, setHeatmapData] = useState<GeoHeatmapData[]>([])
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('24h')
  const [isGenerating, setIsGenerating] = useState(false)

  // 生成热力图数据
  const generateHeatmapData = async () => {
    setIsGenerating(true)
    
    try {
      // 模拟生成热力图数据
      const mockData: GeoHeatmapData[] = []
      
      if (userLocation) {
        // 在用户位置周围生成模拟数据点
        for (let i = 0; i < 20; i++) {
          const lat = userLocation.lat + (Math.random() - 0.5) * 0.1
          const lng = userLocation.lng + (Math.random() - 0.5) * 0.1
          const infectionCount = Math.floor(Math.random() * 50) + 1
          const intensity = Math.random()
          
          mockData.push({
            location: {
              lat,
              lng,
              address: `模拟位置 ${i + 1}`
            },
            infectionCount,
            intensity
          })
        }
      }
      
      setHeatmapData(mockData)
    } catch (error) {
      console.error('生成热力图数据失败:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  // 根据时间范围过滤数据
  const getFilteredData = () => {
    const now = new Date()
    const timeThreshold = new Date()
    
    switch (selectedTimeRange) {
      case '1h':
        timeThreshold.setHours(now.getHours() - 1)
        break
      case '6h':
        timeThreshold.setHours(now.getHours() - 6)
        break
      case '24h':
        timeThreshold.setDate(now.getDate() - 1)
        break
      case '7d':
        timeThreshold.setDate(now.getDate() - 7)
        break
    }
    
    return heatmapData.filter(data => data.intensity > 0.1)
  }

  // 获取热力图统计信息
  const getHeatmapStats = () => {
    const filteredData = getFilteredData()
    const totalInfections = filteredData.reduce((sum, data) => sum + data.infectionCount, 0)
    const avgIntensity = filteredData.reduce((sum, data) => sum + data.intensity, 0) / filteredData.length
    const maxIntensity = Math.max(...filteredData.map(data => data.intensity))
    
    return {
      totalInfections,
      avgIntensity: avgIntensity || 0,
      maxIntensity: maxIntensity || 0,
      dataPoints: filteredData.length
    }
  }

  const stats = getHeatmapStats()

  // 获取强度颜色
  const getIntensityColor = (intensity: number) => {
    if (intensity < 0.3) return 'bg-green-500'
    if (intensity < 0.6) return 'bg-yellow-500'
    if (intensity < 0.8) return 'bg-orange-500'
    return 'bg-red-500'
  }

  // 获取强度标签
  const getIntensityLabel = (intensity: number) => {
    if (intensity < 0.3) return '低'
    if (intensity < 0.6) return '中'
    if (intensity < 0.8) return '高'
    return '极高'
  }

  useEffect(() => {
    generateHeatmapData()
  }, [selectedTimeRange])

  return (
    <div className="space-y-6">
      {/* 热力图控制面板 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            区域感染热力图
          </CardTitle>
          <CardDescription>
            实时显示区域内的感染热力分布
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                时间范围
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value as '1h' | '6h' | '24h' | '7d')}
              >
                <option value="1h">最近1小时</option>
                <option value="6h">最近6小时</option>
                <option value="24h">最近24小时</option>
                <option value="7d">最近7天</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={generateHeatmapData}
                disabled={isGenerating}
                className="w-full sm:w-auto"
              >
                {isGenerating ? '生成中...' : '刷新数据'}
              </Button>
            </div>
          </div>

          {/* 统计信息 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {stats.totalInfections}
              </div>
              <div className="text-sm text-gray-600">总感染数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {stats.avgIntensity.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">平均强度</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {stats.maxIntensity.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">最高强度</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.dataPoints}
              </div>
              <div className="text-sm text-gray-600">数据点</div>
            </div>
          </div>

          {/* 强度图例 */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">强度图例</h4>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                <span className="text-sm text-gray-600">低 (0-0.3)</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
                <span className="text-sm text-gray-600">中 (0.3-0.6)</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-orange-500 rounded mr-2"></div>
                <span className="text-sm text-gray-600">高 (0.6-0.8)</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                <span className="text-sm text-gray-600">极高 (0.8-1.0)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 热力图可视化 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            热力图可视化
          </CardTitle>
          <CardDescription>
            感染热力分布的可视化展示
          </CardDescription>
        </CardHeader>
        <CardContent>
          {heatmapData.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">暂无热力图数据</div>
              <Button onClick={generateHeatmapData}>
                生成热力图数据
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 模拟热力图网格 */}
              <div className="grid grid-cols-5 md:grid-cols-10 gap-1 mb-4">
                {Array.from({ length: 50 }, (_, i) => {
                  const data = heatmapData[i % heatmapData.length]
                  return (
                    <div
                      key={i}
                      className={`aspect-square rounded-sm ${getIntensityColor(data.intensity)} opacity-${Math.floor(data.intensity * 10) * 10}`}
                      title={`强度: ${data.intensity.toFixed(2)}, 感染数: ${data.infectionCount}`}
                    ></div>
                  )
                })}
              </div>

              {/* 热力图数据列表 */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {getFilteredData().map((data, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${getIntensityColor(data.intensity)}`}></div>
                      <div>
                        <div className="text-sm font-medium">{data.location.address}</div>
                        <div className="text-xs text-gray-600">
                          感染数: {data.infectionCount}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {getIntensityLabel(data.intensity)}
                      </div>
                      <div className="text-xs text-gray-600">
                        {data.intensity.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 趋势分析 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            感染趋势分析
          </CardTitle>
          <CardDescription>
            分析感染趋势和传播模式
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">传播模式</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">主要传播方向:</span>
                  <span className="font-medium">东北方向</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">传播速度:</span>
                  <span className="font-medium text-green-600">中等</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">热点区域:</span>
                  <span className="font-medium">市中心</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">预测分析</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">预计峰值:</span>
                  <span className="font-medium">2-3天后</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">影响范围:</span>
                  <span className="font-medium">5km半径</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">风险等级:</span>
                  <span className="font-medium text-yellow-600">中等</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

