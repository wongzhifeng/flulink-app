import React, { useState, useRef, useEffect } from 'react';
import { Input, Typography, Button, Space, Tooltip } from 'antd';
import { EditOutlined, SendOutlined, ClearOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Text } = Typography;

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  showCharCount?: boolean;
  autoFocus?: boolean;
  onSend?: () => void;
  onClear?: () => void;
  disabled?: boolean;
}

const TextInput: React.FC<TextInputProps> = ({
  value,
  onChange,
  placeholder = "分享你的想法，让它在星空中传播共鸣...",
  maxLength = 500,
  showCharCount = true,
  autoFocus = false,
  onSend,
  onClear,
  disabled = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const textAreaRef = useRef<any>(null);

  useEffect(() => {
    if (autoFocus && textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, [autoFocus]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleSend = () => {
    if (onSend && value.trim()) {
      onSend();
    }
  };

  const handleClear = () => {
    onChange('');
    if (onClear) {
      onClear();
    }
    if (textAreaRef.current) {
      textAreaRef.current.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  const charCount = value.length;
  const isNearLimit = charCount > maxLength * 0.8;
  const isOverLimit = charCount > maxLength;

  return (
    <div className="text-input-container">
      <div className={`text-input-wrapper ${isFocused ? 'focused' : ''} ${disabled ? 'disabled' : ''}`}>
        <TextArea
          ref={textAreaRef}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          maxLength={maxLength}
          autoSize={{ minRows: 3, maxRows: 8 }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyPress}
          disabled={disabled}
          className="starseed-textarea"
        />
        
        <div className="text-input-footer">
          <div className="char-count">
            <Text 
              className={`char-count-text ${isOverLimit ? 'over-limit' : isNearLimit ? 'near-limit' : ''}`}
            >
              {charCount}/{maxLength}
            </Text>
          </div>
          
          <Space className="text-input-actions">
            {value && (
              <Tooltip title="清空内容">
                <Button
                  type="text"
                  icon={<ClearOutlined />}
                  onClick={handleClear}
                  disabled={disabled}
                  className="clear-button"
                />
              </Tooltip>
            )}
            
            <Tooltip title="发送 (Ctrl+Enter)">
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSend}
                disabled={disabled || !value.trim() || isOverLimit}
                className="send-button"
              >
                发布星种
              </Button>
            </Tooltip>
          </Space>
        </div>
      </div>
      
      {showCharCount && (
        <div className="char-count-hint">
          <Text type="secondary" className="hint-text">
            {isOverLimit ? (
              <span className="error-text">超出字数限制</span>
            ) : isNearLimit ? (
              <span className="warning-text">接近字数限制</span>
            ) : (
              <span>按 Ctrl+Enter 快速发送</span>
            )}
          </Text>
        </div>
      )}
    </div>
  );
};

export default TextInput;


