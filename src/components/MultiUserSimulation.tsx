'use client';

import { useState, useEffect } from 'react';
import { 
  Send, 
  MapPin, 
  Zap, 
  Brain, 
  ChevronRight, 
  Clock,
  Users,
  MessageCircle,
  Activity
} from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'dealer';
  content: string;
  timestamp: number;
  toxicityScore?: number;
  propagationPath?: string[];
  estimatedReach?: string;
  delay?: number;
}

interface UserSession {
  id: string;
  name: string;
  avatar: string;
  location: string;
  messages: ChatMessage[];
  isTyping: boolean;
  lastActivity: number;
}

const mockUsers: UserSession[] = [
  {
    id: 'user1',
    name: '小明',
    avatar: '👨‍💼',
    location: '杭州市西湖区文三路',
    messages: [],
    isTyping: false,
    lastActivity: Date.now()
  },
  {
    id: 'user2', 
    name: '小红',
    avatar: '👩‍🎨',
    location: '杭州市西湖区翠苑街道',
    messages: [],
    isTyping: false,
    lastActivity: Date.now()
  },
  {
    id: 'user3',
    name: '小李',
    avatar: '👨‍🔬',
    location: '杭州市西湖区学院路',
    messages: [],
    isTyping: false,
    lastActivity: Date.now()
  }
];

const mockMessages = [
  {
    user: 'user1',
    content: '今天西湖边的樱花开了，太美了🌸',
    toxicityScore: 6.2,
    propagationPath: ['文三路小区', '翠苑街道'],
    estimatedReach: '预计覆盖：2小时内影响80-120人',
    delay: 3000
  },
  {
    user: 'user2',
    content: '翠苑街道新开了一家咖啡店，环境很棒☕️',
    toxicityScore: 5.8,
    propagationPath: ['翠苑街道', '西湖区中心'],
    estimatedReach: '预计覆盖：1小时内影响50-80人',
    delay: 2500
  },
  {
    user: 'user3',
    content: '学院路地铁站附近有家很棒的日料店🍣',
    toxicityScore: 7.1,
    propagationPath: ['学院路小区', '翠苑街道', '西湖区中心'],
    estimatedReach: '预计覆盖：3小时内影响150-200人',
    delay: 4000
  }
];

