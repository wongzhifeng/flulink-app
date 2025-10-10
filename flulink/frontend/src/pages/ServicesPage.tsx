import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, message } from 'antd';
import { UserOutlined, HomeOutlined, ToolOutlined, BookOutlined, HeartOutlined, CarOutlined, AppstoreOutlined } from '@ant-design/icons';
import ServiceTagEditor from '../components/ServiceTagEditor';
import './ServicesPage.css';

const { Header, Content, Sider } = Layout;

const ServicesPage: React.FC = () => {
  const [currentLocation, setCurrentLocation] = useState({ coordinates: [116.404, 39.915] });
  const [userInfo, setUserInfo] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('publish');

  useEffect(() => {
    // 获取用户信息
    const token = localStorage.getItem('token');
    if (token) {
      // 这里应该调用API获取用户信息
      setUserInfo({
        maxServices: 3,
        currentServices: 0,
        creditScore: 80
      });
    }

    // 获取用户位置
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            coordinates: [position.coords.longitude, position.coords.latitude]
          });
        },
        (error) => {
          console.warn('获取位置失败:', error);
          message.warning('无法获取位置信息，将使用默认位置');
        }
      );
    }
  }, []);

  const handleServiceSave = (service: any) => {
    console.log('服务保存成功:', service);
    message.success('服务发布成功！');
  };

  const menuItems = [
    {
      key: 'publish',
      icon: <HomeOutlined />,
      label: '发布服务',
    },
    {
      key: 'my-services',
      icon: <UserOutlined />,
      label: '我的服务',
    },
    {
      key: 'match',
      icon: <AppstoreOutlined />,
      label: '匹配服务',
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'publish':
        return (
          <ServiceTagEditor
            maxSlots={userInfo?.maxServices || 3}
            onSave={handleServiceSave}
            currentLocation={currentLocation}
          />
        );
      case 'my-services':
        return (
          <div className="services-content">
            <h2>我的服务</h2>
            <p>这里将显示您发布的所有服务</p>
          </div>
        );
      case 'match':
        return (
          <div className="services-content">
            <h2>匹配服务</h2>
            <p>这里将显示附近的服务匹配结果</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Layout className="services-layout">
      <Header className="services-header">
        <div className="header-content">
          <h1 className="app-title">FluLink 服务节点</h1>
          <div className="user-info">
            {userInfo && (
              <span className="credit-score">
                信用分: {userInfo.creditScore}
              </span>
            )}
          </div>
        </div>
      </Header>
      
      <Layout>
        <Sider width={200} className="services-sider">
          <Menu
            mode="inline"
            selectedKeys={[activeTab]}
            items={menuItems}
            onClick={({ key }) => setActiveTab(key)}
            className="services-menu"
          />
        </Sider>
        
        <Content className="services-content-wrapper">
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default ServicesPage;
