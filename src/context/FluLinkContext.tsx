"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface VirusStrain {
  id: string
  title: string
  type: string
  description: string
  location: {
    lat: number
    lng: number
    radius: number
  }
  spreadDelay: number
  tags: string[]
  mutations?: string[]
}

interface FluLinkContextType {
  strains: VirusStrain[]
  createStrain: (strain: VirusStrain) => void
  updateStrain: (strain: VirusStrain) => void
  deleteStrain: (id: string) => void
}

const FluLinkContext = createContext<FluLinkContextType | undefined>(undefined)

export function FluLinkProvider({ children }: { children: ReactNode }) {
  const [strains, setStrains] = useState<VirusStrain[]>([])

  useEffect(() => {
    // 从localStorage加载数据
    const savedStrains = localStorage.getItem('flulink-strains')
    if (savedStrains) {
      setStrains(JSON.parse(savedStrains))
    }
  }, [])

  useEffect(() => {
    // 保存数据到localStorage
    localStorage.setItem('flulink-strains', JSON.stringify(strains))
  }, [strains])

  const createStrain = (strain: VirusStrain) => {
    setStrains(prev => [...prev, strain])
  }

  const updateStrain = (updatedStrain: VirusStrain) => {
    setStrains(prev => prev.map(strain => 
      strain.id === updatedStrain.id ? updatedStrain : strain
    ))
  }

  const deleteStrain = (id: string) => {
    setStrains(prev => prev.filter(strain => strain.id !== id))
  }

  return (
    <FluLinkContext.Provider value={{
      strains,
      createStrain,
      updateStrain,
      deleteStrain
    }}>
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
