import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Space, Button, Tag, Progress, message } from 'antd';
import { ArrowLeftOutlined, StarOutlined, TeamOutlined, ClockCircleOutlined, FireOutlined } from '@ant-design/icons';
import Navigation from '../components/Navigation/Navigation';
import ClusterMemberList from '../components/Cluster/ClusterMemberList';
import ClusterFeed from '../components/Cluster/ClusterFeed';
import ClusterTaskSystem from '../components/Cluster/ClusterTaskSystem';
import { useApp } from '../context/AppContext';
import { Cluster, ClusterMember, User, StarSeed } from '../types';
import apiService from '../utils/apiService';

const { Title, Text, Paragraph } = Typography;

const ClusterPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useApp();
  const [cluster, setCluster] = useState<Cluster | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'members' | 'feed' | 'tasks'>('members');

  useEffect(() => {
    if (id) {
      fetchClusterDetails();
    }
  }, [id]);

  const fetchClusterDetails = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(`/clusters/${id}`);
      
      if (response.data.success) {
        setCluster(response.data.cluster);
      } else {
        message.error('星团不存在或已解散');
        navigate('/');
      }
    } catch (error: any) {
      console.error('Failed to fetch cluster:', error);
      message.error('加载星团信息失败');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleMemberClick = (member: ClusterMember, user: User) => {
    navigate(`/profile/${user._id}`);
  };

  const handleSendMessage = (userId: string) => {
    // TODO: 实现私信功能
    message.info('私信功能开发中...');
  };

  const handleStarSeedClick = (starSeed: StarSeed) => {
    navigate(`/starseed/${starSeed._id}`);
  };

  const handleUserClick = (user: User) => {
    navigate(`/profile/${user._id}`);
  };

  const handleTaskComplete = (task: any) => {
    message.success(`任务"${task.title}"已完成！获得 ${task.rewards.points} 积分`);
  };

  const getLifecycleProgress = () => {
    if (!cluster) return 0;
    const now = new Date().getTime();
    const start = new Date(cluster.createdAt).getTime();
    const end = new Date(cluster.lifecycleEnd).getTime();
    const progress = ((now - start) / (end - start)) * 100;
    return Math.max(0, Math.min(100, progress));
  };

  const getRemainingDays = () => {
    if (!cluster) return 0;
    const now = new Date().getTime();
    const end = new Date(cluster.lifecycleEnd).getTime();
    return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
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

  if (!cluster) {
    return (
      <div className="page-transition">
        <Navigation />
        <div className="cluster-not-found">
          <Card>
            <Title level={3}>星团不存在</Title>
            <Paragraph>该星团可能已解散或不存在</Paragraph>
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
      <div className="cluster-page-container">
        <div className="cluster-page-content">
          {/* 星团头部信息 */}
          <Card className="cluster-header-card" bordered={false}>
            <div className="cluster-header">
              <div className="header-left">
                <Button
                  type="text"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate('/')}
                  className="back-button"
                >
                  返回
                </Button>
                <div className="cluster-info">
                  <Title level={2} className="cluster-name">
                    <StarOutlined className="cluster-icon" />
                    {cluster.name}
                  </Title>
                  <Space className="cluster-meta">
                    <Tag color="blue" className="meta-tag">
                      <TeamOutlined /> {cluster.members.length} 位成员
                    </Tag>
                    <Tag color="green" className="meta-tag">
                      <FireOutlined /> 共鸣值 {cluster.resonanceScore.toFixed(1)}
                    </Tag>
                    <Tag color="orange" className="meta-tag">
                      <ClockCircleOutlined /> 剩余 {getRemainingDays()} 天
                    </Tag>
                  </Space>
                </div>
              </div>
              
              <div className="header-right">
                <div className="lifecycle-progress">
                  <Text className="progress-label">生命周期进度</Text>
                  <Progress
                    percent={getLifecycleProgress()}
                    strokeColor={{
                      '0%': '#108ee9',
                      '50%': '#faad14',
                      '100%': '#f5222d',
                    }}
                    className="lifecycle-bar"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* 标签页导航 */}
          <Card className="cluster-tabs-card" bordered={false}>
            <div className="tab-navigation">
              <Space size="large">
                <Button
                  type={activeTab === 'members' ? 'primary' : 'text'}
                  onClick={() => setActiveTab('members')}
                  className="tab-button"
                >
                  <TeamOutlined /> 成员列表
                </Button>
                <Button
                  type={activeTab === 'feed' ? 'primary' : 'text'}
                  onClick={() => setActiveTab('feed')}
                  className="tab-button"
                >
                  <StarOutlined /> 信息流
                </Button>
                <Button
                  type={activeTab === 'tasks' ? 'primary' : 'text'}
                  onClick={() => setActiveTab('tasks')}
                  className="tab-button"
                >
                  <FireOutlined /> 任务系统
                </Button>
              </Space>
            </div>
          </Card>

          {/* 内容区域 */}
          <div className="cluster-content">
            {activeTab === 'members' && (
              <ClusterMemberList
                cluster={cluster}
                onMemberClick={handleMemberClick}
                onSendMessage={handleSendMessage}
              />
            )}
            
            {activeTab === 'feed' && (
              <ClusterFeed
                cluster={cluster}
                onStarSeedClick={handleStarSeedClick}
                onUserClick={handleUserClick}
              />
            )}
            
            {activeTab === 'tasks' && state.user && (
              <ClusterTaskSystem
                cluster={cluster}
                currentUser={state.user}
                onTaskComplete={handleTaskComplete}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClusterPage;