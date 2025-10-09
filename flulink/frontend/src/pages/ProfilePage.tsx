import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Space, Button, Tabs, message } from 'antd';
import { ArrowLeftOutlined, EditOutlined, MessageOutlined, HeartOutlined } from '@ant-design/icons';
import Navigation from '../components/Navigation/Navigation';
import ProfileEditForm from '../components/Profile/ProfileEditForm';
import ConstellationCard from '../components/Profile/ConstellationCard';
import ContactManagement from '../components/Profile/ContactManagement';
import UserStarSeeds from '../components/Profile/UserStarSeeds';
import { useApp } from '../context/AppContext';
import { User, StarSeed } from '../types';
import apiService from '../utils/apiService';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useApp();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);

  const isOwnProfile = state.user?._id === id;

  useEffect(() => {
    if (id) {
      fetchUserProfile();
    }
  }, [id]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(`/users/${id}`);
      
      if (response.data.success) {
        setUser(response.data.user);
      } else {
        message.error('用户不存在');
        navigate('/');
      }
    } catch (error: any) {
      console.error('Failed to fetch user profile:', error);
      message.error('加载用户信息失败');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = (updatedUser: User) => {
    setUser(updatedUser);
    setIsEditing(false);
    // 如果是当前用户，更新全局状态
    if (isOwnProfile) {
      // TODO: 更新全局用户状态
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSendMessage = () => {
    // TODO: 实现私信功能
    message.info('私信功能开发中...');
  };

  const handleFollow = () => {
    // TODO: 实现关注功能
    message.info('关注功能开发中...');
  };

  const handleStarSeedClick = (starSeed: StarSeed) => {
    navigate(`/starseed/${starSeed._id}`);
  };

  if (loading) {
    return (
      <div className="page-transition">
        <Navigation />
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-transition">
        <Navigation />
        <div className="profile-not-found">
          <Card>
            <Title level={3}>用户不存在</Title>
            <Text>该用户可能已注销或不存在</Text>
            <Button type="primary" onClick={() => navigate('/')}>
              返回星空图谱
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="page-transition">
      <Navigation />
      <div className="profile-page-container">
        <div className="profile-page-content">
          {/* 页面头部 */}
          <Card className="profile-header-card" bordered={false}>
            <div className="profile-header">
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/')}
                className="back-button"
              >
                返回
              </Button>
              <div className="header-info">
                <Title level={2} className="page-title">
                  {isOwnProfile ? '我的档案' : `${user.username} 的档案`}
                </Title>
                <Text type="secondary" className="page-subtitle">
                  {isOwnProfile ? '管理你的个人信息和星座档案' : '查看用户的星座档案和星种'}
                </Text>
              </div>
            </div>
          </Card>

          {/* 主要内容 */}
          <div className="profile-main-content">
            {isEditing ? (
              <ProfileEditForm
                user={user}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            ) : (
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                className="profile-tabs"
                items={[
                  {
                    key: 'profile',
                    label: '个人档案',
                    children: (
                      <ConstellationCard
                        user={user}
                        onEdit={isOwnProfile ? handleEdit : undefined}
                        onSendMessage={!isOwnProfile ? handleSendMessage : undefined}
                        onFollow={!isOwnProfile ? handleFollow : undefined}
                        isOwnProfile={isOwnProfile}
                      />
                    ),
                  },
                  {
                    key: 'starseeds',
                    label: '发布的星种',
                    children: (
                      <UserStarSeeds
                        userId={user._id}
                        onStarSeedClick={handleStarSeedClick}
                      />
                    ),
                  },
                  ...(isOwnProfile ? [{
                    key: 'contact',
                    label: '联系方式',
                    children: (
                      <ContactManagement
                        user={user}
                        onUpdate={setUser}
                      />
                    ),
                  }] : []),
                ]}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;