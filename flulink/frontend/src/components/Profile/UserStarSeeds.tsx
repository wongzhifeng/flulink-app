import React, { useState, useEffect } from 'react';
import { List, Card, Typography, Avatar, Space, Tag, Button, Empty, Pagination } from 'antd';
import { StarOutlined, FireOutlined, CommentOutlined, ShareAltOutlined, EyeOutlined, CalendarOutlined } from '@ant-design/icons';
import { User, StarSeed } from '../../types';
import apiService from '../../utils/apiService';

const { Title, Text, Paragraph } = Typography;

interface UserStarSeedsProps {
  userId: string;
  onStarSeedClick: (starSeed: StarSeed) => void;
}

const UserStarSeeds: React.FC<UserStarSeedsProps> = ({
  userId,
  onStarSeedClick,
}) => {
  const [starSeeds, setStarSeeds] = useState<StarSeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    fetchUserStarSeeds();
  }, [userId, currentPage]);

  const fetchUserStarSeeds = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(`/users/${userId}/starseeds?page=${currentPage}&limit=${pageSize}`);
      
      if (response.data.success) {
        setStarSeeds(response.data.starSeeds || []);
        setTotal(response.data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch user star seeds:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getLuminosityColor = (luminosity: number) => {
    if (luminosity >= 80) return 'red';
    if (luminosity >= 60) return 'orange';
    if (luminosity >= 40) return 'blue';
    return 'default';
  };

  const getLuminosityText = (luminosity: number) => {
    if (luminosity >= 80) return '极亮';
    if (luminosity >= 60) return '明亮';
    if (luminosity >= 40) return '中等';
    return '微弱';
  };

  return (
    <Card
      title={
        <div className="user-starseeds-header">
          <StarOutlined className="header-icon" />
          <Title level={4} className="header-title">发布的星种</Title>
          <Text type="secondary" className="count-text">
            ({total} 个)
          </Text>
        </div>
      }
      className="user-starseeds-card"
      bordered={false}
    >
      {starSeeds.length === 0 && !loading ? (
        <Empty
          description="暂无发布的星种"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          className="empty-state"
        >
          <Text type="secondary">用户还没有发布任何星种</Text>
        </Empty>
      ) : (
        <>
          <List
            loading={loading}
            dataSource={starSeeds}
            renderItem={(starSeed) => (
              <List.Item
                key={starSeed._id}
                className="starseed-item"
                actions={[
                  <Button
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={() => onStarSeedClick(starSeed)}
                    className="view-button"
                  >
                    查看
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <div className="starseed-avatar">
                      <div className={`luminosity-indicator ${getLuminosityColor(starSeed.luminosity)}`}>
                        <FireOutlined className="luminosity-icon" />
                      </div>
                    </div>
                  }
                  title={
                    <div className="starseed-title">
                      <Text className="starseed-content-preview">
                        {starSeed.content.text?.substring(0, 50) || '图片星种'}
                        {starSeed.content.text && starSeed.content.text.length > 50 && '...'}
                      </Text>
                      <Tag color={getLuminosityColor(starSeed.luminosity)} className="luminosity-tag">
                        {getLuminosityText(starSeed.luminosity)} ({starSeed.luminosity})
                      </Tag>
                    </div>
                  }
                  description={
                    <div className="starseed-description">
                      <div className="starseed-tags">
                        <Space size={[4, 4]} wrap>
                          {starSeed.tags.slice(0, 3).map(tag => (
                            <Tag key={tag} size="small" className="starseed-tag">
                              {tag}
                            </Tag>
                          ))}
                          {starSeed.tags.length > 3 && (
                            <Tag size="small" className="more-tags">
                              +{starSeed.tags.length - 3}
                            </Tag>
                          )}
                        </Space>
                      </div>

                      <div className="starseed-stats">
                        <Space size="large">
                          <div className="stat-item">
                            <FireOutlined className="stat-icon" />
                            <Text className="stat-text">
                              {starSeed.interactions.filter(i => i.type === 'light').length}
                            </Text>
                          </div>
                          <div className="stat-item">
                            <CommentOutlined className="stat-icon" />
                            <Text className="stat-text">
                              {starSeed.interactions.filter(i => i.type === 'comment').length}
                            </Text>
                          </div>
                          <div className="stat-item">
                            <ShareAltOutlined className="stat-icon" />
                            <Text className="stat-text">
                              {starSeed.interactions.filter(i => i.type === 'share').length}
                            </Text>
                          </div>
                          <div className="stat-item">
                            <CalendarOutlined className="stat-icon" />
                            <Text className="stat-text">
                              {new Date(starSeed.createdAt).toLocaleDateString()}
                            </Text>
                          </div>
                        </Space>
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
            className="starseed-list"
          />

          {total > pageSize && (
            <div className="pagination-container">
              <Pagination
                current={currentPage}
                total={total}
                pageSize={pageSize}
                onChange={handlePageChange}
                showSizeChanger={false}
                showQuickJumper
                showTotal={(total, range) => `第 ${range[0]}-${range[1]} 项，共 ${total} 个星种`}
                className="starseed-pagination"
              />
            </div>
          )}
        </>
      )}
    </Card>
  );
};

export default UserStarSeeds;


