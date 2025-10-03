// 监控配置 - Zeabur兼容
export interface MonitoringConfig {
  system: {
    cpuThreshold: number; // CPU使用率阈值
    memoryThreshold: number; // 内存使用率阈值
    diskThreshold: number; // 磁盘使用率阈值
  };
  performance: {
    responseTimeThreshold: number; // 响应时间阈值（毫秒）
    errorRateThreshold: number; // 错误率阈值
    throughputThreshold: number; // 吞吐量阈值
  };
  business: {
    userActivityThreshold: number; // 用户活跃度阈值
    strainSpreadThreshold: number; // 毒株传播阈值
    taskCompletionThreshold: number; // 任务完成率阈值
  };
  alerting: {
    enabled: boolean;
    channels: string[]; // 告警渠道
    cooldown: number; // 告警冷却时间（分钟）
  };
}

export interface SystemMetrics {
  cpu: {
    usage: number; // CPU使用率 0-100
    cores: number; // CPU核心数
    loadAverage: number[]; // 负载平均值
  };
  memory: {
    total: number; // 总内存（字节）
    used: number; // 已使用内存（字节）
    free: number; // 空闲内存（字节）
    usage: number; // 内存使用率 0-100
  };
  disk: {
    total: number; // 总磁盘空间（字节）
    used: number; // 已使用磁盘空间（字节）
    free: number; // 空闲磁盘空间（字节）
    usage: number; // 磁盘使用率 0-100
  };
  network: {
    bytesIn: number; // 入站字节数
    bytesOut: number; // 出站字节数
    packetsIn: number; // 入站数据包数
    packetsOut: number; // 出站数据包数
  };
}

export interface PerformanceMetrics {
  responseTime: {
    average: number; // 平均响应时间（毫秒）
    p50: number; // 50分位数响应时间
    p95: number; // 95分位数响应时间
    p99: number; // 99分位数响应时间
  };
  throughput: {
    requestsPerSecond: number; // 每秒请求数
    requestsPerMinute: number; // 每分钟请求数
    requestsPerHour: number; // 每小时请求数
  };
  errorRate: {
    total: number; // 总错误数
    rate: number; // 错误率 0-1
    byType: Record<string, number>; // 按类型分组的错误数
  };
}

export interface BusinessMetrics {
  users: {
    total: number; // 总用户数
    active: number; // 活跃用户数
    new: number; // 新用户数
    retention: number; // 用户留存率 0-1
  };
  strains: {
    total: number; // 总毒株数
    active: number; // 活跃毒株数
    spread: number; // 传播中的毒株数
    completed: number; // 完成的毒株数
  };
  tasks: {
    total: number; // 总任务数
    pending: number; // 待处理任务数
    active: number; // 进行中任务数
    completed: number; // 已完成任务数
    completionRate: number; // 任务完成率 0-1
  };
}

export interface Alert {
  id: string;
  type: 'system' | 'performance' | 'business';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  metric: string;
  value: number;
  threshold: number;
  timestamp: string;
  resolved: boolean;
  resolvedAt?: string;
}

export interface MonitoringStats {
  systemHealth: 'healthy' | 'warning' | 'critical';
  performanceHealth: 'healthy' | 'warning' | 'critical';
  businessHealth: 'healthy' | 'warning' | 'critical';
  overallHealth: 'healthy' | 'warning' | 'critical';
  activeAlerts: number;
  totalAlerts: number;
  uptime: number; // 系统运行时间（秒）
  lastUpdated: string;
}

// Zeabur环境变量配置
export const getMonitoringConfig = (): MonitoringConfig => {
  return {
    system: {
      cpuThreshold: parseInt(process.env.CPU_THRESHOLD || '80'),
      memoryThreshold: parseInt(process.env.MEMORY_THRESHOLD || '85'),
      diskThreshold: parseInt(process.env.DISK_THRESHOLD || '90'),
    },
    performance: {
      responseTimeThreshold: parseInt(process.env.RESPONSE_TIME_THRESHOLD || '1000'),
      errorRateThreshold: parseFloat(process.env.ERROR_RATE_THRESHOLD || '0.05'),
      throughputThreshold: parseInt(process.env.THROUGHPUT_THRESHOLD || '1000'),
    },
    business: {
      userActivityThreshold: parseInt(process.env.USER_ACTIVITY_THRESHOLD || '50'),
      strainSpreadThreshold: parseInt(process.env.STRAIN_SPREAD_THRESHOLD || '10'),
      taskCompletionThreshold: parseFloat(process.env.TASK_COMPLETION_THRESHOLD || '0.8'),
    },
    alerting: {
      enabled: process.env.ALERTING_ENABLED === 'true',
      channels: (process.env.ALERT_CHANNELS || 'email,webhook').split(','),
      cooldown: parseInt(process.env.ALERT_COOLDOWN || '15'),
    },
  };
};

