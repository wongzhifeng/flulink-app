import React, { useState, useRef, useCallback } from 'react';
import { Upload, Button, Image, Modal, Progress, message, Space, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined, EyeOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import apiService from '../../utils/apiService';

const { Text } = Typography;

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxCount?: number;
  maxSize?: number; // MB
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onChange,
  maxCount = 9,
  maxSize = 5,
  disabled = false,
}) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const uploadRef = useRef<any>(null);

  const handlePreview = (imageUrl: string) => {
    setPreviewImage(imageUrl);
    setPreviewVisible(true);
  };

  const handleRemove = (imageUrl: string) => {
    const newImages = images.filter(img => img !== imageUrl);
    onChange(newImages);
  };

  const handleUpload = useCallback(async (file: File) => {
    // 检查文件大小
    if (file.size > maxSize * 1024 * 1024) {
      message.error(`图片大小不能超过 ${maxSize}MB`);
      return false;
    }

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      message.error('只能上传图片文件');
      return false;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await apiService.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setUploadProgress(progress);
        },
      });

      if (response.data.success) {
        const newImages = [...images, response.data.imageUrl];
        onChange(newImages);
        message.success('图片上传成功');
        return false; // 阻止默认上传行为
      } else {
        message.error(response.data.message || '上传失败');
        return false;
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      message.error(error.response?.data?.message || '上传失败，请重试');
      return false;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [images, onChange, maxSize]);

  const uploadProps: UploadProps = {
    beforeUpload: handleUpload,
    showUploadList: false,
    disabled: disabled || uploading || images.length >= maxCount,
    accept: 'image/*',
  };

  const uploadButton = (
    <div className="upload-button">
      <PlusOutlined />
      <div className="upload-text">上传图片</div>
    </div>
  );

  return (
    <div className="image-upload-container">
      <div className="image-upload-list">
        {images.map((imageUrl, index) => (
          <div key={index} className="image-item">
            <Image
              src={imageUrl}
              alt={`上传图片 ${index + 1}`}
              className="uploaded-image"
              preview={false}
            />
            <div className="image-overlay">
              <Space>
                <Button
                  type="text"
                  icon={<EyeOutlined />}
                  onClick={() => handlePreview(imageUrl)}
                  className="preview-button"
                />
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemove(imageUrl)}
                  className="delete-button"
                  disabled={disabled}
                />
              </Space>
            </div>
          </div>
        ))}
        
        {images.length < maxCount && (
          <Upload {...uploadProps} ref={uploadRef}>
            {uploading ? (
              <div className="upload-progress">
                <Progress
                  type="circle"
                  percent={uploadProgress}
                  size={60}
                  strokeColor="#1890ff"
                />
                <div className="progress-text">上传中...</div>
              </div>
            ) : (
              uploadButton
            )}
          </Upload>
        )}
      </div>

      <div className="upload-hints">
        <Text type="secondary" className="hint-text">
          支持 JPG、PNG、GIF 格式，单个文件不超过 {maxSize}MB
        </Text>
        <Text type="secondary" className="hint-text">
          最多可上传 {maxCount} 张图片
        </Text>
      </div>

      <Modal
        open={previewVisible}
        title="图片预览"
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        className="image-preview-modal"
      >
        <Image
          src={previewImage}
          alt="预览图片"
          style={{ width: '100%' }}
        />
      </Modal>
    </div>
  );
};

export default ImageUpload;


