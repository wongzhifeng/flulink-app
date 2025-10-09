import React, { useRef, useEffect, useState } from 'react'
import * as d3 from 'd3'
import { StarSeed } from '../../types'

interface StarSeedRadiationAnimationProps {
  starSeed: StarSeed
  x: number
  y: number
  onRadiationClick?: (starSeed: StarSeed) => void
  onRadiationHover?: (starSeed: StarSeed) => void
}

const StarSeedRadiationAnimation: React.FC<StarSeedRadiationAnimationProps> = ({
  starSeed,
  x,
  y,
  onRadiationClick,
  onRadiationHover,
}) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isClicked, setIsClicked] = useState(false)

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // 根据光度确定辐射强度
    const radiationIntensity = Math.min(starSeed.luminosity / 10, 1)
    const baseRadius = 20 + radiationIntensity * 40
    const maxRadius = baseRadius + 60

    // 创建辐射组
    const radiationGroup = svg.append('g')
      .attr('class', 'starseed-radiation-animation')
      .attr('transform', `translate(${x}, ${y})`)

    // 创建多个辐射环
    const ringCount = Math.floor(radiationIntensity * 8) + 3
    
    for (let i = 0; i < ringCount; i++) {
      const ringRadius = baseRadius + i * 8
      const ringOpacity = (0.9 - i * 0.1) * radiationIntensity
      const ringColor = getRadiationColor(starSeed.spectrum, i)
      
      const ring = radiationGroup
        .append('circle')
        .attr('class', `radiation-ring-${i}`)
        .attr('r', ringRadius)
        .attr('fill', 'none')
        .attr('stroke', ringColor)
        .attr('stroke-width', 3 - i * 0.3)
        .attr('opacity', ringOpacity)

      // 辐射动画
      const animationDuration = 2000 + i * 300
      const animationRadius = ringRadius + 30 + i * 15
      
      ring
        .transition()
        .duration(animationDuration)
        .attr('r', animationRadius)
        .attr('opacity', 0)
        .on('end', function() {
          d3.select(this)
            .attr('r', ringRadius)
            .attr('opacity', ringOpacity)
            .transition()
            .duration(animationDuration)
            .attr('r', animationRadius)
            .attr('opacity', 0)
        })
    }

    // 创建中心星种
    const centerStar = radiationGroup
      .append('circle')
      .attr('class', 'starseed-center')
      .attr('r', 10 + radiationIntensity * 6)
      .attr('fill', getRadiationColor(starSeed.spectrum, 0))
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 3)
      .style('cursor', 'pointer')

    // 创建内层发光效果
    const innerGlow = radiationGroup
      .append('circle')
      .attr('class', 'inner-glow')
      .attr('r', 15 + radiationIntensity * 8)
      .attr('fill', 'none')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1)
      .attr('opacity', 0.6)

    // 创建光谱标签
    if (starSeed.spectrum.length > 0) {
      const spectrumLabel = radiationGroup
        .append('text')
        .attr('class', 'spectrum-label')
        .attr('text-anchor', 'middle')
        .attr('dy', 35)
        .attr('fill', '#ffffff')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .text(starSeed.spectrum[0])

      // 标签动画
      spectrumLabel
        .transition()
        .duration(1500)
        .attr('opacity', 0.9)
        .on('end', () => {
          spectrumLabel
            .transition()
            .duration(1500)
            .attr('opacity', 0.4)
        })
    }

    // 创建光度指示器
    const luminosityIndicator = radiationGroup
      .append('text')
      .attr('class', 'luminosity-indicator')
      .attr('text-anchor', 'middle')
      .attr('dy', -25)
      .attr('fill', '#ffffff')
      .attr('font-size', '10px')
      .text(`光度: ${starSeed.luminosity.toFixed(1)}`)

    // 添加点击事件
    centerStar.on('click', () => {
      setIsClicked(true)
      if (onRadiationClick) {
        onRadiationClick(starSeed)
      }
      
      // 点击效果
      centerStar
        .transition()
        .duration(200)
        .attr('r', 20 + radiationIntensity * 8)
        .transition()
        .duration(200)
        .attr('r', 10 + radiationIntensity * 6)
      
      setTimeout(() => setIsClicked(false), 500)
    })

    // 添加悬停效果
    centerStar
      .on('mouseenter', function() {
        setIsHovered(true)
        
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 15 + radiationIntensity * 8)
          .attr('fill', '#ffffff')
        
        innerGlow
          .transition()
          .duration(200)
          .attr('r', 25 + radiationIntensity * 10)
          .attr('opacity', 0.9)

        if (onRadiationHover) {
          onRadiationHover(starSeed)
        }
      })
      .on('mouseleave', function() {
        setIsHovered(false)
        
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 10 + radiationIntensity * 6)
          .attr('fill', getRadiationColor(starSeed.spectrum, 0))
        
        innerGlow
          .transition()
          .duration(200)
          .attr('r', 15 + radiationIntensity * 8)
          .attr('opacity', 0.6)
      })

    // 创建脉冲动画
    const pulseAnimation = () => {
      innerGlow
        .transition()
        .duration(1500)
        .attr('r', 20 + radiationIntensity * 10)
        .attr('opacity', 0.8)
        .on('end', () => {
          innerGlow
            .transition()
            .duration(1500)
            .attr('r', 15 + radiationIntensity * 8)
            .attr('opacity', 0.6)
            .on('end', pulseAnimation)
        })
    }

    pulseAnimation()

  }, [starSeed, x, y, isHovered, isClicked])

  // 根据光谱标签获取颜色
  const getRadiationColor = (spectrum: string[], ringIndex: number): string => {
    const colorMap: { [key: string]: string[] } = {
      '科技': ['#1890ff', '#40a9ff', '#69c0ff', '#91d5ff'],
      '艺术': ['#722ed1', '#9254de', '#b37feb', '#d3adf7'],
      '音乐': ['#eb2f96', '#f759ab', '#ff85c0', '#ffadd6'],
      '旅行': ['#52c41a', '#73d13d', '#95de64', '#b7eb8f'],
      '美食': ['#fa8c16', '#ffa940', '#ffc069', '#ffd591'],
      '运动': ['#f5222d', '#ff4d4f', '#ff7875', '#ffa39e'],
      '读书': ['#13c2c2', '#36cfc9', '#5cdbd3', '#87e8de'],
      '电影': ['#faad14', '#ffc53d', '#ffd666', '#ffe58f'],
    }

    if (spectrum.length === 0) return '#1890ff'
    
    const primaryTag = spectrum[0]
    const colors = colorMap[primaryTag] || ['#1890ff', '#40a9ff', '#69c0ff', '#91d5ff']
    return colors[ringIndex % colors.length]
  }

  return (
    <div className="starseed-radiation-animation-container">
      <svg
        ref={svgRef}
        width={200}
        height={200}
        className="starseed-radiation-animation-svg"
        style={{ 
          position: 'absolute',
          left: x - 100,
          top: y - 100,
          pointerEvents: 'auto'
        }}
      />
      
      {/* 悬停信息提示 */}
      {isHovered && (
        <div className="radiation-tooltip">
          <div className="tooltip-content">
            <h4>{starSeed.spectrum[0] || '未知'}</h4>
            <p>光度: {starSeed.luminosity.toFixed(2)}</p>
            <p>传播路径: {starSeed.propagationPath.length} 个节点</p>
            <p>跃迁条件: {starSeed.jumpCondition.currentValue.toFixed(1)}/{starSeed.jumpCondition.threshold}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default StarSeedRadiationAnimation


