import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, Space, message, Switch, Divider } from 'antd';
import { WechatOutlined, RocketOutlined, TwitterOutlined, SaveOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { User } from '../../types';
import apiService from '../../utils/apiService';

const { Title, Text } = Typography;

interface ContactInfo {
  wechat?: string;
  telegram?: string;
  twitter?: string;
}

interface ContactSettings {
  showWechat: boolean;
  showTelegram: boolean;
  showTwitter: boolean;
}

interface ContactManagementProps {
  user: User;
  onUpdate: (updatedUser: User) => void;
}

const ContactManagement: React.FC<ContactManagementProps> = ({
  user,
  onUpdate,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [contactSettings, setContactSettings] = useState<ContactSettings>({
    showWechat: true,
    showTelegram: true,
    showTwitter: true,
  });

  React.useEffect(() => {
    form.setFieldsValue({
      wechat: user.contactInfo?.wechat || '',
      telegram: user.contactInfo?.telegram || '',
      twitter: user.contactInfo?.twitter || '',
    });
  }, [user, form]);

  const handleSubmit = async (values: ContactInfo) => {
    try {
      setLoading(true);

      const updateData = {
        contactInfo: {
          ...values,
          // 只保存非空的联系方式
          wechat: values.wechat?.trim() || undefined,
          telegram: values.telegram?.trim() || undefined,
          twitter: values.twitter?.trim() || undefined,
        },
      };

      const response = await apiService.put(`/users/${user._id}`, updateData);

      if (response.data.success) {
        message.success('联系方式更新成功');
        onUpdate(response.data.user);
      } else {
        message.error(response.data.message || '更新失败');
      }
    } catch (error: any) {
      console.error('Update contact error:', error);
      message.error(error.response?.data?.message || '更新失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key: keyof ContactSettings, value: boolean) => {
    setContactSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const getContactIcon = (type: string) => {
    switch (type) {
      case 'wechat':
        return <WechatOutlined className="contact-icon" />;
      case 'telegram':
        return <RocketOutlined className="contact-icon" />;
      case 'twitter':
        return <TwitterOutlined className="contact-icon" />;
      default:
        return null;
    }
  };

  const getContactLabel = (type: string) => {
    switch (type) {
      case 'wechat':
        return '微信';
      case 'telegram':
        return 'Telegram';
      case 'twitter':
        return 'Twitter';
      default:
        return '';
    }
  };

  const getContactPlaceholder = (type: string) => {
    switch (type) {
      case 'wechat':
        return '输入微信号';
      case 'telegram':
        return '输入Telegram用户名';
      case 'twitter':
        return '输入Twitter用户名';
      default:
        return '';
    }
  };

  return (
    <Card
      title={
        <div className="contact-management-header">
          <MessageOutlined className="header-icon" />
          <Title level={4} className="header-title">联系方式管理</Title>
        </div>
      }
      className="contact-management-card"
      bordered={false}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="contact-form"
      >
        {/* 微信 */}
        <Form.Item
          name="wechat"
          label={
            <div className="contact-label">
              {getContactIcon('wechat')}
              <Text className="label-text">微信</Text>
            </div>
          }
        >
          <Input
            placeholder={getContactPlaceholder('wechat')}
            prefix={<WechatOutlined />}
            className="contact-input"
          />
        </Form.Item>

        {/* Telegram */}
        <Form.Item
          name="telegram"
          label={
            <div className="contact-label">
              {getContactIcon('telegram')}
              <Text className="label-text">Telegram</Text>
            </div>
          }
        >
          <Input
            placeholder={getContactPlaceholder('telegram')}
            prefix={<RocketOutlined />}
            className="contact-input"
          />
        </Form.Item>

        {/* Twitter */}
        <Form.Item
          name="twitter"
          label={
            <div className="contact-label">
              {getContactIcon('twitter')}
              <Text className="label-text">Twitter</Text>
            </div>
          }
        >
          <Input
            placeholder={getContactPlaceholder('twitter')}
            prefix={<TwitterOutlined />}
            className="contact-input"
          />
        </Form.Item>

        <Divider className="form-divider" />

        {/* 隐私设置 */}
        <div className="privacy-settings">
          <Title level={5} className="settings-title">隐私设置</Title>
          <Text type="secondary" className="settings-description">
            控制哪些联系方式对其他用户可见
          </Text>

          <div className="privacy-controls">
            <div className="privacy-item">
              <div className="privacy-info">
                <WechatOutlined className="privacy-icon" />
                <div className="privacy-details">
                  <Text className="privacy-name">微信</Text>
                  <Text type="secondary" className="privacy-desc">
                    其他用户可以查看你的微信号
                  </Text>
                </div>
              </div>
              <Switch
                checked={contactSettings.showWechat}
                onChange={(checked) => handleSettingChange('showWechat', checked)}
                className="privacy-switch"
              />
            </div>

            <div className="privacy-item">
              <div className="privacy-info">
                <RocketOutlined className="privacy-icon" />
                <div className="privacy-details">
                  <Text className="privacy-name">Telegram</Text>
                  <Text type="secondary" className="privacy-desc">
                    其他用户可以查看你的Telegram用户名
                  </Text>
                </div>
              </div>
              <Switch
                checked={contactSettings.showTelegram}
                onChange={(checked) => handleSettingChange('showTelegram', checked)}
                className="privacy-switch"
              />
            </div>

            <div className="privacy-item">
              <div className="privacy-info">
                <TwitterOutlined className="privacy-icon" />
                <div className="privacy-details">
                  <Text className="privacy-name">Twitter</Text>
                  <Text type="secondary" className="privacy-desc">
                    其他用户可以查看你的Twitter用户名
                  </Text>
                </div>
              </div>
              <Switch
                checked={contactSettings.showTwitter}
                onChange={(checked) => handleSettingChange('showTwitter', checked)}
                className="privacy-switch"
              />
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="form-actions">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<SaveOutlined />}
            className="save-button"
          >
            保存设置
          </Button>
        </div>
      </Form>

      {/* 使用提示 */}
      <div className="usage-tips">
        <Title level={5} className="tips-title">使用提示</Title>
        <div className="tips-list">
          <div className="tip-item">
            <EyeOutlined className="tip-icon" />
            <Text className="tip-text">
              联系方式可以帮助其他用户更好地与你建立连接
            </Text>
          </div>
          <div className="tip-item">
            <EyeInvisibleOutlined className="tip-icon" />
            <Text className="tip-text">
              你可以随时调整隐私设置来控制信息的可见性
            </Text>
          </div>
          <div className="tip-item">
            <MessageOutlined className="tip-icon" />
            <Text className="tip-text">
              建议至少保留一种联系方式以便其他用户联系
            </Text>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ContactManagement;


