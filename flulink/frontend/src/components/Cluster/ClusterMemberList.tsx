import React, { useState, useEffect } from 'react';
import { List, Avatar, Card, Typography, Tag, Space, Button, Tooltip, Badge, Progress } from 'antd';
import { UserOutlined, MessageOutlined, StarOutlined, ClockCircleOutlined, FireOutlined } from '@ant-design/icons';
import { Cluster, ClusterMember, User } from '../../types';
import apiService from '../../utils/apiService';

const { Title, Text } = Typography;

interface ClusterMemberListProps {
  cluster: Cluster;
  onMemberClick: (member: ClusterMember, user: User) => void;
  onSendMessage?: (userId: string) => void;
}

const ClusterMemberList: React.FC<ClusterMemberListProps> = ({
  cluster,
  onMemberClick,
  onSendMessage,
}) => {
  const [members, setMembers] = useState<(ClusterMember & { user: User })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemberDetails = async () => {
      if (!cluster.members || cluster.members.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const memberPromises = cluster.members.map(async (member) => {
          const userId = typeof member.userId === 'string' ? member.userId : member.userId._id;
          const response = await apiService.get(`/users/${userId}`);
          return {
            ...member,
            user: response.data.user,
          };
        });

        const membersWithUsers = await Promise.all(memberPromises);
        setMembers(membersWithUsers);
      } catch (error) {
        console.error('Failed to fetch member details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMemberDetails();
  }, [cluster.members]);

  const getActivityLevel = (score: number) => {
    if (score >= 80) return { level: 'high', color: 'red', text: '极高' };
    if (score >= 60) return { level: 'medium', color: 'orange', text: '高' };
    if (score >= 40) return { level: 'low', color: 'blue', text: '中' };
    return { level: 'very-low', color: 'default', text: '低' };
  };

  const getOnlineStatus = (lastActive: string) => {
    const now = new Date().getTime();
    const lastActiveTime = new Date(lastActive).getTime();
    const diffMinutes = (now - lastActiveTime) / (1000 * 60);

    if (diffMinutes < 5) return { status: 'online', color: 'green', text: '在线' };
    if (diffMinutes < 30) return { status: 'recent', color: 'blue', text: '最近活跃' };
    if (diffMinutes < 1440) return { status: 'today', color: 'orange', text: '今日活跃' };
    return { status: 'offline', color: 'default', text: '离线' };
  };

  const sortMembers = (members: (ClusterMember & { user: User })[]) => {
    return [...members].sort((a, b) => {
      // 按活跃度排序
      if (a.activityScore !== b.activityScore) {
        return b.activityScore - a.activityScore;
      }
      // 按加入时间排序
      return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
    });
  };

  const sortedMembers = sortMembers(members);

  return (
    <Card
      title={
        <div className="member-list-header">
          <StarOutlined className="header-icon" />
          <Title level={4} className="header-title">星团成员</Title>
          <Badge count={members.length} className="member-count-badge" />
        </div>
      }
      className="cluster-member-list-card"
      bordered={false}
    >
      <List
        loading={loading}
        dataSource={sortedMembers}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `第 ${range[0]}-${range[1]} 项，共 ${total} 位成员`,
        }}
        renderItem={(member) => {
          const activityLevel = getActivityLevel(member.activityScore);
          const onlineStatus = getOnlineStatus(member.user.updatedAt);

          return (
            <List.Item
              key={member.userId}
              className="member-list-item"
              actions={[
                <Tooltip title="发送私信">
                  <Button
                    type="text"
                    icon={<MessageOutlined />}
                    onClick={() => onSendMessage?.(member.user._id)}
                    className="message-button"
                  />
                </Tooltip>,
                <Tooltip title="查看档案">
                  <Button
                    type="text"
                    icon={<UserOutlined />}
                    onClick={() => onMemberClick(member, member.user)}
                    className="profile-button"
                  />
                </Tooltip>,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <div className="member-avatar-container">
                    <Badge
                      dot
                      color={onlineStatus.color}
                      offset={[-2, 2]}
                    >
                      <Avatar
                        size={48}
                        src={member.user.avatar}
                        icon={<UserOutlined />}
                        className="member-avatar"
                      />
                    </Badge>
                  </div>
                }
                title={
                  <div className="member-title">
                    <Text strong className="member-name">{member.user.username}</Text>
                    <Tag color={activityLevel.color} className="activity-tag">
                      {activityLevel.text}
                    </Tag>
                    <Tag color={onlineStatus.color} className="status-tag">
                      {onlineStatus.text}
                    </Tag>
                  </div>
                }
                description={
                  <div className="member-description">
                    <div className="member-tags">
                      <Space size={[4, 4]} wrap>
                        {member.user.tags.slice(0, 3).map(tag => (
                          <Tag key={tag} size="small" className="member-tag">
                            {tag}
                          </Tag>
                        ))}
                        {member.user.tags.length > 3 && (
                          <Tag size="small" className="more-tags">
                            +{member.user.tags.length - 3}
                          </Tag>
                        )}
                      </Space>
                    </div>
                    
                    <div className="member-stats">
                      <div className="activity-progress">
                        <Text type="secondary" className="progress-label">活跃度</Text>
                        <Progress
                          percent={member.activityScore}
                          size="small"
                          strokeColor={activityLevel.color}
                          showInfo={false}
                          className="activity-progress-bar"
                        />
                        <Text type="secondary" className="progress-value">
                          {member.activityScore}%
                        </Text>
                      </div>
                      
                      <div className="join-time">
                        <ClockCircleOutlined className="time-icon" />
                        <Text type="secondary" className="join-text">
                          {new Date(member.joinedAt).toLocaleDateString()} 加入
                        </Text>
                      </div>
                    </div>
                  </div>
                }
              />
            </List.Item>
          );
        }}
      />
      
      <div className="member-list-footer">
        <Space className="footer-stats">
          <div className="stat-item">
            <FireOutlined className="stat-icon" />
            <Text type="secondary" className="stat-text">
              平均活跃度: {Math.round(members.reduce((sum, m) => sum + m.activityScore, 0) / members.length)}%
            </Text>
          </div>
          <div className="stat-item">
            <StarOutlined className="stat-icon" />
            <Text type="secondary" className="stat-text">
              共鸣值: {cluster.resonanceScore.toFixed(1)}
            </Text>
          </div>
        </Space>
      </div>
    </Card>
  );
};

export default ClusterMemberList;


