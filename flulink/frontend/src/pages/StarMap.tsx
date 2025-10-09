import React, { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import StarMapCanvas from '../components/StarMap/StarMapCanvas'
import ClusterVisualization from '../components/StarMap/ClusterVisualization'
import StarSeedRadiation from '../components/StarMap/StarSeedRadiation'
import MeteorTrail from '../components/StarMap/MeteorTrail'
import StarSeedList from '../components/StarSeed/StarSeedList'
import Navigation from '../components/Navigation/Navigation'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import { StarSeed, Cluster, ClusterMember, User } from '../types'

const StarMap: React.FC = () => {
  const { state } = useApp()
  const [meteors, setMeteors] = useState<Array<{
    id: string
    x: number
    y: number
    targetX: number
    targetY: number
  }>>([])

  // 模拟星种辐射效果
  useEffect(() => {
    if (state.starSeeds.length > 0) {
      // 定期创建流星效果
      const interval = setInterval(() => {
        if (state.starSeeds.length > 0) {
          const randomSeed = state.starSeeds[Math.floor(Math.random() * state.starSeeds.length)]
          const startX = Math.random() * 1200
          const startY = Math.random() * 800
          const targetX = 600 + (Math.random() - 0.5) * 200
          const targetY = 400 + (Math.random() - 0.5) * 200

          const meteorId = `meteor-${Date.now()}`
          setMeteors(prev => [...prev, {
            id: meteorId,
            x: startX,
            y: startY,
            targetX,
            targetY
          }])

          // 3秒后移除流星
          setTimeout(() => {
            setMeteors(prev => prev.filter(m => m.id !== meteorId))
          }, 3000)
        }
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [state.starSeeds])

  const handleStarSeedClick = (starSeed: StarSeed) => {
    console.log('点击星种:', starSeed._id)
  }

  const handleClusterClick = (cluster: Cluster) => {
    console.log('点击星团:', cluster._id)
  }

  const handleMemberClick = (member: ClusterMember, user: User) => {
    console.log('点击星团成员:', member.userId, user.username)
  }

  const handleMeteorComplete = (meteorId: string) => {
    setMeteors(prev => prev.filter(m => m.id !== meteorId))
  }

  if (state.loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="star-map-page">
      <Navigation />
      <div className="star-map-container">
        <div className="star-map-main">
          <StarMapCanvas 
            onStarSeedClick={handleStarSeedClick}
            onClusterClick={handleClusterClick}
          />
          
          {/* 星种辐射效果 */}
          {state.starSeeds.map((starSeed, index) => (
            <StarSeedRadiation
              key={starSeed._id}
              starSeed={starSeed}
              x={200 + index * 150}
              y={200 + index * 100}
              onRadiationClick={handleStarSeedClick}
            />
          ))}

          {/* 流星效果 */}
          {meteors.map(meteor => (
            <MeteorTrail
              key={meteor.id}
              x={meteor.x}
              y={meteor.y}
              targetX={meteor.targetX}
              targetY={meteor.targetY}
              duration={2000}
              onComplete={() => handleMeteorComplete(meteor.id)}
            />
          ))}

          {/* 星团可视化 */}
          {state.currentCluster && (
            <div className="cluster-visualization-overlay">
              <ClusterVisualization
                cluster={state.currentCluster}
                users={state.users}
                width={300}
                height={300}
                onMemberClick={handleMemberClick}
              />
            </div>
          )}
        </div>

        <div className="star-map-sidebar">
          <StarSeedList />
        </div>
      </div>
    </div>
  )
}

export default StarMap
