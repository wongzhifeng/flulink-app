import React from 'react'
import { Layout, Menu, Button, Avatar, Dropdown } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  HomeOutlined, 
  PlusOutlined, 
  UserOutlined, 
  LogoutOutlined,
  StarOutlined,
  TeamOutlined
} from '@ant-design/icons'
import { useAuth } from '../context/AppContext'

const { Header } = Layout

const Navigation: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, user, logout } = useAuth()

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '星空图谱',
    },
    {
      key: '/publish',
      icon: <PlusOutlined />,
      label: '发布星种',
    },
  ]

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人档案',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: logout,
    },
  ]

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }

  return (
    <Header className="navigation-header">
      <div className="nav-container">
        <div className="nav-brand">
          <StarOutlined className="brand-icon" />
          <span className="brand-text">FluLink</span>
        </div>

        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          className="nav-menu"
        />

        <div className="nav-actions">
          {isAuthenticated ? (
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <Button type="text" className="user-button">
                <Avatar size="small" icon={<UserOutlined />} />
                <span className="username">{user?.username}</span>
              </Button>
            </Dropdown>
          ) : (
            <Button
              type="primary"
              onClick={() => navigate('/auth')}
              icon={<UserOutlined />}
            >
              登录
            </Button>
          )}
        </div>
      </div>
    </Header>
  )
}

export default Navigation


