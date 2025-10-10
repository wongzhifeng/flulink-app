import { performance } from 'perf_hooks';
import { EventEmitter } from 'events';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// interface PerformanceProfile {
  functionName: string;
  fileName: string;
  lineNumber: number;
  callCount: number;
  totalTime: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  memoryUsage: number;
  cpuUsage: number;
}

// interface MemoryProfile {
  timestamp: number;
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
  arrayBuffers: number;
}

// interface CPUTimeProfile {
  timestamp: number;
  user: number;
  system: number;
}

// interface PerformanceReport {
  timestamp: string;
  duration: number;
  profiles: PerformanceProfile[];
  memorySnapshots: MemoryProfile[];
  cpuSnapshots: CPUTimeProfile[];
  bottlenecks: string[];
  recommendations: string[];
  summary: {
    totalFunctions: number;
    slowestFunction: string;
    memoryPeak: number;
    cpuPeak: number;
    averageResponseTime: number;
  };
}

class AdvancedPerformanceProfiler extends EventEmitter {
  private profiles: Map<string, PerformanceProfile> = new Map();
  private memorySnapshots: MemoryProfile[] = [];
  private cpuSnapshots: CPUTimeProfile[] = [];
  private isProfiling: boolean = false;
  private profilingInterval: NodeJS.Timeout | null = null;
  private startTime: number = 0;

  constructor() {
    super();
    this.setupProfiling();
  }

  // 设置性能分析
  private setupProfiling() {
    // 监控内存使用
    process.on('beforeExit', () => {
      this.captureMemorySnapshot();
    });

    // 监控未捕获的异常
    process.on('uncaughtException', (error) => {
      this.captureMemorySnapshot();
      this.emit('error', error);
    });

    process.on('unhandledRejection', (reason) => {
      this.captureMemorySnapshot();
      this.emit('error', reason);
    });
  }

  // 开始性能分析
  startProfiling(): void {
    if (this.isProfiling) {
      console.warn('性能分析已在运行中');
      return;
    }

    this.isProfiling = true;
    this.startTime = performance.now();
    
    // 每5秒捕获一次内存和CPU快照
    this.profilingInterval = setInterval(() => {
      this.captureMemorySnapshot();
      this.captureCPUSnapshot();
    }, 5000);

    console.log('🚀 性能分析已启动');
    this.emit('profiling_started');
  }

  // 停止性能分析
  stopProfiling(): PerformanceReport {
    if (!this.isProfiling) {
      throw new Error('性能分析未在运行');
    }

    this.isProfiling = false;
    
    if (this.profilingInterval) {
      clearInterval(this.profilingInterval);
      this.profilingInterval = null;
    }

    const endTime = performance.now();
    const duration = endTime - this.startTime;

    // 捕获最终快照
    this.captureMemorySnapshot();
    this.captureCPUSnapshot();

    const report = this.generateReport(duration);
    
    console.log('⏹️ 性能分析已停止');
    this.emit('profiling_stopped', report);
    
    return report;
  }

  // 分析函数性能
  profileFunction<T>(
    functionName: string,
    fileName: string,
    lineNumber: number,
    fn: () => T
  ): T {
    const startTime = performance.now();
    const startMemory = process.memoryUsage();
    const startCPU = process.cpuUsage();

    let result: T;
    let error: Error | null = null;

    try {
      result = fn();
    } catch (err) {
      error = err as Error;
      throw err;
    } finally {
      const endTime = performance.now();
      const endMemory = process.memoryUsage();
      const endCPU = process.cpuUsage();

      const executionTime = endTime - startTime;
      const memoryDelta = endMemory.heapUsed - startMemory.heapUsed;
      const cpuDelta = (endCPU.user - startCPU.user) + (endCPU.system - startCPU.system);

      this.recordFunctionProfile({
        functionName,
        fileName,
        lineNumber,
        executionTime,
        memoryDelta,
        cpuDelta
      });
    }

    return result;
  }

  // 记录函数性能数据
  private recordFunctionProfile(data: {
    functionName: string;
    fileName: string;
    lineNumber: number;
    executionTime: number;
    memoryDelta: number;
    cpuDelta: number;
  }): void {
    const key = `${data.fileName}:${data.lineNumber}:${data.functionName}`;
    
    let profile = this.profiles.get(key);
    if (!profile) {
      profile = {
        functionName: data.functionName,
        fileName: data.fileName,
        lineNumber: data.lineNumber,
        callCount: 0,
        totalTime: 0,
        averageTime: 0,
        minTime: Infinity,
        maxTime: 0,
        memoryUsage: 0,
        cpuUsage: 0
      };
    }

    profile.callCount++;
    profile.totalTime += data.executionTime;
    profile.averageTime = profile.totalTime / profile.callCount;
    profile.minTime = Math.min(profile.minTime, data.executionTime);
    profile.maxTime = Math.max(profile.maxTime, data.executionTime);
    profile.memoryUsage += data.memoryDelta;
    profile.cpuUsage += data.cpuDelta;

    this.profiles.set(key, profile);
  }

