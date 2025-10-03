'use client'

import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, Tag, ChevronDown, ChevronRight } from 'lucide-react'
import { tagService } from '@/lib/tagService'
import { Tag as TagType } from '@/types/tags'

interface TagSearchProps {
  onTagSelect: (tag: TagType) => void;
  selectedTags: TagType[];
}

export default function TagSearch({ onTagSelect, selectedTags }: TagSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSeedTag, setSelectedSeedTag] = useState<TagType | null>(null)
  const [searchResults, setSearchResults] = useState<TagType[]>([])
  const [seedTags, setSeedTags] = useState<TagType[]>([])
  const [expandedSeeds, setExpandedSeeds] = useState<Set<string>>(new Set())

  useEffect(() => {
    // 初始化种子标签
    const seeds = tagService.getSeedTags()
    setSeedTags(seeds)
  }, [])

  useEffect(() => {
    if (selectedSeedTag && searchQuery) {
      // 在选中的种子标签下搜索子标签
      const results = tagService.searchTags(selectedSeedTag.id, searchQuery)
      setSearchResults(results.tags)
    } else if (selectedSeedTag && !searchQuery) {
      // 显示种子标签下的所有子标签
      const children = tagService.getChildTags(selectedSeedTag.name)
      setSearchResults(children)
    } else {
      setSearchResults([])
    }
  }, [selectedSeedTag, searchQuery])

  const handleSeedTagClick = (seedTag: TagType) => {
    setSelectedSeedTag(seedTag)
    setSearchQuery('')
    
    // 切换展开状态
    const newExpanded = new Set(expandedSeeds)
    if (newExpanded.has(seedTag.id)) {
      newExpanded.delete(seedTag.id)
    } else {
      newExpanded.add(seedTag.id)
    }
    setExpandedSeeds(newExpanded)
  }

  const handleTagClick = (tag: TagType) => {
    onTagSelect(tag)
  }

  const isTagSelected = (tag: TagType) => {
    return selectedTags.some(selected => selected.id === tag.id)
  }

  const getTagColor = (tag: TagType) => {
    return tag.color || '#6B7280'
  }

  return (
    <div className="space-y-4">
      {/* 种子标签选择 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            选择种子标签
          </CardTitle>
          <CardDescription>
            选择主要标签类别，然后在子标签中搜索
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {seedTags.map((seedTag) => (
              <div key={seedTag.id} className="space-y-2">
                <Button
                  variant={selectedSeedTag?.id === seedTag.id ? "default" : "outline"}
                  className="w-full justify-between"
                  onClick={() => handleSeedTagClick(seedTag)}
                >
                  <span className="truncate">{seedTag.name}</span>
                  {expandedSeeds.has(seedTag.id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
                
                {/* 子标签预览 */}
                {expandedSeeds.has(seedTag.id) && (
                  <div className="ml-4 space-y-1">
                    {tagService.getChildTags(seedTag.name).slice(0, 3).map((childTag) => (
                      <Button
                        key={childTag.id}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-xs"
                        onClick={() => handleTagClick(childTag)}
                      >
                        <div 
                          className="w-2 h-2 rounded-full mr-2" 
                          style={{ backgroundColor: getTagColor(childTag) }}
                        />
                        {childTag.name}
                      </Button>
                    ))}
                    {tagService.getChildTags(seedTag.name).length > 3 && (
                      <div className="text-xs text-gray-500 ml-4">
                        +{tagService.getChildTags(seedTag.name).length - 3} 更多...
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 子标签搜索 */}
      {selectedSeedTag && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              在 &quot;{selectedSeedTag.name}&quot; 下搜索
            </CardTitle>
            <CardDescription>
              快速过滤匹配子标签
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 搜索输入框 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={`搜索 ${selectedSeedTag.name} 相关标签...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* 搜索结果 */}
              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  找到 {searchResults.length} 个匹配标签
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {searchResults.map((tag) => (
                    <Button
                      key={tag.id}
                      variant={isTagSelected(tag) ? "default" : "outline"}
                      className="justify-start h-auto p-3"
                      onClick={() => handleTagClick(tag)}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: getTagColor(tag) }}
                        />
                        <div className="flex-1 text-left">
                          <div className="font-medium">{tag.name}</div>
                          {tag.description && (
                            <div className="text-xs text-gray-500 truncate">
                              {tag.description}
                            </div>
                          )}
                        </div>
                        {isTagSelected(tag) && (
                          <div className="text-xs bg-white/20 px-2 py-1 rounded">
                            已选择
                          </div>
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 已选择的标签 */}
      {selectedTags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>已选择的标签</CardTitle>
            <CardDescription>
              点击标签可取消选择
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="cursor-pointer hover:bg-red-100"
                  onClick={() => handleTagClick(tag)}
                >
                  <div 
                    className="w-2 h-2 rounded-full mr-2" 
                    style={{ backgroundColor: getTagColor(tag) }}
                  />
                  {tag.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

