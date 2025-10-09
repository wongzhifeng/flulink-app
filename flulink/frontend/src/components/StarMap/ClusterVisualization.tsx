import React, { useRef, useEffect } from 'react'
import * as d3 from 'd3'
import { Cluster, ClusterMember, User } from '../../types'

interface ClusterVisualizationProps {
  cluster: Cluster
  users: User[]
  width?: number
  height?: number
  onMemberClick?: (member: ClusterMember, user: User) => void
}

const ClusterVisualization: React.FC<ClusterVisualizationProps> = ({
  cluster,
  users,
  width = 400,
  height = 400,
  onMemberClick
}) => {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) / 2 - 50

    // 创建主容器组
    const mainGroup = svg.append('g')
      .attr('class', 'cluster-visualization')
      .attr('transform', `translate(${centerX}, ${centerY})`)

    // 创建星团边界
    const clusterBoundary = mainGroup
      .append('circle')
      .attr('class', 'cluster-boundary')
      .attr('r', radius)
      .attr('fill', 'none')
      .attr('stroke', '#1890ff')
      .attr('stroke-width', 2)
      .attr('opacity', 0.3)

    // 创建星团成员
    cluster.members.forEach((member, index) => {
      const user = users.find(u => u._id === member.userId)
      if (!user) return

      // 计算成员位置（圆形分布）
      const angle = (index / cluster.members.length) * 2 * Math.PI
      const memberRadius = radius * 0.8
      const x = Math.cos(angle) * memberRadius
      const y = Math.sin(angle) * memberRadius

      const memberGroup = mainGroup
        .append('g')
        .attr('class', 'cluster-member')
        .attr('transform', `translate(${x}, ${y})`)

      // 成员发光效果
      const glow = memberGroup
        .append('circle')
        .attr('class', 'member-glow')
        .attr('r', 8)
        .attr('fill', 'none')
        .attr('stroke', '#40a9ff')
        .attr('stroke-width', 1)
        .attr('opacity', 0.5)

      // 成员星球
      const memberStar = memberGroup
        .append('circle')
        .attr('class', 'member-star')
        .attr('r', 6)
        .attr('fill', '#40a9ff')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 1)
        .style('cursor', 'pointer')

      // 共鸣值标签
      const resonanceLabel = memberGroup
        .append('text')
        .attr('class', 'resonance-label')
        .attr('text-anchor', 'middle')
        .attr('dy', 20)
        .attr('fill', '#ffffff')
        .attr('font-size', '10px')
        .text(member.resonanceValue.toFixed(2))

      // 用户名标签
      const nameLabel = memberGroup
        .append('text')
        .attr('class', 'name-label')
        .attr('text-anchor', 'middle')
        .attr('dy', -15)
        .attr('fill', '#ffffff')
        .attr('font-size', '8px')
        .text(user.username)

      // 添加点击事件
      memberStar.on('click', () => {
        if (onMemberClick) {
          onMemberClick(member, user)
        }
      })

      // 添加悬停效果
      memberStar
        .on('mouseenter', function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 8)
            .attr('fill', '#69c0ff')
          
          glow
            .transition()
            .duration(200)
            .attr('r', 12)
            .attr('opacity', 0.8)
        })
        .on('mouseleave', function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 6)
            .attr('fill', '#40a9ff')
          
          glow
            .transition()
            .duration(200)
            .attr('r', 8)
            .attr('opacity', 0.5)
        })

      // 添加脉冲动画
      const pulseAnimation = () => {
        glow
          .transition()
          .duration(2000)
          .attr('r', 10)
          .attr('opacity', 0.8)
          .on('end', () => {
            glow
              .transition()
              .duration(2000)
              .attr('r', 8)
              .attr('opacity', 0.5)
              .on('end', pulseAnimation)
          })
      }

      pulseAnimation()
    })

    // 创建连接线（显示共鸣关系）
    cluster.members.forEach((memberA, indexA) => {
      cluster.members.forEach((memberB, indexB) => {
        if (indexA >= indexB) return

        const angleA = (indexA / cluster.members.length) * 2 * Math.PI
        const angleB = (indexB / cluster.members.length) * 2 * Math.PI
        const memberRadius = radius * 0.8
        
        const x1 = Math.cos(angleA) * memberRadius
        const y1 = Math.sin(angleA) * memberRadius
        const x2 = Math.cos(angleB) * memberRadius
        const y2 = Math.sin(angleB) * memberRadius

        // 计算共鸣强度
        const resonanceStrength = Math.min(memberA.resonanceValue, memberB.resonanceValue)
        const opacity = Math.min(resonanceStrength / 10, 0.3)

        if (opacity > 0.1) {
          mainGroup
            .append('line')
            .attr('class', 'resonance-connection')
            .attr('x1', x1)
            .attr('y1', y1)
            .attr('x2', x2)
            .attr('y2', y2)
            .attr('stroke', '#40a9ff')
            .attr('stroke-width', 1)
            .attr('opacity', opacity)
        }
      })
    })

  }, [cluster, users, width, height])

  return (
    <div className="cluster-visualization-container">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="cluster-visualization-svg"
        style={{ 
          background: 'radial-gradient(circle at center, rgba(24, 144, 255, 0.1) 0%, transparent 70%)',
          borderRadius: '8px'
        }}
      />
    </div>
  )
}

export default ClusterVisualization


