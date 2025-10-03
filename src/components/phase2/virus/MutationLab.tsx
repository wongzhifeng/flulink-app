"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { useFluLink } from '@/context/FluLinkContext'
import { mutationService } from '@/lib/phase2/virus/mutationService'
import { MutationRule, MutationResult, MutationConfig } from '@/types/phase2/virus/mutation'
import { FlaskConical, Atom, Zap, Shield, EyeOff, TrendingUp, History, DollarSign } from 'lucide-react'
import { generateId, formatDate } from '@/lib/utils'

export default function MutationLab() {
  const { strains, updateStrain } = useFluLink()
  const [selectedStrainId, setSelectedStrainId] = useState<string>('')
  const [selectedRule, setSelectedRule] = useState<MutationRule['id']>('spread_acceleration')
  const [mutationProgress, setMutationProgress] = useState(0)
  const [isMutating, setIsMutating] = useState(false)
  const [lastMutationResult, setLastMutationResult] = useState<MutationResult | null>(null)
  const [mutationHistory, setMutationHistory] = useState<MutationResult[]>([])
  const [mutationConfig, setMutationConfig] = useState<MutationConfig>(mutationService.getMutationConfig())

  const selectedStrain = strains.find(s => s.id === selectedStrainId)
  const currentRule = mutationConfig.rules.find(rule => rule.id === selectedRule)

  useEffect(() => {
    // Load mutation history from local storage or context
    const storedHistory = localStorage.getItem('flulink-mutation-history')
    if (storedHistory) {
      setMutationHistory(JSON.parse(storedHistory))
    }
  }, [])

  useEffect(() => {
    // Save mutation history to local storage
    localStorage.setItem('flulink-mutation-history', JSON.stringify(mutationHistory))
  }, [mutationHistory])

  const handleStartMutation = async () => {
    if (!selectedStrain || !currentRule) return

    setIsMutating(true)
    setMutationProgress(0)
    setLastMutationResult(null)

    const result = await mutationService.startMutation(selectedStrain, currentRule, (progress) => {
      setMutationProgress(progress)
    })

    setLastMutationResult(result)
    setMutationHistory(prev => [result, ...prev])
    setIsMutating(false)

    if (result.success && result.mutatedStrain) {
      updateStrain(result.mutatedStrain)
    }
  }

  const getRuleIcon = (ruleId: MutationRule['id']) => {
    switch (ruleId) {
      case 'spread_acceleration': return <Zap className="h-4 w-4" />
      case 'stealth_mode': return <EyeOff className="h-4 w-4" />
      case 'resistance_boost': return <Shield className="h-4 w-4" />
      case 'virulence_increase': return <TrendingUp className="h-4 w-4" />
      case 'tag_adaptability': return <Atom className="h-4 w-4" />
      case 'cost_reduction': return <DollarSign className="h-4 w-4" />
      default: return <FlaskConical className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FlaskConical className="w-6 h-6 mr-2" />
            变异实验室
          </CardTitle>
          <CardDescription>
            通过科学实验改变毒株特性，提升传播效果或隐蔽性。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="select-strain">选择毒株</Label>
            <Select onValueChange={setSelectedStrainId} value={selectedStrainId}>
              <SelectTrigger id="select-strain" className="w-full">
                <SelectValue placeholder="选择一个毒株进行变异" />
              </SelectTrigger>
              <SelectContent>
                {strains.map(strain => (
                  <SelectItem key={strain.id} value={strain.id}>
                    {strain.title} ({strain.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="select-rule">选择变异规则</Label>
            <Select onValueChange={(value) => setSelectedRule(value as MutationRule['id'])} value={selectedRule}>
              <SelectTrigger id="select-rule" className="w-full">
                <SelectValue placeholder="选择一个变异规则" />
              </SelectTrigger>
              <SelectContent>
                {mutationConfig.rules.map(rule => (
                  <SelectItem key={rule.id} value={rule.id}>
                    <div className="flex items-center">
                      {getRuleIcon(rule.id)}
                      <span className="ml-2">{rule.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {currentRule && (
            <Card className="bg-gray-50 border-l-4 border-indigo-500">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-md flex items-center">
                  {getRuleIcon(currentRule.id)}
                  <span className="ml-2">{currentRule.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-3 px-4 text-sm text-gray-700">
                <p>{currentRule.description}</p>
                <p className="mt-2">
                  **成功率**: {currentRule.baseSuccessRate}%
                  **成本**: {currentRule.cost} 资源
                </p>
              </CardContent>
            </Card>
          )}

          <Button
            onClick={handleStartMutation}
            disabled={!selectedStrainId || !selectedRule || isMutating}
            className="w-full"
          >
            {isMutating ? `变异中... ${mutationProgress}%` : '开始变异'}
          </Button>

          {isMutating && (
            <Progress value={mutationProgress} className="w-full mt-4" />
          )}

          {lastMutationResult && (
            <Card className={`mt-4 ${lastMutationResult.success ? 'border-green-500' : 'border-red-500'}`}>
              <CardHeader>
                <CardTitle className="text-lg">
                  变异结果: {lastMutationResult.success ? '成功' : '失败'}
                </CardTitle>
                <CardDescription>
                  {lastMutationResult.message}
                </CardDescription>
              </CardHeader>
              {lastMutationResult.mutatedStrain && (
                <CardContent>
                  <h4 className="font-semibold">变异后的毒株:</h4>
                  <p>名称: {lastMutationResult.mutatedStrain.title}</p>
                  <p>类型: {lastMutationResult.mutatedStrain.type}</p>
                  <p>新特性: {lastMutationResult.mutatedStrain.mutations?.join(', ') || '无'}</p>
                </CardContent>
              )}
            </Card>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="w-5 h-5 mr-2" />
            变异历史
          </CardTitle>
          <CardDescription>
            查看所有毒株的变异记录。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mutationHistory.length === 0 ? (
            <p className="text-gray-500">暂无变异历史记录。</p>
          ) : (
            mutationHistory.map((record, index) => (
              <Card key={index} className={`p-4 ${record.success ? 'border-green-200' : 'border-red-200'}`}>
                <p className="text-sm font-medium">
                  毒株: {strains.find(s => s.id === record.originalStrainId)?.title || '未知毒株'}
                </p>
                <p className="text-xs text-gray-600">
                  规则: {mutationConfig.rules.find(r => r.id === record.ruleId)?.name || '未知规则'}
                </p>
                <p className={`text-xs ${record.success ? 'text-green-600' : 'text-red-600'}`}>
                  结果: {record.success ? '成功' : '失败'} - {record.message}
                </p>
                <p className="text-xs text-gray-500">
                  时间: {formatDate(record.timestamp)}
                </p>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
