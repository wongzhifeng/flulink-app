import React, { useRef, useEffect, useState } from 'react'
import * as d3 from 'd3'
import { StarSeed } from '../../types'

interface MeteorTrailProps {
  x: number
  y: number
  targetX: number
  targetY: number
  duration?: number
  onComplete?: () => void
}

const MeteorTrail: React.FC<MeteorTrailProps> = ({
  x,
  y,
  targetX,
  targetY,
  duration = 2000,
  onComplete
}) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // 计算流星路径
    const pathLength = Math.sqrt(Math.pow(targetX - x, 2) + Math.pow(targetY - y, 2))
    const angle = Math.atan2(targetY - y, targetX - x)

    // 创建流星主体
    const meteorGroup = svg.append('g')
      .attr('class', 'meteor-trail')

    // 创建流星头部
    const meteorHead = meteorGroup
      .append('circle')
      .attr('class', 'meteor-head')
      .attr('cx', x)
      .attr('cy', y)
      .attr('r', 3)
      .attr('fill', '#ffffff')
      .attr('opacity', 1)

    // 创建流星拖尾
    const trailLength = Math.min(pathLength * 0.3, 50)
    const trailPoints = []
    
    for (let i = 0; i < 10; i++) {
      const trailX = x - Math.cos(angle) * (trailLength * i / 10)
      const trailY = y - Math.sin(angle) * (trailLength * i / 10)
      trailPoints.push([trailX, trailY])
    }

    const trailPath = meteorGroup
      .append('path')
      .attr('class', 'meteor-trail-path')
      .attr('d', d3.line()(trailPoints))
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .attr('fill', 'none')
      .attr('opacity', 0.8)

    // 创建发光效果
    const glow = meteorGroup
      .append('circle')
      .attr('class', 'meteor-glow')
      .attr('cx', x)
      .attr('cy', y)
      .attr('r', 8)
      .attr('fill', 'none')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1)
      .attr('opacity', 0.5)

    // 流星移动动画
    const tween = d3.interpolate([x, y], [targetX, targetY])
    
    meteorGroup
      .transition()
      .duration(duration)
      .tween('position', function() {
        return function(t: number) {
          const [currentX, currentY] = tween(t)
          
          // 更新流星头部位置
          meteorHead.attr('cx', currentX).attr('cy', currentY)
          
          // 更新拖尾位置
          const newTrailPoints = []
          for (let i = 0; i < 10; i++) {
            const trailX = currentX - Math.cos(angle) * (trailLength * i / 10)
            const trailY = currentY - Math.sin(angle) * (trailLength * i / 10)
            newTrailPoints.push([trailX, trailY])
          }
          trailPath.attr('d', d3.line()(newTrailPoints))
          
          // 更新发光效果
          glow.attr('cx', currentX).attr('cy', currentY)
          
          // 更新透明度（接近目标时变暗）
          const opacity = 1 - t * 0.5
          meteorHead.attr('opacity', opacity)
          trailPath.attr('opacity', opacity * 0.8)
          glow.attr('opacity', opacity * 0.5)
        }
      })
      .on('end', () => {
        setIsVisible(false)
        if (onComplete) {
          onComplete()
        }
      })

  }, [x, y, targetX, targetY, duration])

  if (!isVisible) return null

  return (
    <div className="meteor-trail-container">
      <svg
        ref={svgRef}
        width={Math.max(Math.abs(targetX - x) + 100, 200)}
        height={Math.max(Math.abs(targetY - y) + 100, 200)}
        className="meteor-trail-svg"
        style={{ 
          position: 'absolute',
          left: Math.min(x, targetX) - 50,
          top: Math.min(y, targetY) - 50,
          pointerEvents: 'none',
          zIndex: 1000
        }}
      />
    </div>
  )
}

export default MeteorTrail


