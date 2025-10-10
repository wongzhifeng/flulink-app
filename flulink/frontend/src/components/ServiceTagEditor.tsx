import React, { useState, useEffect } from 'react';
import './ServiceTagEditor.css';

interface ServiceTagProps {
  maxSlots: number;
  onSave: (service: any) => void;
  currentLocation: { coordinates: [number, number] };
}

const ServiceTagEditor: React.FC<ServiceTagProps> = ({ 
  maxSlots, 
  onSave,
  currentLocation 
}) => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [serviceRadius, setServiceRadius] = useState(1.0);
  const [loading, setLoading] = useState(false);
  const [myServices, setMyServices] = useState<any[]>([]);

  const serviceTypes = [
    { value: 'housing', label: '房屋租赁', disabled: false },
    { value: 'repair', label: '维修服务', disabled: false },
    { value: 'education', label: '教育培训', disabled: false },
    { value: 'health', label: '健康服务', disabled: false },
    { value: 'transport', label: '交通出行', disabled: false },
    { value: 'other', label: '其他服务', disabled: false }
  ];

  useEffect(() => {
    loadMyServices();
  }, []);

  const loadMyServices = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('https://flulink-backend-v2.zeabur.app/api/services/my-services', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setMyServices(data.data);
        
        // 防呆设计：已选类型禁用
        const usedTypes = data.data
          .filter((s: any) => s.isActive)
          .map((s: any) => s.serviceType);
        
        serviceTypes.forEach(type => {
          type.disabled = usedTypes.includes(type.value);
        });
      }
    } catch (error) {
      console.error('加载服务失败:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (images.length >= 3) {
      alert('知足不辱：最多上传3张图片');
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('token');
      const response = await fetch('https://flulink-backend-v2.zeabur.app/api/upload/image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await response.json();
      if (data.success) {
        setImages([...images, data.data.url]);
        alert('图片上传成功');
      }
    } catch (error) {
      alert('图片上传失败');
    }
  };

  const handleSave = async () => {
    // 表单验证
    if (!selectedType) {
      alert('请选择服务类型');
      return;
    }
    if (!title.trim()) {
      alert('请填写服务标题');
      return;
    }
    if (!description.trim()) {
      alert('请填写服务描述');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      // 调用信用验证接口
      const response = await fetch('https://flulink-backend-v2.zeabur.app/api/services/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          serviceType: selectedType,
          title: title.trim(),
          description: description.trim(),
          images,
          location: {
            coordinates: currentLocation.coordinates
          },
          serviceRadius
        })
      });

      const data = await response.json();

      if (data.success) {
        alert(data.daoQuote || '服务发布成功');
        onSave(data.data);
        
        // 重置表单
        resetForm();
        loadMyServices();
      } else {
        // 显示道德风控提示
        alert(`${data.message}\n\n${data.daoQuote}`);
      }
    } catch (error: any) {
      alert('发布失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedType('');
    setTitle('');
    setDescription('');
    setImages([]);
    setServiceRadius(1.0);
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <div className="service-tag-editor dao-theme">
      {/* 道家头部 */}
      <div className="editor-header">
        <h3 className="dao-title">发布长期服务</h3>
        <p className="dao-subtitle">天道无亲，常与善人</p>
        <p className="service-quota">
          当前服务槽位: {myServices.filter(s => s.isActive).length} / {maxSlots}
        </p>
      </div>

      {/* 服务类型选择 */}
      <div className="form-item">
        <label className="dao-label">服务类型</label>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="dao-select"
        >
          <option value="">选择服务类型</option>
          {serviceTypes.map(type => (
            <option 
              key={type.value} 
              value={type.value}
              disabled={type.disabled}
            >
              {type.label} {type.disabled && '(已发布)'}
            </option>
          ))}
        </select>
      </div>

      {/* 服务标题 */}
      <div className="form-item">
        <label className="dao-label">服务标题</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="简洁明了的标题"
          maxLength={50}
          className="dao-input"
        />
        <div className="char-count">{title.length}/50</div>
      </div>

      {/* 服务描述 */}
      <div className="form-item">
        <label className="dao-label">服务描述</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="详细描述您提供的服务内容"
          maxLength={200}
          rows={4}
          className="dao-textarea"
        />
        <div className="char-count">{description.length}/200</div>
      </div>

      {/* 图片上传 */}
      <div className="form-item">
        <label className="dao-label">服务图片（最多3张）</label>
        <div className="image-upload-area">
          {images.map((img, index) => (
            <div key={index} className="image-preview">
              <img src={img} alt={`服务图片${index + 1}`} />
              <button
                className="remove-icon"
                onClick={() => handleRemoveImage(index)}
              >
                ×
              </button>
            </div>
          ))}
          {images.length < 3 && (
            <label className="upload-button dao-button">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              <span>+</span>
              <span>上传图片</span>
            </label>
          )}
        </div>
      </div>

      {/* 服务范围 */}
      <div className="form-item">
        <label className="dao-label">服务范围（公里）</label>
        <select
          value={serviceRadius}
          onChange={(e) => setServiceRadius(parseFloat(e.target.value))}
          className="dao-select"
        >
          <option value={0.5}>0.5公里</option>
          <option value={1.0}>1公里（推荐）</option>
          <option value={2.0}>2公里</option>
          <option value={5.0}>5公里</option>
        </select>
        <p className="dao-hint">知止不殆：建议选择适中的服务范围</p>
      </div>

      {/* 提交按钮 */}
      <div className="form-actions">
        <button
          type="button"
          onClick={handleSave}
          disabled={loading || myServices.filter(s => s.isActive).length >= maxSlots}
          className="dao-button-primary"
        >
          {loading ? '发布中...' : '发布服务'}
        </button>
        <button
          type="button"
          onClick={resetForm}
          className="dao-button-secondary"
        >
          重置
        </button>
      </div>

      {/* 道家引用 */}
      <div className="dao-footer">
        <p className="dao-quote">知足不辱，知止不殆</p>
      </div>
    </div>
  );
};

export default ServiceTagEditor;

