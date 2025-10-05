'use client';

import { useState, useEffect } from 'react';
import { Zap, TrendingUp, Users, Activity, Globe, Shield, AlertCircle, CheckCircle, Clock, MapPin } from 'lucide-react';

interface SystemMetrics {
  activeUsers: number;
  processedCards: number;
  averageResponseTime: number;
  systemUptime: number;
  toxicityDistribution: {
    low: number;
    medium: number;
    high: number;
  };
}

interface RealTimeEvent {
  id: string;
  type: 'card_processed' | 'user_joined' | 'system_alert';
  timestamp: number;
  message: string;
  severity: 'info' | 'warning' | 'error';
}

export default function RealTimeDashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    activeUsers: 0,
    processedCards: 0,
    averageResponseTime: 0,
    systemUptime: 0,
    toxicityDistribution: { low: 0, medium: 0, high: 0 }
  });

  const [events, setEvents] = useState<RealTimeEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // 模拟实时数据更新
    const interval = setInterval(() => {
      setMetrics(prev => ({
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 3) - 1,
        processedCards: prev.processedCards + Math.floor(Math.random() * 5),
        averageResponseTime: Math.random() * 2 + 1,
        systemUptime: 99.5 + Math.random() * 0.5,
        toxicityDistribution: {
          low: Math.floor(Math.random() * 20) + 30,
          medium: Math.floor(Math.random() * 15) + 40,
          high: Math.floor(Math.random() * 10) + 5
        }
      }));

      // 模拟实时事件
      if (Math.random() > 0.7) {
        const eventTypes: RealTimeEvent['type'][] = ['card_processed', 'user_joined', 'system_alert'];
        const severities: RealTimeEvent['severity'][] = ['info', 'warning', 'error'];
        
        const newEvent: RealTimeEvent = {
          id: `event-${Date.now()}`,
          type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
          timestamp: Date.now(),
          message: generateEventMessage(),
          severity: severities[Math.floor(Math.random() * severities.length)]
        };

        setEvents(prev => [newEvent, ...prev.slice(0, 9)]);
      }
    }, 2000);

    setIsConnected(true);

    return () => clearInterval(interval);
  }, []);

  const generateEventMessage = (): string => {
    const messages = [
      '用户发布了新的毒株内容',
      '检测到高毒性传播事件',
      '地理传播路径已更新',
      '系统性能优化完成',
      '新用户加入发牌手服务',
      '管理员调整了动态规则',
      '检测到异常传播模式',
      '系统健康检查通过'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const getEventIcon = (type: RealTimeEvent['type']) => {
    switch (type) {
      case 'card_processed': return <Zap className="w-4 h-4" />;
      case 'user_joined': return <Users className="w-4 h-4" />;
      case 'system_alert': return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: RealTimeEvent['severity']) => {
    switch (severity) {
      case 'info': return 'text-blue-600 bg-blue-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'error': return 'text-red-600 bg-red-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 dealer-gradient rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">FluLink 实时监控</h1>
              <p className="text-sm text-gray-500">发牌手服务全自动监控面板</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {isConnected ? '实时连接中' : '连接断开'}
            </span>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 核心指标 */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">活跃用户</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.activeUsers}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
                <div className="mt-2 flex items-center text-sm text-green-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +12% 较昨日
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">处理卡片</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.processedCards}</p>
                  </div>
                  <Zap className="w-8 h-8 text-purple-500" />
                </div>
                <div className="mt-2 flex items-center text-sm text-green-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +8% 较昨日
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">响应时间</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.averageResponseTime.toFixed(1)}s</p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-500" />
                </div>
                <div className="mt-2 flex items-center text-sm text-green-600">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  目标: &lt;3s
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">系统可用性</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.systemUptime.toFixed(1)}%</p>
                  </div>
                  <Globe className="w-8 h-8 text-green-500" />
                </div>
                <div className="mt-2 flex items-center text-sm text-green-600">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  目标: &gt;99%
                </div>
              </div>
            </div>

            {/* 毒性分布图 */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">毒性分布实时统计</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-sm text-gray-600">低毒性</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-600">{metrics.toxicityDistribution.low}%</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-sm text-blue-600">中毒性</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{metrics.toxicityDistribution.medium}%</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-sm text-red-600">高毒性</span>
                  </div>
                  <p className="text-2xl font-bold text-red-600">{metrics.toxicityDistribution.high}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* 实时事件流 */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">实时事件流</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {events.map((event) => (
                  <div key={event.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                    <div className={`p-1 rounded-full ${getSeverityColor(event.severity)}`}>
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{event.message}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 系统状态 */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">系统状态</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">发牌手服务</span>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm text-green-600">运行正常</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">地理服务</span>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm text-green-600">运行正常</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">AI分析引擎</span>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm text-green-600">运行正常</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">数据库</span>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm text-green-600">运行正常</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
