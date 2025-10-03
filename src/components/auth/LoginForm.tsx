"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface LoginFormProps {
  onSuccess?: () => void
  onError?: (error: string) => void
  redirectTo?: string
  showRegisterLink?: boolean
}

export default function LoginForm({
  onSuccess,
  onError,
  redirectTo = '/dashboard',
  showRegisterLink = true
}: LoginFormProps) {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // 简单的登录逻辑 - 后续可替换为真实API调用
      if (username && password) {
        const userData = {
          username,
          id: Date.now().toString(),
          loginTime: new Date().toISOString()
        }

        localStorage.setItem('flulink-user', JSON.stringify(userData))

        // 触发成功回调
        if (onSuccess) {
          onSuccess()
        }

        // 重定向
        router.push(redirectTo)
      } else {
        throw new Error('请输入用户名和密码')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '登录失败'
      if (onError) {
        onError(errorMessage)
      } else {
        console.error('Login error:', errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegisterClick = () => {
    router.push('/register')
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-indigo-600">🦠 FluLink</CardTitle>
        <CardDescription>登录到您的账户</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="username">用户名</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              required
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? '登录中...' : '登录'}
          </Button>
        </form>

        {showRegisterLink && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              没有账户？
              <span
                className="text-indigo-600 cursor-pointer hover:underline ml-1"
                onClick={handleRegisterClick}
              >
                立即注册
              </span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}