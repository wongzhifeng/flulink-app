'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  ShieldCheck, 
  ShieldX, 
  ShieldAlert, 
  Plus, 
  Settings, 
  BarChart3,
  Clock,
  MapPin,
  Filter
} from 'lucide-react'
import { immunityService } from '@/lib/immunityService'
import { ImmunityRule, ImmunityStatus, ImmunityEffect, ImmunityRecommendation } from '@/types/immunity'
import { useFluLink } from '@/context/FluLinkContext'

export default function ImmunityManager() {
  const { user } = useFluLink()
  const [immunityStatus, setImmunityStatus] = useState<ImmunityStatus | null>(null)
  const [immunityRules, setImmunityRules] = useState<ImmunityRule[]>([])
  const [immunityEffects, setImmunityEffects] = useState<ImmunityEffect[]>([])
  const [recommendations, setRecommendations] = useState<ImmunityRecommendation[]>([])
  const [activeTab, setActiveTab] = useState<'status' | 'rules' | 'effects' | 'recommendations'>('status')
  const [isCreatingRule, setIsCreatingRule] = useState(false)

  useEffect(() => {
    if (user) {
      loadImmunityData()
    }
  }, [user])

  const loadImmunityData = () => {
    if (!user) return

    const status = immunityService.getUserImmunityStatus(user.id)
    const rules = immunityService.getUserImmunityRules(user.id)
    const effects = immunityService.getUserImmunityEffects(user.id)
    const recs = immunityService.getImmunityRecommendations(user.id)

    setImmunityStatus(status)
    setImmunityRules(rules)
    setImmunityEffects(effects)
    setRecommendations(recs)
  }

  const handleCreateRule = (tagId: string, tagName: string, ruleType: ImmunityRule['ruleType'], strength: number) => {
    if (!user) return

    const rule = immunityService.createImmunityRule(user.id, tagId, tagName, ruleType, strength)
    loadImmunityData()
    setIsCreatingRule(false)
  }

  const handleToggleRule = (ruleId: string) => {
    const rule = immunityRules.find(r => r.id === ruleId)
    if (rule) {
      immunityService.updateImmunityRule(ruleId, { isActive: !rule.isActive })
      loadImmunityData()
    }
  }

  const handleDeleteRule = (ruleId: string) => {
    immunityService.deleteImmunityRule(ruleId)
    loadImmunityData()
  }

  const getRuleTypeIcon = (ruleType: ImmunityRule['ruleType']) => {
    switch (ruleType) {
      case 'block': return <ShieldX className="h-4 w-4 text-red-500" />
      case 'filter': return <Filter className="h-4 w-4 text-yellow-500" />
      case 'delay': return <Clock className="h-4 w-4 text-blue-500" />
      default: return <Shield className="h-4 w-4" />
    }
  }

  const getRuleTypeLabel = (ruleType: ImmunityRule['ruleType']) => {
    switch (ruleType) {
      case 'block': return '完全屏蔽'
      case 'filter': return '内容过滤'
      case 'delay': return '延迟显示'
      default: return '未知'
    }
  }

  const getEffectTypeIcon = (effectType: ImmunityEffect['effectType']) => {
    switch (effectType) {
      case 'blocked': return <ShieldX className="h-4 w-4 text-red-500" />
      case 'filtered': return <Filter className="h-4 w-4 text-yellow-500" />
      case 'delayed': return <Clock className="h-4 w-4 text-blue-500" />
      case 'allowed': return <ShieldCheck className="h-4 w-4 text-green-500" />
      default: return <Shield className="h-4 w-4" />
    }
  }

  const getEffectTypeLabel = (effectType: ImmunityEffect['effectType']) => {
    switch (effectType) {
      case 'blocked': return '已屏蔽'
      case 'filtered': return '已过滤'
      case 'delayed': return '已延迟'
      case 'allowed': return '已允许'
      default: return '未知'
    }
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">请先登录</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 头部导航 */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeTab === 'status' ? 'default' : 'outline'}
          onClick={() => setActiveTab('status')}
          className="flex items-center"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          免疫状态
        </Button>
        <Button
          variant={activeTab === 'rules' ? 'default' : 'outline'}
          onClick={() => setActiveTab('rules')}
          className="flex items-center"
        >
          <Settings className="w-4 h-4 mr-2" />
          免疫规则
        </Button>
        <Button
          variant={activeTab === 'effects' ? 'default' : 'outline'}
          onClick={() => setActiveTab('effects')}
          className="flex items-center"
        >
          <ShieldAlert className="w-4 h-4 mr-2" />
          免疫效果
        </Button>
        <Button
          variant={activeTab === 'recommendations' ? 'default' : 'outline'}
          onClick={() => setActiveTab('recommendations')}
          className="flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          推荐规则
        </Button>
      </div>

      {/* 免疫状态标签页 */}
      {activeTab === 'status' && immunityStatus && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">免疫分数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">
                {immunityStatus.immunityScore}
              </div>
              <p className="text-xs text-gray-500">满分100分</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">活跃规则</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {immunityStatus.activeRules}
              </div>
              <p className="text-xs text-gray-500">共{immunityStatus.totalRules}条规则</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">屏蔽标签</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {immunityStatus.blockedTags.length}
              </div>
              <p className="text-xs text-gray-500">完全屏蔽</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">过滤标签</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {immunityStatus.filteredTags.length}
              </div>
              <p className="text-xs text-gray-500">内容过滤</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 免疫规则标签页 */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">免疫规则管理</h3>
            <Button onClick={() => setIsCreatingRule(true)}>
              <Plus className="w-4 h-4 mr-2" />
              添加规则
            </Button>
          </div>

          <div className="space-y-3">
            {immunityRules.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">还没有免疫规则</p>
                  <p className="text-sm text-gray-400">添加规则来保护你的信息环境</p>
                </CardContent>
              </Card>
            ) : (
              immunityRules.map((rule) => (
                <Card key={rule.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getRuleTypeIcon(rule.ruleType)}
                        <div>
                          <div className="font-medium">{rule.tagName}</div>
                          <div className="text-sm text-gray-500">
                            {getRuleTypeLabel(rule.ruleType)} • 强度: {rule.strength}%
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={rule.isActive ? "default" : "secondary"}>
                          {rule.isActive ? '活跃' : '禁用'}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleRule(rule.id)}
                        >
                          {rule.isActive ? '禁用' : '启用'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRule(rule.id)}
                        >
                          删除
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* 免疫效果标签页 */}
      {activeTab === 'effects' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">最近免疫效果</h3>
          <div className="space-y-3">
            {immunityEffects.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <ShieldCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">还没有免疫效果记录</p>
                </CardContent>
              </Card>
            ) : (
              immunityEffects.map((effect, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getEffectTypeIcon(effect.effectType)}
                        <div>
                          <div className="font-medium">{effect.tagName}</div>
                          <div className="text-sm text-gray-500">{effect.reason}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">
                          {getEffectTypeLabel(effect.effectType)}
                        </Badge>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(effect.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* 推荐规则标签页 */}
      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">推荐免疫规则</h3>
          <div className="space-y-3">
            {recommendations.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">暂无推荐规则</p>
                </CardContent>
              </Card>
            ) : (
              recommendations.map((rec) => (
                <Card key={rec.tagId}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{rec.tagName}</div>
                        <div className="text-sm text-gray-500">{rec.reason}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          置信度: {Math.round(rec.confidence * 100)}%
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {rec.suggestedRule.ruleType === 'block' ? '屏蔽' : 
                           rec.suggestedRule.ruleType === 'filter' ? '过滤' : '延迟'}
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => handleCreateRule(
                            rec.tagId,
                            rec.tagName,
                            rec.suggestedRule.ruleType!,
                            rec.suggestedRule.strength || 80
                          )}
                        >
                          添加
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

