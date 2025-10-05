'use client';

import { useState, useEffect } from 'react';
import { 
  Trophy, 
  Star, 
  Zap, 
  Target, 
  Award, 
  Crown, 
  Flame,
  TrendingUp,
  Users,
  MapPin,
  Clock,
  CheckCircle,
  Gift,
  Medal,
  Badge
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'viral' | 'social' | 'location' | 'time' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  unlocked: boolean;
  unlockedAt?: number;
  progress: number;
  maxProgress: number;
  requirement: string;
}

interface UserStats {
  totalCards: number;
  viralCards: number;
  superViralCards: number;
  totalReach: number;
  averageToxicity: number;
  streakDays: number;
  maxStreakDays: number;
  locationsVisited: number;
  followers: number;
  following: number;
  totalPoints: number;
  level: number;
  nextLevelPoints: number;
}

const achievements: Achievement[] = [
  // 病毒传播类成就
  {
    id: 'first_viral',
    title: '初试锋芒',
    description: '发布第一张病毒级毒株',
    icon: <Zap className="w-6 h-6" />,
    category: 'viral',
    rarity: 'common',
    points: 100,
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    requirement: '毒性评分 ≥ 6.0'
  },
  {
    id: 'super_viral_master',
    title: '超级传播者',
    description: '发布10张超级病毒级毒株',
    icon: <Flame className="w-6 h-6" />,
    category: 'viral',
    rarity: 'epic',
    points: 1000,
    unlocked: false,
    progress: 0,
    maxProgress: 10,
    requirement: '毒性评分 ≥ 8.0'
  },
  {
    id: 'viral_legend',
    title: '病毒传说',
    description: '单张毒株影响超过1000人',
    icon: <Crown className="w-6 h-6" />,
    category: 'viral',
    rarity: 'legendary',
    points: 5000,
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    requirement: '单次传播影响 ≥ 1000人'
  },

  // 社交互动类成就
  {
    id: 'social_butterfly',
    title: '社交蝴蝶',
    description: '获得100个关注者',
    icon: <Users className="w-6 h-6" />,
    category: 'social',
    rarity: 'rare',
    points: 500,
    unlocked: false,
    progress: 0,
    maxProgress: 100,
    requirement: '关注者数量 ≥ 100'
  },
  {
    id: 'influencer',
    title: '影响力达人',
    description: '总传播影响超过10000人',
    icon: <TrendingUp className="w-6 h-6" />,
    category: 'social',
    rarity: 'epic',
    points: 2000,
    unlocked: false,
    progress: 0,
    maxProgress: 10000,
    requirement: '累计影响人数 ≥ 10000'
  },

  // 地理位置类成就
  {
    id: 'explorer',
    title: '地理探索者',
    description: '从10个不同位置发布毒株',
    icon: <MapPin className="w-6 h-6" />,
    category: 'location',
    rarity: 'rare',
    points: 300,
    unlocked: false,
    progress: 0,
    maxProgress: 10,
    requirement: '不同位置发布 ≥ 10个'
  },
  {
    id: 'city_conqueror',
    title: '城市征服者',
    description: '在5个不同城市发布过毒株',
    icon: <Target className="w-6 h-6" />,
    category: 'location',
    rarity: 'epic',
    points: 1500,
    unlocked: false,
    progress: 0,
    maxProgress: 5,
    requirement: '不同城市发布 ≥ 5个'
  },

  // 时间相关成就
  {
    id: 'early_bird',
    title: '早起鸟',
    description: '连续7天在早上6-9点发布毒株',
    icon: <Clock className="w-6 h-6" />,
    category: 'time',
    rarity: 'rare',
    points: 400,
    unlocked: false,
    progress: 0,
    maxProgress: 7,
    requirement: '连续7天早上发布'
  },
  {
    id: 'night_owl',
    title: '夜猫子',
    description: '连续30天在晚上发布毒株',
    icon: <Star className="w-6 h-6" />,
    category: 'time',
    rarity: 'epic',
    points: 800,
    unlocked: false,
    progress: 0,
    maxProgress: 30,
    requirement: '连续30天晚上发布'
  },

  // 特殊成就
  {
    id: 'perfectionist',
    title: '完美主义者',
    description: '连续10张毒株毒性评分都超过7.0',
    icon: <Award className="w-6 h-6" />,
    category: 'special',
    rarity: 'legendary',
    points: 3000,
    unlocked: false,
    progress: 0,
    maxProgress: 10,
    requirement: '连续10张毒性 ≥ 7.0'
  },
  {
    id: 'founder',
    title: '创始用户',
    description: '成为FluLink的前1000名用户',
    icon: <Medal className="w-6 h-6" />,
    category: 'special',
    rarity: 'legendary',
    points: 10000,
    unlocked: true,
    unlockedAt: Date.now() - 86400000,
    progress: 1,
    maxProgress: 1,
    requirement: '前1000名注册用户'
  }
];

const mockUserStats: UserStats = {
  totalCards: 47,
  viralCards: 12,
  superViralCards: 3,
  totalReach: 2847,
  averageToxicity: 6.2,
  streakDays: 5,
  maxStreakDays: 12,
  locationsVisited: 8,
  followers: 23,
  following: 15,
  totalPoints: 1850,
  level: 3,
  nextLevelPoints: 2000
};