  // 捕获内存快照
  private captureMemorySnapshot(): void {
    const memoryUsage = process.memoryUsage();
    const snapshot: MemoryProfile = {
      timestamp: Date.now(),
      heapUsed: memoryUsage.heapUsed,
      heapTotal: memoryUsage.heapTotal,
      external: memoryUsage.external,
      rss: memoryUsage.rss,
      arrayBuffers: memoryUsage.arrayBuffers
    };

    this.memorySnapshots.push(snapshot);
    
    // 保持最近1000个快照
    if (this.memorySnapshots.length > 1000) {
      this.memorySnapshots = this.memorySnapshots.slice(-1000);
    }

    this.emit('memory_snapshot', snapshot);
  }

  // 捕获CPU快照
  private captureCPUSnapshot(): void {
    const cpuUsage = process.cpuUsage();
    const snapshot: CPUTimeProfile = {
      timestamp: Date.now(),
      user: cpuUsage.user,
      system: cpuUsage.system
    };

    this.cpuSnapshots.push(snapshot);
    
    // 保持最近1000个快照
    if (this.cpuSnapshots.length > 1000) {
      this.cpuSnapshots = this.cpuSnapshots.slice(-1000);
    }

    this.emit('cpu_snapshot', snapshot);
  }

  // 生成性能报告
  private generateReport(duration: number): PerformanceReport {
    const profiles = Array.from(this.profiles.values());
    
    // 找出性能瓶颈
    const bottlenecks = this.identifyBottlenecks(profiles);
    
    // 生成建议
    const recommendations = this.generateRecommendations(profiles, bottlenecks);
    
    // 计算统计信息
    const summary = this.calculateSummary(profiles);

    return {
      timestamp: new Date().toISOString(),
      duration,
      profiles,
      memorySnapshots: this.memorySnapshots,
      cpuSnapshots: this.cpuSnapshots,
      bottlenecks,
      recommendations,
      summary
    };
  }

