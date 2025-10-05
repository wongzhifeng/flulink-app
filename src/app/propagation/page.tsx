'use client';

import { useState } from 'react';
import { ArrowLeft, Share2, Users, MapPin, Zap, Menu, X } from 'lucide-react';
import Link from 'next/link';
import PropagationDemo from '@/components/PropagationDemo';

export default function PropagationTestPage() {
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
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Link href="/" className="text-white">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <Share2 className="w-5 h-5 text-white" />
              <h1 className="text-white font-semibold">传播演示</h1>
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
                <Link href="/achievements" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                  <span>🏆</span>
                  <span>成就系统</span>
                </Link>
                <Link href="/admin" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                  <span>⚙️</span>
                  <span>管理后台</span>
                </Link>
              </div>
            </div>
          )}

          {/* 主内容区域 */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            {/* 说明卡片 */}
            <div className="p-4 bg-white border-b border-gray-200">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">
                    小明如何收到附近用户的毒株？
                  </h2>
                  <p className="text-sm text-gray-600">
                    这个演示展示了FluLink的核心传播机制：当附近用户发送毒株内容时，
                    系统会根据毒性评分和地理位置计算传播范围。
                  </p>
                </div>
              </div>
            </div>

            {/* 传播演示组件 */}
            <div className="p-4">
              <PropagationDemo />
            </div>

            {/* 技术说明 */}
            <div className="p-4 bg-blue-50 border-t border-blue-200">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">技术实现原理</h3>
              <div className="space-y-2 text-xs text-blue-800">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3 h-3" />
                  <span>基于地理位置计算传播半径</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-3 h-3" />
                  <span>毒性评分决定传播速度和范围</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Share2 className="w-3 h-3" />
                  <span>实时推送通知，无需主动刷新</span>
                </div>
              </div>
            </div>

            {/* 操作指南 */}
            <div className="p-4 bg-yellow-50 border-t border-yellow-200">
              <h3 className="text-sm font-semibold text-yellow-900 mb-2">操作指南</h3>
              <div className="space-y-1 text-xs text-yellow-800">
                <div>1. 点击"开始传播演示"按钮启动模拟</div>
                <div>2. 观察小明如何收到小红和小李的毒株推送</div>
                <div>3. 点击"查看详情"了解每个传播事件的完整信息</div>
                <div>4. 注意毒性评分如何影响传播速度和范围</div>
                <div>5. 使用"重置"按钮重新开始演示</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}