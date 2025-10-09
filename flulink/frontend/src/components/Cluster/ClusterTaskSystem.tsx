import React, { useState, useEffect } from 'react';
import { Card, Typography, Progress, Button, Space, Tag, List, Tooltip, Badge, Modal, Form, Input, message } from 'antd';
import { StarOutlined, PlusOutlined, CheckCircleOutlined, ClockCircleOutlined, TrophyOutlined, TeamOutlined } from '@ant-design/icons';
import { Cluster, User } from '../../types';
import apiService from '../../utils/apiService';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface ClusterTask {
  _id: string;
  title: string;
  description: string;
  type: 'individual' | 'group' | 'cluster';
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  assignees?: string[];
  deadline?: string;
  rewards: {
    points: number;
    badges?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

interface ClusterTaskSystemProps {
  cluster: Cluster;
  currentUser: User;
  onTaskComplete?: (task: ClusterTask) => void;
}

const ClusterTaskSystem: React.FC<ClusterTaskSystemProps> = ({
  cluster,
  currentUser,
  onTaskComplete,
}) => {
  const [tasks, setTasks] = useState<ClusterTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchTasks();
  }, [cluster._id]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(`/clusters/${cluster._id}/tasks`);
      setTasks(response.data.tasks || []);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (values: any) => {
    try {
      const taskData = {
        ...values,
        clusterId: cluster._id,
        creator: currentUser._id,
      };

      const response = await apiService.post('/clusters/tasks', taskData);
      
      if (response.data.success) {
        setTasks(prev => [response.data.task, ...prev]);
        message.success('任务创建成功');
        setCreateModalVisible(false);
        form.resetFields();
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || '创建任务失败');
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      const response = await apiService.post(`/clusters/tasks/${taskId}/complete`);
      
      if (response.data.success) {
        const updatedTask = response.data.task;
        setTasks(prev => prev.map(task => 
          task._id === taskId ? updatedTask : task
        ));
        message.success('任务完成！');
        onTaskComplete?.(updatedTask);
      }
    } catch (error: any) {
      message.error('完成任务失败');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'in_progress': return 'blue';
      case 'pending': return 'default';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '已完成';
      case 'in_progress': return '进行中';
      case 'pending': return '待开始';
      default: return '未知';
    }
  };

  const getTaskProgress = () => {
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    return tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  };

  const getMyTasks = () => {
    return tasks.filter(task => 
      task.assignee === currentUser._id || 
      (task.assignees && task.assignees.includes(currentUser._id))
    );
  };

  const getClusterTasks = () => {
    return tasks.filter(task => task.type === 'cluster');
  };

  const renderTaskItem = (task: ClusterTask) => {
    const isAssignedToMe = task.assignee === currentUser._id || 
      (task.assignees && task.assignees.includes(currentUser._id));
    const canComplete = isAssignedToMe && task.status === 'in_progress';

    return (
      <List.Item
        key={task._id}
        className="task-list-item"
        actions={[
          canComplete ? (
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleCompleteTask(task._id)}
              className="complete-button"
            >
              完成
            </Button>
          ) : null,
        ].filter(Boolean)}
      >
        <List.Item.Meta
          title={
            <div className="task-title">
              <Text strong className="task-name">{task.title}</Text>
              <Space size={[4, 4]}>
                <Tag color={getPriorityColor(task.priority)} size="small">
                  {task.priority}
                </Tag>
                <Tag color={getStatusColor(task.status)} size="small">
                  {getStatusText(task.status)}
                </Tag>
                <Tag color="blue" size="small">
                  {task.type}
                </Tag>
              </Space>
            </div>
          }
          description={
            <div className="task-description">
              <Paragraph className="task-desc-text" ellipsis={{ rows: 2 }}>
                {task.description}
              </Paragraph>
              
              <div className="task-meta">
                <Space size={[8, 8]}>
                  {task.deadline && (
                    <div className="task-deadline">
                      <ClockCircleOutlined className="meta-icon" />
                      <Text type="secondary" className="meta-text">
                        {new Date(task.deadline).toLocaleDateString()}
                      </Text>
                    </div>
                  )}
                  
                  <div className="task-rewards">
                    <TrophyOutlined className="meta-icon" />
                    <Text type="secondary" className="meta-text">
                      {task.rewards.points} 积分
                    </Text>
                  </div>
                  
                  {task.rewards.badges && task.rewards.badges.length > 0 && (
                    <div className="task-badges">
                      <StarOutlined className="meta-icon" />
                      <Text type="secondary" className="meta-text">
                        {task.rewards.badges.join(', ')}
                      </Text>
                    </div>
                  )}
                </Space>
              </div>
            </div>
          }
        />
      </List.Item>
    );
  };

  return (
    <div className="cluster-task-system">
      <Card
        title={
          <div className="task-header">
            <StarOutlined className="header-icon" />
            <Title level={4} className="header-title">星团任务</Title>
            <Badge count={tasks.length} className="task-count-badge" />
          </div>
        }
        className="task-system-card"
        bordered={false}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
            className="create-task-button"
          >
            创建任务
          </Button>
        }
      >
        <div className="task-overview">
          <div className="task-progress">
            <Text className="progress-label">整体进度</Text>
            <Progress
              percent={getTaskProgress()}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
              className="overall-progress"
            />
            <Text type="secondary" className="progress-text">
              {tasks.filter(t => t.status === 'completed').length} / {tasks.length} 个任务已完成
            </Text>
          </div>
        </div>

        <div className="task-sections">
          <div className="my-tasks-section">
            <Title level={5} className="section-title">
              <TeamOutlined className="section-icon" />
              我的任务
            </Title>
            <List
              loading={loading}
              dataSource={getMyTasks()}
              renderItem={renderTaskItem}
              locale={{ emptyText: '暂无分配给我的任务' }}
              className="my-tasks-list"
            />
          </div>

          <div className="cluster-tasks-section">
            <Title level={5} className="section-title">
              <StarOutlined className="section-icon" />
              星团任务
            </Title>
            <List
              loading={loading}
              dataSource={getClusterTasks()}
              renderItem={renderTaskItem}
              locale={{ emptyText: '暂无星团任务' }}
              className="cluster-tasks-list"
            />
          </div>
        </div>
      </Card>

      <Modal
        title="创建新任务"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        className="create-task-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateTask}
          className="task-form"
        >
          <Form.Item
            name="title"
            label="任务标题"
            rules={[{ required: true, message: '请输入任务标题' }]}
          >
            <Input placeholder="输入任务标题" />
          </Form.Item>

          <Form.Item
            name="description"
            label="任务描述"
            rules={[{ required: true, message: '请输入任务描述' }]}
          >
            <TextArea rows={4} placeholder="详细描述任务内容和要求" />
          </Form.Item>

          <Form.Item
            name="type"
            label="任务类型"
            rules={[{ required: true, message: '请选择任务类型' }]}
            initialValue="individual"
          >
            <Input placeholder="individual, group, cluster" />
          </Form.Item>

          <Form.Item
            name="priority"
            label="优先级"
            rules={[{ required: true, message: '请选择优先级' }]}
            initialValue="medium"
          >
            <Input placeholder="low, medium, high" />
          </Form.Item>

          <Form.Item
            name="deadline"
            label="截止时间"
          >
            <Input type="date" />
          </Form.Item>

          <Form.Item
            name="rewards"
            label="奖励积分"
            rules={[{ required: true, message: '请输入奖励积分' }]}
            initialValue={{ points: 10 }}
          >
            <Input type="number" placeholder="10" />
          </Form.Item>

          <Form.Item className="form-actions">
            <Space>
              <Button onClick={() => setCreateModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                创建任务
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ClusterTaskSystem;


