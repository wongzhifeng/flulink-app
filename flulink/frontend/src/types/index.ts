// 用户相关类型
export interface User {
  _id: string
  username: string
  email: string
  phone?: string
  avatar?: string
  tags: string[]
  bio?: string
  constellationName?: string
  constellationDescription?: string
  constellationPersonality?: string[]
  contactInfo?: {
    wechat?: string
    qq?: string
    email?: string
    telegram?: string
    twitter?: string
  }
  constellationProfile?: ConstellationProfile
  createdAt: Date
  updatedAt: Date
}

export interface ConstellationProfile {
  constellationName: string
  constellationDescription: string
  contactInfo: {
    wechat?: string
    qq?: string
    email?: string
  }
  interests: string[]
  personality: string[]
}

// 星种相关类型
export interface StarSeed {
  _id: string
  authorId: string
  owner?: User
  content: {
    text?: string
    imageUrl?: string
    audioUrl?: string
  }
  spectrum: string[]
  tags?: string[]
  luminosity: number
  interactions?: {
    lights: number
    comments: number
    shares: number
  } | Array<{
    userId: string
    type: 'light' | 'comment' | 'share'
    timestamp: Date
  }>
  propagationPath: PropagationNode[]
  jumpCondition: {
    threshold: number
    currentValue: number
    isJumped: boolean
  }
  createdAt: Date
  updatedAt: Date
}

export interface PropagationNode {
  userId: string
  timestamp: Date
  interactionType: 'light' | 'comment' | 'share'
  geographicLevel: number
}

// 星团相关类型
export interface Cluster {
  _id: string
  name?: string
  members: ClusterMember[]
  centerUser: string
  resonanceThreshold: number
  averageResonance: number
  resonanceScore?: number
  lifecycleEnd?: Date
  createdAt: Date
  expiresAt: Date
  status: 'active' | 'dissolved'
}

export interface ClusterMember {
  userId: string
  _id?: string
  position: {
    x: number
    y: number
    z: number
  }
  resonanceValue: number
  activityScore?: number
  joinedAt: Date
}

// 共鸣相关类型
export interface ResonanceValue {
  userIdA: string
  userIdB: string
  value: number
  factors: {
    tagSimilarity: number
    interactionHistory: number
    geographicProximity: number
    temporalProximity: number
  }
  calculatedAt: Date
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// 认证相关类型
export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  token: string | null
}

// 应用状态类型
export interface AppState {
  auth: AuthState
  user?: User
  currentCluster: Cluster | null
  starSeeds: StarSeed[]
  users: User[]
  loading: boolean
  error: string | null
}

// 组件Props类型
export interface StarMapProps {
  width?: number
  height?: number
  onStarSeedClick?: (starSeed: StarSeed) => void
  onClusterClick?: (cluster: Cluster) => void
}

export interface StarSeedCardProps {
  starSeed: StarSeed
  onClick?: () => void
  showRadiation?: boolean
}

export interface ClusterMemberProps {
  member: ClusterMember
  user: User
  onClick?: () => void
}

// 地理传播类型
export interface GeographicPropagation {
  level: number
  delay: number
  spreadRadius: number
  affectedUsers: string[]
}