  // 识别性能瓶颈
  private identifyBottlenecks(profiles: PerformanceProfile[]): string[] {
    const bottlenecks: string[] = [];
    
    // 按平均执行时间排序
    const sortedByTime = profiles.sort((a, b) => b.averageTime - a.averageTime);
    
    // 找出最慢的10%函数
    const slowestCount = Math.max(1, Math.floor(profiles.length * 0.1));
    const slowestFunctions = sortedByTime.slice(0, slowestCount);
    
    slowestFunctions.forEach(profile => {
      if (profile.averageTime > 100) { // 超过100ms
        bottlenecks.push(`${profile.functionName} (${profile.fileName}:${profile.lineNumber}) - 平均 ${profile.averageTime.toFixed(2)}ms`);
      }
    });

    // 找出内存使用最多的函数
    const sortedByMemory = profiles.sort((a, b) => b.memoryUsage - a.memoryUsage);
    const memoryHeavyCount = Math.max(1, Math.floor(profiles.length * 0.1));
    const memoryHeavyFunctions = sortedByMemory.slice(0, memoryHeavyCount);
    
    memoryHeavyFunctions.forEach(profile => {
      if (profile.memoryUsage > 1024 * 1024) { // 超过1MB
        bottlenecks.push(`${profile.functionName} (${profile.fileName}:${profile.lineNumber}) - 内存使用 ${(profile.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
      }
    });

    // 找出CPU使用最多的函数
    const sortedByCPU = profiles.sort((a, b) => b.cpuUsage - a.cpuUsage);
    const cpuHeavyCount = Math.max(1, Math.floor(profiles.length * 0.1));
    const cpuHeavyFunctions = sortedByCPU.slice(0, cpuHeavyCount);
    
    cpuHeavyFunctions.forEach(profile => {
      if (profile.cpuUsage > 1000000) { // 超过1秒CPU时间
        bottlenecks.push(`${profile.functionName} (${profile.fileName}:${profile.lineNumber}) - CPU时间 ${(profile.cpuUsage / 1000000).toFixed(2)}s`);
      }
    });

    return [...new Set(bottlenecks)]; // 去重
  }

  // 生成优化建议
  private generateRecommendations(profiles: PerformanceProfile[], bottlenecks: string[]): string[] {
    const recommendations: string[] = [];
    
    // 基于瓶颈生成建议
    bottlenecks.forEach(bottleneck => {
      if (bottleneck.includes('平均')) {
        recommendations.push(`优化 ${bottleneck.split(' - ')[0]} 的执行时间`);
      } else if (bottleneck.includes('内存使用')) {
        recommendations.push(`减少 ${bottleneck.split(' - ')[0]} 的内存使用`);
      } else if (bottleneck.includes('CPU时间')) {
        recommendations.push(`优化 ${bottleneck.split(' - ')[0]} 的CPU使用`);
      }
    });

    // 基于调用次数生成建议
    const frequentlyCalled = profiles.filter(p => p.callCount > 100);
    if (frequentlyCalled.length > 0) {
      recommendations.push('考虑缓存频繁调用的函数结果');
    }

    // 基于内存快照生成建议
    if (this.memorySnapshots.length > 0) {
      const memoryGrowth = this.calculateMemoryGrowth();
      if (memoryGrowth > 0.1) { // 内存增长超过10%
        recommendations.push('检查内存泄漏，内存使用持续增长');
      }
    }

    // 基于CPU快照生成建议
    if (this.cpuSnapshots.length > 0) {
      const cpuGrowth = this.calculateCPUGrowth();
      if (cpuGrowth > 0.2) { // CPU使用增长超过20%
        recommendations.push('优化CPU密集型操作');
      }
    }

    return [...new Set(recommendations)]; // 去重
  }

  // 计算内存增长
  private calculateMemoryGrowth(): number {
    if (this.memorySnapshots.length < 2) return 0;
    
    const first = this.memorySnapshots[0];
    const last = this.memorySnapshots[this.memorySnapshots.length - 1];
    
    return (last.heapUsed - first.heapUsed) / first.heapUsed;
  }

  // 计算CPU增长
  private calculateCPUGrowth(): number {
    if (this.cpuSnapshots.length < 2) return 0;
    
    const first = this.cpuSnapshots[0];
    const last = this.cpuSnapshots[this.cpuSnapshots.length - 1];
    
    const firstTotal = first.user + first.system;
    const lastTotal = last.user + last.system;
    
    return firstTotal > 0 ? (lastTotal - firstTotal) / firstTotal : 0;
  }

  // 计算统计信息
  private calculateSummary(profiles: PerformanceProfile[]): any {
    const totalFunctions = profiles.length;
    
    const slowestFunction = profiles.reduce((slowest, current) => 
      current.averageTime > slowest.averageTime ? current : slowest,
      { averageTime: 0, functionName: 'N/A' }
    );
    
    const memoryPeak = this.memorySnapshots.length > 0 
      ? Math.max(...this.memorySnapshots.map(s => s.heapUsed))
      : 0;
    
    const cpuPeak = this.cpuSnapshots.length > 0
      ? Math.max(...this.cpuSnapshots.map(s => s.user + s.system))
      : 0;
    
    const averageResponseTime = profiles.length > 0
      ? profiles.reduce((sum, p) => sum + p.averageTime, 0) / profiles.length
      : 0;

    return {
      totalFunctions,
      slowestFunction: slowestFunction.functionName,
      memoryPeak,
      cpuPeak,
      averageResponseTime
    };
  }

  // 导出性能数据
  exportData(): any {
    return {
      profiles: Array.from(this.profiles.values()),
      memorySnapshots: this.memorySnapshots,
      cpuSnapshots: this.cpuSnapshots,
      timestamp: new Date().toISOString()
    };
  }

  // 重置性能数据
  reset(): void {
    this.profiles.clear();
    this.memorySnapshots = [];
    this.cpuSnapshots = [];
    console.log('🔄 性能数据已重置');
  }

  // 获取当前状态
  getStatus(): any {
    return {
      isProfiling: this.isProfiling,
      profileCount: this.profiles.size,
      memorySnapshotCount: this.memorySnapshots.length,
      cpuSnapshotCount: this.cpuSnapshots.length,
      uptime: this.isProfiling ? performance.now() - this.startTime : 0
    };
  }
}

// 性能分析装饰器
export function profile(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;
  
  descriptor.value = function(...args: any[]) {
    const profiler = (global as any).__profiler as AdvancedPerformanceProfiler;
    if (!profiler || !profiler.isProfiling) {
      return method.apply(this, args);
    }
    
    const fileName = target.constructor.name || 'Unknown';
    const lineNumber = 0; // 无法获取确切行号
    
    return profiler.profileFunction(
      propertyName,
      fileName,
      lineNumber,
      () => method.apply(this, args)
    );
  };
}

// 创建全局性能分析器实例
const profiler = new AdvancedPerformanceProfiler();
(global as any).__profiler = profiler;

export { AdvancedPerformanceProfiler, profiler };
