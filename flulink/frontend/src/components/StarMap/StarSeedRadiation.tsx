import React, { useRef, useEffect } from 'react'
import * as d3 from 'd3'
import { StarSeed } from '../../types'

interface StarSeedRadiationProps {
  starSeed: StarSeed
  x: number
  y: number
  onRadiationClick?: (starSeed: StarSeed) => void
}

const StarSeedRadiation: React.FC<StarSeedRadiationProps> = ({
  starSeed,
  x,
  y,
  onRadiationClick
}) => {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // 根据光度确定辐射强度
    const radiationIntensity = Math.min(starSeed.luminosity / 10, 1)
    const baseRadius = 20 + radiationIntensity * 30

    // 创建辐射组
    const radiationGroup = svg.append('g')
      .attr('class', 'starseed-radiation')
      .attr('transform', `translate(${x}, ${y})`)

    // 创建多个辐射环
    const ringCount = Math.floor(radiationIntensity * 5) + 2
    
    for (let i = 0; i < ringCount; i++) {
      const ringRadius = baseRadius + i * 15
      const ringOpacity = (0.8 - i * 0.15) * radiationIntensity
      
      const ring = radiationGroup
        .append('circle')
        .attr('class', `radiation-ring-${i}`)
        .attr('r', ringRadius)
        .attr('fill', 'none')
        .attr('stroke', getRadiationColor(starSeed.spectrum))
        .attr('stroke-width', 2 - i * 0.3)
        .attr('opacity', ringOpacity)

      // 辐射动画
      const animationDuration = 2000 + i * 500
      const animationRadius = ringRadius + 20 + i * 10
      
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
      .attr('r', 8 + radiationIntensity * 4)
      .attr('fill', getRadiationColor(starSeed.spectrum))
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')

    // 添加点击事件
    centerStar.on('click', () => {
      if (onRadiationClick) {
        onRadiationClick(starSeed)
      }
    })

    // 添加悬停效果
    centerStar
      .on('mouseenter', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 12 + radiationIntensity * 6)
          .attr('fill', '#ffffff')
      })
      .on('mouseleave', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 8 + radiationIntensity * 4)
          .attr('fill', getRadiationColor(starSeed.spectrum))
      })

    // 创建光谱标签
    if (starSeed.spectrum.length > 0) {
      const spectrumLabel = radiationGroup
        .append('text')
        .attr('class', 'spectrum-label')
        .attr('text-anchor', 'middle')
        .attr('dy', 25)
        .attr('fill', '#ffffff')
        .attr('font-size', '10px')
        .text(starSeed.spectrum[0])

      // 标签动画
      spectrumLabel
        .transition()
        .duration(1000)
        .attr('opacity', 0.8)
        .on('end', () => {
          spectrumLabel
            .transition()
            .duration(1000)
            .attr('opacity', 0.3)
        })
    }

  }, [starSeed, x, y])

  // 根据光谱标签获取颜色
  const getRadiationColor = (spectrum: string[]): string => {
    const colorMap: { [key: string]: string } = {
      '科技': '#1890ff',
      '艺术': '#722ed1',
      '音乐': '#eb2f96',
      '旅行': '#52c41a',
      '美食': '#fa8c16',
      '运动': '#f5222d',
      '读书': '#13c2c2',
      '电影': '#faad14',
    }

    if (spectrum.length === 0) return '#1890ff'
    
    const primaryTag = spectrum[0]
    return colorMap[primaryTag] || '#1890ff'
  }

  return (
    <div className="starseed-radiation-container">
      <svg
        ref={svgRef}
        width={200}
        height={200}
        className="starseed-radiation-svg"
        style={{ 
          position: 'absolute',
          left: x - 100,
          top: y - 100,
          pointerEvents: 'none'
        }}
      />
    </div>
  )
}

export default StarSeedRadiation


