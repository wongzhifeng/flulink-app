import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Tabs, message, Spin } from 'antd';
import { UserOutlined, LockOutlined, PhoneOutlined, SafetyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import apiService from '../utils/apiService';
import './LoginPage.css';

const { TabPane } = Tabs;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, dispatch } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // 如果已登录，重定向到主页
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // 倒计时
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 密码登录
  const handlePasswordLogin = async (values: any) => {
    setLoading(true);
    try {
      const response = await apiService.post('/auth/login', {
        phone: values.phone,
        password: values.password
      });

      if (response.data.success) {
        const { token, user: userData } = response.data.data;
        localStorage.setItem('token', token);
        dispatch({ type: 'LOGIN_SUCCESS', payload: userData });
        message.success('登录成功！');
        navigate('/');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      message.error(error.response?.data?.message || '登录失败，请检查手机号和密码');
    } finally {
      setLoading(false);
    }
  };

  // 发送验证码
  const handleSendCode = async (phone: string) => {
    setCodeLoading(true);
    try {
      const response = await apiService.post('/auth/send-code', {
        phone
      });

      if (response.data.success) {
        setCodeSent(true);
        setCountdown(60);
        message.success('验证码已发送');
      }
    } catch (error: any) {
      console.error('Send code error:', error);
      message.error(error.response?.data?.message || '发送验证码失败');
    } finally {
      setCodeLoading(false);
    }
  };

  // 验证码登录
  const handleCodeLogin = async (values: any) => {
    setLoading(true);
    try {
      const response = await apiService.post('/auth/login-with-code', {
        phone: values.phone,
        code: values.code
      });

      if (response.data.success) {
        const { token, user: userData } = response.data.data;
        localStorage.setItem('token', token);
        dispatch({ type: 'LOGIN_SUCCESS', payload: userData });
        message.success('登录成功！');
        navigate('/');
      }
    } catch (error: any) {
      console.error('Code login error:', error);
      message.error(error.response?.data?.message || '登录失败，请检查验证码');
    } finally {
      setLoading(false);
    }
  };

  // 用户注册
  const handleRegister = async (values: any) => {
    setLoading(true);
    try {
      const response = await apiService.post('/auth/register', {
        phone: values.phone,
        password: values.password,
        nickname: values.nickname,
        motto: values.motto,
        poem: values.poem,
        tags: values.tags ? values.tags.split(',').map((tag: string) => tag.trim()) : []
      });

      if (response.data.success) {
        message.success('注册成功！请登录');
        // 切换到登录标签页
        const loginTab = document.querySelector('.ant-tabs-tab[data-node-key="password"]') as HTMLElement;
        loginTab?.click();
      }
    } catch (error: any) {
      console.error('Register error:', error);
      message.error(error.response?.data?.message || '注册失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-background">
        <div className="stars"></div>
        <div className="stars2"></div>
        <div className="stars3"></div>
      </div>
      
      <div className="login-container">
        <Card className="login-card">
          <div className="login-header">
            <h1 className="login-title">
              <span className="logo-icon">🌟</span>
              FluLink
            </h1>
            <p className="login-subtitle">星尘共鸣，连接无限可能</p>
          </div>

          <Tabs defaultActiveKey="password" className="login-tabs">
            <TabPane tab="密码登录" key="password">
              <Form
                name="password-login"
                onFinish={handlePasswordLogin}
                autoComplete="off"
                size="large"
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
                    maxLength={11}
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: '请输入密码' },
                    { min: 6, message: '密码至少6位' }
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="密码"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    className="login-button"
                    block
                  >
                    登录
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>

            <TabPane tab="验证码登录" key="code">
              <Form
                name="code-login"
                onFinish={handleCodeLogin}
                autoComplete="off"
                size="large"
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
                    maxLength={11}
                    onChange={() => {
                      setCodeSent(false);
                      setCountdown(0);
                    }}
                  />
                </Form.Item>

                <Form.Item
                  name="code"
                  rules={[
                    { required: true, message: '请输入验证码' },
                    { len: 6, message: '验证码为6位数字' }
                  ]}
                >
                  <Input
                    prefix={<SafetyOutlined />}
                    placeholder="验证码"
                    maxLength={6}
                    suffix={
                      <Button
                        type="link"
                        size="small"
                        loading={codeLoading}
                        disabled={countdown > 0}
                        onClick={() => {
                          const phoneInput = document.querySelector('input[name="phone"]') as HTMLInputElement;
                          if (phoneInput?.value) {
                            handleSendCode(phoneInput.value);
                          } else {
                            message.warning('请先输入手机号');
                          }
                        }}
                      >
                        {countdown > 0 ? `${countdown}s` : '获取验证码'}
                      </Button>
                    }
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    className="login-button"
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
                size="large"
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
                    maxLength={11}
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: '请输入密码' },
                    { min: 6, message: '密码至少6位' }
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="密码"
                  />
                </Form.Item>

                <Form.Item
                  name="nickname"
                  rules={[
                    { required: true, message: '请输入昵称' },
                    { max: 20, message: '昵称最多20个字符' }
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="昵称"
                    maxLength={20}
                  />
                </Form.Item>

                <Form.Item
                  name="motto"
                  rules={[
                    { max: 50, message: '座右铭最多50个字符' }
                  ]}
                >
                  <Input
                    placeholder="座右铭（可选）"
                    maxLength={50}
                  />
                </Form.Item>

                <Form.Item
                  name="poem"
                  rules={[
                    { max: 100, message: '个人诗句最多100个字符' }
                  ]}
                >
                  <Input.TextArea
                    placeholder="个人诗句（可选）"
                    maxLength={100}
                    rows={3}
                    showCount
                  />
                </Form.Item>

                <Form.Item
                  name="tags"
                >
                  <Input
                    placeholder="标签，用逗号分隔（可选）"
                    maxLength={100}
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    className="login-button"
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
  );
};

export default LoginPage;
