'use client';

import { useState } from 'react';
import { ArrowLeft, Trophy, Star, Zap, Menu, X } from 'lucide-react';
import Link from 'next/link';
import AchievementSystem from '@/components/AchievementSystem';

export default function AchievementPage() {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
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

          {/* 顶部导航 */}
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Link href="/" className="text-white">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <Trophy className="w-5 h-5 text-white" />
              <h1 className="text-white font-semibold">成就系统</h1>
            </div>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-white p-1"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

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
                <Link href="/" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                  <span>🏠</span>
                  <span>首页</span>
                </Link>
                <Link href="/propagation" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                  <span>📡</span>
                  <span>传播演示</span>
                </Link>
                <Link href="/admin" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                  <span>⚙️</span>
                  <span>管理后台</span>
                </Link>
              </div>
            </div>
          )}

          {/* 成就系统组件 */}
          <div className="flex-1 overflow-hidden">
            <AchievementSystem />
          </div>
        </div>
      </div>
    </div>
  );
}