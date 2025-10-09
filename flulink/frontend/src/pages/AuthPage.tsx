import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, Tabs, message } from 'antd'
import { UserOutlined, LockOutlined, PhoneOutlined } from '@ant-design/icons'
import { useAuth } from '../context/AppContext'

const { TabPane } = Tabs

const AuthPage: React.FC = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleLogin = async (values: any) => {
    setLoading(true)
    try {
      // TODO: 调用登录API
      const mockUser = {
        _id: '1',
        username: values.username,
        email: values.username,
        tags: ['科技', '艺术'],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      login(mockUser, 'mock-token')
      message.success('登录成功！')
      navigate('/')
    } catch (error) {
      message.error('登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (values: any) => {
    setLoading(true)
    try {
      // TODO: 调用注册API
      message.success('注册成功！请登录')
    } catch (error) {
      message.error('注册失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handlePhoneLogin = async (values: any) => {
    setLoading(true)
    try {
      // TODO: 调用手机验证码登录API
      message.success('验证码已发送')
    } catch (error) {
      message.error('发送失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Card className="auth-card">
          <h1 className="auth-title">FluLink 星空</h1>
          <p className="auth-subtitle">连接星空的每一颗心</p>
          
          <Tabs defaultActiveKey="login" centered>
            <TabPane tab="账号登录" key="login">
              <Form
                name="login"
                onFinish={handleLogin}
                autoComplete="off"
              >
                <Form.Item
                  name="username"
                  rules={[{ required: true, message: '请输入用户名' }]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="用户名"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[{ required: true, message: '请输入密码' }]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="密码"
                    size="large"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    size="large"
                    block
                  >
                    登录
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>

            <TabPane tab="手机登录" key="phone">
              <Form
                name="phoneLogin"
                onFinish={handlePhoneLogin}
                autoComplete="off"
              >
                <Form.Item
                  name="phone"
                  rules={[
                    { required: true, message: '请输入手机号' },
                    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
                  ]}
                >
                  <Input
                    prefix={<PhoneOutlined />}
                    placeholder="手机号"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="code"
                  rules={[{ required: true, message: '请输入验证码' }]}
                >
                  <Input
                    placeholder="验证码"
                    size="large"
                    suffix={
                      <Button type="link" size="small">
                        获取验证码
                      </Button>
                    }
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    size="large"
                    block
                  >
                    登录
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>

            <TabPane tab="注册账号" key="register">
              <Form
                name="register"
                onFinish={handleRegister}
                autoComplete="off"
              >
                <Form.Item
                  name="username"
                  rules={[{ required: true, message: '请输入用户名' }]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="用户名"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: '请输入邮箱' },
                    { type: 'email', message: '请输入正确的邮箱格式' }
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="邮箱"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[{ required: true, message: '请输入密码' }]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="密码"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: '请确认密码' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve()
                        }
                        return Promise.reject(new Error('两次输入的密码不一致'))
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="确认密码"
                    size="large"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    size="large"
                    block
                  >
                    注册
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}

export default AuthPage


