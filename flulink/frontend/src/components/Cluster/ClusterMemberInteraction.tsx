import React, { useState, useRef, useEffect } from 'react'
import * as d3 from 'd3'
import { ClusterMember, User, Cluster } from '../../types'
import ClusterPositionCalculator from '../../utils/clusterPositionCalculator'
import ConstellationProfileModal from './ConstellationProfileModal'

interface ClusterMemberInteractionProps {
  cluster: Cluster
  users: User[]
  width?: number
  height?: number
  layoutType?: 'circular' | 'spiral' | 'constellation' | 'organic'
  onMemberClick?: (member: ClusterMember, user: User) => void
  onMemberHover?: (member: ClusterMember, user: User) => void
}

const ClusterMemberInteraction: React.FC<ClusterMemberInteractionProps> = ({
  cluster,
  users,
  width = 500,
  height = 500,
  layoutType = 'circular',
  onMemberClick,
  onMemberHover,
}) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [selectedMember, setSelectedMember] = useState<ClusterMember | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [hoveredMember, setHoveredMember] = useState<ClusterMember | null>(null)
  const [hoveredUser, setHoveredUser] = useState<User | null>(null)

  const positionCalculator = useRef(
    new ClusterPositionCalculator({
      layoutType,
      centerX: width / 2,
      centerY: height / 2,
      radius: Math.min(width, height) / 2 - 50,
      spacing: 30,
      depth: 100,
    })
  )

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // 更新位置计算器选项
    positionCalculator.current.updateOptions({
      layoutType,
      centerX: width / 2,
      centerY: height / 2,
      radius: Math.min(width, height) / 2 - 50,
    })

    // 计算成员位置
    const membersWithPositions = positionCalculator.current.calculateMemberPositions(cluster.members)

    // 创建主容器组
    const mainGroup = svg.append('g')
      .attr('class', 'cluster-interaction')
      .attr('transform', `translate(${width / 2}, ${height / 2})`)

    // 创建星团边界
    const bounds = positionCalculator.current.calculateClusterBounds(membersWithPositions)
    const clusterRadius = Math.max(
      Math.abs(bounds.maxX - bounds.minX),
      Math.abs(bounds.maxY - bounds.minY)
    ) / 2 + 20

    const clusterBoundary = mainGroup
      .append('circle')
      .attr('class', 'cluster-boundary')
      .attr('r', clusterRadius)
      .attr('fill', 'none')
      .attr('stroke', '#1890ff')
      .attr('stroke-width', 2)
      .attr('opacity', 0.3)

    // 创建共鸣连接线
    createResonanceConnections(mainGroup, membersWithPositions)

    // 创建成员节点
    createMemberNodes(mainGroup, membersWithPositions)

    // 添加拖拽功能
    addDragFunctionality(mainGroup, membersWithPositions)

  }, [cluster, users, width, height, layoutType])

  // 创建共鸣连接线
  const createResonanceConnections = (
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    members: ClusterMember[]
  ) => {
    const connectionsGroup = container.append('g').attr('class', 'resonance-connections')

    members.forEach((memberA, indexA) => {
      members.forEach((memberB, indexB) => {
        if (indexA >= indexB) return

        const distance = positionCalculator.current.calculateDistance(memberA, memberB)
        const resonanceStrength = Math.min(memberA.resonanceValue, memberB.resonanceValue)
        const maxDistance = 150 // 最大连接距离

        if (distance <= maxDistance && resonanceStrength > 2) {
          const opacity = Math.min(resonanceStrength / 10, 0.4)
          const strokeWidth = Math.max(resonanceStrength / 5, 0.5)

          connectionsGroup
            .append('line')
            .attr('class', 'resonance-connection')
            .attr('x1', memberA.position.x)
            .attr('y1', memberA.position.y)
            .attr('x2', memberB.position.x)
            .attr('y2', memberB.position.y)
            .attr('stroke', '#40a9ff')
            .attr('stroke-width', strokeWidth)
            .attr('opacity', opacity)
            .style('cursor', 'pointer')
            .on('click', () => {
              console.log(`连接: ${memberA.userId} - ${memberB.userId}`)
            })
        }
      })
    })
  }

  // 创建成员节点
  const createMemberNodes = (
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    members: ClusterMember[]
  ) => {
    const membersGroup = container.append('g').attr('class', 'cluster-members')

    members.forEach((member) => {
      const user = users.find(u => u._id === member.userId)
      if (!user) return

      const memberGroup = membersGroup
        .append('g')
        .attr('class', 'member-node')
        .attr('transform', `translate(${member.position.x}, ${member.position.y})`)

      // 成员发光效果
      const glow = memberGroup
        .append('circle')
        .attr('class', 'member-glow')
        .attr('r', 12)
        .attr('fill', 'none')
        .attr('stroke', '#40a9ff')
        .attr('stroke-width', 1)
        .attr('opacity', 0.5)

      // 成员星球
      const memberStar = memberGroup
        .append('circle')
        .attr('class', 'member-star')
        .attr('r', 8)
        .attr('fill', '#40a9ff')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')

      // 共鸣值标签
      const resonanceLabel = memberGroup
        .append('text')
        .attr('class', 'resonance-label')
        .attr('text-anchor', 'middle')
        .attr('dy', 25)
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

      // 添加交互事件
      memberStar
        .on('click', () => {
          setSelectedMember(member)
          setSelectedUser(user)
          setShowProfileModal(true)
          if (onMemberClick) {
            onMemberClick(member, user)
          }
        })
        .on('mouseenter', function() {
          setHoveredMember(member)
          setHoveredUser(user)
          
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 12)
            .attr('fill', '#69c0ff')
          
          glow
            .transition()
            .duration(200)
            .attr('r', 16)
            .attr('opacity', 0.8)

          if (onMemberHover) {
            onMemberHover(member, user)
          }
        })
        .on('mouseleave', function() {
          setHoveredMember(null)
          setHoveredUser(null)
          
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 8)
            .attr('fill', '#40a9ff')
          
          glow
            .transition()
            .duration(200)
            .attr('r', 12)
            .attr('opacity', 0.5)
        })

      // 添加脉冲动画
      const pulseAnimation = () => {
        glow
          .transition()
          .duration(2000)
          .attr('r', 14)
          .attr('opacity', 0.8)
          .on('end', () => {
            glow
              .transition()
              .duration(2000)
              .attr('r', 12)
              .attr('opacity', 0.5)
              .on('end', pulseAnimation)
          })
      }

      pulseAnimation()
    })
  }

  // 添加拖拽功能
  const addDragFunctionality = (
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    members: ClusterMember[]
  ) => {
    const drag = d3.drag<SVGGElement, ClusterMember>()
      .on('start', function(event, d) {
        d3.select(this).raise()
      })
      .on('drag', function(event, d) {
        const x = event.x
        const y = event.y
        
        d3.select(this)
          .attr('transform', `translate(${x}, ${y})`)
        
        // 更新成员位置
        d.position.x = x
        d.position.y = y
      })
      .on('end', function(event, d) {
        console.log(`拖拽结束: ${d.userId} 到 (${d.position.x}, ${d.position.y})`)
      })

    container.selectAll('.member-node').call(drag as any)
  }

  const handleCloseProfileModal = () => {
    setShowProfileModal(false)
    setSelectedMember(null)
    setSelectedUser(null)
  }

  const handleSendMessage = (userId: string) => {
    console.log('发送消息给:', userId)
    // TODO: 实现发送消息功能
  }

  const handleAddToFavorites = (userId: string) => {
    console.log('添加关注:', userId)
    // TODO: 实现添加关注功能
  }

  return (
    <div className="cluster-member-interaction">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="cluster-interaction-svg"
        style={{ 
          background: 'radial-gradient(circle at center, rgba(24, 144, 255, 0.1) 0%, transparent 70%)',
          borderRadius: '8px'
        }}
      />

      {/* 悬停信息提示 */}
      {hoveredMember && hoveredUser && (
        <div className="hover-tooltip">
          <div className="tooltip-content">
            <h4>{hoveredUser.username}</h4>
            <p>共鸣值: {hoveredMember.resonanceValue.toFixed(2)}</p>
            <p>位置: ({hoveredMember.position.x.toFixed(1)}, {hoveredMember.position.y.toFixed(1)})</p>
          </div>
        </div>
      )}

      {/* 星座档案弹窗 */}
      <ConstellationProfileModal
        visible={showProfileModal}
        user={selectedUser}
        member={selectedMember}
        onClose={handleCloseProfileModal}
        onSendMessage={handleSendMessage}
        onAddToFavorites={handleAddToFavorites}
      />
    </div>
  )
}

export default ClusterMemberInteraction


