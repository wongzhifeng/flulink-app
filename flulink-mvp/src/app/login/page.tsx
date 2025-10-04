"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 保存用户信息到localStorage
      const user = {
        id: `user_${Date.now()}`,
        username: formData.username,
        email: formData.email,
        createdAt: new Date()
      }
      
      localStorage.setItem('flulink-user', JSON.stringify(user))
      
      // 跳转到仪表板
      router.push('/dashboard')
    } catch (error) {
      console.error('登录/注册失败:', error)
      alert(isLogin ? '登录失败，请重试' : '注册失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setFormData({ username: '', email: '', password: '', confirmPassword: '' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <span className="text-4xl">🦠</span>
          </div>
          <CardTitle className="text-2xl font-bold text-indigo-600">FluLink</CardTitle>
          <CardDescription>
            {isLogin ? '登录您的账户' : '创建新账户'}
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
            
            {!isLogin && (
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
            )}
            
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
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isLogin ? '没有账户？' : '已有账户？'}
              <button
                type="button"
                onClick={toggleMode}
                className="ml-1 text-indigo-600 hover:text-indigo-800 font-medium"
              >
                {isLogin ? '立即注册' : '立即登录'}
              </button>
            </p>
          </div>
          
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              返回主页
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}