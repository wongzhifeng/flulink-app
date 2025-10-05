'use client';

import { useState } from 'react';
import { 
  Settings, 
  Users, 
  BarChart3, 
  Zap, 
  Shield, 
  Activity,
  TrendingUp,
  Globe,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import ClientTime from '@/components/ClientTime';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('metrics');

  const [systemHealth, setSystemHealth] = useState({
    cpuUsage: 23,
    memoryUsage: 67,
    networkLatency: 12,
    databaseConnections: 45,
    queueSize: 8,
    errorRate: 0.02,
    responseTime95Percentile: 2.1
  });

  const [realTimeMetrics, setRealTimeMetrics] = useState({
    dailyActiveUsers: 1234,
    cardsProcessedToday: 567,
    averageResponseTime: 2.3,
    systemUptime: 99.7,
    toxicityDistribution: {
      low: 45,
      medium: 42,
      high: 13
    }
  });

  const tabs = [
    { id: 'metrics', name: '实时指标', icon: BarChart3 },
    { id: 'rules', name: '规则管理', icon: Settings },
    { id: 'users', name: '用户管理', icon: Users },
    { id: 'system', name: '系统监控', icon: Activity }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 dealer-gradient rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">FluLink 管理员后台</h1>
              <p className="text-sm text-gray-500">发牌手服务管理与监控</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">系统运行正常</span>
            </div>
            <ClientTime />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* 侧边栏 */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <nav className="p-4">
            <ul className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary-50 text-primary-700 border border-primary-200'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* 主内容区 */}
        <main className="flex-1 p-6">
          {activeTab === 'metrics' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">实时指标</h2>
              
              {/* 核心指标卡片 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">今日活跃用户</p>
                      <p className="text-2xl font-bold text-gray-900">{realTimeMetrics.dailyActiveUsers.toLocaleString()}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                  <div className="mt-2 flex items-center text-sm text-green-600">
                    <>
                      <TrendingUp className="w-4 h-4 mr-1" />
                      +12% 较昨日
                    </>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">今日处理卡片</p>
                      <p className="text-2xl font-bold text-gray-900">{realTimeMetrics.cardsProcessedToday}</p>
                    </div>
                    <Zap className="w-8 h-8 text-purple-500" />
                  </div>
                  <div className="mt-2 flex items-center text-sm text-green-600">
                    <>
                      <TrendingUp className="w-4 h-4 mr-1" />
                      +8% 较昨日
                    </>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">平均响应时间</p>
                      <p className="text-2xl font-bold text-gray-900">{realTimeMetrics.averageResponseTime}s</p>
                    </div>
                    <Activity className="w-8 h-8 text-orange-500" />
                  </div>
                  <div className="mt-2 flex items-center text-sm text-green-600">
                    <>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      目标: &lt;3s
                    </>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">系统可用性</p>
                      <p className="text-2xl font-bold text-gray-900">{realTimeMetrics.systemUptime}%</p>
                    </div>
                    <Globe className="w-8 h-8 text-green-500" />
                  </div>
                  <div className="mt-2 flex items-center text-sm text-green-600">
                    <>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      目标: &gt;99%
                    </>
                  </div>
                </div>
              </div>

              {/* 毒性分布图 */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">毒性分布统计</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-sm text-gray-600">低毒性</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-600">{realTimeMetrics.toxicityDistribution.low}%</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-sm text-blue-600">中毒性</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{realTimeMetrics.toxicityDistribution.medium}%</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-sm text-red-600">高毒性</span>
                    </div>
                    <p className="text-2xl font-bold text-red-600">{realTimeMetrics.toxicityDistribution.high}%</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">规则管理</h2>
              
              {/* 世界规则（不可修改） */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">🌍 世界规则（不可修改）</h3>
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">锁定</span>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">公平性协议</h4>
                    <p className="text-sm text-gray-600">无论付费免费，每张牌都平等对待</p>
                    <div className="mt-2 text-xs text-gray-500">规则ID: fairness_protocol</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">地理传播逻辑</h4>
                    <p className="text-sm text-gray-600">传播路径必须符合地理逻辑和社交常识</p>
                    <div className="mt-2 text-xs text-gray-500">规则ID: geographic_logic</div>
                  </div>
                </div>
              </div>

              {/* 动态规则（可调节） */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">⚙️ 动态规则（可调节）</h3>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">可调</span>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">传播延迟倍数</label>
                    <div className="flex items-center space-x-3">
                      <input 
                        type="range" 
                        min="0.5" 
                        max="3.0" 
                        step="0.1"
                        defaultValue="1.0"
                        className="flex-1"
                      />
                      <span className="text-sm text-gray-600 w-12">1.0</span>
                    </div>
                    <p className="text-xs text-gray-500">控制传播延迟倍数，当前值影响所有传播计算</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">位置精度要求</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                      <option value="street">街道级 (默认)</option>
                      <option value="district">区县级</option>
                      <option value="city">城市级</option>
                      <option value="exact">精确定位</option>
                    </select>
                    <p className="text-xs text-gray-500">设置用户亮牌时的最小位置精度要求</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">付费用户加成</label>
                    <div className="flex items-center space-x-3">
                      <input 
                        type="range" 
                        min="1.0" 
                        max="2.0" 
                        step="0.1"
                        defaultValue="1.2"
                        className="flex-1"
                      />
                      <span className="text-sm text-gray-600 w-12">1.2</span>
                    </div>
                    <p className="text-xs text-gray-500">付费用户在传播计算中的权重加成</p>
                  </div>

                  <button className="w-full bg-primary-500 text-white py-2 px-4 rounded-lg hover:bg-primary-600 transition-colors">
                    保存规则变更
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">系统监控</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">CPU & 内存</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>CPU 使用率</span>
                        <span>{systemHealth.cpuUsage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${systemHealth.cpuUsage}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>内存使用率</span>
                        <span>{systemHealth.memoryUsage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${systemHealth.memoryUsage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">网络 & 数据库</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">网络延迟</span>
                      <span className="text-sm font-medium">{systemHealth.networkLatency}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">数据库连接</span>
                      <span className="text-sm font-medium">{systemHealth.databaseConnections}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">队列大小</span>
                      <span className="text-sm font-medium">{systemHealth.queueSize}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">服务健康状态</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <div className="text-sm text-gray-600 mb-1">发牌手服务</div>
                    <div className="text-xs text-green-600">运行正常</div>
                  </div>
                  <div className="text-center">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <div className="text-sm text-gray-600 mb-1">地理服务</div>
                    <div className="text-xs text-green-600">运行正常</div>
                  </div>
                  <div className="text-center">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <div className="text-sm text-gray-600 mb-1">数据库</div>
                    <div className="text-xs text-green-600">运行正常</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}