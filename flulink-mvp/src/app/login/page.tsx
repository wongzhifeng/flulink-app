"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useFluLink } from '@/context/FluLinkContext'
import { User } from '@/types'
import { generateId } from '@/lib/utils'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const { setUser, setUserLocation } = useFluLink()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))

      const newUser: User = {
        id: generateId(),
        username: formData.username,
        email: formData.email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.username}`,
        bio: '',
        immunityTags: [],
        tier: 'free',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      setUser(newUser)
      router.push('/dashboard')
    } catch (error) {
      console.error('登录失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-indigo-600">
            🦠 FluLink
          </CardTitle>
          <CardDescription>
            {isLogin ? '欢迎回来，继续传播你的想法' : '加入我们，开始你的传播之旅'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                name="username"
                placeholder="用户名"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div>
              <Input
                name="email"
                type="email"
                placeholder="邮箱"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div>
              <Input
                name="password"
                type="password"
                placeholder="密码"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            
            {!isLogin && (
              <div>
                <Input
                  name="confirmPassword"
                  type="password"
                  placeholder="确认密码"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? '处理中...' : (isLogin ? '登录' : '注册')}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-indigo-600 hover:underline"
            >
              {isLogin ? '还没有账号？立即注册' : '已有账号？立即登录'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useFluLink } from '@/context/FluLinkContext'
import { User } from '@/types'
import { generateId } from '@/lib/utils'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const { setUser, setUserLocation } = useFluLink()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))

      const newUser: User = {
        id: generateId(),
        username: formData.username,
        email: formData.email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.username}`,
        bio: '',
        immunityTags: [],
        tier: 'free',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      setUser(newUser)
      router.push('/dashboard')
    } catch (error) {
      console.error('登录失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-indigo-600">
            🦠 FluLink
          </CardTitle>
          <CardDescription>
            {isLogin ? '欢迎回来，继续传播你的想法' : '加入我们，开始你的传播之旅'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                name="username"
                placeholder="用户名"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div>
              <Input
                name="email"
                type="email"
                placeholder="邮箱"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div>
              <Input
                name="password"
                type="password"
                placeholder="密码"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            
            {!isLogin && (
              <div>
                <Input
                  name="confirmPassword"
                  type="password"
                  placeholder="确认密码"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? '处理中...' : (isLogin ? '登录' : '注册')}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-indigo-600 hover:underline"
            >
              {isLogin ? '还没有账号？立即注册' : '已有账号？立即登录'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}



