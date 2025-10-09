import React, { useRef, useEffect } from 'react'
import * as d3 from 'd3'
import { Card, Button, Space, Typography } from 'antd'
import { EyeOutlined, CloseOutlined } from '@ant-design/icons'
import { StarSeed } from '../../types'

const { Title, Text } = Typography

interface LightPreviewProps {
  starSeed: StarSeed
  visible: boolean
  onClose: () => void
}

const LightPreview: React.FC<LightPreviewProps> = ({
  starSeed,
  visible,
  onClose,
}) => {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !visible) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = 400
    const height = 300
    const centerX = width / 2
    const centerY = height / 2

    // 创建主容器组
    const mainGroup = svg.append('g')
      .attr('class', 'light-preview')
      .attr('transform', `translate(${centerX}, ${centerY})`)

    // 根据光度确定光芒强度
    const lightIntensity = Math.min(starSeed.luminosity / 10, 1)
    const baseRadius = 20 + lightIntensity * 30

    // 创建光芒效果
    createLightEffect(mainGroup, lightIntensity, baseRadius)

    // 创建中心星种
    createCenterStar(mainGroup, lightIntensity)

    // 创建光谱标签
    createSpectrumLabels(mainGroup, starSeed.spectrum)

    // 创建传播路径预览
    createPropagationPreview(mainGroup, starSeed.propagationPath)

  }, [starSeed, visible])

  // 创建光芒效果
  const createLightEffect = (
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    intensity: number,
    baseRadius: number
  ) => {
    const lightGroup = container.append('g').attr('class', 'light-effect')

    // 创建多个光芒环
    const ringCount = Math.floor(intensity * 6) + 3
    
    for (let i = 0; i < ringCount; i++) {
      const ringRadius = baseRadius + i * 15
      const ringOpacity = (0.9 - i * 0.12) * intensity
      const ringColor = getLightColor(starSeed.spectrum, i)
      
      const ring = lightGroup
        .append('circle')
        .attr('class', `light-ring-${i}`)
        .attr('r', ringRadius)
        .attr('fill', 'none')
        .attr('stroke', ringColor)
        .attr('stroke-width', 3 - i * 0.4)
        .attr('opacity', ringOpacity)

      // 光芒动画
      const animationDuration = 1500 + i * 200
      const animationRadius = ringRadius + 25 + i * 10
      
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
  }

  // 创建中心星种
  const createCenterStar = (
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    intensity: number
  ) => {
    const starGroup = container.append('g').attr('class', 'center-star')

    // 外层发光
    const outerGlow = starGroup
      .append('circle')
      .attr('r', 25 + intensity * 15)
      .attr('fill', 'none')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1)
      .attr('opacity', 0.6)

    // 主星种
    const mainStar = starGroup
      .append('circle')
      .attr('r', 12 + intensity * 8)
      .attr('fill', getLightColor(starSeed.spectrum, 0))
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 3)

    // 内层发光
    const innerGlow = starGroup
      .append('circle')
      .attr('r', 8 + intensity * 5)
      .attr('fill', '#ffffff')
      .attr('opacity', 0.8)

    // 脉冲动画
    const pulseAnimation = () => {
      outerGlow
        .transition()
        .duration(2000)
        .attr('r', 30 + intensity * 20)
        .attr('opacity', 0.3)
        .on('end', () => {
          outerGlow
            .transition()
            .duration(2000)
            .attr('r', 25 + intensity * 15)
            .attr('opacity', 0.6)
            .on('end', pulseAnimation)
        })
    }

    pulseAnimation()
  }

  // 创建光谱标签
  const createSpectrumLabels = (
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    spectrum: string[]
  ) => {
    const labelGroup = container.append('g').attr('class', 'spectrum-labels')

    spectrum.slice(0, 3).forEach((tag, index) => {
      const angle = (index / spectrum.length) * 2 * Math.PI
      const radius = 80
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius

      const label = labelGroup
        .append('text')
        .attr('class', 'spectrum-label')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', 'middle')
        .attr('fill', '#ffffff')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .text(tag)

      // 标签动画
      label
        .transition()
        .duration(1000)
        .attr('opacity', 0.9)
        .on('end', () => {
          label
            .transition()
            .duration(1000)
            .attr('opacity', 0.4)
        })
    })
  }

  // 创建传播路径预览
  const createPropagationPreview = (
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    propagationPath: any[]
  ) => {
    const pathGroup = container.append('g').attr('class', 'propagation-preview')

    propagationPath.slice(0, 5).forEach((node, index) => {
      const angle = (index / 5) * 2 * Math.PI
      const radius = 60
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius

      const nodeCircle = pathGroup
        .append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', 3)
        .attr('fill', '#40a9ff')
        .attr('opacity', 0.7)

      // 连接线
      pathGroup
        .append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', x)
        .attr('y2', y)
        .attr('stroke', '#40a9ff')
        .attr('stroke-width', 1)
        .attr('opacity', 0.3)

      // 节点动画
      nodeCircle
        .transition()
        .duration(1000)
        .attr('r', 5)
        .attr('opacity', 1)
        .on('end', () => {
          nodeCircle
            .transition()
            .duration(1000)
            .attr('r', 3)
            .attr('opacity', 0.7)
        })
    })
  }

  // 根据光谱获取颜色
  const getLightColor = (spectrum: string[], index: number): string => {
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
    return colors[index % colors.length]
  }

  if (!visible) return null

  return (
    <div className="light-preview-modal">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-content">
        <Card
          title={
            <Space>
              <EyeOutlined />
              <span>光芒预览</span>
            </Space>
          }
          extra={
            <Button type="text" icon={<CloseOutlined />} onClick={onClose} />
          }
          className="light-preview-card"
        >
          <div className="preview-content">
            <svg
              ref={svgRef}
              width={400}
              height={300}
              className="light-preview-svg"
              style={{ 
                background: 'radial-gradient(circle at center, rgba(24, 144, 255, 0.1) 0%, transparent 70%)',
                borderRadius: '8px'
              }}
            />
            
            <div className="preview-info">
              <Title level={5} style={{ color: '#ffffff' }}>
                {starSeed.spectrum[0] || '未知'} 星种
              </Title>
              <Text style={{ color: '#ffffff' }}>
                光度: {starSeed.luminosity.toFixed(2)} · 
                传播路径: {starSeed.propagationPath.length} 个节点
              </Text>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default LightPreview


