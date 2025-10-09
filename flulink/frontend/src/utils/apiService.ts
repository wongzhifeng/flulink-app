import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios'
import { ApiResponse, User, StarSeed, Cluster, ResonanceValue } from '../types'

// 性能优化：API缓存接口
interface CacheItem {
  data: any
  timestamp: number
  ttl: number
}

// 第6次优化：增强API缓存类，添加智能缓存策略
class ApiCache {
  private cache = new Map<string, CacheItem>()
  private accessOrder = new Map<string, number>() // 访问顺序记录
  private maxSize = 100 // 最大缓存条目数
  private hitCount = 0 // 缓存命中次数
  private missCount = 0 // 缓存未命中次数

  set(key: string, data: any, ttl: number = 300000) { // 默认5分钟TTL
    // 优化6.1: 增强LRU缓存策略
    if (this.cache.size >= this.maxSize) {
      this.evictLeastRecentlyUsed()
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
    
    // 优化6.2: 记录访问顺序
    this.accessOrder.set(key, Date.now())
  }

  // 优化6.3: 新增LRU淘汰方法
  private evictLeastRecentlyUsed() {
    let oldestKey = ''
    let oldestTime = Infinity
    
    for (const [key, time] of this.accessOrder) {
      if (time < oldestTime) {
        oldestTime = time
        oldestKey = key
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey)
      this.accessOrder.delete(oldestKey)
    }
  }

  get(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) return null
    
    // 检查是否过期
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return item.data
  }

  clear() {
    this.cache.clear()
  }

  delete(key: string) {
    this.cache.delete(key)
  }
}

class ApiService {
  private api: AxiosInstance
  private cache = new ApiCache()
  private requestQueue = new Map<string, Promise<any>>() // 请求去重

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'https://flulink-backend-v2.zeabur.app/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // 性能优化：请求拦截器 - 添加缓存和去重逻辑
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        
        // 性能优化：为GET请求添加缓存键
        if (config.method === 'get') {
          const cacheKey = this.generateCacheKey(config)
          const cachedData = this.cache.get(cacheKey)
          if (cachedData) {
            // 返回缓存的Promise
            return Promise.reject({ 
              isCached: true, 
              data: cachedData,
              config 
            })
          }
        }
        
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // 性能优化：响应拦截器 - 处理缓存和去重
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        // 性能优化：缓存GET请求的响应
        if (response.config.method === 'get') {
          const cacheKey = this.generateCacheKey(response.config)
          this.cache.set(cacheKey, response.data, 300000) // 5分钟缓存
        }
        
