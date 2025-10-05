'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, MapPin, Zap, Play, Pause, RotateCcw, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { FluDealerService } from '@/services/DealerService';
import { UserCard, DealerResponse, GeoLocation } from '@/types/dealer';
import { globalStateManager, GlobalVirusStrain } from '@/lib/globalState';

interface UserState {
  id: string;
  name: string;
  location: GeoLocation;
  messages: DealerResponse[];
  isTyping: boolean;
  cardContent: string;
  color: string;
  icon: React.ReactNode;
}

const initialUsers: UserState[] = [
  {
    id: 'user-001',
    name: '小明',
    location: { latitude: 30.2741, longitude: 120.1551, precision: '小区', address: '杭州市西湖区文三路小区' },
    messages: [],
    isTyping: false,
    cardContent: '',
    color: 'bg-blue-500',
    icon: <User className="w-4 h-4" />
  },
  {
    id: 'user-002', 
    name: '小红',
    location: { latitude: 30.2800, longitude: 120.1600, precision: '街道', address: '杭州市西湖区翠苑街道' },
    messages: [],
    isTyping: false,
    cardContent: '',
    color: 'bg-pink-500',
    icon: <User className="w-4 h-4" />
  },
  {
    id: 'user-003',
    name: '小李',
    location: { latitude: 30.2650, longitude: 120.1500, precision: '街道', address: '杭州市西湖区学院路小区' },
    messages: [],
    isTyping: false,
    cardContent: '',
    color: 'bg-green-500',
    icon: <User className="w-4 h-4" />
  },
];

const demoScenarios = [
  { userId: 'user-001', content: "🦠 西湖区美食推荐：发现了一家超棒的川菜馆，味道正宗，价格实惠！" },
  { userId: 'user-002', content: "🦠 翠苑街道周末活动：明天下午2点，西湖边野餐活动，有兴趣的朋友一起来！" },
  { userId: 'user-003', content: "🦠 学院路求助：我的橘猫在学院路附近走丢了，有看到的请联系我！" },
  { userId: 'user-001', content: "🦠 文三路咖啡店探店：新开的咖啡店环境很棒，咖啡香浓，适合工作学习" },
  { userId: 'user-002', content: "🦠 翠苑街道交通提醒：今天地铁2号线有故障，建议绕行" },
  { userId: 'user-003', content: "🦠 学院路科技资讯：深圳南山科技园今天有个AI技术分享会，内容很棒" },
  { userId: 'user-001', content: "🦠 西湖区天气预警：今天下午有雷阵雨，大家出门记得带伞" },
  { userId: 'user-002', content: "🦠 翠苑街道购物推荐：新开的购物中心有很多品牌店，值得逛逛" },
  { userId: 'user-003', content: "🦠 学院路学习资源：发现了一个很好的在线学习平台，分享给大家" },
];

