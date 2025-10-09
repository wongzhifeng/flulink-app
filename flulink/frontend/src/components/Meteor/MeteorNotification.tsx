import React, { useState, useEffect } from 'react'
import { Card, Tag, Progress, Button, Space, Typography } from 'antd'
import { StarOutlined, ClockCircleOutlined, EyeOutlined } from '@ant-design/icons'
import { StarSeed } from '../../types'

const { Title, Text } = Typography

interface MeteorNotificationProps {
  starSeed: StarSeed
  arrivalTime: Date
  onPreview?: (starSeed: StarSeed) => void
  onDismiss?: () => void
}

const MeteorNotification: React.FC<MeteorNotificationProps> = ({
  starSeed,
  arrivalTime,
  onPreview,
  onDismiss,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [isArrived, setIsArrived] = useState(false)

  useEffect(() => {
    const updateTimeLeft = () => {
      const now = new Date()
      const diff = arrivalTime.getTime() - now.getTime()
      
      if (diff <= 0) {
        setTimeLeft(0)
        setIsArrived(true)
      } else {
        setTimeLeft(diff)
      }
    }

    updateTimeLeft()
    const interval = setInterval(updateTimeLeft, 1000)

    return () => clearInterval(interval)
  }, [arrivalTime])

  const formatTimeLeft = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) {
      return `${days}天${hours % 24}小时${minutes % 60}分钟`
    } else if (hours > 0) {
      return `${hours}小时${minutes % 60}分钟${seconds % 60}秒`
    } else if (minutes > 0) {
      return `${minutes}分钟${seconds % 60}秒`
    } else {
      return `${seconds}秒`
    }
  }

  const getProgressPercent = (): number => {
    const totalTime = arrivalTime.getTime() - starSeed.createdAt.getTime()
    const elapsedTime = totalTime - timeLeft
    return Math.min((elapsedTime / totalTime) * 100, 100)
  }

  const getLuminosityColor = (luminosity: number): string => {
    if (luminosity >= 8) return '#f5222d'
    if (luminosity >= 6) return '#fa8c16'
    if (luminosity >= 4) return '#faad14'
    if (luminosity >= 2) return '#52c41a'
    return '#13c2c2'
  }

  const handlePreview = () => {
    if (onPreview) {
      onPreview(starSeed)
    }
  }

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss()
    }
  }

  return (
    <Card 
      className={`meteor-notification ${isArrived ? 'arrived' : 'pending'}`}
      style={{
        background: isArrived 
          ? 'linear-gradient(135deg, rgba(245, 34, 45, 0.1) 0%, rgba(250, 140, 22, 0.1) 100%)'
          : 'linear-gradient(135deg, rgba(24, 144, 255, 0.1) 0%, rgba(64, 169, 255, 0.1) 100%)',
        border: `1px solid ${isArrived ? 'rgba(245, 34, 45, 0.3)' : 'rgba(24, 144, 255, 0.3)'}`,
        marginBottom: '12px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* 流星拖尾效果 */}
      <div className="meteor-trail-effect" />
      
      <div className="notification-content">
        <div className="notification-header">
          <Space>
            <StarOutlined style={{ color: getLuminosityColor(starSeed.luminosity) }} />
            <Title level={5} style={{ margin: 0, color: '#ffffff' }}>
              {isArrived ? '流星已抵达' : '流星即将抵达'}
            </Title>
          </Space>
          <Button 
            type="text" 
            size="small" 
            onClick={handleDismiss}
            style={{ color: '#ffffff' }}
          >
            ×
          </Button>
        </div>

        <div className="notification-body">
          <div className="starseed-info">
            <Text style={{ color: '#ffffff' }}>
              {starSeed.content.text?.substring(0, 50)}...
            </Text>
            <div className="starseed-meta">
              <Space wrap>
                {starSeed.spectrum.slice(0, 2).map((tag) => (
                  <Tag key={tag} color="purple" size="small">
                    {tag}
                  </Tag>
                ))}
                <Tag 
                  color={getLuminosityColor(starSeed.luminosity)} 
                  size="small"
                >
                  光度: {starSeed.luminosity.toFixed(1)}
                </Tag>
              </Space>
            </div>
          </div>

          <div className="arrival-info">
            <div className="time-info">
              <Space>
                <ClockCircleOutlined style={{ color: '#ffffff' }} />
                <Text style={{ color: '#ffffff' }}>
                  {isArrived ? '已抵达' : `还有 ${formatTimeLeft(timeLeft)}`}
                </Text>
              </Space>
            </div>

            {!isArrived && (
              <div className="progress-info">
                <Progress
                  percent={getProgressPercent()}
                  strokeColor={{
                    '0%': '#13c2c2',
                    '100%': '#f5222d',
                  }}
                  showInfo={false}
                  size="small"
                />
              </div>
            )}
          </div>

          <div className="notification-actions">
            <Space>
              <Button
                type="primary"
                size="small"
                icon={<EyeOutlined />}
                onClick={handlePreview}
              >
                预览光芒
              </Button>
              {isArrived && (
                <Button
                  size="small"
                  onClick={handlePreview}
                >
                  查看详情
                </Button>
              )}
            </Space>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default MeteorNotification


