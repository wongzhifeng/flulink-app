import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { Card, Spin, message } from 'antd';
import { StarOutlined, UserOutlined, HeartOutlined } from '@ant-design/icons';
import './StarMap.css';

interface StarSeed {
  _id: string;
  content: {
    text?: string;
    imageUrl?: string;
    audioUrl?: string;
  };
  luminosity: number;
  spectrum: string[];
  interactions: {
    lights: number;
    comments: number;
    shares: number;
  };
  authorId: string;
  createdAt: Date;
}

interface ClusterMember {
  userId: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  resonanceValue: number;
  activityScore?: number;
  joinedAt: Date;
}

interface Cluster {
  _id: string;
  members: ClusterMember[];
  centerUser: string;
  resonanceThreshold: number;
  averageResonance: number;
  createdAt: Date;
  expiresAt: Date;
  status: 'active' | 'dissolved';
}

interface StarMapProps {
  cluster: Cluster | null;
  starSeeds: StarSeed[];
  currentUser?: {
    _id: string;
    nickname: string;
    avatar?: string;
  };
  onStarSeedClick?: (starSeed: StarSeed) => void;
  onMemberClick?: (member: ClusterMember) => void;
}

const StarMap: React.FC<StarMapProps> = ({
  cluster,
  starSeeds,
  currentUser,
  onStarSeedClick,
  onMemberClick
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [loading, setLoading] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [animationPhase, setAnimationPhase] = useState(0);

  // 响应式尺寸调整
  useEffect(() => {
    const updateDimensions = () => {
      const container = svgRef.current?.parentElement;
      if (container) {
        const rect = container.getBoundingClientRect();
        setDimensions({
          width: Math.max(800, rect.width - 40),
          height: Math.max(600, rect.height - 40)
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // 计算星种位置
  const calculateStarSeedPositions = useCallback((seeds: StarSeed[], centerX: number, centerY: number) => {
    return seeds.map((seed, index) => {
      const angle = (index / seeds.length) * 2 * Math.PI;
      const radius = 150 + (seed.luminosity / 100) * 100; // 基于光度调整半径
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      return {
        ...seed,
        position: { x, y, z: 0 },
        angle,
        radius
      };
    });
  }, []);

  // 计算星团成员位置
  const calculateClusterPositions = useCallback((members: ClusterMember[], centerX: number, centerY: number) => {
    return members.map((member, index) => {
      const angle = (index / members.length) * 2 * Math.PI;
      const radius = 80 + (member.resonanceValue / 100) * 60; // 基于共鸣值调整半径
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      return {
        ...member,
        displayPosition: { x, y },
        angle,
        radius
      };
    });
  }, []);

  // 渲染星空背景
  const renderStarField = useCallback((svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) => {
    const starCount = 200;
    const stars = Array.from({ length: starCount }, (_, i) => ({
      id: i,
      x: Math.random() * dimensions.width,
      y: Math.random() * dimensions.height,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.8 + 0.2,
      twinkle: Math.random() * 0.5 + 0.5
    }));

    svg.selectAll('.star-field')
      .data(stars)
      .enter()
      .append('circle')
      .attr('class', 'star-field')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', d => d.size)
      .attr('fill', '#ffffff')
      .attr('opacity', d => d.opacity)
      .style('animation', `twinkle ${2 + d.twinkle}s ease-in-out infinite alternate`);
  }, [dimensions]);

  // 渲染星种
  const renderStarSeeds = useCallback((
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    seeds: StarSeed[],
    centerX: number,
    centerY: number
  ) => {
    const positionedSeeds = calculateStarSeedPositions(seeds, centerX, centerY);
    
    const seedGroup = svg.selectAll('.star-seed-group')
      .data(positionedSeeds)
      .enter()
      .append('g')
      .attr('class', 'star-seed-group')
      .attr('transform', d => `translate(${d.position.x}, ${d.position.y})`)
      .style('cursor', 'pointer');

    // 星种核心
    seedGroup.append('circle')
      .attr('class', 'star-seed-core')
      .attr('r', d => 8 + (d.luminosity / 100) * 12)
      .attr('fill', d => {
        const hue = (d.luminosity / 100) * 60; // 黄色到橙色
        return `hsl(${hue}, 100%, 60%)`;
      })
      .attr('stroke', '#ffd700')
      .attr('stroke-width', 2)
      .style('filter', 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.6))');

    // 星种光环
    seedGroup.append('circle')
      .attr('class', 'star-seed-halo')
      .attr('r', d => 15 + (d.luminosity / 100) * 20)
      .attr('fill', 'none')
      .attr('stroke', '#ffd700')
      .attr('stroke-width', 1)
      .attr('opacity', 0.6)
      .style('animation', 'pulse 2s ease-in-out infinite');

    // 星种标签
    seedGroup.append('text')
      .attr('class', 'star-seed-label')
      .attr('text-anchor', 'middle')
      .attr('dy', -25)
      .attr('fill', '#ffffff')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text(d => d.content.text?.substring(0, 20) + '...' || '星种');

    // 互动指示器
    const interactionGroup = seedGroup.append('g')
      .attr('class', 'interaction-indicators')
      .attr('transform', 'translate(0, 20)');

    // 点亮数
    interactionGroup.append('text')
      .attr('class', 'interaction-count')
      .attr('x', -20)
      .attr('y', 0)
      .attr('fill', '#ff6b6b')
      .attr('font-size', '10px')
      .text(d => d.interactions.lights);

    interactionGroup.append('text')
      .attr('class', 'interaction-icon')
      .attr('x', -30)
      .attr('y', 0)
      .attr('fill', '#ff6b6b')
      .attr('font-size', '10px')
      .text('💡');

    // 评论数
    interactionGroup.append('text')
      .attr('class', 'interaction-count')
      .attr('x', 0)
      .attr('y', 0)
      .attr('fill', '#4ecdc4')
      .attr('font-size', '10px')
      .text(d => d.interactions.comments);

    interactionGroup.append('text')
      .attr('class', 'interaction-icon')
      .attr('x', -10)
      .attr('y', 0)
      .attr('fill', '#4ecdc4')
      .attr('font-size', '10px')
      .text('💬');

    // 分享数
    interactionGroup.append('text')
      .attr('class', 'interaction-count')
      .attr('x', 20)
      .attr('y', 0)
      .attr('fill', '#45b7d1')
      .attr('font-size', '10px')
      .text(d => d.interactions.shares);

    interactionGroup.append('text')
      .attr('class', 'interaction-icon')
      .attr('x', 10)
      .attr('y', 0)
      .attr('fill', '#45b7d1')
      .attr('font-size', '10px')
      .text('📤');

    // 点击事件
    seedGroup.on('click', (event, d) => {
      event.stopPropagation();
      onStarSeedClick?.(d);
    });

    // 悬停效果
    seedGroup.on('mouseenter', function(event, d) {
      d3.select(this).select('.star-seed-core')
        .transition()
        .duration(200)
        .attr('r', 12 + (d.luminosity / 100) * 16);
      
      d3.select(this).select('.star-seed-halo')
        .transition()
        .duration(200)
        .attr('r', 20 + (d.luminosity / 100) * 25)
        .attr('opacity', 0.8);
    });

    seedGroup.on('mouseleave', function(event, d) {
      d3.select(this).select('.star-seed-core')
        .transition()
        .duration(200)
        .attr('r', 8 + (d.luminosity / 100) * 12);
      
      d3.select(this).select('.star-seed-halo')
        .transition()
        .duration(200)
        .attr('r', 15 + (d.luminosity / 100) * 20)
        .attr('opacity', 0.6);
    });
  }, [calculateStarSeedPositions, onStarSeedClick]);

  // 渲染星团成员
  const renderClusterMembers = useCallback((
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    members: ClusterMember[],
    centerX: number,
    centerY: number
  ) => {
    const positionedMembers = calculateClusterPositions(members, centerX, centerY);
    
    const memberGroup = svg.selectAll('.cluster-member-group')
      .data(positionedMembers)
      .enter()
      .append('g')
      .attr('class', 'cluster-member-group')
      .attr('transform', d => `translate(${d.displayPosition.x}, ${d.displayPosition.y})`)
      .style('cursor', 'pointer');

    // 成员节点
    memberGroup.append('circle')
      .attr('class', 'cluster-member-node')
      .attr('r', d => 6 + (d.resonanceValue / 100) * 8)
      .attr('fill', d => {
        const hue = (d.resonanceValue / 100) * 120; // 绿色到蓝色
        return `hsl(${hue}, 70%, 60%)`;
      })
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .style('filter', 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.4))');

    // 共鸣连接线
    memberGroup.append('line')
      .attr('class', 'resonance-line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', d => Math.cos(d.angle) * 20)
      .attr('y2', d => Math.sin(d.angle) * 20)
      .attr('stroke', '#4ecdc4')
      .attr('stroke-width', d => (d.resonanceValue / 100) * 3 + 0.5)
      .attr('opacity', 0.6);

    // 活跃度指示器
    memberGroup.append('circle')
      .attr('class', 'activity-indicator')
      .attr('r', d => (d.activityScore || 0.5) * 4 + 2)
      .attr('fill', 'none')
      .attr('stroke', '#ffd700')
      .attr('stroke-width', 1)
      .attr('opacity', d => (d.activityScore || 0.5) * 0.8 + 0.2)
      .style('animation', 'pulse 3s ease-in-out infinite');

    // 点击事件
    memberGroup.on('click', (event, d) => {
      event.stopPropagation();
      onMemberClick?.(d);
    });

    // 悬停效果
    memberGroup.on('mouseenter', function(event, d) {
      d3.select(this).select('.cluster-member-node')
        .transition()
        .duration(200)
        .attr('r', 8 + (d.resonanceValue / 100) * 10);
    });

    memberGroup.on('mouseleave', function(event, d) {
      d3.select(this).select('.cluster-member-node')
        .transition()
        .duration(200)
        .attr('r', 6 + (d.resonanceValue / 100) * 8);
    });
  }, [calculateClusterPositions, onMemberClick]);

  // 渲染中心用户
  const renderCenterUser = useCallback((
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    centerX: number,
    centerY: number
  ) => {
    const centerGroup = svg.append('g')
      .attr('class', 'center-user-group')
      .attr('transform', `translate(${centerX}, ${centerY})`);

    // 中心光环
    centerGroup.append('circle')
      .attr('class', 'center-halo')
      .attr('r', 40)
      .attr('fill', 'none')
      .attr('stroke', '#ffd700')
      .attr('stroke-width', 3)
      .attr('opacity', 0.8)
      .style('animation', 'centerPulse 2s ease-in-out infinite');

    // 中心节点
    centerGroup.append('circle')
      .attr('class', 'center-node')
      .attr('r', 15)
      .attr('fill', '#ffd700')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 3)
      .style('filter', 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.8))');

    // 中心标签
    centerGroup.append('text')
      .attr('class', 'center-label')
      .attr('text-anchor', 'middle')
      .attr('dy', -30)
      .attr('fill', '#ffffff')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text('星团中心');

    // 用户头像（如果有）
    if (currentUser?.avatar) {
      centerGroup.append('image')
        .attr('class', 'center-avatar')
        .attr('href', currentUser.avatar)
        .attr('x', -12)
        .attr('y', -12)
        .attr('width', 24)
        .attr('height', 24)
        .attr('clip-path', 'circle(12px)');
    }
  }, [currentUser]);

  // 渲染辐射动画
  const renderRadiationAnimation = useCallback((
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    centerX: number,
    centerY: number
  ) => {
    const radiationGroup = svg.append('g')
      .attr('class', 'radiation-group');

    // 创建多个辐射环
    for (let i = 0; i < 3; i++) {
      radiationGroup.append('circle')
        .attr('class', `radiation-ring-${i}`)
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('r', 50 + i * 30)
        .attr('fill', 'none')
        .attr('stroke', '#4ecdc4')
        .attr('stroke-width', 2)
        .attr('opacity', 0.3)
        .style('animation', `radiationExpand ${3 + i}s linear infinite`)
        .style('animation-delay', `${i * 0.5}s`);
    }
  }, []);

  // 主渲染函数
  const renderStarMap = useCallback(() => {
    if (!svgRef.current) return;

    setLoading(true);
    
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // 清除之前的内容

    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;

    // 渲染星空背景
    renderStarField(svg);

    // 渲染中心用户
    renderCenterUser(svg, centerX, centerY);

    // 渲染星团成员
    if (cluster?.members) {
      renderClusterMembers(svg, cluster.members, centerX, centerY);
    }

    // 渲染星种
    if (starSeeds.length > 0) {
      renderStarSeeds(svg, starSeeds, centerX, centerY);
    }

    // 渲染辐射动画
    renderRadiationAnimation(svg, centerX, centerY);

    setLoading(false);
  }, [
    dimensions,
    cluster,
    starSeeds,
    renderStarField,
    renderCenterUser,
    renderClusterMembers,
    renderStarSeeds,
    renderRadiationAnimation
  ]);

  // 动画循环
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 360);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // 当数据变化时重新渲染
  useEffect(() => {
    renderStarMap();
  }, [renderStarMap]);

  return (
    <Card 
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <StarOutlined style={{ color: '#ffd700' }} />
          <span>星空图谱</span>
          {cluster && (
            <span style={{ fontSize: '12px', color: '#666' }}>
              ({cluster.members.length} 成员)
            </span>
          )}
        </div>
      }
      style={{ height: '100%' }}
      bodyStyle={{ padding: 0, height: 'calc(100% - 57px)' }}
    >
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <Spin spinning={loading} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          <svg
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            style={{ 
              background: 'radial-gradient(circle at center, #0a0a1a 0%, #000000 100%)',
              borderRadius: '8px'
            }}
          />
        </Spin>
      </div>
    </Card>
  );
};

export default StarMap;
