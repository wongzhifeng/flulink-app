import React from 'react'
import { Card, Tag, Space, Button, Progress, Timeline, Avatar, Typography } from 'antd'
import { HeartOutlined, CommentOutlined, ShareAltOutlined, StarOutlined, UserOutlined } from '@ant-design/icons'
import { StarSeed, User } from '../../types'

const { Title, Text, Paragraph } = Typography

interface StarSeedDetailDisplayProps {
  starSeed: StarSeed
  author?: User
  onLight?: (starSeedId: string) => void
  onComment?: (starSeedId: string) => void
  onShare?: (starSeedId: string) => void
  onAuthorClick?: (userId: string) => void
}

const StarSeedDetailDisplay: React.FC<StarSeedDetailDisplayProps> = ({
  starSeed,
  author,
  onLight,
  onComment,
  onShare,
  onAuthorClick,
}) => {
  const handleLight = () => {
    if (onLight) {
      onLight(starSeed._id)
    }
  }

  const handleComment = () => {
    if (onComment) {
      onComment(starSeed._id)
    }
  }

  const handleShare = () => {
    if (onShare) {
      onShare(starSeed._id)
    }
  }

  const handleAuthorClick = () => {
    if (onAuthorClick && author) {
      onAuthorClick(author._id)
    }
  }

  // 计算跃迁进度
  const jumpProgress = (starSeed.jumpCondition.currentValue / starSeed.jumpCondition.threshold) * 100

  // 计算光度等级
  const getLuminosityLevel = (luminosity: number): { level: string; color: string } => {
    if (luminosity >= 8) return { level: '超新星', color: '#f5222d' }
    if (luminosity >= 6) return { level: '巨星', color: '#fa8c16' }
    if (luminosity >= 4) return { level: '主序星', color: '#faad14' }
    if (luminosity >= 2) return { level: '矮星', color: '#52c41a' }
    return { level: '微星', color: '#13c2c2' }
  }

  const luminosityInfo = getLuminosityLevel(starSeed.luminosity)

  return (
    <div className="starseed-detail-display">
      <Card className="starseed-detail-card">
        {/* 星种内容 */}
        <div className="starseed-content">
          {starSeed.content.text && (
            <Paragraph className="starseed-text">
              {starSeed.content.text}
            </Paragraph>
          )}
          
          {starSeed.content.imageUrl && (
            <div className="starseed-image">
              <img 
                src={starSeed.content.imageUrl} 
                alt="星种图片"
                style={{ 
                  maxWidth: '100%', 
                  height: 'auto',
                  borderRadius: '8px',
                  marginTop: '12px'
                }}
              />
            </div>
          )}

          {starSeed.content.audioUrl && (
            <div className="starseed-audio">
              <audio 
                controls 
                style={{ 
                  width: '100%', 
                  marginTop: '12px',
                  borderRadius: '8px'
                }}
              >
                <source src={starSeed.content.audioUrl} type="audio/mpeg" />
                您的浏览器不支持音频播放
              </audio>
            </div>
          )}
        </div>

        {/* 星种元信息 */}
        <div className="starseed-meta">
          <Space wrap>
            {starSeed.spectrum.map((tag) => (
              <Tag key={tag} color="purple" icon={<StarOutlined />}>
                {tag}
              </Tag>
            ))}
            <Tag color={luminosityInfo.color}>
              {luminosityInfo.level}: {starSeed.luminosity.toFixed(2)}
            </Tag>
            <Tag color="cyan">
              传播: {starSeed.propagationPath.length} 个节点
            </Tag>
          </Space>
        </div>

        {/* 作者信息 */}
        {author && (
          <div className="starseed-author">
            <Card size="small" className="author-card">
              <div className="author-info" onClick={handleAuthorClick} style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} />
                <div className="author-details">
                  <Text strong>{author.username}</Text>
                  <Text type="secondary" style={{ marginLeft: '8px' }}>
                    {new Date(starSeed.createdAt).toLocaleString()}
                  </Text>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* 跃迁条件 */}
        <div className="jump-condition">
          <Title level={5}>跃迁条件</Title>
          <Progress
            percent={jumpProgress}
            strokeColor={{
              '0%': '#13c2c2',
              '100%': '#f5222d',
            }}
            format={(percent) => `${starSeed.jumpCondition.currentValue.toFixed(1)}/${starSeed.jumpCondition.threshold}`}
          />
          <Text type="secondary">
            {starSeed.jumpCondition.isJumped ? '已跃迁' : '未跃迁'}
          </Text>
        </div>

        {/* 传播路径 */}
        <div className="propagation-path">
          <Title level={5}>传播路径</Title>
          <Timeline>
            {starSeed.propagationPath.slice(0, 10).map((node, index) => (
              <Timeline.Item
                key={index}
                color={node.interactionType === 'light' ? '#52c41a' : 
                       node.interactionType === 'comment' ? '#1890ff' : '#fa8c16'}
              >
                <div className="propagation-node">
                  <Text strong>用户 {node.userId}</Text>
                  <Tag color="blue" style={{ marginLeft: '8px' }}>
                    {node.interactionType}
                  </Tag>
                  <Text type="secondary" style={{ marginLeft: '8px' }}>
                    {new Date(node.timestamp).toLocaleString()}
                  </Text>
                  <Tag color="orange" style={{ marginLeft: '8px' }}>
                    层级: {node.geographicLevel}
                  </Tag>
                </div>
              </Timeline.Item>
            ))}
            {starSeed.propagationPath.length > 10 && (
              <Timeline.Item color="gray">
                <Text type="secondary">
                  还有 {starSeed.propagationPath.length - 10} 个传播节点...
                </Text>
              </Timeline.Item>
            )}
          </Timeline>
        </div>

        {/* 交互按钮 */}
        <div className="starseed-actions">
          <Space>
            <Button
              type="primary"
              icon={<HeartOutlined />}
              onClick={handleLight}
              size="large"
            >
              点亮 ({starSeed.propagationPath.filter(p => p.interactionType === 'light').length})
            </Button>
            <Button
              icon={<CommentOutlined />}
              onClick={handleComment}
              size="large"
            >
              评论
            </Button>
            <Button
              icon={<ShareAltOutlined />}
              onClick={handleShare}
              size="large"
            >
              分享
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  )
}

export default StarSeedDetailDisplay


