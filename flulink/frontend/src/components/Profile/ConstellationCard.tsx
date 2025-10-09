import React from 'react';
import { Card, Typography, Avatar, Space, Tag, Button, Divider, Row, Col, Statistic } from 'antd';
import { UserOutlined, StarOutlined, MessageOutlined, HeartOutlined, ShareAltOutlined, CalendarOutlined, FireOutlined } from '@ant-design/icons';
import { User, StarSeed } from '../../types';

const { Title, Text, Paragraph } = Typography;

interface ConstellationCardProps {
  user: User;
  starSeeds?: StarSeed[];
  onEdit?: () => void;
  onSendMessage?: () => void;
  onFollow?: () => void;
  isOwnProfile?: boolean;
}

const ConstellationCard: React.FC<ConstellationCardProps> = ({
  user,
  starSeeds = [],
  onEdit,
  onSendMessage,
  onFollow,
  isOwnProfile = false,
}) => {
  const getJoinDays = () => {
    const joinDate = new Date(user.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - joinDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getTotalLuminosity = () => {
    return starSeeds.reduce((sum, seed) => sum + seed.luminosity, 0);
  };

  const getTotalInteractions = () => {
    return starSeeds.reduce((sum, seed) => sum + seed.interactions.length, 0);
  };

  const getAverageLuminosity = () => {
    return starSeeds.length > 0 ? Math.round(getTotalLuminosity() / starSeeds.length) : 0;
  };

  const getMostActiveTag = () => {
    const tagCounts: { [key: string]: number } = {};
    starSeeds.forEach(seed => {
      seed.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    return Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || '暂无';
  };

  return (
    <div className="constellation-card-container">
      {/* 主要信息卡片 */}
      <Card className="main-profile-card" bordered={false}>
        <div className="profile-header">
          <div className="profile-info">
            <Avatar
              size={80}
              src={user.avatar}
              icon={<UserOutlined />}
              className="profile-avatar"
            />
            <div className="profile-details">
              <Title level={3} className="profile-name">
                {user.username}
              </Title>
              <Text type="secondary" className="profile-email">
                {user.email}
              </Text>
              <div className="profile-stats">
                <Space size="large">
                  <div className="stat-item">
                    <CalendarOutlined className="stat-icon" />
                    <Text className="stat-text">加入 {getJoinDays()} 天</Text>
                  </div>
                  <div className="stat-item">
                    <StarOutlined className="stat-icon" />
                    <Text className="stat-text">{starSeeds.length} 个星种</Text>
                  </div>
                </Space>
              </div>
            </div>
          </div>

          <div className="profile-actions">
            <Space>
              {isOwnProfile ? (
                <Button
                  type="primary"
                  icon={<UserOutlined />}
                  onClick={onEdit}
                  className="edit-button"
                >
                  编辑资料
                </Button>
              ) : (
                <>
                  <Button
                    icon={<MessageOutlined />}
                    onClick={onSendMessage}
                    className="message-button"
                  >
                    私信
                  </Button>
                  <Button
                    type="primary"
                    icon={<HeartOutlined />}
                    onClick={onFollow}
                    className="follow-button"
                  >
                    关注
                  </Button>
                </>
              )}
            </Space>
          </div>
        </div>

        {user.bio && (
          <div className="profile-bio">
            <Paragraph className="bio-text">{user.bio}</Paragraph>
          </div>
        )}

        <div className="profile-tags">
          <Space size={[4, 4]} wrap>
            {user.tags.map(tag => (
              <Tag key={tag} color="blue" className="profile-tag">
                {tag}
              </Tag>
            ))}
          </Space>
        </div>
      </Card>

      {/* 星座档案卡片 */}
      {user.constellationName && (
        <Card
          title={
            <div className="constellation-title">
              <StarOutlined className="title-icon" />
              <Title level={4} className="title-text">星座档案</Title>
            </div>
          }
          className="constellation-card"
          bordered={false}
        >
          <div className="constellation-content">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div className="constellation-name">
                  <Title level={3} className="constellation-name-text">
                    {user.constellationName}
                  </Title>
                </div>
                {user.constellationDescription && (
                  <Paragraph className="constellation-description">
                    {user.constellationDescription}
                  </Paragraph>
                )}
              </Col>

              {user.constellationPersonality && user.constellationPersonality.length > 0 && (
                <Col span={24}>
                  <div className="personality-section">
                    <Text className="personality-label">性格特质:</Text>
                    <Space size={[4, 4]} wrap className="personality-tags">
                      {user.constellationPersonality.map(trait => (
                        <Tag key={trait} color="purple" className="personality-tag">
                          {trait}
                        </Tag>
                      ))}
                    </Space>
                  </div>
                </Col>
              )}
            </Row>
          </div>
        </Card>
      )}

      {/* 联系方式卡片 */}
      {user.contactInfo && (
        <Card
          title="联系方式"
          className="contact-card"
          bordered={false}
        >
          <div className="contact-info">
            <Space direction="vertical" size="middle" className="contact-list">
              {user.contactInfo.wechat && (
                <div className="contact-item">
                  <Text strong className="contact-label">微信:</Text>
                  <Text copyable className="contact-value">
                    {user.contactInfo.wechat}
                  </Text>
                </div>
              )}
              {user.contactInfo.telegram && (
                <div className="contact-item">
                  <Text strong className="contact-label">Telegram:</Text>
                  <Text copyable className="contact-value">
                    {user.contactInfo.telegram}
                  </Text>
                </div>
              )}
              {user.contactInfo.twitter && (
                <div className="contact-item">
                  <Text strong className="contact-label">Twitter:</Text>
                  <Text copyable className="contact-value">
                    {user.contactInfo.twitter}
                  </Text>
                </div>
              )}
            </Space>
          </div>
        </Card>
      )}

      {/* 统计数据卡片 */}
      <Card
        title="星空统计"
        className="stats-card"
        bordered={false}
      >
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={8} md={6}>
            <Statistic
              title="总光度"
              value={getTotalLuminosity()}
              prefix={<FireOutlined />}
              className="statistic-item"
            />
          </Col>
          <Col xs={12} sm={8} md={6}>
            <Statistic
              title="平均光度"
              value={getAverageLuminosity()}
              prefix={<StarOutlined />}
              className="statistic-item"
            />
          </Col>
          <Col xs={12} sm={8} md={6}>
            <Statistic
              title="总互动"
              value={getTotalInteractions()}
              prefix={<HeartOutlined />}
              className="statistic-item"
            />
          </Col>
          <Col xs={12} sm={8} md={6}>
            <Statistic
              title="活跃标签"
              value={getMostActiveTag()}
              className="statistic-item"
            />
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default ConstellationCard;


