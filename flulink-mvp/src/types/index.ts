export interface User {
  id: string
  username: string
  email: string
  avatar?: string
  bio?: string
  location?: {
    lat: number
    lng: number
    address: string
  }
  immunityTags: string[]
  tier: 'free' | 'premium' | 'enterprise'
  createdAt: Date
  updatedAt: Date
}

export interface VirusStrain {
  id: string
  title: string
  content: string
  type: 'life' | 'opinion' | 'interest' | 'super'
  tags: string[]
  authorId: string
  location: {
    lat: number
    lng: number
    address: string
    radius: number
  }
  spreadDelay: number // 传播延迟（小时）
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface SpreadRecord {
  id: string
  strainId: string
  userId: string
  location: {
    lat: number
    lng: number
    address: string
  }
  spreadTime: Date
  isInfected: boolean
}

export interface Task {
  id: string
  title: string
  description: string
  type: 'creation' | 'spread' | 'collaboration'
  reward: {
    points: number
    material?: string
  }
  creatorId: string
  participants: string[]
  isCompleted: boolean
  createdAt: Date
  updatedAt: Date
}

export interface GeoHeatmapData {
  location: {
    lat: number
    lng: number
    address: string
  }
  infectionCount: number
  intensity: number // 0-1
}

