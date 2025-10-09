import React from 'react'
import { Modal, Card, Avatar, Tag, Space, Button, Divider, Typography } from 'antd'
import { UserOutlined, MessageOutlined, HeartOutlined, StarOutlined } from '@ant-design/icons'
import { User, ClusterMember } from '../../types'

const { Title, Text, Paragraph } = Typography

interface ConstellationProfileModalProps {
  visible: boolean
  user: User | null
  member: ClusterMember | null
  onClose: () => void
  onSendMessage?: (userId: string) => void
  onAddToFavorites?: (userId: string) => void
}

const ConstellationProfileModal: React.FC<ConstellationProfileModalProps> = ({
  visible,
  user,
  member,
  onClose,
  onSendMessage,
  onAddToFavorites,
}) => {
  if (!user || !member) return null

  const handleSendMessage = () => {
    if (onSendMessage) {
      onSendMessage(user._id)
    }
  }

  const handleAddToFavorites = () => {
    if (onAddToFavorites) {
      onAddToFavorites(user._id)
    }
  }

  return (
    <Modal
      title="星座档案"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      className="constellation-profile-modal"
    >
      <div className="profile-content">
        {/* 用户基本信息 */}
        <Card className="profile-header-card">
          <div className="profile-header">
            <Avatar size={80} icon={<UserOutlined />} className="profile-avatar" />
            <div className="profile-info">
              <Title level={3} className="profile-name">
                {user.username}
              </Title>
              <Text type="secondary" className="profile-email">
                {user.email}
              </Text>
              <div className="profile-stats">
                <Space>
                  <Tag color="blue" icon={<StarOutlined />}>
                    共鸣值: {member.resonanceValue.toFixed(2)}
                  </Tag>
                  <Tag color="green">
                    位置: ({member.position.x.toFixed(1)}, {member.position.y.toFixed(1)})
                  </Tag>
                </Space>
              </div>
            </div>
          </div>
        </Card>

        {/* 星座档案信息 */}
        {user.constellationProfile && (
          <Card title="星座档案" className="constellation-card">
            <div className="constellation-info">
              <div className="constellation-name">
                <Title level={4}>{user.constellationProfile.constellationName}</Title>
              </div>
              
              <Paragraph className="constellation-description">
                {user.constellationProfile.constellationDescription}
              </Paragraph>

              <Divider />

              <div className="constellation-tags">
                <Title level={5}>兴趣爱好</Title>
                <Space wrap>
                  {user.constellationProfile.interests.map((interest) => (
                    <Tag key={interest} color="purple">
                      {interest}
                    </Tag>
                  ))}
                </Space>
              </div>

              <div className="constellation-personality">
                <Title level={5}>性格特点</Title>
                <Space wrap>
                  {user.constellationProfile.personality.map((trait) => (
                    <Tag key={trait} color="orange">
                      {trait}
                    </Tag>
                  ))}
                </Space>
              </div>

              <Divider />

              <div className="contact-info">
                <Title level={5}>联系方式</Title>
                <Space direction="vertical" style={{ width: '100%' }}>
                  {user.constellationProfile.contactInfo.wechat && (
                    <Text>微信: {user.constellationProfile.contactInfo.wechat}</Text>
                  )}
                  {user.constellationProfile.contactInfo.qq && (
                    <Text>QQ: {user.constellationProfile.contactInfo.qq}</Text>
                  )}
                  {user.constellationProfile.contactInfo.email && (
                    <Text>邮箱: {user.constellationProfile.contactInfo.email}</Text>
                  )}
                </Space>
              </div>
            </div>
          </Card>
        )}

        {/* 用户标签 */}
        <Card title="用户标签" className="user-tags-card">
          <Space wrap>
            {user.tags.map((tag) => (
              <Tag key={tag} color="blue">
                {tag}
              </Tag>
            ))}
          </Space>
        </Card>

        {/* 操作按钮 */}
        <div className="profile-actions">
          <Space>
            <Button
              type="primary"
              icon={<MessageOutlined />}
              onClick={handleSendMessage}
            >
              发送消息
            </Button>
            <Button
              icon={<HeartOutlined />}
              onClick={handleAddToFavorites}
            >
              添加关注
            </Button>
            <Button onClick={onClose}>
              关闭
            </Button>
          </Space>
        </div>
      </div>
    </Modal>
  )
}

export default ConstellationProfileModal


