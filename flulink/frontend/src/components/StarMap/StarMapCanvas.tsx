import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import * as d3 from 'd3'
import { StarMapProps, StarSeed, Cluster } from '../../types'

interface StarMapState {
  width: number
  height: number
  centerX: number
  centerY: number
  zoom: number
  panX: number
  panY: number
}

// 第4次优化：使用React.memo包装组件，增强性能优化
const StarMapCanvas: React.FC<StarMapProps> = React.memo(({ 
  width = 1200, 
  height = 800,
  onStarSeedClick,
  onClusterClick 
}) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const animationFrameRef = useRef<number>()
  const meteorIntervalRef = useRef<NodeJS.Timeout>()
  const lastRenderTime = useRef<number>(0)
  const renderCount = useRef<number>(0)
  
  // 优化4.1: 增强状态计算缓存，添加性能监控
  const initialStarMapState = useMemo(() => {
    const startTime = performance.now()
    const state = {
      width,
      height,
      centerX: width / 2,
      centerY: height / 2,
      zoom: 1,
      panX: 0,
      panY: 0,
    }
    console.log(`StarMap state calculation took: ${performance.now() - startTime}ms`)
    return state
  }, [width, height])
  
  const [starMapState, setStarMapState] = useState<StarMapState>(initialStarMapState)

  // 第4次优化：使用useCallback缓存事件处理函数，添加性能监控
  const handleZoom = useCallback((event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
    const startTime = performance.now()
    const { transform } = event
    
    // 优化4.1: 添加变换阈值，避免微小变化
    const zoomThreshold = 0.01
    const panThreshold = 1
    
    setStarMapState(prev => {
      // 优化4.2: 检查是否需要更新状态
      if (Math.abs(prev.zoom - transform.k) < zoomThreshold && 
          Math.abs(prev.panX - transform.x) < panThreshold && 
          Math.abs(prev.panY - transform.y) < panThreshold) {
        return prev // 避免不必要的状态更新
      }
      
      const newState = {
        ...prev,
        zoom: transform.k,
        panX: transform.x,
        panY: transform.y,
      }
      
      // 优化4.3: 记录状态更新性能
      const updateTime = performance.now() - startTime
      if (updateTime > 5) {
        console.warn(`Slow zoom update: ${updateTime}ms`)
      }
      
      return newState
    })
  }, [])

  // 性能优化：使用useCallback缓存动画函数
  const createBackgroundStars = useCallback((container: d3.Selection<SVGGElement, unknown, null, undefined>, width: number, height: number) => {
    const starField = container.append('g').attr('class', 'star-field')
    
    // 性能优化：减少星星数量，使用更高效的渲染方式
    const starSizes = [0.5, 1, 1.5, 2]
    const starColors = ['#ffffff', '#e6f7ff', '#bae7ff', '#91d5ff']
    
    starSizes.forEach((size, index) => {
      const stars = starField
        .selectAll(`.star-${size}`)
        .data(Array.from({ length: Math.floor(100 / starSizes.length) }, (_, i) => i)) // 减少星星数量
        .enter()
        .append('circle')
        .attr('class', `star star-${size}`)
        .attr('cx', () => Math.random() * width)
        .attr('cy', () => Math.random() * height)
        .attr('r', size)
        .attr('fill', starColors[index])
        .attr('opacity', () => Math.random() * 0.8 + 0.2)

      // 性能优化：使用requestAnimationFrame优化动画
      const animateStars = () => {
        stars
          .transition()
          .duration(() => Math.random() * 2000 + 1000) // 减少动画时间
          .attr('opacity', () => Math.random() * 0.8 + 0.2)
          .on('end', function() {
            animationFrameRef.current = requestAnimationFrame(() => {
              d3.select(this)
                .transition()
                .duration(() => Math.random() * 2000 + 1000)
                .attr('opacity', () => Math.random() * 0.8 + 0.2)
            })
          })
      }
      
      animateStars()
    })
  }, [])

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // 创建主容器组
    const mainGroup = svg.append('g')
      .attr('class', 'main-group')
      .attr('transform', `translate(${starMapState.panX}, ${starMapState.panY}) scale(${starMapState.zoom})`)

    // 创建背景星空
    createBackgroundStars(mainGroup, starMapState.width, starMapState.height)
    
    // 创建中心星球
    createCenterStar(mainGroup, starMapState.centerX, starMapState.centerY)
    
    // 创建星种辐射效果
    createStarSeedRadiation(mainGroup, starMapState.centerX, starMapState.centerY)
    
    // 创建流星效果
    createMeteorEffects(mainGroup, starMapState.width, starMapState.height)

    // 添加缩放和平移功能
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on('zoom', handleZoom)

    svg.call(zoom)

    // 性能优化：清理定时器和动画帧
    return () => {
      if (meteorIntervalRef.current) {
        clearInterval(meteorIntervalRef.current)
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [starMapState.width, starMapState.height, starMapState.zoom, starMapState.panX, starMapState.panY, createBackgroundStars, handleZoom])

  // 性能优化：使用useCallback缓存中心星球创建函数
  const createCenterStar = useCallback((container: d3.Selection<SVGGElement, unknown, null, undefined>, x: number, y: number) => {
    const centerGroup = container.append('g').attr('class', 'center-star-group')
    
    // 外层发光效果
    const outerGlow = centerGroup
      .append('circle')
      .attr('class', 'center-star-outer-glow')
      .attr('cx', x)
      .attr('cy', y)
      .attr('r', 40)
      .attr('fill', 'none')
      .attr('stroke', '#1890ff')
      .attr('stroke-width', 1)
      .attr('opacity', 0.3)

    // 中层发光效果
    const middleGlow = centerGroup
      .append('circle')
      .attr('class', 'center-star-middle-glow')
      .attr('cx', x)
      .attr('cy', y)
      .attr('r', 30)
      .attr('fill', 'none')
      .attr('stroke', '#40a9ff')
      .attr('stroke-width', 2)
      .attr('opacity', 0.5)

    // 主星球
    const centerStar = centerGroup
      .append('circle')
      .attr('class', 'center-star')
      .attr('cx', x)
      .attr('cy', y)
      .attr('r', 20)
      .attr('fill', '#1890ff')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 3)
      .style('cursor', 'pointer')

    // 内层发光效果
    const innerGlow = centerGroup
      .append('circle')
      .attr('class', 'center-star-inner-glow')
      .attr('cx', x)
      .attr('cy', y)
      .attr('r', 15)
      .attr('fill', '#69c0ff')
      .attr('opacity', 0.8)

    // 性能优化：使用requestAnimationFrame优化脉冲动画
    const pulseAnimation = () => {
      outerGlow
        .transition()
        .duration(1500) // 减少动画时间
        .attr('r', 50)
        .attr('opacity', 0.1)
        .on('end', () => {
          animationFrameRef.current = requestAnimationFrame(() => {
            outerGlow
              .transition()
              .duration(1500)
              .attr('r', 40)
              .attr('opacity', 0.3)
              .on('end', pulseAnimation)
          })
        })

      middleGlow
        .transition()
        .duration(1000)
        .attr('r', 35)
        .attr('opacity', 0.3)
        .on('end', () => {
          animationFrameRef.current = requestAnimationFrame(() => {
            middleGlow
              .transition()
              .duration(1000)
              .attr('r', 30)
              .attr('opacity', 0.5)
          })
        })
    }

    pulseAnimation()

    // 添加点击事件
    centerStar.on('click', () => {
      console.log('点击中心星球')
    })
  }, [])

  // 性能优化：使用useCallback缓存辐射效果创建函数
  const createStarSeedRadiation = useCallback((container: d3.Selection<SVGGElement, unknown, null, undefined>, x: number, y: number) => {
    const radiationGroup = container.append('g').attr('class', 'radiation-group')
    
    // 性能优化：减少辐射环数量
    for (let i = 0; i < 2; i++) { // 从3个减少到2个
      const radiation = radiationGroup
        .append('circle')
        .attr('class', `radiation-ring-${i}`)
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', 60 + i * 40)
        .attr('fill', 'none')
        .attr('stroke', '#1890ff')
        .attr('stroke-width', 1)
        .attr('opacity', 0.3 - i * 0.1)

      // 性能优化：使用requestAnimationFrame优化辐射动画
      const animateRadiation = () => {
        radiation
          .transition()
          .duration(2000 + i * 500) // 减少动画时间
          .attr('r', 100 + i * 60)
          .attr('opacity', 0)
          .on('end', function() {
            animationFrameRef.current = requestAnimationFrame(() => {
              d3.select(this)
                .attr('r', 60 + i * 40)
                .attr('opacity', 0.3 - i * 0.1)
                .transition()
                .duration(2000 + i * 500)
                .attr('r', 100 + i * 60)
                .attr('opacity', 0)
            })
          })
      }
      
      animateRadiation()
    }
  }, [])

  // 性能优化：使用useCallback缓存流星效果创建函数
  const createMeteorEffects = useCallback((container: d3.Selection<SVGGElement, unknown, null, undefined>, width: number, height: number) => {
    const meteorGroup = container.append('g').attr('class', 'meteor-group')
    
    const createMeteor = () => {
      const startX = Math.random() * width
      const startY = Math.random() * height
      const endX = startX + (Math.random() - 0.5) * 200
      const endY = startY + (Math.random() - 0.5) * 200

      const meteor = meteorGroup
        .append('line')
        .attr('class', 'meteor')
        .attr('x1', startX)
        .attr('y1', startY)
        .attr('x2', startX)
        .attr('y2', startY)
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2)
        .attr('opacity', 0)

      meteor
        .transition()
        .duration(800) // 减少动画时间
        .attr('x2', endX)
        .attr('y2', endY)
        .attr('opacity', 1)
        .transition()
        .duration(300) // 减少动画时间
        .attr('opacity', 0)
        .on('end', () => {
          meteor.remove()
        })
    }

    // 性能优化：增加流星间隔时间，减少频率
    meteorIntervalRef.current = setInterval(createMeteor, 5000) // 从3秒增加到5秒
    
    return () => {
      if (meteorIntervalRef.current) {
        clearInterval(meteorIntervalRef.current)
      }
    }
  }, [])

  // 性能优化：使用useMemo缓存样式对象
  const svgStyle = useMemo(() => ({
    background: 'radial-gradient(circle at center, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
    cursor: 'grab'
  }), [])

  return (
    <div className="star-map-canvas">
      <svg
        ref={svgRef}
        width={starMapState.width}
        height={starMapState.height}
        className="star-map-svg"
        style={svgStyle}
      />
    </div>
  )
})

// 性能优化：设置displayName用于调试
StarMapCanvas.displayName = 'StarMapCanvas'

export default StarMapCanvas