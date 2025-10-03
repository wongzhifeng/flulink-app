"use client"

import { FluLinkProvider } from '@/context/FluLinkContext'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // 检查是否有用户登录状态
    const user = localStorage.getItem('flulink-user')
    if (user) {
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-indigo-600 mb-4">🦠 FluLink</h1>
        <p className="text-gray-600 mb-8">如流感般扩散，连接你在意的每个角落</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
      </div>
    </div>
  )
}

