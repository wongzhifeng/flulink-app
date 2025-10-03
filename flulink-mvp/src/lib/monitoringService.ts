import { 
  MonitoringConfig, 
  SystemMetrics, 
  PerformanceMetrics, 
  BusinessMetrics, 
  Alert, 
  MonitoringStats 
} from '../types/monitoring';

// 监控服务类 - Zeabur兼容
class MonitoringService {
  private config: MonitoringConfig;
  private systemMetrics: SystemMetrics;
  private performanceMetrics: PerformanceMetrics;
  private businessMetrics: BusinessMetrics;
  private alerts: Alert[] = [];
  private stats: MonitoringStats;
  private isInitialized: boolean = false;

  constructor() {
    this.config = this.getConfig();
    this.systemMetrics = this.getDefaultSystemMetrics();
    this.performanceMetrics = this.getDefaultPerformanceMetrics();
    this.businessMetrics = this.getDefaultBusinessMetrics();
    this.stats = this.getDefaultStats();
  }

  private getConfig(): MonitoringConfig {
    // Zeabur环境变量处理
    const env = typeof window === 'undefined' ? {} : {};
    
    return {
      system: {
        cpuThreshold: 80,
        memoryThreshold: 85,
        diskThreshold: 90,
      },
      performance: {
        responseTimeThreshold: 1000,
        errorRateThreshold: 0.05,
        throughputThreshold: 1000,
      },
      business: {
        userActivityThreshold: 50,
        strainSpreadThreshold: 10,
        taskCompletionThreshold: 0.8,
      },
      alerting: {
        enabled: true,
        channels: ['email', 'webhook'],
        cooldown: 15,
      },
    };
  }

  // 初始化监控服务
  async initialize(): Promise<boolean> {
    try {
      // 在Zeabur环境中，监控通常由平台自动管理
      // 这里模拟初始化成功
      this.isInitialized = true;
      
      // 启动定期监控
      this.startPeriodicMonitoring();
      
      console.log('Monitoring service initialized successfully');
      return true;
    } catch (error) {
      console.error('Monitoring initialization failed:', error);
      return false;
    }
  }

  // 获取系统指标
  async getSystemMetrics(): Promise<SystemMetrics> {
    try {
      // 模拟系统指标收集
      this.systemMetrics = {
        cpu: {
          usage: Math.random() * 100,
          cores: 4,
          loadAverage: [Math.random() * 2, Math.random() * 2, Math.random() * 2],
        },
        memory: {
          total: 8 * 1024 * 1024 * 1024, // 8GB
          used: Math.random() * 6 * 1024 * 1024 * 1024, // 0-6GB
          free: 0,
          usage: 0,
        },
        disk: {
          total: 100 * 1024 * 1024 * 1024, // 100GB
          used: Math.random() * 80 * 1024 * 1024 * 1024, // 0-80GB
          free: 0,
          usage: 0,
        },
        network: {
          bytesIn: Math.random() * 1000000,
          bytesOut: Math.random() * 1000000,
          packetsIn: Math.random() * 10000,
          packetsOut: Math.random() * 10000,
        },
      };

      // 计算使用率
      this.systemMetrics.memory.free = this.systemMetrics.memory.total - this.systemMetrics.memory.used;
      this.systemMetrics.memory.usage = (this.systemMetrics.memory.used / this.systemMetrics.memory.total) * 100;
      
      this.systemMetrics.disk.free = this.systemMetrics.disk.total - this.systemMetrics.disk.used;
      this.systemMetrics.disk.usage = (this.systemMetrics.disk.used / this.systemMetrics.disk.total) * 100;

      return { ...this.systemMetrics };
    } catch (error) {
      console.error('Failed to get system metrics:', error);
      return this.systemMetrics;
    }
  }

