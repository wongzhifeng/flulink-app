"use client"

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, X, Filter, Tag, TrendingUp, Users, MapPin, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Tag {
  id: string
  name: string
  type: '兴趣' | '状态' | '地理' | '关系' | '偏好'
  popularity: number
  matchRate?: number
  isSelected?: boolean
}

interface TagSearchFilterProps {
  tags: Tag[]
  onTagsChange?: (selectedTags: Tag[]) => void
  className?: string
}

interface FilterState {
  searchTerm: string
  selectedTypes: string[]
  minPopularity: number
  sortBy: 'name' | 'popularity' | 'type' | 'matchRate'
}

export default function TagSearchFilter({
  tags,
  onTagsChange,
  className
}: TagSearchFilterProps) {
  const [filterState, setFilterState] = useState<FilterState>({
    searchTerm: '',
    selectedTypes: [],
    minPopularity: 0,
    sortBy: 'popularity'
  })

  const [selectedTags, setSelectedTags] = useState<Tag[]>([])

  const tagTypes = ['兴趣', '状态', '地理', '关系', '偏好']

  const filteredTags = useMemo(() => {
    return tags
      .filter(tag => {
        const matchesSearch = tag.name.toLowerCase().includes(filterState.searchTerm.toLowerCase())
        const matchesType = filterState.selectedTypes.length === 0 || filterState.selectedTypes.includes(tag.type)
        const matchesPopularity = tag.popularity >= filterState.minPopularity

        return matchesSearch && matchesType && matchesPopularity
      })
      .sort((a, b) => {
        switch (filterState.sortBy) {
          case 'name':
            return a.name.localeCompare(b.name)
          case 'popularity':
            return b.popularity - a.popularity
          case 'type':
            return a.type.localeCompare(b.type)
          case 'matchRate':
            return (b.matchRate || 0) - (a.matchRate || 0)
          default:
            return 0
        }
      })
  }, [tags, filterState])

  const getTypeColor = (type: string) => {
    switch (type) {
      case '兴趣':
        return 'bg-blue-100 text-blue-800'
      case '状态':
        return 'bg-green-100 text-green-800'
      case '地理':
        return 'bg-purple-100 text-purple-800'
      case '关系':
        return 'bg-orange-100 text-orange-800'
      case '偏好':
        return 'bg-pink-100 text-pink-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case '兴趣':
        return <TrendingUp className="w-3 h-3" />
      case '状态':
        return <Users className="w-3 h-3" />
      case '地理':
        return <MapPin className="w-3 h-3" />
      case '关系':
        return <Users className="w-3 h-3" />
      case '偏好':
        return <Clock className="w-3 h-3" />
      default:
        return <Tag className="w-3 h-3" />
    }
  }

  const handleTagToggle = (tag: Tag) => {
    const isSelected = selectedTags.some(t => t.id === tag.id)
    let newSelectedTags: Tag[]

    if (isSelected) {
      newSelectedTags = selectedTags.filter(t => t.id !== tag.id)
    } else {
      newSelectedTags = [...selectedTags, { ...tag, isSelected: true }]
    }

    setSelectedTags(newSelectedTags)
    onTagsChange?.(newSelectedTags)
  }

  const handleRemoveSelectedTag = (tagId: string) => {
    const newSelectedTags = selectedTags.filter(t => t.id !== tagId)
    setSelectedTags(newSelectedTags)
    onTagsChange?.(newSelectedTags)
  }

  const handleClearAll = () => {
    setSelectedTags([])
    onTagsChange?.([])
  }

  const handleTypeToggle = (type: string) => {
    setFilterState(prev => ({
      ...prev,
      selectedTypes: prev.selectedTypes.includes(type)
        ? prev.selectedTypes.filter(t => t !== type)
        : [...prev.selectedTypes, type]
    }))
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center">
                <Tag className="w-5 h-5 mr-2" />
                已选标签 ({selectedTags.length})
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4 mr-1" />
                清空
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map(tag => (
                <Badge
                  key={tag.id}
                  variant="default"
                  className={cn("flex items-center space-x-1", getTypeColor(tag.type))}
                >
                  <span>{tag.name}</span>
                  <button
                    onClick={() => handleRemoveSelectedTag(tag.id)}
                    className="ml-1 hover:opacity-70"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            标签搜索与筛选
          </CardTitle>
          <CardDescription>
            选择标签来精确匹配毒株传播
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="搜索标签..."
              value={filterState.searchTerm}
              onChange={(e) => setFilterState(prev => ({ ...prev, searchTerm: e.target.value }))}
              className="pl-10"
            />
          </div>

          {/* Type Filters */}
          <div className="space-y-2">
            <label className="text-sm font-medium">标签类型</label>
            <div className="flex flex-wrap gap-2">
              {tagTypes.map(type => (
                <Button
                  key={type}
                  variant={filterState.selectedTypes.includes(type) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTypeToggle(type)}
                  className={cn(
                    "flex items-center space-x-1",
                    filterState.selectedTypes.includes(type) && getTypeColor(type).replace('bg-', 'bg-').replace('text-', 'text-')
                  )}
                >
                  {getTypeIcon(type)}
                  <span>{type}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Popularity Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              热门度 ≥ {filterState.minPopularity}
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="0"
                max="100"
                value={filterState.minPopularity}
                onChange={(e) => setFilterState(prev => ({ ...prev, minPopularity: parseInt(e.target.value) }))}
                className="flex-1"
              />
              <span className="text-sm text-gray-600 min-w-8">{filterState.minPopularity}</span>
            </div>
          </div>

          {/* Sort Options */}
          <div className="space-y-2">
            <label className="text-sm font-medium">排序方式</label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'popularity', label: '热门度', icon: <TrendingUp className="w-3 h-3" /> },
                { value: 'name', label: '名称', icon: <Tag className="w-3 h-3" /> },
                { value: 'type', label: '类型', icon: <Filter className="w-3 h-3" /> },
                { value: 'matchRate', label: '匹配度', icon: <Users className="w-3 h-3" /> }
              ].map(option => (
                <Button
                  key={option.value}
                  variant={filterState.sortBy === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterState(prev => ({ ...prev, sortBy: option.value as any }))}
                  className="flex items-center space-x-1"
                >
                  {option.icon}
                  <span>{option.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tag Results */}
      <Card>
        <CardHeader>
          <CardTitle>
            可用标签 ({filteredTags.length})
          </CardTitle>
          <CardDescription>
            点击标签添加到筛选器
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTags.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Tag className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>没有找到匹配的标签</p>
              <p className="text-sm">尝试调整搜索条件</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredTags.map(tag => {
                const isSelected = selectedTags.some(t => t.id === tag.id)
                return (
                  <div
                    key={tag.id}
                    onClick={() => handleTagToggle(tag)}
                    className={cn(
                      "p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md",
                      isSelected ? "ring-2 ring-blue-500 border-blue-500" : "border-gray-200",
                      "hover:border-blue-300"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge
                        variant="outline"
                        className={cn("text-xs", getTypeColor(tag.type))}
                      >
                        <div className="flex items-center space-x-1">
                          {getTypeIcon(tag.type)}
                          <span>{tag.type}</span>
                        </div>
                      </Badge>
                      {isSelected && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </div>
                    <h4 className="font-medium text-sm mb-1">{tag.name}</h4>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>热度: {tag.popularity}</span>
                      {tag.matchRate !== undefined && (
                        <span>匹配: {tag.matchRate}%</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tag Usage Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-semibold text-blue-800 mb-2">标签使用技巧</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 选择相关标签提高毒株传播匹配度</li>
            <li>• 热门标签更容易找到匹配用户</li>
            <li>• 不同类型标签组合使用效果更佳</li>
            <li>• 标签匹配度影响传播速度和范围</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}