// 离线模式服务 - 当后端不可用时使用本地存储
import { User, UserService, StarSeed, Cluster } from '../types'

class OfflineService {
  private storageKey = 'flulink_offline_data'

  // 初始化离线数据
  initializeOfflineData() {
    const existingData = localStorage.getItem(this.storageKey)
    if (!existingData) {
      const defaultData = {
        users: [],
        userServices: [],
        starSeeds: [],
        clusters: [],
        currentUser: null,
        isOfflineMode: true
      }
      localStorage.setItem(this.storageKey, JSON.stringify(defaultData))
    }
  }

  // 获取离线数据
  private getOfflineData() {
    const data = localStorage.getItem(this.storageKey)
    return data ? JSON.parse(data) : { users: [], userServices: [], starSeeds: [], clusters: [], currentUser: null }
  }

  // 保存离线数据
  private saveOfflineData(data: any) {
    localStorage.setItem(this.storageKey, JSON.stringify(data))
  }

  // 用户认证模拟
  async login(username: string, password: string) {
    // 模拟登录成功
    const mockUser: User = {
      _id: 'offline_user_1',
      username: username,
      email: `${username}@offline.local`,
      avatar: '/default-avatar.png',
      tags: ['离线用户'],
      creditScore: 80,
      serviceSlots: { maxServices: 3, currentServices: 0 },
      location: {
        type: 'Point',
        coordinates: [116.3974, 39.9092] // 默认北京
      },
      isNewUser: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const data = this.getOfflineData()
    data.currentUser = mockUser
    this.saveOfflineData(data)

    return {
      success: true,
      data: {
        user: mockUser,
        token: 'offline_token_' + Date.now()
      },
      message: '离线模式登录成功'
    }
  }

  // 用户服务管理
  async publishService(serviceData: any) {
    const data = this.getOfflineData()
    const newService: UserService = {
      _id: 'service_' + Date.now(),
      userId: data.currentUser?._id || 'offline_user_1',
      serviceType: serviceData.serviceType,
      title: serviceData.title,
      description: serviceData.description,
      images: serviceData.images || [],
      location: serviceData.location || {
        type: 'Point',
        coordinates: [116.3974, 39.9092]
      },
      serviceRadius: serviceData.serviceRadius || 1.0,
      creditScore: data.currentUser?.creditScore || 80,
      moralStatus: 'active',
      ratings: { totalCount: 0, averageScore: 0, negativeRate: 0 },
      isActive: true,
      lastUpdated: new Date().toISOString(),
      daoQuote: '天道无亲，常与善人',
      metadata: { ipAddress: '127.0.0.1', userAgent: 'offline' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    data.userServices.push(newService)
    this.saveOfflineData(data)

    return {
      success: true,
      data: newService,
      message: '离线模式：服务发布成功！'
    }
  }

  async getMyServices() {
    const data = this.getOfflineData()
    const userServices = data.userServices.filter((service: UserService) => 
      service.userId === data.currentUser?._id
    )

    return {
      success: true,
      data: userServices,
      message: '离线模式：获取服务列表成功'
    }
  }

  async matchServices(need: string) {
    const data = this.getOfflineData()
    const matchedServices = data.userServices.filter((service: UserService) => 
      service.serviceType === need && service.isActive
    )

    return {
      success: true,
      data: matchedServices.slice(0, 5), // 限制返回5个
      message: '离线模式：匹配服务成功'
    }
  }

  // 星种管理
  async publishStarSeed(starSeedData: any) {
    const data = this.getOfflineData()
    const newStarSeed: StarSeed = {
      _id: 'starseed_' + Date.now(),
      userId: data.currentUser?._id || 'offline_user_1',
      content: starSeedData.content,
      spectrum: starSeedData.spectrum || ['离线'],
      luminosity: 50,
      interactions: { lights: 0, comments: 0, shares: 0 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    data.starSeeds.push(newStarSeed)
    this.saveOfflineData(data)

    return {
      success: true,
      data: newStarSeed,
      message: '离线模式：星种发布成功'
    }
  }

  async getStarSeeds() {
    const data = this.getOfflineData()
    return {
      success: true,
      data: data.starSeeds,
      message: '离线模式：获取星种列表成功'
    }
  }

  // 星团管理
  async generateCluster() {
    const data = this.getOfflineData()
    const newCluster: Cluster = {
      _id: 'cluster_' + Date.now(),
      members: [data.currentUser?._id || 'offline_user_1'],
      resonanceScore: 75,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    data.clusters.push(newCluster)
    this.saveOfflineData(data)

    return {
      success: true,
      data: newCluster,
      message: '离线模式：星团生成成功'
    }
  }

  // 健康检查
  async healthCheck() {
    return {
      success: true,
      message: 'FluLink离线模式正常运行',
      timestamp: new Date().toISOString(),
      version: '1.0.0-offline',
      mode: 'offline'
    }
  }

  // 检测是否应该使用离线模式
  async detectOfflineMode(): Promise<boolean> {
    try {
      const response = await fetch('https://flulink-backend-v2.zeabur.app/api/health', {
        method: 'GET',
        timeout: 3000
      })
      return !response.ok
    } catch (error) {
      return true
    }
  }

  // 启用离线模式
  enableOfflineMode() {
    localStorage.setItem('offline_mode', 'true')
    this.initializeOfflineData()
  }

  // 禁用离线模式
  disableOfflineMode() {
    localStorage.removeItem('offline_mode')
  }

  // 检查是否在离线模式
  isOfflineMode(): boolean {
    return localStorage.getItem('offline_mode') === 'true'
  }
}

export default new OfflineService()