        return response
      },
      (error) => {
        // 性能优化：处理缓存命中
        if (error.isCached) {
          return Promise.resolve({ data: error.data })
        }
        
        if (error.response?.status === 401) {
          localStorage.removeItem('token')
          window.location.href = '/auth'
        }
        return Promise.reject(error)
      }
    )
  }

  // 性能优化：生成缓存键
  private generateCacheKey(config: AxiosRequestConfig): string {
    const { method, url, params, data } = config
    return `${method}:${url}:${JSON.stringify(params)}:${JSON.stringify(data)}`
  }

  // 性能优化：请求去重
  private deduplicateRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    if (this.requestQueue.has(key)) {
      return this.requestQueue.get(key)!
    }
    
    const promise = requestFn().finally(() => {
      this.requestQueue.delete(key)
    })
    
    this.requestQueue.set(key, promise)
    return promise
  }

  // 性能优化：认证相关API - 添加去重
  async login(username: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    const requestKey = `login:${username}`
    return this.deduplicateRequest(requestKey, async () => {
      const response = await this.api.post('/auth/login', { username, password })
      return response.data
    })
  }

  async register(userData: { username: string; email: string; password: string }): Promise<ApiResponse<User>> {
    const response = await this.api.post('/auth/register', userData)
    return response.data
  }

  async phoneLogin(phone: string, code: string): Promise<ApiResponse<{ user: User; token: string }>> {
    const requestKey = `phoneLogin:${phone}:${code}`
    return this.deduplicateRequest(requestKey, async () => {
      const response = await this.api.post('/auth/phone-login', { phone, code })
      return response.data
    })
  }

  // 性能优化：用户相关API - 添加缓存
  async getUserProfile(): Promise<ApiResponse<User>> {
    const response = await this.api.get('/users/profile')
    return response.data
  }

  async updateUserProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    const response = await this.api.put('/users/profile', userData)
    // 性能优化：更新后清除相关缓存
    this.cache.clear()
    return response.data
  }

  async getUserTags(): Promise<ApiResponse<string[]>> {
    const response = await this.api.get('/users/tags')
    return response.data
  }

  async addUserTag(tag: string): Promise<ApiResponse<string[]>> {
    const response = await this.api.post('/users/tags', { tag })
    // 性能优化：更新后清除相关缓存
    this.cache.delete('get:/users/tags')
    return response.data
  }

  async removeUserTag(tag: string): Promise<ApiResponse<string[]>> {
    const response = await this.api.delete(`/users/tags/${tag}`)
    // 性能优化：更新后清除相关缓存
    this.cache.delete('get:/users/tags')
    return response.data
  }

  // 性能优化：星种相关API - 添加缓存和去重
  async publishStarSeed(starSeedData: {
    content: { text?: string; imageUrl?: string; audioUrl?: string }
    spectrum: string[]
  }): Promise<ApiResponse<StarSeed>> {
    const response = await this.api.post('/starseeds', starSeedData)
    // 性能优化：发布后清除星种列表缓存
    this.cache.delete('get:/starseeds')
    return response.data
  }

  async getStarSeeds(): Promise<ApiResponse<StarSeed[]>> {
    const response = await this.api.get('/starseeds')
    return response.data
  }

  async getStarSeedById(id: string): Promise<ApiResponse<StarSeed>> {
    const response = await this.api.get(`/starseeds/${id}`)
    return response.data
  }

  async lightStarSeed(id: string): Promise<ApiResponse<StarSeed>> {
    const requestKey = `light:${id}`
    return this.deduplicateRequest(requestKey, async () => {
      const response = await this.api.post(`/starseeds/${id}/light`)
      // 性能优化：点亮后清除相关缓存
      this.cache.delete(`get:/starseeds/${id}`)
      this.cache.delete('get:/starseeds')
      return response.data
    })
  }

  async commentStarSeed(id: string, comment: string): Promise<ApiResponse<StarSeed>> {
    const response = await this.api.post(`/starseeds/${id}/comment`, { comment })
    // 性能优化：评论后清除相关缓存
    this.cache.delete(`get:/starseeds/${id}`)
    return response.data
  }

  async shareStarSeed(id: string): Promise<ApiResponse<StarSeed>> {
    const requestKey = `share:${id}`
    return this.deduplicateRequest(requestKey, async () => {
      const response = await this.api.post(`/starseeds/${id}/share`)
      // 性能优化：分享后清除相关缓存
      this.cache.delete(`get:/starseeds/${id}`)
      return response.data
    })
  }

  // 性能优化：星团相关API - 添加缓存和去重
  async generateCluster(): Promise<ApiResponse<Cluster>> {
    const response = await this.api.post('/clusters/generate')
    // 性能优化：生成星团后清除相关缓存
    this.cache.delete('get:/clusters/current')
    return response.data
  }

  async getClusterById(id: string): Promise<ApiResponse<Cluster>> {
    const response = await this.api.get(`/clusters/${id}`)
    return response.data
  }

  async getCurrentCluster(): Promise<ApiResponse<Cluster>> {
    const response = await this.api.get('/clusters/current')
    return response.data
  }

  async dissolveCluster(id: string): Promise<ApiResponse<void>> {
    const response = await this.api.post(`/clusters/${id}/dissolve`)
    // 性能优化：解散星团后清除相关缓存
    this.cache.delete('get:/clusters/current')
    this.cache.delete(`get:/clusters/${id}`)
    return response.data
  }

  // 性能优化：共鸣相关API - 添加缓存
  async calculateResonance(userIdA: string, userIdB: string): Promise<ApiResponse<ResonanceValue>> {
    const requestKey = `resonance:${userIdA}:${userIdB}`
    return this.deduplicateRequest(requestKey, async () => {
      const response = await this.api.post('/resonance/calculate', { userIdA, userIdB })
      return response.data
    })
  }

  async getResonanceHistory(): Promise<ApiResponse<ResonanceValue[]>> {
    const response = await this.api.get('/resonance/history')
    return response.data
  }

  // 性能优化：文件上传API - 添加进度监控
  async uploadImage(file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData()
    formData.append('image', file)
    
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent: any) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      }
    }
    
    const response = await this.api.post('/upload/image', formData, config)
    return response.data
  }

  // 性能优化：批量API调用
  async batchRequest<T>(requests: Array<() => Promise<T>>): Promise<T[]> {
    return Promise.all(requests.map(request => request()))
  }

  // 性能优化：清除所有缓存
  clearCache(): void {
    this.cache.clear()
  }

  // 性能优化：获取缓存统计
  getCacheStats(): { size: number; maxSize: number } {
    return {
      size: this.cache['cache'].size,
      maxSize: this.cache['maxSize']
    }
  }

  // 添加缺失的HTTP方法
  get(url: string, config?: any) {
    return this.api.get(url, config)
  }

  post(url: string, data?: any, config?: any) {
    return this.api.post(url, data, config)
  }

  put(url: string, data?: any, config?: any) {
    return this.api.put(url, data, config)
  }

  delete(url: string, config?: any) {
    return this.api.delete(url, config)
  }
}

export default new ApiService()

