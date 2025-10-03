"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, User, Mail, Lock, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RegisterFormProps {
  onSuccess?: () => void
  onError?: (error: string) => void
  redirectTo?: string
  showLoginLink?: boolean
  className?: string
}

interface FormData {
  username: string
  email: string
  password: string
  confirmPassword: string
  agreeToTerms: boolean
}

interface ValidationErrors {
  username?: string
  email?: string
  password?: string
  confirmPassword?: string
  agreeToTerms?: string
}

export default function RegisterForm({
  onSuccess,
  onError,
  redirectTo = '/dashboard',
  showLoginLink = true,
  className
}: RegisterFormProps) {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  })
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {}

    // Username validation
    if (!formData.username.trim()) {
      errors.username = '用户名不能为空'
    } else if (formData.username.length < 3) {
      errors.username = '用户名至少需要3个字符'
    } else if (formData.username.length > 20) {
      errors.username = '用户名不能超过20个字符'
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = '邮箱不能为空'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = '请输入有效的邮箱地址'
    }

    // Password validation
    if (!formData.password) {
      errors.password = '密码不能为空'
    } else if (formData.password.length < 6) {
      errors.password = '密码至少需要6个字符'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = '密码必须包含大小写字母和数字'
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = '请确认密码'
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = '两次输入的密码不一致'
    }

    // Terms agreement validation
    if (!formData.agreeToTerms) {
      errors.agreeToTerms = '请同意用户协议和隐私政策'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Mock successful registration
      localStorage.setItem('flulink_user', JSON.stringify({
        username: formData.username,
        email: formData.email,
        isLoggedIn: true,
        tier: 'free',
        createdAt: new Date().toISOString()
      }))

      onSuccess?.()

      if (redirectTo) {
        window.location.href = redirectTo
      }
    } catch (error) {
      onError?.(error instanceof Error ? error.message : '注册失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // Clear validation error for this field when user starts typing
    if (validationErrors[field as keyof ValidationErrors]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
    if (!password) return { strength: 0, label: '弱', color: 'text-red-500' }

    let strength = 0
    if (password.length >= 6) strength += 1
    if (/[a-z]/.test(password)) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/\d/.test(password)) strength += 1
    if (/[^a-zA-Z\d]/.test(password)) strength += 1

    if (strength <= 2) return { strength, label: '弱', color: 'text-red-500' }
    if (strength <= 3) return { strength, label: '中', color: 'text-yellow-500' }
    return { strength, label: '强', color: 'text-green-500' }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">注册 FluLink</CardTitle>
        <CardDescription>
          创建账户开始传播你的毒株
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Field */}
          <div className="space-y-2">
            <Label htmlFor="username" className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              用户名
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="请输入用户名"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className={validationErrors.username ? "border-red-500" : ""}
              disabled={isLoading}
            />
            {validationErrors.username && (
              <p className="text-sm text-red-500">{validationErrors.username}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              邮箱地址
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="请输入邮箱地址"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={validationErrors.email ? "border-red-500" : ""}
              disabled={isLoading}
            />
            {validationErrors.email && (
              <p className="text-sm text-red-500">{validationErrors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center">
              <Lock className="w-4 h-4 mr-2" />
              密码
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="请输入密码"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={validationErrors.password ? "border-red-500 pr-10" : "pr-10"}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {formData.password && (
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      passwordStrength.strength <= 2 ? 'bg-red-500' :
                      passwordStrength.strength <= 3 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                  />
                </div>
                <span className={`text-xs ${passwordStrength.color}`}>
                  {passwordStrength.label}
                </span>
              </div>
            )}
            {validationErrors.password && (
              <p className="text-sm text-red-500">{validationErrors.password}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">确认密码</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="请再次输入密码"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={validationErrors.confirmPassword ? "border-red-500 pr-10" : "pr-10"}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {validationErrors.confirmPassword && (
              <p className="text-sm text-red-500">{validationErrors.confirmPassword}</p>
            )}
          </div>

          {/* Terms Agreement */}
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <input
                id="agreeToTerms"
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                className="mt-1"
                disabled={isLoading}
              />
              <Label htmlFor="agreeToTerms" className="text-sm font-normal">
                我已阅读并同意
                <a href="/terms" className="text-blue-600 hover:underline ml-1">
                  用户协议
                </a>
                和
                <a href="/privacy" className="text-blue-600 hover:underline ml-1">
                  隐私政策
                </a>
              </Label>
            </div>
            {validationErrors.agreeToTerms && (
              <p className="text-sm text-red-500">{validationErrors.agreeToTerms}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                注册中...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                注册账户
              </>
            )}
          </Button>

          {/* Login Link */}
          {showLoginLink && (
            <div className="text-center text-sm">
              <span className="text-gray-600">已有账户？</span>
              <a href="/login" className="text-blue-600 hover:underline font-medium ml-1">
                立即登录
              </a>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}