export default function MultiUserSimulation() {
  const [users, setUsers] = useState<UserSession[]>(mockUsers);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    // 初始化每个用户的欢迎消息
    const welcomeMessages = users.map(user => ({
      id: `welcome-${user.id}`,
      type: 'dealer' as const,
      content: `欢迎 ${user.name}！请发送您的位置信息以启动会话。`,
      timestamp: Date.now()
    }));

    setUsers(prev => prev.map((user, index) => ({
      ...user,
      messages: [welcomeMessages[index]]
    })));
  }, []);

  const simulateUserInteraction = () => {
    if (currentMessageIndex >= mockMessages.length) {
      setIsSimulating(false);
      return;
    }

    const messageData = mockMessages[currentMessageIndex];
    const userIndex = users.findIndex(u => u.id === messageData.user);
    
    if (userIndex === -1) return;

    // 添加用户消息
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: messageData.content,
      timestamp: Date.now()
    };

    setUsers(prev => prev.map((user, index) => {
      if (index === userIndex) {
        return {
          ...user,
          messages: [...user.messages, userMessage],
          isTyping: true,
          lastActivity: Date.now()
        };
      }
      return user;
    }));

    // 模拟发牌手分析延迟
    setTimeout(() => {
      const dealerMessage: ChatMessage = {
        id: `dealer-${Date.now()}`,
        type: 'dealer',
        content: `🔬 毒株分析完成！毒性评分：${messageData.toxicityScore}/10`,
        timestamp: Date.now(),
        toxicityScore: messageData.toxicityScore,
        propagationPath: messageData.propagationPath,
        estimatedReach: messageData.estimatedReach,
        delay: messageData.delay
      };

      setUsers(prev => prev.map((user, index) => {
        if (index === userIndex) {
          return {
            ...user,
            messages: [...user.messages, dealerMessage],
            isTyping: false,
            lastActivity: Date.now()
          };
        }
        return user;
      }));

      setCurrentMessageIndex(prev => prev + 1);
    }, messageData.delay);
  };

  const startSimulation = () => {
    setIsSimulating(true);
    setCurrentMessageIndex(0);
    simulateUserInteraction();
  };

  const resetSimulation = () => {
    setIsSimulating(false);
    setCurrentMessageIndex(0);
    setUsers(mockUsers.map(user => ({
      ...user,
      messages: [{
        id: `welcome-${user.id}`,
        type: 'dealer' as const,
        content: `欢迎 ${user.name}！请发送您的位置信息以启动会话。`,
        timestamp: Date.now()
      }],
      isTyping: false
    })));
  };

  useEffect(() => {
    if (isSimulating && currentMessageIndex < mockMessages.length) {
      const timer = setTimeout(() => {
        simulateUserInteraction();
      }, 2000); // 每2秒发送一条消息

      return () => clearTimeout(timer);
    }
  }, [isSimulating, currentMessageIndex]);

  return (
    <div className="w-full bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 控制面板 */}
        <div className="mb-6 bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900">多用户实时互动模拟</h2>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isSimulating ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-sm text-gray-600">
                  {isSimulating ? '模拟进行中' : '模拟已停止'}
                </span>
              </div>
              <button
                onClick={startSimulation}
                disabled={isSimulating}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSimulating ? '模拟中...' : '开始模拟'}
              </button>
              <button
                onClick={resetSimulation}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                重置
              </button>
            </div>
          </div>
        </div>

        {/* 三个用户界面 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {users.map((user, index) => (
            <div key={user.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* 手机界面头部 */}
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-4 text-white">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{user.avatar}</div>
                  <div>
                    <h3 className="font-semibold">{user.name}</h3>
                    <p className="text-sm opacity-90">{user.location}</p>
                  </div>
                </div>
                <div className="mt-2 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-xs">在线</span>
                  <span className="text-xs opacity-75">
                    {new Date(user.lastActivity).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* 聊天区域 */}
              <div className="h-96 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {user.messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-purple-600 text-white rounded-br-none'
                        : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      
                      {message.type === 'dealer' && message.toxicityScore && (
                        <div className="mt-2 pt-2 border-t border-gray-200/50 text-xs text-gray-600">
                          <div className="flex items-center mb-1">
                            <Zap className="w-3 h-3 mr-1 text-orange-500" />
                            毒性评分: <span className="font-semibold text-orange-600 ml-1">{message.toxicityScore}/10</span>
                          </div>
                          
                          {message.propagationPath && (
                            <div className="flex items-center mb-1">
                              <MapPin className="w-3 h-3 mr-1 text-blue-500" />
                              传播路径: {message.propagationPath.join(' → ')}
                            </div>
                          )}
                          
                          {message.estimatedReach && (
                            <div className="flex items-center mb-1">
                              <Activity className="w-3 h-3 mr-1 text-green-500" />
                              影响范围: {message.estimatedReach}
                            </div>
                          )}
                          
                          {message.delay && (
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 mr-1 text-gray-500" />
                              延迟: {message.delay/1000}秒
                            </div>
                          )}
                        </div>
                      )}
                      
                      <span className="block text-right text-[10px] text-gray-400 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
                
                {user.isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white p-3 rounded-lg rounded-bl-none border border-gray-200">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-600">发牌手正在分析...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 输入区域 */}
              <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="输入毒株内容..."
                    disabled
                  />
                  <button
                    className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    disabled
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 说明文字 */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <MessageCircle className="w-5 h-5 text-blue-500 mr-2 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-2">模拟说明</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 三个界面代表三个不同用户与发牌手的独立互动</li>
                <li>• 每个用户发送毒株内容后，发牌手会分析毒性并预测传播路径</li>
                <li>• 毒性评分越高，传播范围越广，延迟时间越短</li>
                <li>• 模拟真实的地理传播逻辑和用户行为模式</li>
                <li>• 点击"开始模拟"观看完整的互动流程</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
