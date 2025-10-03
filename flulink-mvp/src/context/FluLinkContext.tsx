"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { User, VirusStrain, SpreadRecord, Task, GeoHeatmapData } from '@/types'

interface FluLinkContextType {
  // 用户状态
  user: User | null
  setUser: (user: User | null) => void
  
  // 毒株状态
  strains: VirusStrain[]
  setStrains: (strains: VirusStrain[]) => void
  addStrain: (strain: VirusStrain) => void
  
  // 传播记录
  spreadRecords: SpreadRecord[]
  setSpreadRecords: (records: SpreadRecord[]) => void
  addSpreadRecord: (record: SpreadRecord) => void
  
  // 任务状态
  tasks: Task[]
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  
  // 热力图数据
  heatmapData: GeoHeatmapData[]
  setHeatmapData: (data: GeoHeatmapData[]) => void
  
  // 位置信息
  userLocation: { lat: number; lng: number } | null
  setUserLocation: (location: { lat: number; lng: number } | null) => void
  
  // 加载状态
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

const FluLinkContext = createContext<FluLinkContextType | undefined>(undefined)

export function FluLinkProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [strains, setStrains] = useState<VirusStrain[]>([])
  const [spreadRecords, setSpreadRecords] = useState<SpreadRecord[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [heatmapData, setHeatmapData] = useState<GeoHeatmapData[]>([])
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // 获取用户位置
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.error('获取位置失败:', error)
        }
      )
    }
  }, [])

  const addStrain = (strain: VirusStrain) => {
    setStrains(prev => [...prev, strain])
  }

  const addSpreadRecord = (record: SpreadRecord) => {
    setSpreadRecords(prev => [...prev, record])
  }

  const addTask = (task: Task) => {
    setTasks(prev => [...prev, task])
  }

  const value: FluLinkContextType = {
    user,
    setUser,
    strains,
    setStrains,
    addStrain,
    spreadRecords,
    setSpreadRecords,
    addSpreadRecord,
    tasks,
    setTasks,
    addTask,
    heatmapData,
    setHeatmapData,
    userLocation,
    setUserLocation,
    isLoading,
    setIsLoading
  }

  return (
    <FluLinkContext.Provider value={value}>
      {children}
    </FluLinkContext.Provider>
  )
}

export function useFluLink() {
  const context = useContext(FluLinkContext)
  if (context === undefined) {
    throw new Error('useFluLink must be used within a FluLinkProvider')
  }
  return context
}

