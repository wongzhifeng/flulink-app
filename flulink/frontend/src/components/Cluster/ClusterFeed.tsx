import React, { useState, useEffect } from 'react';
import { List, Card, Typography, Avatar, Space, Button, Tag, Tooltip, Badge, Empty } from 'antd';
import { StarOutlined, FireOutlined, CommentOutlined, ShareAltOutlined, EyeOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Cluster, StarSeed, User } from '../../types';
import apiService from '../../utils/apiService';

const { Title, Text, Paragraph } = Typography;

interface ClusterFeedProps {
  cluster: Cluster;
  onStarSeedClick: (starSeed: StarSeed) => void;
  onUserClick: (user: User) => void;
}

interface FeedItem {
  id: string;
  type: 'starseed' | 'activity' | 'announcement';
  timestamp: string;
  data: any;
  user?: User;
}

const ClusterFeed: React.FC<ClusterFeedProps> = ({
  cluster,
  onStarSeedClick,
  onUserClick,
}) => {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchFeedItems();
  }, [cluster._id, page]);

  const fetchFeedItems = async () => {
    try {
      setLoading(true);
      
      // 获取星团相关的星种
      const starSeedsResponse = await apiService.get(`/clusters/${cluster._id}/starseeds?page=${page}&limit=10`);
      const starSeeds = starSeedsResponse.data.starSeeds || [];

      // 获取星团活动
      const activitiesResponse = await apiService.get(`/clusters/${cluster._id}/activities?page=${page}&limit=5`);
      const activities = activitiesResponse.data.activities || [];

      // 合并并排序feed项目
      const items: FeedItem[] = [
        ...starSeeds.map((starSeed: StarSeed) => ({
          id: `starseed-${starSeed._id}`,
          type: 'starseed' as const,
          timestamp: starSeed.createdAt,
          data: starSeed,
          user: starSeed.owner as User,
        })),
        ...activities.map((activity: any) => ({
          id: `activity-${activity._id}`,
          type: 'activity' as const,
          timestamp: activity.createdAt,
          data: activity,
        })),
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      if (page === 1) {
        setFeedItems(items);
      } else {
        setFeedItems(prev => [...prev, ...items]);
      }

      setHasMore(items.length === 10);
    } catch (error) {
      console.error('Failed to fetch feed items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const renderStarSeedItem = (item: FeedItem) => {
    const starSeed = item.data as StarSeed;
    const user = item.user as User;

    return (
      <Card
        key={item.id}
        className="feed-starseed-card"
        hoverable
        onClick={() => onStarSeedClick(starSeed)}
      >
        <div className="starseed-header">
          <div className="starseed-author">
            <Avatar
              size="small"
              src={user?.avatar}
              icon={<StarOutlined />}
              className="author-avatar"
            />
            <div className="author-info">
              <Text strong className="author-name">{user?.username}</Text>
              <Text type="secondary" className="post-time">
                {new Date(item.timestamp).toLocaleString()}
              </Text>
            </div>
          </div>
          <div className="starseed-luminosity">
            <FireOutlined className="luminosity-icon" />
            <Text className="luminosity-value">{starSeed.luminosity}</Text>
          </div>
        </div>

        <div className="starseed-content">
          {starSeed.content.text && (
            <Paragraph className="starseed-text" ellipsis={{ rows: 3 }}>
              {starSeed.content.text}
            </Paragraph>
          )}
          {starSeed.content.imageUrl && (
            <div className="starseed-image">
              <img src={starSeed.content.imageUrl} alt="Star Seed" className="content-image" />
            </div>
          )}
        </div>

        <div className="starseed-tags">
          <Space size={[4, 4]} wrap>
            {starSeed.tags.map(tag => (
              <Tag key={tag} size="small" className="starseed-tag">
                {tag}
              </Tag>
            ))}
          </Space>
        </div>

        <div className="starseed-actions">
          <Space>
            <Button
              type="text"
              icon={<FireOutlined />}
              size="small"
              className="action-button"
            >
              {starSeed.interactions.filter(i => i.type === 'light').length}
            </Button>
            <Button
              type="text"
              icon={<CommentOutlined />}
              size="small"
              className="action-button"
            >
              {starSeed.interactions.filter(i => i.type === 'comment').length}
            </Button>
            <Button
              type="text"
              icon={<ShareAltOutlined />}
              size="small"
              className="action-button"
            >
              {starSeed.interactions.filter(i => i.type === 'share').length}
            </Button>
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              className="action-button"
            >
              详情
            </Button>
          </Space>
        </div>
      </Card>
    );
  };

  const renderActivityItem = (item: FeedItem) => {
    const activity = item.data;

    return (
      <Card key={item.id} className="feed-activity-card">
        <div className="activity-content">
          <div className="activity-icon">
            <StarOutlined className="activity-icon-symbol" />
          </div>
          <div className="activity-text">
            <Text className="activity-description">
              {activity.description || '星团有新活动'}
            </Text>
            <Text type="secondary" className="activity-time">
              {new Date(item.timestamp).toLocaleString()}
            </Text>
          </div>
        </div>
      </Card>
    );
  };

  const renderFeedItem = (item: FeedItem) => {
    switch (item.type) {
      case 'starseed':
        return renderStarSeedItem(item);
      case 'activity':
        return renderActivityItem(item);
      default:
        return null;
    }
  };

  return (
    <Card
      title={
        <div className="feed-header">
          <StarOutlined className="header-icon" />
          <Title level={4} className="header-title">星团信息流</Title>
          <Badge count={feedItems.length} className="feed-count-badge" />
        </div>
      }
      className="cluster-feed-card"
      bordered={false}
    >
      {feedItems.length === 0 && !loading ? (
        <Empty
          description="暂无信息流内容"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          className="feed-empty"
        >
          <Text type="secondary">星团成员发布星种后，内容将显示在这里</Text>
        </Empty>
      ) : (
        <List
          loading={loading}
          dataSource={feedItems}
          renderItem={renderFeedItem}
          loadMore={
            hasMore ? (
              <div className="load-more-container">
                <Button
                  type="primary"
                  ghost
                  onClick={handleLoadMore}
                  loading={loading}
                  className="load-more-button"
                >
                  加载更多
                </Button>
              </div>
            ) : null
          }
          className="feed-list"
        />
      )}

      <div className="feed-footer">
        <Space className="footer-info">
          <div className="info-item">
            <ClockCircleOutlined className="info-icon" />
            <Text type="secondary" className="info-text">
              星团创建于 {new Date(cluster.createdAt).toLocaleDateString()}
            </Text>
          </div>
          <div className="info-item">
            <StarOutlined className="info-icon" />
            <Text type="secondary" className="info-text">
              生命周期: {Math.ceil((new Date(cluster.lifecycleEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} 天
            </Text>
          </div>
        </Space>
      </div>
    </Card>
  );
};

export default ClusterFeed;