export default function MultiUserDemoPage() {
  const [users, setUsers] = useState<UserState[]>(initialUsers);
  const [isRunning, setIsRunning] = useState(false);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const dealerService = useRef(new FluDealerService()).current;
  const messageEndRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const phonesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 初始化欢迎消息
    const welcomeMessages = users.map(user => ({
      id: `welcome-${user.id}`,
      type: 'dealer' as const,
      content: `欢迎 ${user.name}！请发送您的位置信息以启动会话。`,
      timestamp: Date.now(),
      toxicityReport: { score: 0, analysis: '' },
      propagationPrediction: { path: [], estimatedReach: '', successRate: 0, delay: 0 },
      suggestions: []
    }));

    setUsers(prev => prev.map((user, index) => ({
      ...user,
      messages: [welcomeMessages[index]]
    })));
  }, []);

  const handleSendMessage = async (userId: string, content: string) => {
    setUsers(prevUsers => prevUsers.map(user =>
      user.id === userId ? { ...user, cardContent: '', isTyping: true } : user
    ));

    const user = users.find(u => u.id === userId);
    if (!user) return;

    const userCard: UserCard = {
      content: content,
      location: user.location,
      attachments: [],
      formData: undefined,
      userLevel: 'free'
    };

    const userMessage: DealerResponse = {
      id: `user-${userId}-${Date.now()}`,
      type: 'user',
      timestamp: Date.now(),
      content: content,
      toxicityReport: { score: 0, analysis: '' },
      propagationPrediction: { path: [], estimatedReach: '', successRate: 0, delay: 0 },
      suggestions: []
    };

    setUsers(prevUsers => prevUsers.map(u =>
      u.id === userId ? { ...u, messages: [...u.messages, userMessage] } : u
    ));

    try {
      const dealerResponse = await dealerService.processUserCard(userCard);
      
      // 为毒株内容添加病毒株信息
      if (content.includes('🦠')) {
        const virusStrain = dealerService.generateMockVirusStrains().find(strain => 
          strain.title.includes(content.split('：')[0].replace('🦠 ', '').split('区')[0])
        ) || dealerService.generateMockVirusStrains()[0];
        
        const newVirusStrain = {
          ...virusStrain,
          id: `multi-user-${userId}-${Date.now()}`,
          title: content.split('：')[0].replace('🦠 ', ''),
          content: content.split('：')[1] || content,
          author: user.name,
          location: user.location.address,
          timestamp: Date.now(),
          source: 'multi-user' as const,
          userId: userId,
          userName: user.name
        };
        
        dealerResponse.virusStrain = newVirusStrain;
        
        // 同步到全局状态
        globalStateManager.addVirusStrain(newVirusStrain);
      }
      
      setUsers(prevUsers => prevUsers.map(u =>
        u.id === userId ? { ...u, messages: [...u.messages, dealerResponse], isTyping: false } : u
      ));
    } catch (error) {
      console.error(`Error processing card for ${userId}:`, error);
      setUsers(prevUsers => prevUsers.map(u =>
        u.id === userId ? { ...u, isTyping: false } : u
      ));
    }
  };

  const startSimulation = () => {
    setIsRunning(true);
    setScenarioIndex(0);
    
    // 自动滚动到手机界面位置
    setTimeout(() => {
      if (phonesContainerRef.current) {
        phonesContainerRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }
    }, 100); // 延迟100ms确保状态更新完成
  };

  const stopSimulation = () => {
    setIsRunning(false);
  };

  const resetSimulation = () => {
    setIsRunning(false);
    setScenarioIndex(0);
    setUsers(initialUsers.map(user => ({ ...user, messages: [] })));
  };

  useEffect(() => {
    if (isRunning && scenarioIndex < demoScenarios.length) {
      const currentScenario = demoScenarios[scenarioIndex];
      const timer = setTimeout(() => {
        handleSendMessage(currentScenario.userId, currentScenario.content);
        setScenarioIndex(prev => prev + 1);
      }, 3000 + Math.random() * 2000);
      return () => clearTimeout(timer);
    } else if (isRunning && scenarioIndex >= demoScenarios.length) {
      setIsRunning(false);
    }
  }, [isRunning, scenarioIndex]);

  const getToxicityColor = (score: number) => {
    if (score >= 9) return 'text-red-600 bg-red-50';
    if (score >= 7) return 'text-orange-600 bg-orange-50';
    if (score >= 4) return 'text-blue-600 bg-blue-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getToxicityLevel = (score: number) => {
    if (score >= 9) return '病毒级';
    if (score >= 7) return '高毒性';
    if (score >= 4) return '中毒性';
    return '低毒性';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* PC端顶部导航 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-800">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center space-x-2">
                <User className="w-6 h-6 text-purple-600" />
                <h1 className="text-xl font-semibold text-gray-900">多用户实时互动演示</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-sm text-gray-600">
                  {isRunning ? '演示进行中' : '演示已停止'}
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={isRunning ? stopSimulation : startSimulation}
                  className={`px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                    isRunning 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  {isRunning ? (
                    <>
                      <Pause className="w-4 h-4 mr-2 inline" />
                      停止演示
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2 inline" />
                      开始演示
                    </>
                  )}
                </button>
                <button
                  onClick={resetSimulation}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                >
                  <RotateCcw className="w-4 h-4 mr-2 inline" />
                  重置
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区域 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 说明卡片 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-200">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <User className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                三用户实时互动演示
              </h2>
              <p className="text-gray-600 mb-4">
                这个演示展示了三个用户同时与FluLink发牌手互动的场景。每个用户都有独立的手机界面，
                模拟真实的多人社交环境。发牌手会根据每个用户的内容进行毒性分析和传播预测。
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700">小明 - 文三路小区</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                  <span className="text-gray-700">小红 - 翠苑街道</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">小李 - 学院路小区</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 三台手机界面 */}
        <div ref={phonesContainerRef} className={`grid grid-cols-1 lg:grid-cols-3 gap-8 transition-all duration-500 ${isRunning ? 'scale-105' : 'scale-100'}`}>
          {/* 演示状态提示 */}
          {isRunning && (
            <div className="lg:col-span-3 flex justify-center mb-4">
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-full shadow-lg animate-pulse">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                  <span className="font-medium">演示进行中 - 观察三个用户的互动</span>
                </div>
              </div>
            </div>
          )}
          
          {users.map(user => (
            <div key={user.id} className="flex justify-center">
              {/* 手机模拟器外壳 */}
              <div className={`w-80 bg-black rounded-3xl p-3 shadow-2xl transition-all duration-300 ${isRunning ? 'shadow-purple-500/50 shadow-2xl' : 'shadow-2xl'}`}>
                {/* 手机屏幕 */}
                <div className="bg-white rounded-2xl overflow-hidden h-[600px] flex flex-col">
                  {/* 状态栏 */}
                  <div className="bg-black text-white text-xs px-4 py-1 flex justify-between items-center">
                    <span>9:41</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-4 h-2 bg-white rounded-sm"></div>
                      <div className="w-6 h-3 border border-white rounded-sm"></div>
                    </div>
                  </div>

                  {/* 手机界面头部 */}
                  <div className={`p-3 text-white ${user.color}`}>
                    <div className="flex items-center space-x-2">
                      <div className="text-lg">{user.icon}</div>
                      <div>
                        <h3 className="font-semibold text-sm">{user.name}</h3>
                        <p className="text-xs opacity-90">{user.location.address}</p>
                      </div>
                    </div>
                    <div className="mt-1 flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                      <span className="text-xs">在线</span>
                    </div>
                  </div>

                  {/* 聊天区域 */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
                    {user.messages.length === 0 && (
                      <div className="text-center text-gray-400 text-sm mt-10">等待亮牌...</div>
                    )}
                    {user.messages.map((msg, index) => (
                      <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-2 rounded-lg shadow-sm animate-fadeIn ${
                          msg.type === 'user'
                            ? `${user.color} text-white rounded-br-md`
                            : 'bg-white text-gray-800 rounded-bl-md border border-gray-200'
                        }`}>
                          <p className="text-xs">{msg.content}</p>
                          
                          {/* 毒株信息显示 */}
                          {msg.type === 'dealer' && msg.virusStrain && (
                            <div className="mt-2 p-2 bg-purple-50 border border-purple-200 rounded-md">
                              <div className="flex items-center space-x-1 mb-1">
                                <span className="text-sm">🦠</span>
                                <span className="text-xs font-medium text-purple-800">{msg.virusStrain.title}</span>
                                <span className="text-xs text-purple-600">({msg.virusStrain.propagationCount}人)</span>
                              </div>
                              <p className="text-xs text-purple-700">{msg.virusStrain.content}</p>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-xs text-purple-600">by {msg.virusStrain.author}</span>
                                <span className="text-xs text-purple-500">毒性: {msg.virusStrain.toxicityScore}/10</span>
                              </div>
                            </div>
                          )}
                          
                          {msg.type === 'dealer' && msg.toxicityReport.score > 0 && (
                            <div className={`mt-1 pt-1 border-t border-gray-200 text-[10px] ${getToxicityColor(msg.toxicityReport.score)}`}>
                              <p className="flex items-center">
                                <Zap className="w-2.5 h-2.5 mr-0.5" />
                                毒性: <span className="font-semibold ml-0.5">{msg.toxicityReport.score.toFixed(1)}/10</span>
                                <span className={`ml-1 px-1 py-0.5 rounded-full text-[8px] font-medium ${getToxicityColor(msg.toxicityReport.score)}`}>
                                  {getToxicityLevel(msg.toxicityReport.score)}
                                </span>
                              </p>
                              {msg.propagationPrediction.path.length > 0 && (
                                <p className="flex items-center mt-0.5">
                                  <MapPin className="w-2.5 h-2.5 mr-0.5 text-blue-500" />
                                  传播: {msg.propagationPrediction.path.map(p => p.name).join(' → ')}
                                </p>
                              )}
                              {msg.propagationPrediction.delay > 0 && (
                                <p className="flex items-center mt-0.5">
                                  <span className="w-2.5 h-2.5 mr-0.5 text-gray-500">⏱️</span>
                                  延迟: {msg.propagationPrediction.delay / 1000}s
                                </p>
                              )}
                            </div>
                          )}
                          <span className="block text-right text-[8px] text-gray-400 mt-0.5">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                    {user.isTyping && (
                      <div className="flex justify-start">
                        <div className="max-w-[80%] p-2 rounded-lg shadow-sm bg-white text-gray-800 rounded-bl-md border border-gray-200 animate-fadeIn">
                          <div className="flex items-center space-x-1">
                            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
                            <span className="text-xs">发牌手分析中...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={(el) => { messageEndRefs.current[user.id] = el; }} />
                  </div>

                  {/* 输入区域 */}
                  <div className="p-3 border-t border-gray-200 bg-white">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        className="flex-1 p-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="亮牌：输入毒株内容..."
                        value={user.cardContent}
                        onChange={(e) => setUsers(prev => prev.map(u => u.id === user.id ? { ...u, cardContent: e.target.value } : u))}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') handleSendMessage(user.id, user.cardContent);
                        }}
                        disabled={user.isTyping || isRunning}
                      />
                      <button
                        onClick={() => handleSendMessage(user.id, user.cardContent)}
                        className={`p-2 rounded-lg text-white shadow-md ${user.color} hover:opacity-80 transition-opacity disabled:opacity-50`}
                        disabled={user.isTyping || !user.cardContent.trim() || isRunning}
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 操作指南 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">操作指南</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">演示控制</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 点击"开始演示"启动自动模拟</li>
                <li>• 三个用户会依次发送毒株内容</li>
                <li>• 发牌手会分析每个内容的毒性</li>
                <li>• 点击"停止演示"暂停模拟</li>
                <li>• 点击"重置"清空所有消息</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">功能特点</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 实时毒性评分和传播预测</li>
                <li>• 基于地理位置的智能分析</li>
                <li>• 独立的用户界面和状态</li>
                <li>• 模拟真实的社交互动场景</li>
                <li>• 完整的消息历史和状态追踪</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}