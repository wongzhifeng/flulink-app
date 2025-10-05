'use client';

import { useState, useRef } from 'react';
import { 
  Upload, 
  Image, 
  Video, 
  Music, 
  FileText, 
  XCircle, 
  File,
  CheckCircle,
  AlertCircle,
  Eye,
  Download,
  Trash2
} from 'lucide-react';

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number; // bytes
  url: string; // Blob URL for preview
  status: 'uploading' | 'success' | 'error' | 'processing';
  progress: number;
  thumbnail?: string;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    pages?: number;
  };
}

interface AttachmentUploaderProps {
  onAttachmentsChange?: (attachments: Attachment[]) => void;
  maxSize?: number; // bytes
  maxCount?: number;
  allowedTypes?: string[];
  className?: string;
}

export default function AttachmentUploader({
  onAttachmentsChange,
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxCount = 5,
  allowedTypes = ['image/*', 'video/*', 'audio/*', 'application/pdf'],
  className = ''
}: AttachmentUploaderProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (files: FileList | null) => {
    if (!files) return;

    const newAttachments: Attachment[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // 检查文件大小
      if (file.size > maxSize) {
        alert(`文件 ${file.name} 超过大小限制 (${(maxSize / 1024 / 1024).toFixed(1)}MB)`);
        continue;
      }

      // 检查文件类型
      const isAllowed = allowedTypes.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.slice(0, -1));
        }
        return file.type === type;
      });

      if (!isAllowed) {
        alert(`文件 ${file.name} 类型不支持`);
        continue;
      }

      // 检查数量限制
      if (attachments.length + newAttachments.length >= maxCount) {
        alert(`最多只能上传 ${maxCount} 个文件`);
        break;
      }

      const attachment: Attachment = {
        id: `${Date.now()}-${i}`,
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file),
        status: 'uploading',
        progress: 0,
        metadata: {}
      };

      // 生成缩略图
      if (file.type.startsWith('image/')) {
        try {
          const img = new window.Image();
          img.onload = () => {
            attachment.metadata = {
              width: img.width,
              height: img.height
            };
            attachment.thumbnail = attachment.url;
            setAttachments(prev => prev.map(att => 
              att.id === attachment.id ? attachment : att
            ));
          };
          img.src = attachment.url;
        } catch (error) {
          console.error('Error generating thumbnail:', error);
        }
      }

      newAttachments.push(attachment);
    }

    if (newAttachments.length > 0) {
      const updatedAttachments = [...attachments, ...newAttachments];
      setAttachments(updatedAttachments);
      onAttachmentsChange?.(updatedAttachments);

      // 模拟上传过程
      newAttachments.forEach(attachment => {
        simulateUpload(attachment.id);
      });
    }
  };

  const simulateUpload = (attachmentId: string) => {
    const interval = setInterval(() => {
      setAttachments(prev => prev.map(att => {
        if (att.id === attachmentId) {
          const newProgress = Math.min(att.progress + Math.random() * 20, 100);
          
          if (newProgress >= 100) {
            clearInterval(interval);
            return {
              ...att,
              progress: 100,
              status: 'success'
            };
          }
          
          return {
            ...att,
            progress: newProgress
          };
        }
        return att;
      }));
    }, 200);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => {
      const attachment = prev.find(att => att.id === id);
      if (attachment) {
        URL.revokeObjectURL(attachment.url);
      }
      const updated = prev.filter(att => att.id !== id);
      onAttachmentsChange?.(updated);
      return updated;
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-5 h-5 text-blue-500" />;
    if (type.startsWith('video/')) return <Video className="w-5 h-5 text-green-500" />;
    if (type.startsWith('audio/')) return <Music className="w-5 h-5 text-purple-500" />;
    if (type === 'application/pdf') return <FileText className="w-5 h-5 text-red-500" />;
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: Attachment['status']) => {
    switch (status) {
      case 'uploading': return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'processing': return <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />;
      default: return null;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 上传区域 */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          multiple
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files)}
          accept={allowedTypes.join(',')}
        />
        
        <div className="text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            拖拽文件到此处或
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-600 hover:text-blue-800 ml-1"
            >
              点击选择文件
            </button>
          </p>
          <p className="text-sm text-gray-500">
            支持图片、视频、音频、PDF文档
          </p>
          <p className="text-xs text-gray-400 mt-2">
            单个文件最大 {formatFileSize(maxSize)}，最多 {maxCount} 个文件
          </p>
        </div>
      </div>

      {/* 附件列表 */}
      {attachments.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">已上传文件 ({attachments.length}/{maxCount})</h3>
          {attachments.map(attachment => (
            <div key={attachment.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center space-x-3">
                {/* 缩略图或图标 */}
                <div className="flex-shrink-0">
                  {attachment.thumbnail ? (
                    <img 
                      src={attachment.thumbnail} 
                      alt={attachment.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      {getFileIcon(attachment.type)}
                    </div>
                  )}
                </div>

                {/* 文件信息 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {attachment.name}
                    </h4>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(attachment.status)}
                      <button
                        onClick={() => handleRemoveAttachment(attachment.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-xs text-gray-500">
                      {formatFileSize(attachment.size)}
                    </span>
                    {attachment.metadata?.width && attachment.metadata?.height && (
                      <span className="text-xs text-gray-500">
                        {attachment.metadata.width} × {attachment.metadata.height}
                      </span>
                    )}
                    {attachment.metadata?.duration && (
                      <span className="text-xs text-gray-500">
                        {Math.floor(attachment.metadata.duration / 60)}:{(attachment.metadata.duration % 60).toString().padStart(2, '0')}
                      </span>
                    )}
                  </div>

                  {/* 上传进度 */}
                  {attachment.status === 'uploading' && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${attachment.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        上传中... {Math.round(attachment.progress)}%
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 使用说明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">附件使用说明</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• 图片和视频会增加毒株的传播潜力</li>
          <li>• 音频文件适合语音消息和播客内容</li>
          <li>• PDF文档适合分享资料和报告</li>
          <li>• 附件会经过发牌手的安全扫描</li>
          <li>• 支持的文件格式：JPG, PNG, GIF, MP4, MP3, PDF等</li>
        </ul>
      </div>
    </div>
  );
}