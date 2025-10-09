import React, { useState, useEffect } from 'react'
import { Card, Statistic, Progress, Typography, Space } from 'antd'
import { ClockCircleOutlined, StarOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { StarSeed } from '../../types'

const { Title, Text } = Typography

interface MeteorCountdownProps {
  starSeed: StarSeed
  arrivalTime: Date
  onArrival?: (starSeed: StarSeed) => void
}

const MeteorCountdown: React.FC<MeteorCountdownProps> = ({
  starSeed,
  arrivalTime,
  onArrival,
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [isArrived, setIsArrived] = useState(false)
  const [totalTime, setTotalTime] = useState(0)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const diff = arrivalTime.getTime() - now.getTime()
      
      if (diff <= 0) {
        setIsArrived(true)
        if (onArrival) {
          onArrival(starSeed)
        }
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeLeft({ days, hours, minutes, seconds })
    }

    // 计算总时间
    const total = arrivalTime.getTime() - starSeed.createdAt.getTime()
    setTotalTime(total)

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(interval)
  }, [arrivalTime, starSeed, onArrival])

  const getProgressPercent = (): number => {
    if (totalTime === 0) return 0
    const elapsedTime = totalTime - (timeLeft.days * 24 * 60 * 60 * 1000 + 
                                   timeLeft.hours * 60 * 60 * 1000 + 
                                   timeLeft.minutes * 60 * 1000 + 
                                   timeLeft.seconds * 1000)
    return Math.min((elapsedTime / totalTime) * 100, 100)
  }

  const getLuminosityLevel = (luminosity: number): { level: string; color: string } => {
    if (luminosity >= 8) return { level: '超新星', color: '#f5222d' }
    if (luminosity >= 6) return { level: '巨星', color: '#fa8c16' }
    if (luminosity >= 4) return { level: '主序星', color: '#faad14' }
    if (luminosity >= 2) return { level: '矮星', color: '#52c41a' }
    return { level: '微星', color: '#13c2c2' }
  }

  const luminosityInfo = getLuminosityLevel(starSeed.luminosity)

  if (isArrived) {
    return (
      <Card 
        className="meteor-countdown arrived"
        style={{
          background: 'linear-gradient(135deg, rgba(245, 34, 45, 0.1) 0%, rgba(250, 140, 22, 0.1) 100%)',
          border: '1px solid rgba(245, 34, 45, 0.3)',
          textAlign: 'center'
        }}
      >
        <div className="arrival-celebration">
          <ThunderboltOutlined style={{ fontSize: '48px', color: '#f5222d', marginBottom: '16px' }} />
          <Title level={3} style={{ color: '#ffffff', marginBottom: '8px' }}>
            流星已抵达！
          </Title>
          <Text style={{ color: '#ffffff' }}>
            星种 "{starSeed.spectrum[0] || '未知'}" 的光芒已经到达你的星空
          </Text>
        </div>
      </Card>
    )
  }

  return (
    <Card 
      className="meteor-countdown"
      style={{
        background: 'linear-gradient(135deg, rgba(24, 144, 255, 0.1) 0%, rgba(64, 169, 255, 0.1) 100%)',
        border: '1px solid rgba(24, 144, 255, 0.3)',
        textAlign: 'center'
      }}
    >
      <div className="countdown-header">
        <Space>
          <StarOutlined style={{ color: luminosityInfo.color }} />
          <Title level={4} style={{ color: '#ffffff', margin: 0 }}>
            流星倒计时
          </Title>
        </Space>
        <Text style={{ color: '#ffffff', fontSize: '12px' }}>
          {luminosityInfo.level} · 光度 {starSeed.luminosity.toFixed(1)}
        </Text>
      </div>

      <div className="countdown-timer">
        <Space size="large">
          <Statistic
            title="天"
            value={timeLeft.days}
            valueStyle={{ color: '#ffffff', fontSize: '24px' }}
          />
          <Statistic
            title="时"
            value={timeLeft.hours}
            valueStyle={{ color: '#ffffff', fontSize: '24px' }}
          />
          <Statistic
            title="分"
            value={timeLeft.minutes}
            valueStyle={{ color: '#ffffff', fontSize: '24px' }}
          />
          <Statistic
            title="秒"
            value={timeLeft.seconds}
            valueStyle={{ color: '#ffffff', fontSize: '24px' }}
          />
        </Space>
      </div>

      <div className="countdown-progress">
        <div className="progress-header">
          <Space>
            <ClockCircleOutlined style={{ color: '#ffffff' }} />
            <Text style={{ color: '#ffffff' }}>
              传播进度
            </Text>
          </Space>
        </div>
        <Progress
          percent={getProgressPercent()}
          strokeColor={{
            '0%': '#13c2c2',
            '50%': '#faad14',
            '100%': '#f5222d',
          }}
          showInfo={true}
          format={(percent) => `${percent?.toFixed(1)}%`}
        />
      </div>

      <div className="countdown-info">
        <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px' }}>
          预计抵达时间: {arrivalTime.toLocaleString()}
        </Text>
      </div>
    </Card>
  )
}

export default MeteorCountdown


