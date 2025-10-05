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
  Activity,
  Bell,
  Eye,
  Share2
} from 'lucide-react';

interface PropagationEvent {
  id: string;
  fromUser: string;
  fromLocation: string;
  content: string;
  toxicityScore: number;
  propagationPath: string[];
  timestamp: number;
  status: 'spreading' | 'reached' | 'blocked';
  delay: number;
}

interface UserSession {
  id: string;
  name: string;
  avatar: string;
  location: string;
  messages: any[];
  isTyping: boolean;
  lastActivity: number;
  receivedPropagations: PropagationEvent[];
}

const mockUsers: UserSession[] = [
  {
    id: 'user1',
    name: '小明',
    avatar: '👨‍💼',
    location: '杭州市西湖区文三路',
    messages: [],
    isTyping: false,
    lastActivity: Date.now(),
    receivedPropagations: []
  },
  {
    id: 'user2', 
    name: '小红',
    avatar: '👩‍🎨',
    location: '杭州市西湖区翠苑街道',
    messages: [],
    isTyping: false,
    lastActivity: Date.now(),
    receivedPropagations: []
  },
  {
    id: 'user3',
    name: '小李',
    avatar: '👨‍🔬',
    location: '杭州市西湖区学院路',
    messages: [],
    isTyping: false,
    lastActivity: Date.now(),
    receivedPropagations: []
  }
];

const propagationEvents: PropagationEvent[] = [
  {
    id: 'prop1',
    fromUser: '小红',
    fromLocation: '翠苑街道',
    content: '翠苑街道新开了一家咖啡店，环境很棒☕️',
    toxicityScore: 5.8,
    propagationPath: ['翠苑街道', '文三路小区', '学院路小区'],
    timestamp: Date.now(),
    status: 'spreading',
    delay: 3000
  },
  {
    id: 'prop2',
    fromUser: '小李',
    fromLocation: '学院路',
    content: '学院路地铁站附近有家很棒的日料店🍣',
    toxicityScore: 7.1,
    propagationPath: ['学院路小区', '翠苑街道', '文三路小区'],
    timestamp: Date.now(),
    status: 'spreading',
    delay: 5000
  }
];

