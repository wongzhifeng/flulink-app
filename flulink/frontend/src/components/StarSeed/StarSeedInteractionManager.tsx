import React, { useState, useRef, useEffect } from 'react'
import * as d3 from 'd3'
import { StarSeed, User } from '../../types'
import StarSeedRadiationAnimation from './StarSeedRadiationAnimation'
import StarSeedDetailDisplay from './StarSeedDetailDisplay'

interface StarSeedInteractionManagerProps {
  starSeeds: StarSeed[]
  users: User[]
  width?: number
  height?: number
  onStarSeedClick?: (starSeed: StarSeed) => void
  onStarSeedLight?: (starSeedId: string) => void
  onStarSeedComment?: (starSeedId: string) => void
  onStarSeedShare?: (starSeedId: string) => void
  onAuthorClick?: (userId: string) => void
}

const StarSeedInteractionManager: React.FC<StarSeedInteractionManagerProps> = ({
  starSeeds,
  users,
  width = 1200,
  height = 800,
  onStarSeedClick,
  onStarSeedLight,
  onStarSeedComment,
  onStarSeedShare,
  onAuthorClick,
}) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [selectedStarSeed, setSelectedStarSeed] = useState<StarSeed | null>(null)
  const [hoveredStarSeed, setHoveredStarSeed] = useState<StarSeed | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // 创建主容器组
    const mainGroup = svg.append('g')
      .attr('class', 'starseed-interaction-manager')

    // 创建星种位置分布
    createStarSeedDistribution(mainGroup, starSeeds)

    // 创建连接线（显示传播关系）
    createPropagationConnections(mainGroup, starSeeds)

  }, [starSeeds, width, height])

  // 创建星种位置分布
  const createStarSeedDistribution = (
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    seeds: StarSeed[]
  ) => {
    const seedsGroup = container.append('g').attr('class', 'starseed-distribution')

    seeds.forEach((seed, index) => {
      // 使用螺旋分布算法
      const angle = index * 0.618 * Math.PI // 黄金角度
      const radius = Math.sqrt(index) * 50
      const x = width / 2 + Math.cos(angle) * radius
      const y = height / 2 + Math.sin(angle) * radius

      // 创建星种容器
      const seedContainer = seedsGroup
        .append('g')
        .attr('class', 'starseed-container')
        .attr('transform', `translate(${x}, ${y})`)

      // 创建星种背景
      const background = seedContainer
        .append('circle')
        .attr('class', 'starseed-background')
        .attr('r', 30)
        .attr('fill', 'rgba(24, 144, 255, 0.1)')
        .attr('stroke', 'rgba(24, 144, 255, 0.3)')
        .attr('stroke-width', 1)

      // 创建星种中心点
      const center = seedContainer
        .append('circle')
        .attr('class', 'starseed-center')
        .attr('r', 8)
        .attr('fill', '#1890ff')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')

      // 添加交互事件
      center
        .on('click', () => {
          setSelectedStarSeed(seed)
          setShowDetailModal(true)
          if (onStarSeedClick) {
            onStarSeedClick(seed)
          }
        })
        .on('mouseenter', function() {
          setHoveredStarSeed(seed)
          
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 12)
            .attr('fill', '#40a9ff')
          
          background
            .transition()
            .duration(200)
            .attr('r', 40)
            .attr('fill', 'rgba(24, 144, 255, 0.2)')
        })
        .on('mouseleave', function() {
          setHoveredStarSeed(null)
          
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 8)
            .attr('fill', '#1890ff')
          
          background
            .transition()
            .duration(200)
            .attr('r', 30)
            .attr('fill', 'rgba(24, 144, 255, 0.1)')
        })

      // 添加脉冲动画
      const pulseAnimation = () => {
        background
          .transition()
          .duration(2000)
          .attr('r', 35)
          .attr('opacity', 0.8)
          .on('end', () => {
            background
              .transition()
              .duration(2000)
              .attr('r', 30)
              .attr('opacity', 1)
              .on('end', pulseAnimation)
          })
      }

      pulseAnimation()
    })
  }

  // 创建传播连接线
  const createPropagationConnections = (
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    seeds: StarSeed[]
  ) => {
    const connectionsGroup = container.append('g').attr('class', 'propagation-connections')

    seeds.forEach((seed, index) => {
      const angle = index * 0.618 * Math.PI
      const radius = Math.sqrt(index) * 50
      const x = width / 2 + Math.cos(angle) * radius
      const y = height / 2 + Math.sin(angle) * radius

      // 创建传播路径
      seed.propagationPath.forEach((node, nodeIndex) => {
        if (nodeIndex < 3) { // 只显示前3个传播节点
          const targetAngle = (index + nodeIndex + 1) * 0.618 * Math.PI
          const targetRadius = Math.sqrt(index + nodeIndex + 1) * 50
          const targetX = width / 2 + Math.cos(targetAngle) * targetRadius
          const targetY = height / 2 + Math.sin(targetAngle) * targetRadius

          const connection = connectionsGroup
            .append('line')
            .attr('class', 'propagation-connection')
            .attr('x1', x)
            .attr('y1', y)
            .attr('x2', targetX)
            .attr('y2', targetY)
            .attr('stroke', '#40a9ff')
            .attr('stroke-width', 1)
            .attr('opacity', 0.3)
            .style('cursor', 'pointer')

          // 添加连接线动画
          connection
            .transition()
            .duration(1000)
            .attr('opacity', 0.6)
            .on('end', () => {
              connection
                .transition()
                .duration(1000)
                .attr('opacity', 0.3)
            })

          connection.on('click', () => {
            console.log(`传播路径: ${seed._id} -> ${node.userId}`)
          })
        }
      })
    })
  }

  const handleLight = (starSeedId: string) => {
    if (onStarSeedLight) {
      onStarSeedLight(starSeedId)
    }
  }

  const handleComment = (starSeedId: string) => {
    if (onStarSeedComment) {
      onStarSeedComment(starSeedId)
    }
  }

  const handleShare = (starSeedId: string) => {
    if (onStarSeedShare) {
      onStarSeedShare(starSeedId)
    }
  }

  const handleCloseDetailModal = () => {
    setShowDetailModal(false)
    setSelectedStarSeed(null)
  }

  const getAuthor = (authorId: string): User | undefined => {
    return users.find(user => user._id === authorId)
  }

  return (
    <div className="starseed-interaction-manager">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="starseed-interaction-svg"
        style={{ 
          background: 'radial-gradient(circle at center, rgba(24, 144, 255, 0.05) 0%, transparent 70%)',
          borderRadius: '8px'
        }}
      />

      {/* 悬停的星种辐射效果 */}
      {hoveredStarSeed && (
        <StarSeedRadiationAnimation
          starSeed={hoveredStarSeed}
          x={width / 2}
          y={height / 2}
          onRadiationClick={onStarSeedClick}
          onRadiationHover={onStarSeedClick}
        />
      )}

      {/* 星种详情弹窗 */}
      {showDetailModal && selectedStarSeed && (
        <div className="starseed-detail-modal">
          <div className="modal-backdrop" onClick={handleCloseDetailModal} />
          <div className="modal-content">
            <StarSeedDetailDisplay
              starSeed={selectedStarSeed}
              author={getAuthor(selectedStarSeed.authorId)}
              onLight={handleLight}
              onComment={handleComment}
              onShare={handleShare}
              onAuthorClick={onAuthorClick}
            />
            <button className="close-button" onClick={handleCloseDetailModal}>
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default StarSeedInteractionManager


