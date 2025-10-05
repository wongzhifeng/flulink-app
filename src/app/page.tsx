'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, MapPin, Zap, Brain, ChevronRight, Share2, Paperclip, Trophy, Menu, X, RefreshCw } from 'lucide-react';
import { FluDealerService } from '@/services/DealerService';
import { UserCard, DealerResponse, GeoLocation } from '@/types/dealer';
import AttachmentUploader from '@/components/AttachmentUploader';
import { globalStateManager, GlobalVirusStrain } from '@/lib/globalState';

export default function FluDealerApp() {
  const [isLocationVerified, setIsLocationVerified] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<GeoLocation | null>({
    latitude: 30.2741,
    longitude: 120.1551,
    precision: '街道',
    address: '杭州市西湖区文三路与学院路口'
  });
  const [cardContent, setCardContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [dealerResponse, setDealerResponse] = useState<DealerResponse | null>(null);
  const [showAttachments, setShowAttachments] = useState(false);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [messages, setMessages] = useState<DealerResponse[]>([]);
  const [locationUpdateCount, setLocationUpdateCount] = useState(0);
  const [isLocationUpdating, setIsLocationUpdating] = useState(false);
  const [timeGranularity, setTimeGranularity] = useState(30); // 时间颗粒度（秒）
  const [showTimeSettings, setShowTimeSettings] = useState(false);
  const [showVirusDetail, setShowVirusDetail] = useState(false);
  const [selectedVirusStrain, setSelectedVirusStrain] = useState<any>(null);
  const [showDeepExplore, setShowDeepExplore] = useState(false);
  const [userPreferences, setUserPreferences] = useState<{[key: string]: string}>({});
  const [floatingStrains, setFloatingStrains] = useState<any[]>([]);
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());

  const dealerService = useRef(new FluDealerService()).current;
  const messageEndRef = useRef<HTMLDivElement>(null);

  // 添加欢迎消息（客户端渲染）
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage = {
        id: 'welcome-message',
        type: 'dealer' as const,
        timestamp: Date.now(),
        content: '欢迎使用FluLink！我是您的专属发牌手，将为您分析内容的传播潜力。请分享您的想法，让我来评估它的"传播力"！',
        toxicityReport: { score: 0, analysis: '' },
        propagationPrediction: { path: [], estimatedReach: '', successRate: 0, delay: 0 },
        suggestions: []
      };

      // 添加模拟用户毒株
      const mockStrains = dealerService.generateMockUserStrains();
      const mockMessages = mockStrains.map(strain => dealerService.createMockUserStrainMessage(strain));

      setMessages([welcomeMessage, ...mockMessages]);
      
      // 延迟更新悬浮毒株，确保DOM已渲染
      setTimeout(() => {
        updateFloatingStrains();
      }, 100);
    }
  }, []);

  // 监听全局状态变化，接收多用户界面的毒株信息
  useEffect(() => {
    const unsubscribe = globalStateManager.subscribe(() => {
      const multiUserStrains = globalStateManager.getMultiUserStrains();
      if (multiUserStrains.length > 0) {
        // 将多用户的毒株转换为首页消息
        const newMessages = multiUserStrains.map(strain => ({
          id: `multi-user-${strain.id}`,
          type: 'dealer' as const,
          content: `🦠 检测到附近用户发布新毒株："${strain.title}"`,
          timestamp: strain.timestamp,
          toxicityReport: { score: strain.toxicityScore, analysis: `传播力评分: ${strain.toxicityScore}/10` },
          propagationPrediction: { 
            path: [{ name: strain.location, type: '小区' as const }], 
            estimatedReach: `${strain.propagationCount}人`, 
            successRate: Math.min(95, strain.toxicityScore * 10), 
            delay: 2000 
          },
          suggestions: ['👁️ 查看详情', '🦠 关注传播', '📊 分析数据'],
          virusStrain: strain
        }));
        
        setMessages(prev => [...prev, ...newMessages]);
        
        setTimeout(() => {
          updateFloatingStrains();
        }, 100);
      }
    });
    
    return unsubscribe;
  }, []);

  // 获取用户位置
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const mockLocation: GeoLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            address: '杭州市西湖区文三路与学院路口',
            precision: '街道'
          };
          setCurrentLocation(mockLocation);
          setIsLocationVerified(true);
        },
        (error) => {
          console.warn('位置获取受限，使用默认位置:', error.message || '权限被拒绝');
          setCurrentLocation({
            latitude: 30.2741,
            longitude: 120.1551,
            precision: '小区',
            address: '杭州市西湖区文三路小区'
          });
          setIsLocationVerified(true);
        }
      );
    } else {
      setCurrentLocation({
        latitude: 30.2741,
        longitude: 120.1551,
        precision: '小区',
        address: '杭州市西湖区文三路小区'
      });
      setIsLocationVerified(true);
    }
  }, []);

  // 定时更新位置信息
  useEffect(() => {
    if (isLocationVerified && currentLocation) {
      const interval = setInterval(() => {
        // 模拟位置微调
        const newLocation = {
          ...currentLocation,
          latitude: currentLocation.latitude + (Math.random() - 0.5) * 0.0001,
          longitude: currentLocation.longitude + (Math.random() - 0.5) * 0.0001,
        };
        setCurrentLocation(newLocation);
        setLocationUpdateCount(prev => prev + 1);
        
        // 发送位置更新给发牌手
        sendLocationUpdate(newLocation);
      }, timeGranularity * 1000); // 根据时间颗粒度更新

      return () => clearInterval(interval);
    }
  }, [isLocationVerified, currentLocation, timeGranularity]);

  // 发送位置更新给发牌手（后台运行，不显示在聊天记录中）
  const sendLocationUpdate = async (location: GeoLocation) => {
    try {
      // 显示位置更新状态
      setIsLocationUpdating(true);
      setLocationUpdateCount(prev => prev + 1);
      
      // 后台更新位置，不添加到消息列表
      console.log(`位置已更新: ${location.address}`);
      
      // 2秒后隐藏更新状态
      setTimeout(() => {
        setIsLocationUpdating(false);
      }, 2000);
    } catch (error) {
      console.error('位置更新失败:', error);
      setIsLocationUpdating(false);
    }
  };

  // 自动接收发牌手消息
  useEffect(() => {
    if (isLocationVerified) {
      const interval = setInterval(() => {
        // 模拟发牌手主动发送消息
        const messageTypes = ['virus_detection', 'system_notification', 'propagation_update'];
        const messageType = messageTypes[Math.floor(Math.random() * messageTypes.length)];
        
        let dealerMessage: DealerResponse;
        
        if (messageType === 'virus_detection') {
          // 毒株检测消息
          dealerMessage = dealerService.detectNearbyVirusStrains();
        } else {
          // 其他系统消息
          const systemMessages = [
            "📊 您的传播影响力正在上升，当前排名前15%",
            "🎯 建议在下午2-4点发布内容，传播效果最佳",
            "🌍 您的毒株已传播到3个不同区域",
            "⚡ 检测到高传播力内容，建议关注传播路径",
            "📈 系统通知：您的毒株'周末活动'已获得100+传播",
            "🌐 地理传播：您的毒株已扩散到西湖区其他街道",
            "💡 建议：当前时间段发布内容传播效果最佳",
            "🎯 系统推荐：基于您的位置，建议发布本地化内容",
            "📊 统计更新：今日已传播毒株数量达到500+",
            "🔄 实时更新：附近用户活跃度上升，传播机会增加",
            `⏱️ 时间颗粒度：系统按${timeGranularity}秒间隔更新传播数据`,
            "🕐 异步社交：内容传播遵循时间节奏，请耐心等待",
            "📈 传播周期：每轮更新都会带来新的传播机会",
            "🎪 社交节奏：系统正在后台处理您的传播请求"
          ];
          
          const randomMessage = systemMessages[Math.floor(Math.random() * systemMessages.length)];
          
          dealerMessage = {
            id: `dealer-auto-${Date.now()}`,
            type: 'dealer',
            timestamp: Date.now(),
            content: randomMessage,
            toxicityReport: { score: Math.random() * 10, analysis: '自动分析' },
            propagationPrediction: { 
              path: [{ name: '当前位置', type: '小区' }], 
              estimatedReach: '预计影响50-100人', 
              successRate: Math.random() * 100, 
              delay: Math.random() * 5000 
            },
            suggestions: ['继续发布优质内容', '关注传播反馈']
          };
        }
        
        setMessages(prev => [...prev, dealerMessage]);
      }, timeGranularity * 1000); // 根据时间颗粒度发送消息

      return () => clearInterval(interval);
    }
  }, [isLocationVerified, timeGranularity]);

  // 滚动监听，当毒株消息滚动出屏幕时更新悬浮窗
  useEffect(() => {
    const chatContainer = document.querySelector('.flex-1.overflow-y-auto.bg-gray-50.p-3.space-y-3');
    if (!chatContainer) return;

    const handleScroll = () => {
      updateInteractionTime(); // 滚动也算交互
      updateFloatingStrains(); // 更新悬浮毒株
    };

    chatContainer.addEventListener('scroll', handleScroll);
    return () => chatContainer.removeEventListener('scroll', handleScroll);
  }, [messages]);

  // 监听交互时间，30秒无交互隐藏悬浮窗
  useEffect(() => {
    // 移除自动隐藏逻辑，悬浮窗不再自动消失
    // const interval = setInterval(() => {
    //   const now = Date.now();
    //   if (now - lastInteractionTime > 30000) {
    //     setFloatingStrains([]);
    //   }
    // }, 5000); // 每5秒检查一次

    // return () => clearInterval(interval);
  }, [lastInteractionTime]);

  // 滚动到底部
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, dealerResponse]);

  const handleSubmitCard = async () => {
    if (!currentLocation || !cardContent.trim()) return;

    updateInteractionTime(); // 更新交互时间
    setIsProcessing(true);
    
    // 添加用户消息
    const userMessage: DealerResponse = {
      id: `user-${Date.now()}`,
      type: 'user',
      timestamp: Date.now(),
      content: cardContent.trim(),
      toxicityReport: { score: 0, analysis: '' },
      propagationPrediction: { path: [], estimatedReach: '', successRate: 0, delay: 0 },
      suggestions: []
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    const userCard: UserCard = {
      content: cardContent.trim(),
      location: currentLocation,
      attachments: attachments.map(att => ({
        id: att.id,
        name: att.name,
        type: att.type,
        size: att.size,
        url: att.url
      })),
      formData: undefined,
      userLevel: 'free'
    };

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const response = await dealerService.processUserCard(userCard);
      setMessages(prev => [...prev, response]);
      setCardContent('');
      setAttachments([]);
      setShowAttachments(false);
    } catch (error) {
      console.error('发牌失败:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // 计算毒株热度（简化版：只显示一把火）
  const calculateHeat = (strain: any) => {
    // 简化逻辑：只要满足悬浮条件就显示一把火
    return shouldFloat(strain) ? 1 : 0;
  };

  // 检查毒株是否应该悬浮显示
  const shouldFloat = (strain: any) => {
    return strain.toxicityScore >= 7 || strain.propagationCount >= 15;
  };

  // 检查消息是否在视口内
  const isMessageInViewport = (messageId: string) => {
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    if (!messageElement) return false;
    
    const rect = messageElement.getBoundingClientRect();
    const chatContainer = document.querySelector('.flex-1.overflow-y-auto.bg-gray-50.p-3.space-y-3');
    if (!chatContainer) return false;
    
    const containerRect = chatContainer.getBoundingClientRect();
    return rect.top >= containerRect.top && rect.bottom <= containerRect.bottom;
  };

  // 更新悬浮毒株列表（基于滚动位置和可见性）
  const updateFloatingStrains = () => {
    const strains = messages
      .filter(msg => {
        if (!msg.virusStrain || !shouldFloat(msg.virusStrain)) return false;
        // 只显示不在视口内的毒株消息
        return !isMessageInViewport(msg.id);
      })
      .map(msg => ({
        ...msg.virusStrain,
        heatLevel: calculateHeat(msg.virusStrain),
        lastUpdate: msg.timestamp,
        messageId: msg.id,
        uniqueKey: `${msg.virusStrain.id}-${msg.id}` // 确保唯一性
      }))
      .sort((a, b) => (b.toxicityScore * 0.6 + b.propagationCount * 0.4) - (a.toxicityScore * 0.6 + a.propagationCount * 0.4));
    
    // 去重：按毒株ID去重，保留最新的
    const uniqueStrains = strains.reduce((acc, current) => {
      const existingIndex = acc.findIndex(item => item.id === current.id);
      if (existingIndex === -1) {
        acc.push(current);
      } else if (current.lastUpdate > acc[existingIndex].lastUpdate) {
        acc[existingIndex] = current;
      }
      return acc;
    }, [] as any[]);
    
    setFloatingStrains(uniqueStrains.slice(0, 3)); // 保留最新的3条
  };

  // 更新最后交互时间
  const updateInteractionTime = () => {
    setLastInteractionTime(Date.now());
  };

  // 手动触发模拟用户毒株发布
  const triggerMockUserStrains = () => {
    updateInteractionTime();
    const mockStrains = dealerService.generateMockUserStrains();
    const mockMessages = mockStrains.map(strain => dealerService.createMockUserStrainMessage(strain));
    setMessages(prev => [...prev, ...mockMessages]);
  };
  const getRecommendedMode = (virusStrain: any) => {
    // 根据内容类型推荐模式
    if (virusStrain.content.length > 200 || virusStrain.content.includes('图片') || virusStrain.content.includes('视频')) {
      return 'deep';
    }
    return 'popup';
  };

  // 记录用户偏好
  const recordUserPreference = (mode: string, virusStrain: any) => {
    const contentType = virusStrain.content.length > 200 ? 'long' : 'short';
    const key = `${contentType}_${virusStrain.toxicityScore > 5 ? 'high' : 'low'}`;
    setUserPreferences(prev => ({
      ...prev,
      [key]: mode
    }));
  };

  // 获取用户历史偏好
  const getUserPreference = (virusStrain: any) => {
    const contentType = virusStrain.content.length > 200 ? 'long' : 'short';
    const key = `${contentType}_${virusStrain.toxicityScore > 5 ? 'high' : 'low'}`;
    return userPreferences[key];
  };

  // 处理快速查看（弹窗模式）
  const handleQuickView = (virusStrain: any) => {
    updateInteractionTime(); // 更新交互时间
    setSelectedVirusStrain(virusStrain);
    setShowVirusDetail(true);
    recordUserPreference('popup', virusStrain);
  };

  // 处理深度探索（新页面模式）
  const handleDeepExplore = (virusStrain: any) => {
    updateInteractionTime(); // 更新交互时间
    setSelectedVirusStrain(virusStrain);
    setShowDeepExplore(true);
    recordUserPreference('deep', virusStrain);
  };
  const handleVirusInteraction = async (action: 'like' | 'dislike' | 'comment' | 'attachment') => {
    if (!selectedVirusStrain) return;
    
    updateInteractionTime(); // 更新交互时间
    
    try {
      // 模拟交互处理
      const response = await dealerService.propagateVirusStrain(selectedVirusStrain.id);
      
      // 根据交互类型添加不同的消息
      let interactionMessage = '';
      switch (action) {
        case 'like':
          interactionMessage = `👍 您已为"${selectedVirusStrain.title}"点赞，传播速度+20%`;
          break;
        case 'dislike':
          interactionMessage = `👎 您已对"${selectedVirusStrain.title}"表示反对，但仍会传播（反向传播）`;
          break;
        case 'comment':
          interactionMessage = `💬 您已对"${selectedVirusStrain.title}"发表评论，传播范围扩大`;
          break;
        case 'attachment':
          interactionMessage = `📎 您已为"${selectedVirusStrain.title}"添加附件，传播内容丰富`;
          break;
      }
      
      // 添加交互反馈消息
      const feedbackMessage = {
        id: `interaction-${Date.now()}`,
        type: 'dealer' as const,
        timestamp: Date.now(),
        content: interactionMessage,
        toxicityReport: { score: selectedVirusStrain.toxicityScore + 0.5, analysis: '交互增强传播力' },
        propagationPrediction: { 
          path: [{ name: '当前位置', type: '小区' }], 
          estimatedReach: '预计影响100-200人', 
          successRate: 85, 
          delay: 2000 
        },
        suggestions: ['继续传播', '关注反馈', '分享给朋友']
      };
      
      setMessages(prev => [...prev, feedbackMessage]);
      // 不自动关闭弹窗，让用户继续操作
      // setShowVirusDetail(false);
      
    } catch (error) {
      console.error('交互处理失败:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitCard();
    }
  };

  const getToxicityColor = (score: number) => {
    if (score >= 9) return 'text-red-600 bg-red-50';
    if (score >= 7) return 'text-orange-600 bg-orange-50';
    if (score >= 4) return 'text-blue-600 bg-blue-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getToxicityLevel = (score: number) => {
    if (score >= 9) return '超级传播';
    if (score >= 7) return '高传播力';
    if (score >= 4) return '中等传播';
    return '轻度传播';
  };

  if (!isLocationVerified) {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <style jsx>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-5px);
          }
          60% {
            transform: translateY(-3px);
          }
        }
      `}</style>
        {/* 手机模拟器外壳 */}
        <div className="w-full max-w-sm bg-black rounded-3xl p-2 shadow-2xl">
          {/* 手机屏幕 */}
          <div className="bg-white rounded-2xl overflow-hidden h-[800px] flex flex-col">
            {/* 状态栏 */}
            <div className="bg-black text-white text-xs px-4 py-1 flex justify-between items-center">
              <span>9:41</span>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-2 bg-white rounded-sm"></div>
                <div className="w-6 h-3 border border-white rounded-sm"></div>
              </div>
            </div>

            {/* 用户登录界面 */}
            <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-white">
              <div className="text-center w-full">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-white" />
            </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">FluLink</h1>
                <p className="text-gray-600 mb-6">流感式异步社交</p>
                
                <div className="space-y-3">
                  <button 
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          (pos) => {
                            setIsLocationVerified(true);
                            setCurrentLocation({
                              latitude: pos.coords.latitude,
                              longitude: pos.coords.longitude,
                              address: '杭州市西湖区文三路',
                              precision: '街道',
                              district: '西湖区',
                              city: '杭州市'
                            });
                          }
                        );
                      } else {
                        setIsLocationVerified(true);
                        setCurrentLocation({
                          latitude: 30.2741,
                          longitude: 120.1551,
                          precision: '小区',
                          address: '杭州市西湖区文三路小区'
                        });
                      }
                    }}
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 px-4 rounded-xl font-medium"
                  >
                    📍 允许位置访问
              </button>
                  
                  <p className="text-xs text-gray-500">
                    我们需要获取您的位置信息以提供精准的传播服务
                  </p>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-3">了解更多</p>
                    <div className="flex justify-center space-x-4">
                      <a 
                        href="/multi-user" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-xs text-purple-600"
                      >
                        <Share2 className="w-3 h-3 mr-1" />
                        多用户演示
                      </a>
                      <a 
                        href="/achievements" 
                        className="flex items-center text-xs text-yellow-600"
                      >
                        <Trophy className="w-3 h-3 mr-1" />
                        成就系统
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <style jsx>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-5px);
          }
          60% {
            transform: translateY(-3px);
          }
        }
      `}</style>
      {/* 手机模拟器外壳 */}
      <div className="w-full max-w-sm bg-black rounded-3xl p-2 shadow-2xl">
        {/* 手机屏幕 */}
        <div className="bg-white rounded-2xl overflow-hidden h-[800px] flex flex-col">
          {/* 状态栏 */}
          <div className="bg-black text-white text-xs px-4 py-1 flex justify-between items-center">
            <span>9:41</span>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-2 bg-white rounded-sm"></div>
              <div className="w-6 h-3 border border-white rounded-sm"></div>
            </div>
          </div>

          {/* 顶部导航栏 */}
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-white" />
              <h1 className="text-white font-semibold">FluLink</h1>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-white text-xs">
                <RefreshCw className="w-3 h-3" />
                <span>{locationUpdateCount}</span>
            </div>
              <button
                onClick={() => setShowTimeSettings(!showTimeSettings)}
                className="text-white p-1 text-xs"
                title="时间颗粒度设置"
              >
                ⏱️ {timeGranularity}s
              </button>
              <button
                onClick={triggerMockUserStrains}
                className="text-white p-1 text-xs"
                title="测试悬浮毒株"
              >
                🦠 测试
              </button>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="text-white p-1"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
            
          {/* 悬浮毒株窗 */}
          {floatingStrains.length > 0 && (
            <div className="fixed top-4 left-4 right-4 z-40 pointer-events-none">
              <div className="space-y-2">
                {floatingStrains.map((strain, index) => (
                  <div
                    key={strain.uniqueKey || strain.id}
                    className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-200 pointer-events-auto hover:bg-white/95 transition-all duration-300"
                    style={{
                      opacity: 0.7,
                      transform: `translateY(${index * 5}px)`
                    }}
                    onClick={() => handleQuickView(strain)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">🦠</span>
                        <span className="text-sm font-medium text-gray-800 truncate max-w-[120px]">
                          {strain.title.length > 10 ? strain.title.substring(0, 10) + '...' : strain.title}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {strain.heatLevel > 0 && (
                          <span className="text-sm text-orange-500">
                            🔥
                          </span>
                        )}
                        <span className="text-xs text-gray-500 ml-1">
                          {strain.propagationCount}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 时间颗粒度设置面板 */}
          {showTimeSettings && (
            <div className="absolute top-0 left-0 right-0 z-50 bg-white shadow-lg">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">时间颗粒度设置</h3>
                  <button
                    onClick={() => setShowTimeSettings(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
            </div>
            
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      当前时间颗粒度: {timeGranularity}秒
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min="5"
                        max="120"
                        step="5"
                        value={timeGranularity}
                        onChange={(e) => setTimeGranularity(Number(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-sm text-gray-600 min-w-[40px]">{timeGranularity}s</span>
            </div>
          </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[10, 30, 60].map((value) => (
                      <button
                        key={value}
                        onClick={() => setTimeGranularity(value)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          timeGranularity === value
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {value}秒
                      </button>
                    ))}
                  </div>
                  
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>• 时间颗粒度控制系统的更新频率</p>
                    <p>• 位置更新和发牌手消息都会按此间隔发送</p>
                    <p>• 建议范围: 5-120秒</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 毒株详情弹窗 */}
          {showVirusDetail && selectedVirusStrain && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={(e) => {
                // 点击空白区域关闭弹窗
                if (e.target === e.currentTarget) {
                  setShowVirusDetail(false);
                }
              }}
            >
              <div 
                className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* 弹窗头部 */}
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-5 h-5 text-white" />
                    <h3 className="text-white font-semibold">毒株详情</h3>
                  </div>
                  <button
                    onClick={() => setShowVirusDetail(false)}
                    className="text-white hover:text-gray-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* 弹窗内容 */}
                <div className="p-4 space-y-4">
                  {/* 毒株基本信息 */}
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-gray-800 text-lg mb-2">
                        {selectedVirusStrain.title}
                      </h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {selectedVirusStrain.content}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500">👤</span>
                        <span>{selectedVirusStrain.author}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500">📍</span>
                        <span>{selectedVirusStrain.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500">🦠</span>
                        <span>传播力: {selectedVirusStrain.toxicityScore}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500">📊</span>
                        <span>已传播: {selectedVirusStrain.propagationCount}人</span>
                      </div>
                    </div>
                  </div>

                  {/* 交互按钮 */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => handleVirusInteraction('like')}
                        className="flex items-center justify-center space-x-2 bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <span>👍</span>
                        <span>点赞</span>
                      </button>
                      <button 
                        onClick={() => handleVirusInteraction('dislike')}
                        className="flex items-center justify-center space-x-2 bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <span>👎</span>
                        <span>点反对</span>
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => handleVirusInteraction('comment')}
                      className="w-full flex items-center justify-center space-x-2 bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <span>💬</span>
                      <span>发表评论</span>
                    </button>
                    
                    <button 
                      onClick={() => handleVirusInteraction('attachment')}
                      className="w-full flex items-center justify-center space-x-2 bg-purple-500 text-white py-3 px-4 rounded-lg hover:bg-purple-600 transition-colors"
                    >
                      <span>📎</span>
                      <span>添加附件</span>
                    </button>
        </div>

                  {/* 传播说明 */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 text-center">
                      💡 点赞和点反对都会增加传播速度，代表您已"中毒"并继续传播
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 深度探索页面 */}
          {showDeepExplore && selectedVirusStrain && (
            <div 
              className="fixed inset-0 bg-white z-50 overflow-y-auto"
              onClick={(e) => {
                // 点击空白区域关闭页面（仅在页面顶部区域）
                if (e.target === e.currentTarget && e.clientY < 100) {
                  setShowDeepExplore(false);
                }
              }}
            >
              {/* 页面头部 */}
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-white" />
                  <h3 className="text-white font-semibold">深度探索</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowDeepExplore(false)}
                    className="text-white hover:text-gray-200 text-sm"
                  >
                    返回弹窗模式
                  </button>
                  <button
                    onClick={() => setShowDeepExplore(false)}
                    className="text-white hover:text-gray-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* 页面内容 */}
              <div 
                className="p-4 space-y-6"
                onClick={(e) => e.stopPropagation()}
              >
                {/* 毒株基本信息 */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <h2 className="font-bold text-xl text-gray-800 mb-3">{selectedVirusStrain.title}</h2>
                  <p className="text-gray-600 leading-relaxed mb-4">{selectedVirusStrain.content}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">👤</span>
                      <span>{selectedVirusStrain.author}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">📍</span>
                      <span>{selectedVirusStrain.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">🦠</span>
                      <span>传播力: {selectedVirusStrain.toxicityScore}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">📊</span>
                      <span>已传播: {selectedVirusStrain.propagationCount}人</span>
                    </div>
                  </div>
                </div>

                {/* 传播路径可视化 */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                    <span>🌍</span>
                    <span>传播路径可视化</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-600">当前位置: {selectedVirusStrain.location}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-600">已扩散到3个相邻区域</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-600">预计24小时内覆盖整个西湖区</span>
                    </div>
                  </div>
            </div>
            
                {/* 变异历史时间轴 */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                    <span>🕐</span>
                    <span>变异历史时间轴</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                      <div>
                        <div className="text-sm font-medium text-gray-800">原始版本</div>
                        <div className="text-xs text-gray-500">2小时前 · 作者: {selectedVirusStrain.author}</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <div className="text-sm font-medium text-gray-800">第一次变异</div>
                        <div className="text-xs text-gray-500">1小时前 · 用户A添加了图片</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <div className="text-sm font-medium text-gray-800">第二次变异</div>
                        <div className="text-xs text-gray-500">30分钟前 · 用户B更新了位置信息</div>
                      </div>
                    </div>
                  </div>
            </div>
            
                {/* 跨平台分享 */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                    <span>📤</span>
                    <span>跨平台分享</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center space-x-2 bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors">
                      <span>📱</span>
                      <span>生成传播海报</span>
                    </button>
                    <button className="flex items-center justify-center space-x-2 bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                      <span>🔗</span>
                      <span>复制分享链接</span>
                    </button>
            </div>
          </div>

                {/* 添加到毒株库 */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-4 border border-purple-200">
                  <button className="w-full flex items-center justify-center space-x-2 bg-purple-500 text-white py-3 px-4 rounded-lg hover:bg-purple-600 transition-colors">
                    <span>⭐</span>
                    <span>添加到我的毒株库</span>
                  </button>
                </div>

                {/* 交互按钮 */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-800 mb-3">与毒株互动</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => handleVirusInteraction('like')}
                        className="flex items-center justify-center space-x-2 bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <span>👍</span>
                        <span>点赞</span>
                      </button>
                      <button 
                        onClick={() => handleVirusInteraction('dislike')}
                        className="flex items-center justify-center space-x-2 bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <span>👎</span>
                        <span>点反对</span>
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => handleVirusInteraction('comment')}
                      className="w-full flex items-center justify-center space-x-2 bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <span>💬</span>
                      <span>发表评论</span>
                    </button>
                    
                    <button 
                      onClick={() => handleVirusInteraction('attachment')}
                      className="w-full flex items-center justify-center space-x-2 bg-purple-500 text-white py-3 px-4 rounded-lg hover:bg-purple-600 transition-colors"
                    >
                      <span>📎</span>
                      <span>添加附件</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 侧边菜单 */}
          {showMenu && (
            <div className="absolute top-0 left-0 right-0 z-50 bg-white shadow-lg">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900">菜单</h2>
                  <button onClick={() => setShowMenu(false)}>
                    <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
              <div className="p-4 space-y-3">
                <a href="/multi-user" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                  <Share2 className="w-5 h-5 text-purple-600" />
                  <span>多用户演示</span>
                </a>
                <a href="/achievements" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  <span>成就系统</span>
                </a>
                <a href="/admin" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                  <Brain className="w-5 h-5 text-blue-600" />
                  <span>管理后台</span>
                </a>
              </div>
            </div>
          )}

          {/* 聊天区域 */}
          <div className="flex-1 overflow-y-auto bg-gray-50 p-3 space-y-3">
            {/* 消息列表 */}
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`} data-message-id={message.id}>
                <div className={`max-w-[85%] p-3 rounded-2xl ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-br-md'
                    : 'bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100'
                }`}>
                  {message.type === 'dealer' && (
                    <div className="flex items-center space-x-2 mb-2">
                      <Brain className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-medium text-purple-700">发牌手</span>
                    </div>
                  )}
                  
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  
                  {/* 毒株卡片 */}
                  {message.type === 'dealer' && message.virusStrain && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-purple-800 text-sm">{message.virusStrain.title}</h4>
                        <span className="text-xs text-purple-600">传播力: {message.virusStrain.toxicityScore}</span>
                      </div>
                      <p className="text-xs text-gray-700 mb-2">{message.virusStrain.content}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span>作者: {message.virusStrain.author}</span>
                        <span>📍 {message.virusStrain.location}</span>
                        <span>传播: {message.virusStrain.propagationCount}人</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleQuickView(message.virusStrain!)}
                          className="flex-1 bg-purple-600 text-white py-2 px-3 rounded-md text-xs font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-1"
                        >
                          <span>⌂</span>
                          <span>快速查看</span>
                        </button>
                        <button
                          onClick={() => handleDeepExplore(message.virusStrain!)}
                          className="flex-1 border border-purple-600 text-purple-600 py-2 px-3 rounded-md text-xs font-medium hover:bg-purple-50 transition-colors flex items-center justify-center space-x-1"
                        >
                          <span>↗</span>
                          <span>深度探索</span>
                        </button>
                      </div>
                      {/* 智能推荐提示 */}
                      {getRecommendedMode(message.virusStrain!) === 'popup' && (
                        <div className="text-xs text-purple-600 text-center mt-2 animate-pulse">
                          推荐快速查看此类型内容
                        </div>
                      )}
                      {getRecommendedMode(message.virusStrain!) === 'deep' && (
                        <div className="text-xs text-blue-600 text-center mt-2 animate-pulse">
                          推荐深度探索此类型内容
                        </div>
                      )}
                      {/* 用户偏好提示 */}
                      {getUserPreference(message.virusStrain!) && (
                        <div className="text-xs text-gray-500 text-center mt-1">
                          您上次选择{getUserPreference(message.virusStrain!) === 'popup' ? '快速查看' : '深度探索'}同类内容
                        </div>
                      )}
                    </div>
                  )}
                  
                  {message.type === 'dealer' && message.toxicityReport.score > 0 && (
                    <div className={`mt-3 pt-3 border-t border-gray-200 text-xs`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <Zap className="w-3 h-3 mr-1 text-purple-500" />
                          <span className="font-medium">传播力评级</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getToxicityColor(message.toxicityReport.score)}`}>
                          {message.toxicityReport.score.toFixed(1)}/10 - {getToxicityLevel(message.toxicityReport.score)}
                        </span>
                      </div>
                      
                      {message.propagationPrediction.path.length > 0 && (
                        <div className="flex items-center mb-2">
                          <MapPin className="w-3 h-3 mr-1 text-blue-500" />
                          <span className="text-gray-600">
                            传播路径: {message.propagationPrediction.path.map(p => p.name).join(' → ')}
                          </span>
                        </div>
                      )}
                      
                      {message.propagationPrediction.estimatedReach && (
                        <div className="flex items-center mb-2">
                          <ChevronRight className="w-3 h-3 mr-1 text-green-500" />
                          <span className="text-gray-600">
                            预计覆盖: {message.propagationPrediction.estimatedReach}
                          </span>
                        </div>
                      )}
                      
                      {message.propagationPrediction.delay > 0 && (
                        <div className="flex items-center">
                          <span className="w-3 h-3 mr-1 text-gray-500">⏱️</span>
                          <span className="text-gray-600">
                            传播延迟: {message.propagationPrediction.delay / 1000}秒
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="text-right text-[10px] text-gray-400 mt-2">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            
            {isProcessing && (
              <div className="flex justify-start">
                <div className="max-w-[85%] p-3 rounded-2xl rounded-bl-md bg-white shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-600">发牌手正在分析...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messageEndRef} />
          </div>

          {/* 输入区域 */}
          <div className="bg-white border-t border-gray-200 p-3">
            {/* 附件上传区域 */}
            {showAttachments && (
              <div className="mb-3">
                <AttachmentUploader
                  onAttachmentsChange={setAttachments}
                  maxSize={5 * 1024 * 1024}
                  maxCount={3}
                  className="max-h-32 overflow-y-auto"
                />
              </div>
            )}
            
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <textarea
                  value={cardContent}
                  onChange={(e) => setCardContent(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="分享你的想法，让它像流感一样传播... 💬"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl resize-none text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={2}
                  maxLength={500}
                />
                {cardContent.length > 450 && (
                  <div className="text-right text-xs text-gray-400 mt-1">
                    {cardContent.length}/500
                  </div>
                )}
              </div>
              
              {/* 附件按钮 */}
              <button
                onClick={() => setShowAttachments(!showAttachments)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  showAttachments 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <Paperclip className="w-4 h-4" />
              </button>
              
              <button
                onClick={handleSubmitCard}
                disabled={!cardContent.trim() || isProcessing}
                className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            
            {/* 操作提示 */}
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>在线</span>
                <div className="flex items-center space-x-1">
                  <MapPin className={`w-3 h-3 transition-all duration-300 ${
                    isLocationUpdating 
                      ? 'text-blue-500 animate-pulse scale-110' 
                      : 'text-gray-500'
                  }`} />
                  <span className={`transition-all duration-300 ${
                    isLocationUpdating 
                      ? 'text-blue-500 font-medium' 
                      : 'text-gray-500'
                  }`}>
                    {isLocationUpdating ? '位置已更新' : 
                      currentLocation?.address && currentLocation.address.length > 10 
                        ? (() => {
                            const addr = currentLocation.address;
                            // 优先保留"市+区"信息，如果还是太长则截取前10个字符
                            if (addr.includes('市') && addr.includes('区')) {
                              const cityMatch = addr.match(/(.{2,3}市.{2,3}区)/);
                              if (cityMatch && cityMatch[0].length <= 10) {
                                return cityMatch[0];
                              }
                            }
                            return addr.substring(0, 10) + '...';
                          })()
                        : currentLocation?.address}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {attachments.length > 0 && (
                  <span className="text-blue-600">📎 {attachments.length}</span>
                )}
                <span className="text-gray-400 text-xs">⏱️ {timeGranularity}s</span>
                <span>💡 Enter发送</span>
              </div>
            </div>
          </div>
        </div>
        </div>
    </div>
  );
}