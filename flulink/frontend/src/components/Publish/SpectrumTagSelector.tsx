import React, { useState, useEffect } from 'react';
import { Select, Tag, Space, Typography, Button, Tooltip, Input } from 'antd';
import { PlusOutlined, CloseOutlined, StarOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Text } = Typography;

interface SpectrumTag {
  tag: string;
  weight: number;
}

interface SpectrumTagSelectorProps {
  value: SpectrumTag[];
  onChange: (tags: SpectrumTag[]) => void;
  maxTags?: number;
  disabled?: boolean;
}

const SpectrumTagSelector: React.FC<SpectrumTagSelectorProps> = ({
  value,
  onChange,
  maxTags = 10,
  disabled = false,
}) => {
  const [customTag, setCustomTag] = useState('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);

  // 预设标签
  const presetTags = [
    '科技', '艺术', '音乐', '旅行', '美食', '运动', '读书', '电影',
    '摄影', '设计', '编程', '创业', '投资', '心理学', '哲学', '历史',
    '自然', '环保', '教育', '健康', '时尚', '游戏', '动漫', '宠物',
    '情感', '思考', '分享', '学习', '成长', '梦想', '生活', '工作'
  ];

  const handleTagAdd = (tag: string, weight: number = 1.0) => {
    if (value.length >= maxTags) {
      return;
    }

    const existingTag = value.find(t => t.tag === tag);
    if (existingTag) {
      return;
    }

    const newTag: SpectrumTag = { tag, weight };
    onChange([...value, newTag]);
  };

  const handleTagRemove = (tagToRemove: string) => {
    const newTags = value.filter(tag => tag.tag !== tagToRemove);
    onChange(newTags);
  };

  const handleWeightChange = (tag: string, newWeight: number) => {
    const newTags = value.map(t => 
      t.tag === tag ? { ...t, weight: newWeight } : t
    );
    onChange(newTags);
  };

  const handleCustomTagAdd = () => {
    if (customTag.trim() && !value.find(t => t.tag === customTag.trim())) {
      handleTagAdd(customTag.trim());
      setCustomTag('');
      setIsAddingCustom(false);
    }
  };

  const getWeightColor = (weight: number) => {
    if (weight >= 0.8) return 'red';
    if (weight >= 0.6) return 'orange';
    if (weight >= 0.4) return 'blue';
    return 'default';
  };

  const getWeightText = (weight: number) => {
    if (weight >= 0.8) return '强';
    if (weight >= 0.6) return '中';
    if (weight >= 0.4) return '弱';
    return '微';
  };

  return (
    <div className="spectrum-tag-selector">
      <div className="tag-selector-header">
        <Text strong className="selector-title">
          <StarOutlined /> 光谱标签
        </Text>
        <Text type="secondary" className="tag-count">
          {value.length}/{maxTags}
        </Text>
      </div>

      <div className="selected-tags">
        {value.map((tag, index) => (
          <Tag
            key={tag.tag}
            closable={!disabled}
            onClose={() => handleTagRemove(tag.tag)}
            className="spectrum-tag"
            color={getWeightColor(tag.weight)}
          >
            <span className="tag-name">{tag.tag}</span>
            <span className="tag-weight">({getWeightText(tag.weight)})</span>
          </Tag>
        ))}
      </div>

      {value.length < maxTags && (
        <div className="tag-options">
          <div className="preset-tags">
            <Text type="secondary" className="preset-title">推荐标签:</Text>
            <Space size={[4, 4]} wrap className="preset-tag-list">
              {presetTags
                .filter(tag => !value.find(t => t.tag === tag))
                .slice(0, 20)
                .map(tag => (
                  <Tag
                    key={tag}
                    className="preset-tag"
                    onClick={() => handleTagAdd(tag)}
                    style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
                  >
                    {tag}
                  </Tag>
                ))}
            </Space>
          </div>

          <div className="custom-tag-section">
            {!isAddingCustom ? (
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() => setIsAddingCustom(true)}
                disabled={disabled}
                className="add-custom-button"
              >
                添加自定义标签
              </Button>
            ) : (
              <div className="custom-tag-input">
                <Input
                  placeholder="输入自定义标签"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onPressEnter={handleCustomTagAdd}
                  onBlur={() => {
                    if (!customTag.trim()) {
                      setIsAddingCustom(false);
                    }
                  }}
                  disabled={disabled}
                  className="custom-tag-field"
                />
                <Space className="custom-tag-actions">
                  <Button
                    type="primary"
                    size="small"
                    onClick={handleCustomTagAdd}
                    disabled={disabled || !customTag.trim()}
                  >
                    添加
                  </Button>
                  <Button
                    size="small"
                    icon={<CloseOutlined />}
                    onClick={() => {
                      setCustomTag('');
                      setIsAddingCustom(false);
                    }}
                    disabled={disabled}
                  >
                    取消
                  </Button>
                </Space>
              </div>
            )}
          </div>
        </div>
      )}

      {value.length > 0 && (
        <div className="tag-weights">
          <Text type="secondary" className="weight-title">标签权重调整:</Text>
          <div className="weight-controls">
            {value.map(tag => (
              <div key={tag.tag} className="weight-control">
                <Text className="weight-label">{tag.tag}:</Text>
                <Select
                  value={tag.weight}
                  onChange={(weight) => handleWeightChange(tag.tag, weight)}
                  disabled={disabled}
                  size="small"
                  className="weight-select"
                >
                  <Option value={0.2}>微 (0.2)</Option>
                  <Option value={0.4}>弱 (0.4)</Option>
                  <Option value={0.6}>中 (0.6)</Option>
                  <Option value={0.8}>强 (0.8)</Option>
                  <Option value={1.0}>极强 (1.0)</Option>
                </Select>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="tag-hints">
        <Text type="secondary" className="hint-text">
          • 标签决定星种的传播方向和目标用户
        </Text>
        <Text type="secondary" className="hint-text">
          • 权重影响标签在光谱中的重要性
        </Text>
        <Text type="secondary" className="hint-text">
          • 建议选择3-5个相关标签获得最佳效果
        </Text>
      </div>
    </div>
  );
};

export default SpectrumTagSelector;


