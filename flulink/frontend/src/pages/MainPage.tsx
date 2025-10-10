import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, message, Modal, Form, Input, Upload } from 'antd';
import { 
  HomeOutlined, 
  StarOutlined, 
  TeamOutlined, 
  UserOutlined, 
  PlusOutlined,
  LogoutOutlined,
  SettingOutlined,
  BellOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import StarMap from '../components/StarMap';
import StarSeedCard from '../components/StarSeedCard';
import apiService from '../utils/apiService';
import './MainPage.css';

const { Header, Content, Sider } = Layout;

const MainPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, starSeeds, currentCluster, dispatch } = useAppContext();
  
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [form] = Form.useForm();

  // 页面初始化
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // 根据路径设置活动标签
    const path = location.pathname;
    if (path.includes('/cluster')) {
      setActiveTab('cluster');
    } else if (path.includes('/profile')) {
      setActiveTab('profile');
    } else {
      setActiveTab('home');
    }
  }, [user, navigate, location]);

  // 发布星种
  const handlePublish = async (values: any) => {
    setPublishLoading(true);
    try {
      const response = await apiService.post('/starseeds/publish', {
        content: values.content,
        imageUrl: values.imageUrl,
        audioUrl: values.audioUrl,
        spectrum: values.tags || []
      });

      if (response.data.success) {
        message.success('星种发布成功！');
        setShowPublishModal(false);
        form.resetFields();
        
        // 更新星种列表
        dispatch({ type: 'ADD_STARSEED', payload: response.data.data.starSeed });
      }
    } catch (error) {
      console.error('Publish star seed error:', error);
      message.error('发布失败，请稍后重试');
    } finally {
      setPublishLoading(false);
    }
  };

  // 用户菜单
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人档案',
      onClick: () => navigate('/profile')
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
      onClick: () => navigate('/settings')
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => {
        localStorage.removeItem('token');
        dispatch({ type: 'LOGOUT' });
        navigate('/login');
      }
    }
  ];

  // 侧边栏菜单
  const menuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: '首页',
      onClick: () => {
        setActiveTab('home');
        navigate('/');
      }
    },
    {
      key: 'cluster',
      icon: <TeamOutlined />,
      label: '星团',
      onClick: () => {
        setActiveTab('cluster');
        navigate('/cluster');
      }
    },
    {
      key: 'stars',
      icon: <StarOutlined />,
      label: '星种',
      onClick: () => {
        setActiveTab('stars');
        navigate('/stars');
      }
    }
  ];

  // 渲染内容区域
  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="home-content">
            <div className="content-header">
              <h2>欢迎回来，{user?.nickname || '星尘探索者'}！</h2>
              <p>探索无限可能的星空世界</p>
            </div>
            
            <div className="content-grid">
              <div className="star-map-section">
                <StarMap
                  cluster={currentCluster}
                  starSeeds={starSeeds}
                  currentUser={user}
                  onStarSeedClick={(starSeed) => {
                    // 处理星种点击
                    console.log('Star seed clicked:', starSeed);
                  }}
                  onMemberClick={(member) => {
                    // 处理成员点击
                    console.log('Member clicked:', member);
                  }}
                />
              </div>
              
              <div className="star-seeds-section">
                <div className="section-header">
                  <h3>最新星种</h3>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => setShowPublishModal(true)}
                  >
                    发布星种
                  </Button>
                </div>
                
                <div className="star-seeds-list">
                  {starSeeds.slice(0, 5).map((starSeed) => (
                    <StarSeedCard
                      key={starSeed._id}
                      starSeed={starSeed}
                      currentUser={user}
                      onUpdate={(updatedStarSeed) => {
                        dispatch({ type: 'UPDATE_STAR_SEED', payload: updatedStarSeed });
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'cluster':
        return (
          <div className="cluster-content">
            <div className="content-header">
              <h2>星团管理</h2>
              <p>与志同道合的伙伴一起探索星空</p>
            </div>
            
            {currentCluster ? (
              <div className="cluster-info">
                <div className="cluster-stats">
                  <div className="stat-card">
                    <div className="stat-number">{currentCluster.members.length}</div>
                    <div className="stat-label">成员数量</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">{currentCluster.averageResonance.toFixed(1)}</div>
                    <div className="stat-label">平均共鸣</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">
                      {Math.ceil((new Date(currentCluster.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}
                    </div>
                    <div className="stat-label">剩余天数</div>
                  </div>
                </div>
                
                <StarMap
                  cluster={currentCluster}
                  starSeeds={starSeeds}
                  currentUser={user}
                />
              </div>
            ) : (
              <div className="no-cluster">
                <TeamOutlined style={{ fontSize: '64px', color: '#ccc' }} />
                <h3>您还没有加入任何星团</h3>
                <p>寻找志同道合的伙伴，一起探索星空世界</p>
                <Button type="primary" size="large">
                  寻找星团
                </Button>
              </div>
            )}
          </div>
        );
        
      case 'stars':
        return (
          <div className="stars-content">
            <div className="content-header">
              <h2>星种广场</h2>
              <p>发现更多有趣的星种内容</p>
            </div>
            
            <div className="stars-list">
              {starSeeds.map((starSeed) => (
                <StarSeedCard
                  key={starSeed._id}
                  starSeed={starSeed}
                  currentUser={user}
                  onUpdate={(updatedStarSeed) => {
                    dispatch({ type: 'UPDATE_STAR_SEED', payload: updatedStarSeed });
                  }}
                />
              ))}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <Layout className="main-layout">
      <Header className="main-header">
        <div className="header-left">
          <div className="logo">
            <StarOutlined style={{ fontSize: '24px', color: '#ffd700' }} />
            <span className="logo-text">FluLink</span>
          </div>
        </div>
        
        <div className="header-center">
          <div className="search-bar">
            <Input
              placeholder="搜索星种、用户..."
              prefix={<SearchOutlined />}
              style={{ width: '300px' }}
            />
          </div>
        </div>
        
        <div className="header-right">
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setShowPublishModal(true)}
          >
            发布
          </Button>
          
          <Button 
            type="text" 
            icon={<BellOutlined />}
            style={{ marginLeft: '8px' }}
          />
          
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            trigger={['click']}
          >
            <Avatar 
              src={user?.avatar} 
              icon={<UserOutlined />}
              style={{ marginLeft: '16px', cursor: 'pointer' }}
            />
          </Dropdown>
        </div>
      </Header>
      
      <Layout>
        <Sider 
          collapsible 
          collapsed={collapsed} 
          onCollapse={setCollapsed}
          className="main-sider"
        >
          <Menu
            mode="inline"
            selectedKeys={[activeTab]}
            items={menuItems}
            className="main-menu"
          />
        </Sider>
        
        <Content className="main-content">
          {renderContent()}
        </Content>
      </Layout>
      
      {/* 发布星种模态框 */}
      <Modal
        title="发布星种"
        open={showPublishModal}
        onCancel={() => setShowPublishModal(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handlePublish}
        >
          <Form.Item
            name="content"
            label="星种内容"
            rules={[{ required: true, message: '请输入星种内容' }]}
          >
            <Input.TextArea
              placeholder="分享你的想法..."
              rows={4}
              maxLength={500}
              showCount
            />
          </Form.Item>
          
          <Form.Item
            name="tags"
            label="标签"
          >
            <Input
              placeholder="输入标签，用逗号分隔"
              onChange={(e) => {
                const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                form.setFieldsValue({ tags });
              }}
            />
          </Form.Item>
          
          <Form.Item
            name="imageUrl"
            label="图片"
          >
            <Upload
              listType="picture-card"
              maxCount={1}
              beforeUpload={() => false}
              onChange={(info) => {
                if (info.file.status === 'done') {
                  form.setFieldsValue({ imageUrl: info.file.response?.url });
                }
              }}
            >
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>上传图片</div>
              </div>
            </Upload>
          </Form.Item>
          
          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button onClick={() => setShowPublishModal(false)}>
                取消
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={publishLoading}
              >
                发布
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default MainPage;
