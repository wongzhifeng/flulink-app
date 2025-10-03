"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, Filter, Edit, Trash2, Eye, MapPin, Clock, Users, Zap, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Strain {
  id: string
  title: string
  type: '生活毒株' | '观点毒株' | '兴趣毒株' | '超级毒株'
  description: string
  tags: string[]
  location: string
  spreadDelay: number
  createdAt: string
  infectionRate: number
  currentLevel: number
  isActive: boolean
  mutations: any[]
}

interface StrainListProps {
  strains: Strain[]
  onEditStrain?: (strain: Strain) => void
  onDeleteStrain?: (strainId: string) => void
  onViewDetails?: (strain: Strain) => void
  className?: string
}

export default function StrainList({
  strains,
  onEditStrain,
  onDeleteStrain,
  onViewDetails,
  className
}: StrainListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('createdAt')

  const getTypeColor = (type: Strain['type']) => {
    switch (type) {
      case '生活毒株':
        return 'bg-blue-100 text-blue-800'
      case '观点毒株':
        return 'bg-purple-100 text-purple-800'
      case '兴趣毒株':
        return 'bg-green-100 text-green-800'
      case '超级毒株':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getLevelName = (level: number) => {
    switch (level) {
      case 1:
        return '本小区'
      case 2:
        return '临近小区'
      case 3:
        return '所属街道'
      case 4:
        return '行政区/城市'
      case 5:
        return '跨国传播'
      default:
        return '未知'
    }
  }

  const filteredAndSortedStrains = strains
    .filter(strain => {
      const matchesSearch = strain.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          strain.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          strain.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesType = filterType === 'all' || strain.type === filterType
      const matchesStatus = filterStatus === 'all' ||
                           (filterStatus === 'active' && strain.isActive) ||
                           (filterStatus === 'inactive' && !strain.isActive)

      return matchesSearch && matchesType && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'title':
          return a.title.localeCompare(b.title)
        case 'infectionRate':
          return b.infectionRate - a.infectionRate
        case 'spreadDelay':
          return a.spreadDelay - b.spreadDelay
        default:
          return 0
      }
    })

  const getInfectionProgressColor = (rate: number) => {
    if (rate < 30) return 'bg-red-500'
    if (rate < 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="搜索毒株名称、描述或标签..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border rounded-md bg-white"
            >
              <option value="all">所有类型</option>
              <option value="生活毒株">生活毒株</option>
              <option value="观点毒株">观点毒株</option>
              <option value="兴趣毒株">兴趣毒株</option>
              <option value="超级毒株">超级毒株</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border rounded-md bg-white"
            >
              <option value="all">所有状态</option>
              <option value="active">活跃中</option>
              <option value="inactive">已结束</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border rounded-md bg-white"
            >
              <option value="createdAt">按创建时间</option>
              <option value="title">按名称</option>
              <option value="infectionRate">按感染率</option>
              <option value="spreadDelay">按传播延迟</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Strain List */}
      <div className="grid gap-4">
        {filteredAndSortedStrains.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">没有找到匹配的毒株</p>
              <p className="text-sm text-gray-400 mt-1">
                {strains.length === 0 ? '创建你的第一个毒株开始传播' : '尝试调整搜索条件'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAndSortedStrains.map((strain) => (
            <Card key={strain.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Strain Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg flex items-center">
                          {strain.title}
                          <Badge variant="outline" className={cn("ml-2", getTypeColor(strain.type))}>
                            {strain.type}
                          </Badge>
                          {!strain.isActive && (
                            <Badge variant="outline" className="ml-2 bg-gray-100 text-gray-600">
                              已结束
                            </Badge>
                          )}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">{strain.description}</p>
                      </div>
                    </div>

                    {/* Tags */}
                    {strain.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {strain.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                        <span>{strain.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-gray-500" />
                        <span>{strain.spreadDelay}小时延迟</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2 text-gray-500" />
                        <span>{strain.infectionRate}% 感染率</span>
                      </div>
                      <div className="flex items-center">
                        <Zap className="w-4 h-4 mr-2 text-gray-500" />
                        <span>{getLevelName(strain.currentLevel)}</span>
                      </div>
                    </div>

                    {/* Infection Progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>传播进度</span>
                        <span>{strain.infectionRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={cn("h-2 rounded-full transition-all", getInfectionProgressColor(strain.infectionRate))}
                          style={{ width: `${strain.infectionRate}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetails?.(strain)}
                      className="flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      查看
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditStrain?.(strain)}
                      className="flex items-center"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      编辑
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeleteStrain?.(strain.id)}
                      className="flex items-center text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      删除
                    </Button>
                  </div>
                </div>

                {/* Mutation Info */}
                {strain.mutations.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center text-sm text-gray-600">
                      <Zap className="w-4 h-4 mr-2" />
                      <span>已变异 {strain.mutations.length} 次</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Stats Summary */}
      {strains.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-6 text-sm text-gray-600">
              <div>
                <span className="font-medium">总计: </span>
                {strains.length} 个毒株
              </div>
              <div>
                <span className="font-medium">活跃: </span>
                {strains.filter(s => s.isActive).length} 个
              </div>
              <div>
                <span className="font-medium">平均感染率: </span>
                {Math.round(strains.reduce((sum, s) => sum + s.infectionRate, 0) / strains.length)}%
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}