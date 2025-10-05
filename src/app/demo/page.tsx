'use client';

import { useState } from 'react';
import { ArrowLeft, Play, Shield, MapPin, Zap } from 'lucide-react';
import ToxicityDemo from '@/components/ToxicityDemo';

export default function DemoPage() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "欢迎来到FluLink",
      content: "体验革命性的内容传播平台",
      icon: Shield
    },
    {
      title: "位置验证",
      content: "发送您的位置信息以启动服务",
      icon: MapPin
    },
    {
      title: "亮牌发布",
      content: "输入您的毒株内容",
      icon: Zap
    },
    {
      title: "AI分析",
      content: "发牌手分析毒性和传播潜力",
      icon: Zap
    }
  ];

  if (currentStep < 4) {
    const currentIcon = steps[currentStep].icon;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-16 h-16 rounded-full dealer-gradient flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">FluLink 发牌手</h1>
            <p className="text-gray-600">让内容像流感一样自然传播</p>
          </div>

          <div className="space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCurrent = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div
                  key={index}
                  className={`flex items-center p-3 rounded-lg transition-all ${
                    isCurrent ? 'bg-purple-100 border-2 border-purple-500' : 
                    isCompleted ? 'bg-green-50 border-2 border-green-200' :
                    'bg-gray-50 border-2 border-gray-100'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                    isCurrent ? 'bg-purple-500 text-white' :
                    isCompleted ? 'bg-green-500 text-white' :
                    'bg-gray-300 text-gray-600'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className={`font-medium ${isCurrent ? 'text-purple-900' : isCompleted ? 'text-green-900' : 'text-gray-600'}`}>
                      {step.title}
                    </div>
                    <div className={`text-sm ${isCurrent ? 'text-purple-700' : isCompleted ? 'text-green-700' : 'text-gray-500'}`}>
                      {step.content}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentStep(prev => prev + 1)}
            disabled={currentStep === 3}
            className="mt-8 w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {currentStep === 3 ? (
              <>
                <Play className="w-5 h-5 mr-2" />
                开始体验
              </>
            ) : (
              '下一步'
            )}
          </button>

          {currentStep > 0 && (
            <button
              onClick={() => setCurrentStep(0)}
              className="mt-4 w-full text-purple-600 py-2 px-4 rounded-lg hover:bg-purple-50 transition-colors flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              重新开始
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 dealer-gradient rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">FluLink 发牌手演示</h1>
              <p className="text-sm text-gray-500">学习如何发布和传播毒株内容</p>
            </div>
          </div>
          
          <button
            onClick={() => setCurrentStep(0)}
            className="flex items-center text-purple-600 hover:bg-purple-50 px-3 py-2 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回向导
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">🎯 快速开始指南</h2>
            <div className="text-blue-800 space-y-2">
              <p>1. 访问 <code className="bg-blue-100 px-2 py-1 rounded text-sm">http://localhost:8080</code></p>
              <p>2. 点击 "发送位置信息" 按钮</p>
              <p>3. 在输入框中输入你的毒株内容</p>
              <p>4. 按回车或点击发送，等待AI分析</p>
              <p>5. 查看毒性评分和传播预测结果</p>
            </div>
          </div>

          <ToxicityDemo />

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🃏 关于"亮牌"</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">什么是亮牌？</h3>
                <p className="text-gray-700">
                  在FluLink发牌手服务中，"亮牌"就是发布内容的过程。就像打牌时亮出底牌一样，
                  你需要将你的想法、感受、信息"亮"给大家看。
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-4">毒株是什么？</h3>
                <div className="space-y-2 text-gray-700">
                  <p>• <strong>概念:</strong> 你发布的任何内容都可以称为"毒株"</p>
                  <p>• <strong>毒性:</strong> 内容的传播潜力评分（1-10分）</p>
                  <p>• <strong>传播:</strong> AI预测这个毒株会在哪些区域"传染"给多少人</p>
                  <p>• <strong>公平性:</strong> 每张牌都被平等对待，无论是否付费</p>
                </div>
              </div>

              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h3 className="font-medium text-purple-900 mb-2">💡 最佳实践</h3>
                <ul className="text-purple-800 space-y-1">
                  <li>• 包含具体地点信息可提高传播潜力</li>
                  <li>• 话题性内容比日常分享更容易传播</li>
                  <li>• 适当的emoji和符号能增强表达效果</li>
                  <li>• 实用信息和求助内容传播价值更高</li>
                  <li>• 保持内容的真实性和价值性</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center">
            <a 
              href="/" 
              className="inline-flex items-center bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Play className="w-5 h-5 mr-2" />
              立即开始亮牌
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
