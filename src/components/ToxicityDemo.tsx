'use client';

import { useState } from 'react';
import { Zap, TrendingUp, Target, AlertCircle } from 'lucide-react';

interface ToxicityExample {
  content: string;
  toxicity: 'low' | 'medium' | 'high';
  description: string;
  expectedScore: number;
}

const toxicityExamples: ToxicityExample[] = [
  {
    content: "今天天气真好😊",
    toxicity: 'low',
    description: "日常感受分享",
    expectedScore: 2.1
  },
  {
    content: "杭州文三路的这家咖啡店太赞了！coffee lover必去的地方☕️",
    toxicity: 'medium',
    description: "本地推荐分享",
    expectedScore: 5.8
  },
  {
    content: "👀重磅！杭州西湖区即将新增地铁站，周边房价要涨？",
    toxicity: 'high',
    description: "热点话题爆料",
    expectedScore: 8.3
  },
  {
    content: "【紧急求助】寻人启事：80岁老人走失，在文三路附近...",
    toxicity: 'medium',
    description: "社会求助信息",
    expectedScore: 6.2
  },
  {
    content: "💥独家：某知名企业高管密会！行业将有大动作...",
    toxicity: 'high',
    description: "敏感信息爆料",
    expectedScore: 9.1
  },
  {
    content: "分享一个生活小技巧：如何快速清理冰箱🍅",
    toxicity: 'low',
    description: "实用技巧分享",
    expectedScore: 3.4
  }
];

export default function ToxicityDemo() {
  const [selectedExample, setSelectedExample] = useState<ToxicityExample | null>(null);

  const getToxicityColor = (toxicity: string) => {
    switch (toxicity) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getToxicityIcon = (toxicity: string) => {
    switch (toxicity) {
      case 'low': return <Target className="w-4 h-4" />;
      case 'medium': return <TrendingUp className="w-4 h-4" />;
      case 'high': return <AlertCircle className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <Zap className="w-6 h-6 mr-2 text-purple-600" />
        毒株发布示例
      </h2>
      
      <p className="text-gray-600 mb-6">
        选择不同类型的毒株内容，看看发牌手如何分析其传播潜力：
      </p>

      <div className="grid gap-4 mb-6">
        {toxicityExamples.map((example, index) => (
          <button
            key={index}
            onClick={() => setSelectedExample(example)}
            className={`text-left p-4 rounded-lg border-2 transition-all hover:shadow-md ${
              selectedExample === example 
                ? 'border-purple-500 bg-purple-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getToxicityColor(example.toxicity)}`}>
                {getToxicityIcon(example.toxicity)}
                <span className="ml-1">{example.toxicity === 'low' ? '低毒性' : example.toxicity === 'medium' ? '中毒性' : '高毒性'}</span>
              </span>
              <span className="text-xs text-gray-500">预测评分: {example.expectedScore}</span>
            </div>
            
            <div className="font-medium text-gray-900 mb-1">
              "{example.content}"
            </div>
            
            <div className="text-sm text-gray-600">
              {example.description}
            </div>
          </button>
        ))}
      </div>

      {selectedExample && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-900 mb-2">📈 传播预测分析</h3>
          <div className="text-sm text-purple-800 space-y-1">
            <p><strong>内容类型:</strong> {selectedExample.description}</p>
            <p><strong>毒性评分:</strong> {selectedExample.expectedScore}/10</p>
            <p><strong>传播路径:</strong> 本小区 → 翠苑街道 → {selectedExample.toxicity === 'high' ? '西湖区 → 杭州市' : selectedExample.toxicity === 'medium' ? '西湖区' : '翠苑街道'}</p>
            <p><strong>预计影响:</strong> {
              selectedExample.toxicity === 'high' 
                ? '500-1000人 (12小时内)' 
                : selectedExample.toxicity === 'medium' 
                ? '100-300人 (3小时内)' 
                : '15-25人 (1小时内)'
            }</p>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">💡 发布技巧</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• <strong>本地性:</strong> 提及具体地点能显著提高传播潜力</li>
          <li>• <strong>时效性:</strong> 热点话题比日常分享更容易传播</li>
          <li>• <strong>符号使用:</strong> 适量的emoji和标点符号能增强表达效果</li>
          <li>• <strong>实用性:</strong> 提供有价值的信息比纯情感表达传播更广</li>
          <li>• <strong>互动性:</strong> 包含问题或求助元素能激发用户参与传播</li>
        </ul>
      </div>
    </div>
  );
}
