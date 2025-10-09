import React, { useState, useEffect } from 'react';
import { Form, Card, Button, Space, Typography, message, Divider, Alert } from 'antd';
import { RocketOutlined, StarOutlined, SendOutlined } from '@ant-design/icons';
import { useApp } from '../../context/AppContext';
import TextInput from './TextInput';
import ImageUpload from './ImageUpload';
import SpectrumTagSelector from './SpectrumTagSelector';
import apiService from '../../utils/apiService';
import { StarSeed } from '../../types';

const { Title, Text, Paragraph } = Typography;

interface StarSeedFormData {
  content: {
    text: string;
    imageUrl?: string;
  };
  tags: string[];
  spectrum: { tag: string; weight: number }[];
}

interface StarSeedPublishFormProps {
  onSuccess?: (starSeed: StarSeed) => void;
  onCancel?: () => void;
}

const StarSeedPublishForm: React.FC<StarSeedPublishFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { state, dispatch } = useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<StarSeedFormData>({
    content: { text: '' },
    tags: [],
    spectrum: [],
  });

  // 检查用户是否已登录
  useEffect(() => {
    if (!state.isAuthenticated) {
      message.warning('请先登录后再发布星种');
      if (onCancel) {
        onCancel();
      }
    }
  }, [state.isAuthenticated, onCancel]);

  const handleTextChange = (text: string) => {
    setFormData(prev => ({
      ...prev,
      content: { ...prev.content, text }
    }));
  };

  const handleImagesChange = (images: string[]) => {
    setFormData(prev => ({
      ...prev,
      content: { ...prev.content, imageUrl: images[0] || undefined }
    }));
  };

  const handleSpectrumChange = (spectrum: { tag: string; weight: number }[]) => {
    const tags = spectrum.map(s => s.tag);
    setFormData(prev => ({
      ...prev,
      tags,
      spectrum
    }));
  };

  const handleSubmit = async () => {
    if (!formData.content.text.trim()) {
      message.error('请输入星种内容');
      return;
    }

    if (formData.tags.length === 0) {
      message.error('请至少选择一个标签');
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        content: formData.content,
        tags: formData.tags,
        spectrum: formData.spectrum,
        owner: state.user?._id,
      };

      const response = await apiService.post('/starseeds', submitData);

      if (response.data.success) {
        const newStarSeed = response.data.starSeed;
        
        // 更新全局状态
        dispatch({ type: 'ADD_STARSEED', payload: newStarSeed });
        
        message.success('星种发布成功！它将在星空中传播共鸣');
        
        // 重置表单
        setFormData({
          content: { text: '' },
          tags: [],
          spectrum: [],
        });
        form.resetFields();

        if (onSuccess) {
          onSuccess(newStarSeed);
        }
      } else {
        message.error(response.data.message || '发布失败');
      }
    } catch (error: any) {
      console.error('Publish error:', error);
      message.error(error.response?.data?.message || '发布失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (formData.content.text.trim() || formData.tags.length > 0) {
      // 如果有内容，确认是否要放弃
      const confirmed = window.confirm('确定要放弃当前编辑的内容吗？');
      if (!confirmed) return;
    }

    setFormData({
      content: { text: '' },
      tags: [],
      spectrum: [],
    });
    form.resetFields();

    if (onCancel) {
      onCancel();
    }
  };

  const isFormValid = formData.content.text.trim() && formData.tags.length > 0;

  return (
    <div className="starseed-publish-form">
      <Card
        title={
          <div className="form-header">
            <StarOutlined className="form-icon" />
            <Title level={3} className="form-title">发布星种</Title>
          </div>
        }
        className="publish-form-card"
        bordered={false}
      >
        <div className="form-content">
          <Alert
            message="星种发布指南"
            description="分享你的想法、经历或感悟，选择合适的标签让它传播到共鸣的用户群体中。"
            type="info"
            showIcon
            className="publish-guide"
          />

          <Form form={form} layout="vertical" className="starseed-form">
            <Form.Item label="星种内容" required>
              <TextInput
                value={formData.content.text}
                onChange={handleTextChange}
                placeholder="分享你的想法，让它在星空中传播共鸣..."
                maxLength={500}
                autoFocus
                onSend={handleSubmit}
                onClear={() => setFormData(prev => ({ ...prev, content: { text: '' } }))}
                disabled={loading}
              />
            </Form.Item>

            <Form.Item label="图片附件">
              <ImageUpload
                images={formData.content.imageUrl ? [formData.content.imageUrl] : []}
                onChange={handleImagesChange}
                maxCount={1}
                maxSize={5}
                disabled={loading}
              />
            </Form.Item>

            <Form.Item label="光谱标签" required>
              <SpectrumTagSelector
                value={formData.spectrum}
                onChange={handleSpectrumChange}
                maxTags={10}
                disabled={loading}
              />
            </Form.Item>
          </Form>

          <Divider className="form-divider" />

          <div className="form-actions">
            <Space className="action-buttons">
              <Button
                onClick={handleCancel}
                disabled={loading}
                className="cancel-button"
              >
                取消
              </Button>
              <Button
                type="primary"
                icon={<RocketOutlined />}
                onClick={handleSubmit}
                loading={loading}
                disabled={!isFormValid}
                className="submit-button"
              >
                发布星种
              </Button>
            </Space>
          </div>

          <div className="form-tips">
            <Text type="secondary" className="tip-text">
              💡 提示：选择合适的标签可以让你的星种更容易被相关用户发现
            </Text>
            <Text type="secondary" className="tip-text">
              🌟 星种发布后会在星空中传播，与共鸣的用户形成连接
            </Text>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StarSeedPublishForm;


