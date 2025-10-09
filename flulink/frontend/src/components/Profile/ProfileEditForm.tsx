import React, { useState, useEffect } from 'react';
import { Form, Input, Upload, Button, Card, Typography, Space, Tag, message, Avatar, Select, Divider } from 'antd';
import { UserOutlined, CameraOutlined, SaveOutlined, EditOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { User } from '../../types';
import apiService from '../../utils/apiService';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface ProfileEditFormProps {
  user: User;
  onSave: (updatedUser: User) => void;
  onCancel: () => void;
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  user,
  onSave,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user.avatar || '');
  const [tags, setTags] = useState<string[]>(user.tags || []);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    form.setFieldsValue({
      username: user.username,
      email: user.email,
      bio: user.bio || '',
      constellationName: user.constellationName || '',
      constellationDescription: user.constellationDescription || '',
      constellationPersonality: user.constellationPersonality || [],
      contactInfo: user.contactInfo || {},
    });
    setTags(user.tags || []);
    setAvatarUrl(user.avatar || '');
  }, [user, form]);

  const handleAvatarUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await apiService.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setAvatarUrl(response.data.imageUrl);
        message.success('头像上传成功');
        return false; // 阻止默认上传行为
      } else {
        message.error('头像上传失败');
        return false;
      }
    } catch (error: any) {
      message.error('头像上传失败，请重试');
      return false;
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      const updateData = {
        ...values,
        avatar: avatarUrl,
        tags: tags,
      };

      const response = await apiService.put(`/users/${user._id}`, updateData);

      if (response.data.success) {
        message.success('个人资料更新成功');
        onSave(response.data.user);
      } else {
        message.error(response.data.message || '更新失败');
      }
    } catch (error: any) {
      console.error('Update profile error:', error);
      message.error(error.response?.data?.message || '更新失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const presetTags = [
    '科技', '艺术', '音乐', '旅行', '美食', '运动', '读书', '电影',
    '摄影', '设计', '编程', '创业', '投资', '心理学', '哲学', '历史',
    '自然', '环保', '教育', '健康', '时尚', '游戏', '动漫', '宠物'
  ];

  return (
    <Card
      title={
        <div className="profile-edit-header">
          <EditOutlined className="header-icon" />
          <Title level={4} className="header-title">编辑个人资料</Title>
        </div>
      }
      className="profile-edit-card"
      bordered={false}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="profile-edit-form"
      >
        {/* 头像上传 */}
        <Form.Item label="头像">
          <div className="avatar-upload-section">
            <Avatar
              size={80}
              src={avatarUrl}
              icon={<UserOutlined />}
              className="profile-avatar"
            />
            <Upload
              beforeUpload={handleAvatarUpload}
              showUploadList={false}
              accept="image/*"
              className="avatar-upload"
            >
              <Button icon={<CameraOutlined />} className="upload-button">
                更换头像
              </Button>
            </Upload>
          </div>
        </Form.Item>

        {/* 基本信息 */}
        <Form.Item
          name="username"
          label="用户名"
          rules={[{ required: true, message: '请输入用户名' }]}
        >
          <Input placeholder="输入用户名" />
        </Form.Item>

        <Form.Item
          name="email"
          label="邮箱"
          rules={[
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '请输入有效的邮箱地址' }
          ]}
        >
          <Input placeholder="输入邮箱地址" />
        </Form.Item>

        <Form.Item
          name="bio"
          label="个人简介"
        >
          <TextArea
            rows={4}
            placeholder="介绍一下自己，让其他用户更好地了解你..."
            maxLength={200}
            showCount
          />
        </Form.Item>

        {/* 标签管理 */}
        <Form.Item label="个人标签">
          <div className="tags-section">
            <div className="current-tags">
              <Text className="tags-label">当前标签:</Text>
              <Space size={[4, 4]} wrap className="tags-list">
                {tags.map(tag => (
                  <Tag
                    key={tag}
                    closable
                    onClose={() => handleRemoveTag(tag)}
                    className="profile-tag"
                  >
                    {tag}
                  </Tag>
                ))}
              </Space>
            </div>

            <div className="add-tag-section">
              <Space className="add-tag-controls">
                <Input
                  placeholder="输入新标签"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onPressEnter={handleAddTag}
                  className="tag-input"
                />
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={handleAddTag}
                  disabled={!newTag.trim()}
                  className="add-tag-button"
                >
                  添加
                </Button>
              </Space>
            </div>

            <div className="preset-tags-section">
              <Text className="preset-label">推荐标签:</Text>
              <Space size={[4, 4]} wrap className="preset-tags">
                {presetTags
                  .filter(tag => !tags.includes(tag))
                  .slice(0, 12)
                  .map(tag => (
                    <Tag
                      key={tag}
                      className="preset-tag"
                      onClick={() => {
                        if (!tags.includes(tag)) {
                          setTags([...tags, tag]);
                        }
                      }}
                    >
                      {tag}
                    </Tag>
                  ))}
              </Space>
            </div>
          </div>
        </Form.Item>

        <Divider className="form-divider" />

        {/* 星座档案 */}
        <Title level={5} className="section-title">星座档案</Title>

        <Form.Item
          name="constellationName"
          label="星座名称"
        >
          <Input placeholder="输入你的星座名称" />
        </Form.Item>

        <Form.Item
          name="constellationDescription"
          label="星座描述"
        >
          <TextArea
            rows={3}
            placeholder="描述你的星座特点和个性..."
            maxLength={150}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="constellationPersonality"
          label="性格特质"
        >
          <Select
            mode="tags"
            placeholder="选择或输入性格特质"
            className="personality-select"
          >
            <Option value="热情">热情</Option>
            <Option value="冷静">冷静</Option>
            <Option value="幽默">幽默</Option>
            <Option value="严肃">严肃</Option>
            <Option value="创新">创新</Option>
            <Option value="传统">传统</Option>
            <Option value="外向">外向</Option>
            <Option value="内向">内向</Option>
            <Option value="理性">理性</Option>
            <Option value="感性">感性</Option>
          </Select>
        </Form.Item>

        <Divider className="form-divider" />

        {/* 联系方式 */}
        <Title level={5} className="section-title">联系方式</Title>

        <Form.Item
          name={['contactInfo', 'wechat']}
          label="微信"
        >
          <Input placeholder="输入微信号" />
        </Form.Item>

        <Form.Item
          name={['contactInfo', 'telegram']}
          label="Telegram"
        >
          <Input placeholder="输入Telegram用户名" />
        </Form.Item>

        <Form.Item
          name={['contactInfo', 'twitter']}
          label="Twitter"
        >
          <Input placeholder="输入Twitter用户名" />
        </Form.Item>

        {/* 操作按钮 */}
        <div className="form-actions">
          <Space>
            <Button onClick={onCancel} className="cancel-button">
              取消
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SaveOutlined />}
              className="save-button"
            >
              保存更改
            </Button>
          </Space>
        </div>
      </Form>
    </Card>
  );
};

export default ProfileEditForm;


