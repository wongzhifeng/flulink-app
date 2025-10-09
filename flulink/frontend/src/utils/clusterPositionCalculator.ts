import { ClusterMember, Cluster } from '../types'

export interface Position3D {
  x: number
  y: number
  z: number
}

export interface ClusterLayoutOptions {
  layoutType: 'circular' | 'spiral' | 'constellation' | 'organic'
  centerX: number
  centerY: number
  radius: number
  spacing: number
  depth: number
}

export class ClusterPositionCalculator {
  private options: ClusterLayoutOptions

  constructor(options: Partial<ClusterLayoutOptions> = {}) {
    this.options = {
      layoutType: 'circular',
      centerX: 0,
      centerY: 0,
      radius: 100,
      spacing: 20,
      depth: 50,
      ...options,
    }
  }

  /**
   * 计算星团成员位置
   */
  calculateMemberPositions(members: ClusterMember[]): ClusterMember[] {
    switch (this.options.layoutType) {
      case 'circular':
        return this.calculateCircularLayout(members)
      case 'spiral':
        return this.calculateSpiralLayout(members)
      case 'constellation':
        return this.calculateConstellationLayout(members)
      case 'organic':
        return this.calculateOrganicLayout(members)
      default:
        return this.calculateCircularLayout(members)
    }
  }

  /**
   * 圆形布局
   */
  private calculateCircularLayout(members: ClusterMember[]): ClusterMember[] {
    const { centerX, centerY, radius } = this.options
    const angleStep = (2 * Math.PI) / members.length

    return members.map((member, index) => {
      const angle = index * angleStep
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius
      const z = this.calculateDepthByResonance(member.resonanceValue)

      return {
        ...member,
        position: { x, y, z },
      }
    })
  }

  /**
   * 螺旋布局
   */
  private calculateSpiralLayout(members: ClusterMember[]): ClusterMember[] {
    const { centerX, centerY, radius, spacing } = this.options
    const goldenAngle = Math.PI * (3 - Math.sqrt(5)) // 黄金角度

    return members.map((member, index) => {
      const angle = index * goldenAngle
      const distance = Math.sqrt(index) * spacing
      const x = centerX + Math.cos(angle) * distance
      const y = centerY + Math.sin(angle) * distance
      const z = this.calculateDepthByResonance(member.resonanceValue)

      return {
        ...member,
        position: { x, y, z },
      }
    })
  }

  /**
   * 星座布局（基于共鸣值分组）
   */
  private calculateConstellationLayout(members: ClusterMember[]): ClusterMember[] {
    const { centerX, centerY, radius } = this.options
    
    // 按共鸣值分组
    const groups = this.groupMembersByResonance(members)
    const groupCount = groups.length
    const groupRadius = radius * 0.6

    return members.map((member) => {
      const groupIndex = groups.findIndex(group => 
        group.some(m => m.userId === member.userId)
      )
      const group = groups[groupIndex]
      const memberIndex = group.findIndex(m => m.userId === member.userId)
      
      // 计算组中心位置
      const groupAngle = (groupIndex / groupCount) * 2 * Math.PI
      const groupCenterX = centerX + Math.cos(groupAngle) * groupRadius
      const groupCenterY = centerY + Math.sin(groupAngle) * groupRadius
      
      // 计算组内位置
      const memberAngle = (memberIndex / group.length) * 2 * Math.PI
      const memberRadius = radius * 0.2
      const x = groupCenterX + Math.cos(memberAngle) * memberRadius
      const y = groupCenterY + Math.sin(memberAngle) * memberRadius
      const z = this.calculateDepthByResonance(member.resonanceValue)

      return {
        ...member,
        position: { x, y, z },
      }
    })
  }

  /**
   * 有机布局（模拟自然分布）
   */
  private calculateOrganicLayout(members: ClusterMember[]): ClusterMember[] {
    const { centerX, centerY, radius } = this.options
    
    return members.map((member, index) => {
      // 使用噪声函数创建有机分布
      const noiseX = this.noise(index * 0.1, 0) * radius
      const noiseY = this.noise(index * 0.1, 1) * radius
      const noiseZ = this.noise(index * 0.1, 2) * this.options.depth
      
      const x = centerX + noiseX
      const y = centerY + noiseY
      const z = this.calculateDepthByResonance(member.resonanceValue) + noiseZ

      return {
        ...member,
        position: { x, y, z },
      }
    })
  }

  /**
   * 根据共鸣值计算深度
   */
  private calculateDepthByResonance(resonanceValue: number): number {
    const { depth } = this.options
    // 共鸣值越高，越靠近中心（z值越小）
    return depth * (1 - Math.min(resonanceValue / 10, 1))
  }

  /**
   * 按共鸣值分组
   */
  private groupMembersByResonance(members: ClusterMember[]): ClusterMember[][] {
    const sorted = [...members].sort((a, b) => b.resonanceValue - a.resonanceValue)
    const groups: ClusterMember[][] = []
    const groupSize = Math.ceil(sorted.length / 3) // 分为3组

    for (let i = 0; i < sorted.length; i += groupSize) {
      groups.push(sorted.slice(i, i + groupSize))
    }

    return groups
  }

  /**
   * 简单的噪声函数
   */
  private noise(x: number, y: number): number {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
    return (n - Math.floor(n)) * 2 - 1
  }

  /**
   * 计算成员间的距离
   */
  calculateDistance(member1: ClusterMember, member2: ClusterMember): number {
    const dx = member1.position.x - member2.position.x
    const dy = member1.position.y - member2.position.y
    const dz = member1.position.z - member2.position.z
    return Math.sqrt(dx * dx + dy * dy + dz * dz)
  }

  /**
   * 计算星团中心位置
   */
  calculateClusterCenter(members: ClusterMember[]): Position3D {
    if (members.length === 0) {
      return { x: 0, y: 0, z: 0 }
    }

    const sumX = members.reduce((sum, member) => sum + member.position.x, 0)
    const sumY = members.reduce((sum, member) => sum + member.position.y, 0)
    const sumZ = members.reduce((sum, member) => sum + member.position.z, 0)

    return {
      x: sumX / members.length,
      y: sumY / members.length,
      z: sumZ / members.length,
    }
  }

  /**
   * 计算星团边界
   */
  calculateClusterBounds(members: ClusterMember[]): {
    minX: number
    maxX: number
    minY: number
    maxY: number
    minZ: number
    maxZ: number
  } {
    if (members.length === 0) {
      return { minX: 0, maxX: 0, minY: 0, maxY: 0, minZ: 0, maxZ: 0 }
    }

    const positions = members.map(member => member.position)
    
    return {
      minX: Math.min(...positions.map(p => p.x)),
      maxX: Math.max(...positions.map(p => p.x)),
      minY: Math.min(...positions.map(p => p.y)),
      maxY: Math.max(...positions.map(p => p.y)),
      minZ: Math.min(...positions.map(p => p.z)),
      maxZ: Math.max(...positions.map(p => p.z)),
    }
  }

  /**
   * 更新布局选项
   */
  updateOptions(newOptions: Partial<ClusterLayoutOptions>): void {
    this.options = { ...this.options, ...newOptions }
  }
}

export default ClusterPositionCalculator