  // 获取性能指标
  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    try {
      // 模拟性能指标收集
      this.performanceMetrics = {
        responseTime: {
          average: Math.random() * 500 + 100,
          p50: Math.random() * 300 + 50,
          p95: Math.random() * 800 + 200,
          p99: Math.random() * 1200 + 500,
        },
        throughput: {
          requestsPerSecond: Math.random() * 100 + 10,
          requestsPerMinute: Math.random() * 6000 + 600,
          requestsPerHour: Math.random() * 360000 + 36000,
        },
        errorRate: {
          total: Math.floor(Math.random() * 100),
          rate: Math.random() * 0.1,
          byType: {
            '4xx': Math.floor(Math.random() * 50),
            '5xx': Math.floor(Math.random() * 20),
            'timeout': Math.floor(Math.random() * 10),
            'network': Math.floor(Math.random() * 5),
          },
        },
      };

      return { ...this.performanceMetrics };
    } catch (error) {
      console.error('Failed to get performance metrics:', error);
      return this.performanceMetrics;
    }
  }

  // 获取业务指标
  async getBusinessMetrics(): Promise<BusinessMetrics> {
    try {
      // 模拟业务指标收集
      this.businessMetrics = {
        users: {
          total: Math.floor(Math.random() * 10000 + 1000),
          active: Math.floor(Math.random() * 1000 + 100),
          new: Math.floor(Math.random() * 100 + 10),
          retention: Math.random() * 0.3 + 0.7,
        },
        strains: {
          total: Math.floor(Math.random() * 5000 + 500),
          active: Math.floor(Math.random() * 500 + 50),
          spread: Math.floor(Math.random() * 100 + 10),
          completed: Math.floor(Math.random() * 1000 + 100),
        },
        tasks: {
          total: Math.floor(Math.random() * 2000 + 200),
          pending: Math.floor(Math.random() * 200 + 20),
          active: Math.floor(Math.random() * 100 + 10),
          completed: Math.floor(Math.random() * 1000 + 100),
          completionRate: Math.random() * 0.2 + 0.8,
        },
      };

      return { ...this.businessMetrics };
    } catch (error) {
      console.error('Failed to get business metrics:', error);
      return this.businessMetrics;
    }
  }

  // 获取监控统计
  async getMonitoringStats(): Promise<MonitoringStats> {
    try {
      const systemMetrics = await this.getSystemMetrics();
      const performanceMetrics = await this.getPerformanceMetrics();
      const businessMetrics = await this.getBusinessMetrics();

      // 计算健康状态
      const systemHealth = this.calculateSystemHealth(systemMetrics);
      const performanceHealth = this.calculatePerformanceHealth(performanceMetrics);
      const businessHealth = this.calculateBusinessHealth(businessMetrics);
      const overallHealth = this.calculateOverallHealth(systemHealth, performanceHealth, businessHealth);

      this.stats = {
        systemHealth,
        performanceHealth,
        businessHealth,
        overallHealth,
        activeAlerts: this.alerts.filter(alert => !alert.resolved).length,
        totalAlerts: this.alerts.length,
        uptime: Date.now() - (this.stats?.uptime || Date.now()),
        lastUpdated: new Date().toISOString(),
      };

      return { ...this.stats };
    } catch (error) {
      console.error('Failed to get monitoring stats:', error);
      return this.stats;
    }
  }

  // 获取告警列表
  getAlerts(limit: number = 50): Alert[] {
    return this.alerts
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  // 创建告警
  createAlert(
    type: Alert['type'],
    severity: Alert['severity'],
    title: string,
    message: string,
    metric: string,
    value: number,
    threshold: number
  ): Alert {
    const alert: Alert = {
      id: this.generateId(),
      type,
      severity,
      title,
      message,
      metric,
      value,
      threshold,
      timestamp: new Date().toISOString(),
      resolved: false,
    };

    this.alerts.push(alert);
    return alert;
  }

  // 解决告警
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  // 健康检查
  async healthCheck(): Promise<boolean> {
    try {
      const stats = await this.getMonitoringStats();
      return stats.overallHealth !== 'critical';
    } catch (error) {
      console.error('Monitoring health check failed:', error);
      return false;
    }
  }

  // 私有方法
  private getDefaultSystemMetrics(): SystemMetrics {
    return {
      cpu: { usage: 0, cores: 0, loadAverage: [] },
      memory: { total: 0, used: 0, free: 0, usage: 0 },
      disk: { total: 0, used: 0, free: 0, usage: 0 },
      network: { bytesIn: 0, bytesOut: 0, packetsIn: 0, packetsOut: 0 },
    };
  }

  private getDefaultPerformanceMetrics(): PerformanceMetrics {
    return {
      responseTime: { average: 0, p50: 0, p95: 0, p99: 0 },
      throughput: { requestsPerSecond: 0, requestsPerMinute: 0, requestsPerHour: 0 },
      errorRate: { total: 0, rate: 0, byType: {} },
    };
  }

  private getDefaultBusinessMetrics(): BusinessMetrics {
    return {
      users: { total: 0, active: 0, new: 0, retention: 0 },
      strains: { total: 0, active: 0, spread: 0, completed: 0 },
      tasks: { total: 0, pending: 0, active: 0, completed: 0, completionRate: 0 },
    };
  }

  private getDefaultStats(): MonitoringStats {
    return {
      systemHealth: 'healthy',
      performanceHealth: 'healthy',
      businessHealth: 'healthy',
      overallHealth: 'healthy',
      activeAlerts: 0,
      totalAlerts: 0,
      uptime: 0,
      lastUpdated: new Date().toISOString(),
    };
  }

  private calculateSystemHealth(metrics: SystemMetrics): 'healthy' | 'warning' | 'critical' {
    if (metrics.cpu.usage > this.config.system.cpuThreshold ||
        metrics.memory.usage > this.config.system.memoryThreshold ||
        metrics.disk.usage > this.config.system.diskThreshold) {
      return 'critical';
    }
    if (metrics.cpu.usage > this.config.system.cpuThreshold * 0.8 ||
        metrics.memory.usage > this.config.system.memoryThreshold * 0.8 ||
        metrics.disk.usage > this.config.system.diskThreshold * 0.8) {
      return 'warning';
    }
    return 'healthy';
  }

  private calculatePerformanceHealth(metrics: PerformanceMetrics): 'healthy' | 'warning' | 'critical' {
    if (metrics.responseTime.average > this.config.performance.responseTimeThreshold ||
        metrics.errorRate.rate > this.config.performance.errorRateThreshold) {
      return 'critical';
    }
    if (metrics.responseTime.average > this.config.performance.responseTimeThreshold * 0.8 ||
        metrics.errorRate.rate > this.config.performance.errorRateThreshold * 0.8) {
      return 'warning';
    }
    return 'healthy';
  }

  private calculateBusinessHealth(metrics: BusinessMetrics): 'healthy' | 'warning' | 'critical' {
    if (metrics.users.active < this.config.business.userActivityThreshold * 0.5 ||
        metrics.tasks.completionRate < this.config.business.taskCompletionThreshold * 0.5) {
      return 'critical';
    }
    if (metrics.users.active < this.config.business.userActivityThreshold ||
        metrics.tasks.completionRate < this.config.business.taskCompletionThreshold) {
      return 'warning';
    }
    return 'healthy';
  }

  private calculateOverallHealth(
    systemHealth: 'healthy' | 'warning' | 'critical',
    performanceHealth: 'healthy' | 'warning' | 'critical',
    businessHealth: 'healthy' | 'warning' | 'critical'
  ): 'healthy' | 'warning' | 'critical' {
    if (systemHealth === 'critical' || performanceHealth === 'critical' || businessHealth === 'critical') {
      return 'critical';
    }
    if (systemHealth === 'warning' || performanceHealth === 'warning' || businessHealth === 'warning') {
      return 'warning';
    }
    return 'healthy';
  }

  private startPeriodicMonitoring(): void {
    // 每30秒收集一次指标
    setInterval(async () => {
      try {
        await this.collectMetrics();
        await this.checkAlerts();
      } catch (error) {
        console.error('Periodic monitoring error:', error);
      }
    }, 30000);
  }

  private async collectMetrics(): Promise<void> {
    await this.getSystemMetrics();
    await this.getPerformanceMetrics();
    await this.getBusinessMetrics();
  }

  private async checkAlerts(): Promise<void> {
    // 检查系统告警
    if (this.systemMetrics.cpu.usage > this.config.system.cpuThreshold) {
      this.createAlert(
        'system',
        'high',
        'CPU使用率过高',
        `CPU使用率达到 ${this.systemMetrics.cpu.usage.toFixed(1)}%`,
        'cpu.usage',
        this.systemMetrics.cpu.usage,
        this.config.system.cpuThreshold
      );
    }

    // 检查性能告警
    if (this.performanceMetrics.responseTime.average > this.config.performance.responseTimeThreshold) {
      this.createAlert(
        'performance',
        'medium',
        '响应时间过长',
        `平均响应时间达到 ${this.performanceMetrics.responseTime.average.toFixed(0)}ms`,
        'responseTime.average',
        this.performanceMetrics.responseTime.average,
        this.config.performance.responseTimeThreshold
      );
    }

    // 检查业务告警
    if (this.businessMetrics.users.active < this.config.business.userActivityThreshold) {
      this.createAlert(
        'business',
        'low',
        '用户活跃度低',
        `活跃用户数仅为 ${this.businessMetrics.users.active}`,
        'users.active',
        this.businessMetrics.users.active,
        this.config.business.userActivityThreshold
      );
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}

// 创建单例实例
export const monitoringService = new MonitoringService();

// 初始化监控服务
if (typeof window === 'undefined') {
  // 只在服务端初始化
  monitoringService.initialize().catch(console.error);
}