export default function PropagationDemo() {
  const [users, setUsers] = useState<UserSession[]>(mockUsers);
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [showPropagationDetails, setShowPropagationDetails] = useState<string | null>(null);

  useEffect(() => {
    // 初始化欢迎消息
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

  const simulatePropagation = () => {
    if (currentEventIndex >= propagationEvents.length) {
      setIsSimulating(false);
      return;
    }

    const event = propagationEvents[currentEventIndex];
    
    // 找到目标用户（小明）
    const targetUserIndex = users.findIndex(u => u.id === 'user1');
    if (targetUserIndex === -1) return;

    // 模拟传播延迟
    setTimeout(() => {
      const propagationMessage = {
        id: `prop-${event.id}-${Date.now()}`,
        type: 'propagation' as const,
        content: `📡 收到来自${event.fromUser}的毒株传播`,
        timestamp: Date.now(),
        propagationEvent: event
      };

      setUsers(prev => prev.map((user, index) => {
        if (index === targetUserIndex) {
          return {
            ...user,
            messages: [...user.messages, propagationMessage],
            receivedPropagations: [...user.receivedPropagations, event],
            lastActivity: Date.now()
          };
        }
        return user;
      }));

      setCurrentEventIndex(prev => prev + 1);
    }, event.delay);
  };

  const startPropagationDemo = () => {
    setIsSimulating(true);
    setCurrentEventIndex(0);
    simulatePropagation();
  };

  const resetDemo = () => {
    setIsSimulating(false);
    setCurrentEventIndex(0);
    setUsers(mockUsers.map(user => ({
      ...user,
      messages: [{
        id: `welcome-${user.id}`,
        type: 'dealer' as const,
        content: `欢迎 ${user.name}！请发送您的位置信息以启动会话。`,
        timestamp: Date.now()
      }],
      receivedPropagations: []
    })));
  };

  useEffect(() => {
    if (isSimulating && currentEventIndex < propagationEvents.length) {
      const timer = setTimeout(() => {
        simulatePropagation();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isSimulating, currentEventIndex]);

  const getToxicityColor = (score: number) => {
    if (score >= 7) return 'text-red-600 bg-red-50 border-red-200';
    if (score >= 5) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  return (
    <div className="w-full bg-gray-100 p-3">
      <div className="max-w-full mx-auto">
        {/* 控制面板 */}
        <div className="mb-4 bg-white rounded-lg p-3 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Share2 className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-bold text-gray-900">毒株传播演示</h2>
            </div>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              小明视角
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span className="text-xs text-gray-600">
                {isSimulating ? '传播进行中' : '传播已停止'}
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={startPropagationDemo}
                disabled={isSimulating}
                className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs"
              >
                {isSimulating ? '传播中...' : '开始演示'}
              </button>
              <button
                onClick={resetDemo}
                className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-xs"
              >
                重置
              </button>
            </div>
          </div>
        </div>

        {/* 三个用户界面 */}
        <div className="space-y-4">
          {users.map((user, index) => (
            <div key={user.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
              {/* 手机界面头部 */}
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-3 text-white">
                <div className="flex items-center space-x-2">
                  <div className="text-lg">{user.avatar}</div>
                  <div>
                    <h3 className="font-semibold text-sm">{user.name}</h3>
                    <p className="text-xs opacity-90">{user.location}</p>
                  </div>
                </div>
                <div className="mt-1 flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                  <span className="text-xs">在线</span>
                  <span className="text-xs opacity-75">
                    {new Date(user.lastActivity).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* 聊天区域 */}
              <div className="h-64 overflow-y-auto p-3 space-y-2 bg-gray-50">
                {user.messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-2 rounded-lg text-xs ${
                      message.type === 'user'
                        ? 'bg-purple-600 text-white rounded-br-md'
                        : message.type === 'propagation'
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-300 rounded-bl-md'
                        : 'bg-white text-gray-800 rounded-bl-md border border-gray-200'
                    }`}>
                      <p className="text-xs">{message.content}</p>
                      
                      {message.type === 'propagation' && message.propagationEvent && (
                        <div className="mt-2 pt-2 border-t border-yellow-300/50">
                          <div className="text-[10px] space-y-1">
                            <div className="flex items-center">
                              <Bell className="w-2.5 h-2.5 mr-1 text-yellow-600" />
                              来源: {message.propagationEvent.fromUser}
                            </div>
                            <div className="text-yellow-700 font-medium text-xs">
                              "{message.propagationEvent.content}"
                            </div>
                            <div className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] border ${getToxicityColor(message.propagationEvent.toxicityScore)}`}>
                              <Zap className="w-2.5 h-2.5 mr-1" />
                              毒性: {message.propagationEvent.toxicityScore}/10
                            </div>
                            <div className="flex items-center">
                              <MapPin className="w-2.5 h-2.5 mr-1 text-blue-500" />
                              路径: {message.propagationEvent.propagationPath.join(' → ')}
                            </div>
                            <button
                              onClick={() => setShowPropagationDetails(message.propagationEvent.id)}
                              className="flex items-center text-[10px] text-blue-600 hover:text-blue-800"
                            >
                              <Eye className="w-2.5 h-2.5 mr-1" />
                              详情
                            </button>
                          </div>
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
              <div className="p-3 bg-white border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    className="flex-1 p-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                    placeholder="输入毒株内容..."
                    disabled
                  />
                  <button
                    className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    disabled
                  >
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 传播详情弹窗 */}
        {showPropagationDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">传播详情</h3>
                <button
                  onClick={() => setShowPropagationDetails(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              {(() => {
                const event = propagationEvents.find(e => e.id === showPropagationDetails);
                if (!event) return null;
                
                return (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">原始内容</h4>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                        "{event.content}"
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">传播信息</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">发送者:</span>
                          <span className="font-medium">{event.fromUser}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">位置:</span>
                          <span className="font-medium">{event.fromLocation}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">毒性评分:</span>
                          <span className={`font-medium ${getToxicityColor(event.toxicityScore).split(' ')[0]}`}>
                            {event.toxicityScore}/10
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">传播延迟:</span>
                          <span className="font-medium">{event.delay/1000}秒</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">传播路径</h4>
                      <div className="flex items-center space-x-2 text-sm">
                        {event.propagationPath.map((path, index) => (
                          <div key={index} className="flex items-center">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                              {path}
                            </span>
                            {index < event.propagationPath.length - 1 && (
                              <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* 说明文字 */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <Share2 className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-900 mb-2">毒株传播机制说明</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• 当附近用户发送毒株内容时，系统会根据毒性评分计算传播范围</li>
                <li>• 毒性评分越高，传播距离越远，延迟时间越短</li>
                <li>• 小明会收到来自小红、小李等附近用户的毒株推送</li>
                <li>• 每个传播事件都包含原始内容、发送者信息和传播路径</li>
                <li>• 用户可以查看传播详情，了解毒株的来源和传播轨迹</li>
                <li>• 这模拟了真实的"流感式"内容传播机制</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