export default function AchievementSystem() {
  const [userStats, setUserStats] = useState<UserStats>(mockUserStats);
  const [userAchievements, setUserAchievements] = useState<Achievement[]>(achievements);
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'leaderboard'>('overview');
  const [showUnlocked, setShowUnlocked] = useState(false);

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-100 border-gray-300';
      case 'rare': return 'text-blue-600 bg-blue-100 border-blue-300';
      case 'epic': return 'text-purple-600 bg-purple-100 border-purple-300';
      case 'legendary': return 'text-yellow-600 bg-yellow-100 border-yellow-300';
      default: return 'text-gray-600 bg-gray-100 border-gray-300';
    }
  };

  const getRarityIcon = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return <Badge className="w-4 h-4" />;
      case 'rare': return <Star className="w-4 h-4" />;
      case 'epic': return <Crown className="w-4 h-4" />;
      case 'legendary': return <Trophy className="w-4 h-4" />;
      default: return <Badge className="w-4 h-4" />;
    }
  };

  const getCategoryIcon = (category: Achievement['category']) => {
    switch (category) {
      case 'viral': return <Zap className="w-4 h-4" />;
      case 'social': return <Users className="w-4 h-4" />;
      case 'location': return <MapPin className="w-4 h-4" />;
      case 'time': return <Clock className="w-4 h-4" />;
      case 'special': return <Gift className="w-4 h-4" />;
      default: return <Award className="w-4 h-4" />;
    }
  };

  const unlockedAchievements = userAchievements.filter(a => a.unlocked);
  const lockedAchievements = userAchievements.filter(a => !a.unlocked);

  const getLevelProgress = () => {
    const currentLevelPoints = (userStats.level - 1) * 1000;
    const nextLevelPoints = userStats.level * 1000;
    const progress = ((userStats.totalPoints - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-gradient-to-r from-yellow-500 to-orange-500 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-white" />
            <h1 className="text-white font-semibold">成就系统</h1>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-white bg-white/20 px-2 py-1 rounded-full">
              等级 {userStats.level}
            </span>
            <span className="text-xs text-white bg-white/20 px-2 py-1 rounded-full">
              {userStats.totalPoints} 积分
            </span>
          </div>
        </div>
        {/* 等级进度条 */}
        <div className="mt-2">
          <div className="w-full bg-white/20 rounded-full h-1">
            <div 
              className="bg-white h-1 rounded-full transition-all duration-300"
              style={{ width: `${getLevelProgress()}%` }}
            ></div>
          </div>
        </div>
      </header>

      <div className="flex flex-col h-full">
        {/* 移动端标签栏 */}
        <div className="bg-white border-b border-gray-200 px-4 py-2">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <TrendingUp className="w-4 h-4 mr-1" />
              总览
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`flex-1 flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'achievements'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Trophy className="w-4 h-4 mr-1" />
              成就
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex-1 flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'leaderboard'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Crown className="w-4 h-4 mr-1" />
              排行
            </button>
          </div>
        </div>

        {/* 主内容区域 */}
        <main className="flex-1 overflow-y-auto p-4">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 用户统计卡片 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">总亮牌数</p>
                      <p className="text-lg font-bold text-gray-900">{userStats.totalCards}</p>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Zap className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">病毒级毒株</p>
                      <p className="text-lg font-bold text-gray-900">{userStats.viralCards}</p>
                    </div>
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Flame className="w-4 h-4 text-red-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">总影响人数</p>
                      <p className="text-lg font-bold text-gray-900">{userStats.totalReach.toLocaleString()}</p>
                    </div>
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Users className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">平均毒性</p>
                      <p className="text-lg font-bold text-gray-900">{userStats.averageToxicity.toFixed(1)}</p>
                    </div>
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Target className="w-4 h-4 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* 最近成就 */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">最近解锁的成就</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {unlockedAchievements.slice(0, 4).map(achievement => (
                    <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`p-2 rounded-lg ${getRarityColor(achievement.rarity)}`}>
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          {getRarityIcon(achievement.rarity)}
                          <span className="text-xs text-gray-500">{achievement.points} 积分</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 进度追踪 */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">即将解锁的成就</h3>
                <div className="space-y-4">
                  {lockedAchievements.slice(0, 3).map(achievement => (
                    <div key={achievement.id} className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${getRarityColor(achievement.rarity)} opacity-50`}>
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                          <span className="text-sm text-gray-500">{achievement.progress}/{achievement.maxProgress}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{achievement.requirement}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="space-y-6">
              {/* 筛选器 */}
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowUnlocked(false)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      !showUnlocked ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    全部成就
                  </button>
                  <button
                    onClick={() => setShowUnlocked(true)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      showUnlocked ? 'bg-green-100 text-green-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    已解锁
                  </button>
                </div>
              </div>

              {/* 成就列表 */}
              <div className="space-y-3">
                {(showUnlocked ? unlockedAchievements : userAchievements).map(achievement => (
                  <div 
                    key={achievement.id} 
                    className={`bg-white rounded-lg shadow-sm p-4 border transition-all duration-200 ${
                      achievement.unlocked 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start space-x-3 mb-3">
                      <div className={`p-2 rounded-lg ${getRarityColor(achievement.rarity)} ${
                        !achievement.unlocked ? 'opacity-50' : ''
                      }`}>
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-sm font-semibold text-gray-900">{achievement.title}</h3>
                          <div className="flex items-center space-x-1">
                            {getRarityIcon(achievement.rarity)}
                            <span className="text-xs font-medium text-gray-600">{achievement.points}</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600">{achievement.description}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        {getCategoryIcon(achievement.category)}
                        <span>{achievement.category}</span>
                      </div>
                      
                      {achievement.unlocked ? (
                        <div className="flex items-center space-x-2 text-xs text-green-600">
                          <CheckCircle className="w-3 h-3" />
                          <span>已解锁</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500">
                            {achievement.progress}/{achievement.maxProgress} - {achievement.requirement}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">排行榜</h3>
                <div className="text-center py-12 text-gray-500">
                  <Crown className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>排行榜功能即将推出</p>
                  <p className="text-sm">敬请期待！</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
