import React, { useState, useEffect } from 'react'
import { Card, List, Typography, Space, Button, Empty } from 'antd'
import { StarOutlined, ClockCircleOutlined, EyeOutlined } from '@ant-design/icons'
import { StarSeed } from '../../types'
import MeteorNotification from './MeteorNotification'
import MeteorCountdown from './MeteorCountdown'
import LightPreview from './LightPreview'

const { Title, Text } = Typography

interface MeteorManagerProps {
  starSeeds: StarSeed[]
  onStarSeedArrival?: (starSeed: StarSeed) => void
  onPreviewStarSeed?: (starSeed: StarSeed) => void
}

interface MeteorData {
  starSeed: StarSeed
  arrivalTime: Date
  isArrived: boolean
}

const MeteorManager: React.FC<MeteorManagerProps> = ({
  starSeeds,
  onStarSeedArrival,
  onPreviewStarSeed,
}) => {
  const [meteors, setMeteors] = useState<MeteorData[]>([])
  const [previewStarSeed, setPreviewStarSeed] = useState<StarSeed | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    // 生成流星数据
    const meteorData: MeteorData[] = starSeeds.map(starSeed => {
      // 计算抵达时间（基于创建时间和传播延迟）
      const baseDelay = 24 * 60 * 60 * 1000 // 24小时基础延迟
      const luminosityDelay = starSeed.luminosity * 2 * 60 * 60 * 1000 // 光度影响延迟
      const propagationDelay = starSeed.propagationPath.length * 30 * 60 * 1000 // 传播路径延迟
      
      const totalDelay = baseDelay + luminosityDelay + propagationDelay
      const arrivalTime = new Date(starSeed.createdAt.getTime() + totalDelay)
      
      return {
        starSeed,
        arrivalTime,
        isArrived: arrivalTime <= new Date(),
      }
    })

    // 按抵达时间排序
    meteorData.sort((a, b) => a.arrivalTime.getTime() - b.arrivalTime.getTime())
    
    setMeteors(meteorData)
  }, [starSeeds])

  const handleStarSeedArrival = (starSeed: StarSeed) => {
    setMeteors(prev => 
      prev.map(meteor => 
        meteor.starSeed._id === starSeed._id 
          ? { ...meteor, isArrived: true }
          : meteor
      )
    )

    if (onStarSeedArrival) {
      onStarSeedArrival(starSeed)
    }
  }

  const handlePreview = (starSeed: StarSeed) => {
    setPreviewStarSeed(starSeed)
    setShowPreview(true)
    
    if (onPreviewStarSeed) {
      onPreviewStarSeed(starSeed)
    }
  }

  const handleClosePreview = () => {
    setShowPreview(false)
    setPreviewStarSeed(null)
  }

  const handleDismissNotification = (starSeedId: string) => {
    setMeteors(prev => prev.filter(meteor => meteor.starSeed._id !== starSeedId))
  }

  const upcomingMeteors = meteors.filter(meteor => !meteor.isArrived)
  const arrivedMeteors = meteors.filter(meteor => meteor.isArrived)

  return (
    <div className="meteor-manager">
      <Card 
        title={
          <Space>
            <StarOutlined />
            <span>流星管理</span>
          </Space>
        }
        className="meteor-manager-card"
      >
        {/* 即将抵达的流星 */}
        <div className="upcoming-meteors">
          <Title level={5} style={{ color: '#ffffff', marginBottom: '16px' }}>
            <ClockCircleOutlined style={{ marginRight: '8px' }} />
            即将抵达的流星
          </Title>
          
          {upcomingMeteors.length > 0 ? (
            <List
              dataSource={upcomingMeteors.slice(0, 3)}
              renderItem={(meteor) => (
                <List.Item>
                  <MeteorNotification
                    starSeed={meteor.starSeed}
                    arrivalTime={meteor.arrivalTime}
                    onPreview={handlePreview}
                    onDismiss={() => handleDismissNotification(meteor.starSeed._id)}
                  />
                </List.Item>
              )}
            />
          ) : (
            <Empty 
              description="暂无即将抵达的流星"
              style={{ color: '#ffffff' }}
            />
          )}
        </div>

        {/* 已抵达的流星 */}
        {arrivedMeteors.length > 0 && (
          <div className="arrived-meteors">
            <Title level={5} style={{ color: '#ffffff', marginBottom: '16px' }}>
              <StarOutlined style={{ marginRight: '8px' }} />
              已抵达的流星
            </Title>
            
            <List
              dataSource={arrivedMeteors.slice(0, 2)}
              renderItem={(meteor) => (
                <List.Item>
                  <MeteorCountdown
                    starSeed={meteor.starSeed}
                    arrivalTime={meteor.arrivalTime}
                    onArrival={handleStarSeedArrival}
                  />
                </List.Item>
              )}
            />
          </div>
        )}

        {/* 统计信息 */}
        <div className="meteor-stats">
          <Space>
            <Text style={{ color: '#ffffff' }}>
              总计: {meteors.length} 个流星
            </Text>
            <Text style={{ color: '#52c41a' }}>
              即将抵达: {upcomingMeteors.length}
            </Text>
            <Text style={{ color: '#fa8c16' }}>
              已抵达: {arrivedMeteors.length}
            </Text>
          </Space>
        </div>
      </Card>

      {/* 光芒预览 */}
      {previewStarSeed && (
        <LightPreview
          starSeed={previewStarSeed}
          visible={showPreview}
          onClose={handleClosePreview}
        />
      )}
    </div>
  )
}

export default MeteorManager


