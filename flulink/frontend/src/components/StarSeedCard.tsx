import React, { useState } from 'react';
import { Card, Avatar, Tag, Button, Tooltip, message, Modal } from 'antd';
import { 
  HeartOutlined, 
  MessageOutlined, 
  ShareAltOutlined, 
  StarOutlined,
  UserOutlined,
  ClockCircleOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { StarSeed, User } from '../types';
import apiService from '../utils/apiService';
import './StarSeedCard.css';

interface StarSeedCardProps {
  starSeed: StarSeed;
  currentUser?: User;
  onUpdate?: (updatedStarSeed: StarSeed) => void;
  showActions?: boolean;
  compact?: boolean;
}

const StarSeedCard: React.FC<StarSeedCardProps> = ({
  starSeed,
  currentUser,
  onUpdate,
  showActions = true,
  compact = false
}) => {
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState(false);
  const [shared, setShared] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentLoading, setCommentLoading] = useState(false);

  // 格式化时间
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return new Date(date).toLocaleDateString();
  };

  // 点亮星种
  const handleLight = async () => {
    if (!currentUser) {
      message.warning('请先登录');
      return;
    }

    if (liked) {
      message.info('您已经点亮过这个星种了');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.post(`/starseeds/${starSeed._id}/light`);
      if (response.data.success) {
        setLiked(true);
        const updatedStarSeed = {
          ...starSeed,
          interactions: {
            ...starSeed.interactions,
            lights: response.data.data.lights
          }
        };
        onUpdate?.(updatedStarSeed);
        message.success('点亮成功！');
      }
    } catch (error) {
      console.error('Light star seed error:', error);
      message.error('点亮失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 分享星种
  const handleShare = async () => {
    if (!currentUser) {
      message.warning('请先登录');
      return;
    }

    if (shared) {
      message.info('您已经分享过这个星种了');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.post(`/starseeds/${starSeed._id}/share`);
      if (response.data.success) {
        setShared(true);
        const updatedStarSeed = {
          ...starSeed,
          interactions: {
            ...starSeed.interactions,
            shares: response.data.data.shares
          }
        };
        onUpdate?.(updatedStarSeed);
        message.success('分享成功！');
      }
    } catch (error) {
      console.error('Share star seed error:', error);
      message.error('分享失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 获取评论
  const fetchComments = async () => {
    setCommentLoading(true);
    try {
      const response = await apiService.get(`/starseeds/${starSeed._id}/comments`);
      if (response.data.success) {
        setComments(response.data.data.comments);
        setShowComments(true);
      }
    } catch (error) {
      console.error('Fetch comments error:', error);
      message.error('获取评论失败');
    } finally {
      setCommentLoading(false);
    }
  };

  // 计算光度等级
  const getLuminosityLevel = (luminosity: number) => {
    if (luminosity >= 80) return { level: '超新星', color: '#ff6b6b', icon: '🌟' };
    if (luminosity >= 60) return { level: '巨星', color: '#ffd700', icon: '⭐' };
    if (luminosity >= 40) return { level: '恒星', color: '#4ecdc4', icon: '✨' };
    if (luminosity >= 20) return { level: '矮星', color: '#95a5a6', icon: '💫' };
    return { level: '星尘', color: '#bdc3c7', icon: '✨' };
  };

  const luminosityInfo = getLuminosityLevel(starSeed.luminosity);

  return (
    <>
      <Card
        className={`star-seed-card ${compact ? 'compact' : ''}`}
        hoverable
        style={{
          background: `linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)`,
          border: `1px solid ${luminosityInfo.color}20`,
          borderRadius: '12px',
          marginBottom: '16px'
        }}
      >
        {/* 头部信息 */}
        <div className="card-header">
          <div className="author-info">
            <Avatar 
              src={starSeed.owner?.avatar} 
              icon={<UserOutlined />}
              size={compact ? 32 : 40}
            />
            <div className="author-details">
              <div className="author-name">
                {starSeed.owner?.nickname || '匿名用户'}
              </div>
              <div className="post-time">
                <ClockCircleOutlined style={{ marginRight: '4px' }} />
                {formatTime(starSeed.createdAt)}
              </div>
            </div>
          </div>
          
          <div className="luminosity-info">
            <Tooltip title={`光度: ${starSeed.luminosity}`}>
              <Tag 
                color={luminosityInfo.color}
                icon={<StarOutlined />}
                style={{ 
                  borderRadius: '16px',
                  border: `1px solid ${luminosityInfo.color}40`
                }}
              >
                {luminosityInfo.icon} {luminosityInfo.level}
              </Tag>
            </Tooltip>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="card-content">
          {starSeed.content.text && (
            <div className="text-content">
              {starSeed.content.text}
            </div>
          )}

          {starSeed.content.imageUrl && (
            <div className="image-content">
              <img 
                src={starSeed.content.imageUrl} 
                alt="星种图片"
                style={{ 
                  width: '100%', 
                  borderRadius: '8px',
                  maxHeight: '300px',
                  objectFit: 'cover'
                }}
              />
            </div>
          )}

          {starSeed.content.audioUrl && (
            <div className="audio-content">
              <audio 
                controls 
                style={{ width: '100%' }}
                preload="metadata"
              >
                <source src={starSeed.content.audioUrl} type="audio/mpeg" />
                您的浏览器不支持音频播放
              </audio>
            </div>
          )}

          {/* 标签 */}
          {starSeed.tags && starSeed.tags.length > 0 && (
            <div className="tags-section">
              {starSeed.tags.map((tag, index) => (
                <Tag key={index} color="blue" style={{ marginBottom: '4px' }}>
                  #{tag}
                </Tag>
              ))}
            </div>
          )}
        </div>

        {/* 互动区域 */}
        {showActions && (
          <div className="card-actions">
            <div className="action-stats">
              <div className="stat-item">
                <HeartOutlined style={{ color: '#ff6b6b' }} />
                <span>{starSeed.interactions?.lights || 0}</span>
              </div>
              <div className="stat-item">
                <MessageOutlined style={{ color: '#4ecdc4' }} />
                <span>{starSeed.interactions?.comments || 0}</span>
              </div>
              <div className="stat-item">
                <ShareAltOutlined style={{ color: '#45b7d1' }} />
                <span>{starSeed.interactions?.shares || 0}</span>
              </div>
            </div>

            <div className="action-buttons">
              <Button
                type="text"
                icon={<HeartOutlined />}
                loading={loading}
                onClick={handleLight}
                disabled={liked}
                className={liked ? 'liked' : ''}
              >
                {liked ? '已点亮' : '点亮'}
              </Button>
              
              <Button
                type="text"
                icon={<MessageOutlined />}
                loading={commentLoading}
                onClick={fetchComments}
              >
                评论
              </Button>
              
              <Button
                type="text"
                icon={<ShareAltOutlined />}
                loading={loading}
                onClick={handleShare}
                disabled={shared}
                className={shared ? 'shared' : ''}
              >
                {shared ? '已分享' : '分享'}
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* 评论模态框 */}
      <Modal
        title="评论"
        open={showComments}
        onCancel={() => setShowComments(false)}
        footer={null}
        width={600}
      >
        <div className="comments-section">
          {comments.length === 0 ? (
            <div className="no-comments">
              <MessageOutlined style={{ fontSize: '48px', color: '#ccc' }} />
              <p>暂无评论，快来抢沙发吧！</p>
            </div>
          ) : (
            <div className="comments-list">
              {comments.map((comment) => (
                <div key={comment.id} className="comment-item">
                  <Avatar 
                    src={comment.user.avatar} 
                    icon={<UserOutlined />}
                    size={32}
                  />
                  <div className="comment-content">
                    <div className="comment-header">
                      <span className="comment-author">{comment.user.nickname}</span>
                      <span className="comment-time">{formatTime(comment.createdAt)}</span>
                    </div>
                    <div className="comment-text">{comment.content}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default StarSeedCard;
