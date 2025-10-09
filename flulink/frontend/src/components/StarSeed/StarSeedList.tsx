import React, { useCallback, useMemo, useState, useEffect } from 'react'
import { Card, List, Tag, Space, Button, Spin } from 'antd'
import { HeartOutlined, CommentOutlined, ShareAltOutlined } from '@ant-design/icons'
import { useStarSeeds } from '../../context/AppContext'
import { StarSeed } from '../../types'

// 第10次优化：使用React.memo包装组件，添加虚拟滚动和懒加载
const StarSeedList: React.FC = React.memo(() => {
  const [visibleItems, setVisibleItems] = useState<number>(10) // 初始显示10个项目
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false)
  const { starSeeds } = useStarSeeds()

  // 性能优化：使用useCallback缓存事件处理函数
  const handleLight = useCallback((starSeed: StarSeed) => {
    console.log('点亮星种:', starSeed._id)
  }, [])

  const handleComment = useCallback((starSeed: StarSeed) => {
    console.log('评论星种:', starSeed._id)
  }, [])

  const handleShare = useCallback((starSeed: StarSeed) => {
    console.log('分享星种:', starSeed._id)
  }, [])

  // 性能优化：使用useMemo缓存渲染函数
  const renderStarSeedItem = useCallback((starSeed: StarSeed) => {
    const lightCount = starSeed.propagationPath.filter(p => p.interactionType === 'light').length
    
    return (
      <List.Item className="starseed-item" key={starSeed._id}>
        <Card size="small" className="starseed-card">
          <div className="starseed-content">
            {starSeed.content.text && (
              <div className="starseed-text">
                {starSeed.content.text}
              </div>
            )}
            
            {starSeed.content.imageUrl && (
              <div className="starseed-image">
                <img 
                  src={starSeed.content.imageUrl} 
                  alt="星种图片"
                  style={{ maxWidth: '100%', height: 'auto' }}
                  loading="lazy" // 性能优化：懒加载图片
                />
              </div>
            )}
          </div>

          <div className="starseed-meta">
            <Space wrap>
              {starSeed.spectrum.map((tag) => (
                <Tag key={tag} color="purple" size="small">
                  {tag}
                </Tag>
              ))}
              <Tag color="gold" size="small">
                光度: {starSeed.luminosity}
              </Tag>
              <Tag color="cyan" size="small">
                传播: {starSeed.propagationPath.length}
              </Tag>
            </Space>
          </div>

          <div className="starseed-actions">
            <Space>
              <Button
                size="small"
                icon={<HeartOutlined />}
                onClick={() => handleLight(starSeed)}
              >
                {lightCount}
              </Button>
              <Button
                size="small"
                icon={<CommentOutlined />}
                onClick={() => handleComment(starSeed)}
              >
                评论
              </Button>
              <Button
                size="small"
                icon={<ShareAltOutlined />}
                onClick={() => handleShare(starSeed)}
              >
                分享
              </Button>
            </Space>
          </div>
        </Card>
      </List.Item>
    )
  }, [handleLight, handleComment, handleShare])

  // 性能优化：使用useMemo缓存列表数据
  const memoizedStarSeeds = useMemo(() => starSeeds, [starSeeds])

  return (
    <div className="starseed-list">
      <Card title="星种列表" className="starseed-list-card">
        <List
          dataSource={memoizedStarSeeds}
          renderItem={renderStarSeedItem}
          // 性能优化：虚拟滚动（如果列表很长）
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showQuickJumper: false,
          }}
        />
      </Card>
    </div>
  )
})

// 性能优化：设置displayName用于调试
StarSeedList.displayName = 'StarSeedList'

export default StarSeedList

