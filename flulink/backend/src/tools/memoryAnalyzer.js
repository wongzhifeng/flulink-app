import { performance } from 'perf_hooks';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

interface MemoryLeakDetection {
  objectType: string;
  count: number;
  size: number;
  growthRate: number;
  suspicious: boolean;
}

interface MemoryAnalysis {
  timestamp: string;
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
  arrayBuffers: number;
  leakDetections: MemoryLeakDetection[];
  recommendations: string[];
}

interface MemoryReport {
  timestamp: string;
  duration: number;
  analyses: MemoryAnalysis[];
  summary: {
    peakMemory: number;
    averageMemory: number;
    memoryGrowth: number;
    leakCount: number;
    suspiciousObjects: string[];
  };
  recommendations: string[];
}

class MemoryAnalyzer {
  private analyses: MemoryAnalysis[] = [];
  private isAnalyzing: boolean = false;
  private analysisInterval: NodeJS.Timeout | null = null;
  private startTime: number = 0;
  private baselineMemory: NodeJS.MemoryUsage | null = null;

  constructor() {
    this.setupMemoryMonitoring();
  }

  // 设置内存监控
  private setupMemoryMonitoring() {
    // 监控内存使用
    process.on('beforeExit', () => {
      this.captureMemorySnapshot();
    });

    // 监控未捕获的异常
    process.on('uncaughtException', () => {
      this.captureMemorySnapshot();
    });

    process.on('unhandledRejection', () => {
      this.captureMemorySnapshot();
    });
  }

  // 开始内存分析
  startAnalysis(intervalMs: number = 5000): void {
    if (this.isAnalyzing) {
      console.warn('内存分析已在运行中');
      return;
    }

    this.isAnalyzing = true;
    this.startTime = performance.now();
    this.baselineMemory = process.memoryUsage();
    
    // 定期捕获内存快照
    this.analysisInterval = setInterval(() => {
      this.captureMemorySnapshot();
    }, intervalMs);

    console.log('🧠 内存分析已启动');
  }

  // 停止内存分析
  stopAnalysis(): MemoryReport {
    if (!this.isAnalyzing) {
      throw new Error('内存分析未在运行');
    }

    this.isAnalyzing = false;
    
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
    }

    const endTime = performance.now();
    const duration = endTime - this.startTime;

    // 捕获最终快照
    this.captureMemorySnapshot();

    const report = this.generateReport(duration);
    
    console.log('⏹️ 内存分析已停止');
    
    return report;
  }

  // 捕获内存快照
  private captureMemorySnapshot(): void {
    const memoryUsage = process.memoryUsage();
    const leakDetections = this.detectMemoryLeaks();
    const recommendations = this.generateMemoryRecommendations(memoryUsage, leakDetections);

    const analysis: MemoryAnalysis = {
      timestamp: new Date().toISOString(),
      heapUsed: memoryUsage.heapUsed,
      heapTotal: memoryUsage.heapTotal,
      external: memoryUsage.external,
      rss: memoryUsage.rss,
      arrayBuffers: memoryUsage.arrayBuffers,
      leakDetections,
      recommendations
    };

    this.analyses.push(analysis);
    
    // 保持最近1000个分析
    if (this.analyses.length > 1000) {
      this.analyses = this.analyses.slice(-1000);
    }
  }

  // 检测内存泄漏
  private detectMemoryLeaks(): MemoryLeakDetection[] {
    const detections: MemoryLeakDetection[] = [];
    
    // 分析内存使用模式
    if (this.analyses.length < 3) {
      return detections;
    }

    // 计算内存增长趋势
    const recentAnalyses = this.analyses.slice(-10);
    const memoryGrowth = this.calculateMemoryGrowth(recentAnalyses);
    
    if (memoryGrowth > 0.1) { // 内存增长超过10%
      detections.push({
        objectType: 'General Memory Growth',
        count: 1,
        size: recentAnalyses[recentAnalyses.length - 1].heapUsed,
        growthRate: memoryGrowth,
        suspicious: true
      });
    }

    // 检测特定类型的内存泄漏
    const heapGrowth = this.calculateHeapGrowth(recentAnalyses);
    if (heapGrowth > 0.05) {
      detections.push({
        objectType: 'Heap Memory Growth',
        count: 1,
        size: recentAnalyses[recentAnalyses.length - 1].heapUsed,
        growthRate: heapGrowth,
        suspicious: true
      });
    }

    const externalGrowth = this.calculateExternalGrowth(recentAnalyses);
    if (externalGrowth > 0.1) {
      detections.push({
        objectType: 'External Memory Growth',
        count: 1,
        size: recentAnalyses[recentAnalyses.length - 1].external,
        growthRate: externalGrowth,
        suspicious: true
      });
    }

    return detections;
  }

  // 计算内存增长
  private calculateMemoryGrowth(analyses: MemoryAnalysis[]): number {
    if (analyses.length < 2) return 0;
    
    const first = analyses[0];
    const last = analyses[analyses.length - 1];
    
    return (last.heapUsed - first.heapUsed) / first.heapUsed;
  }

  // 计算堆内存增长
  private calculateHeapGrowth(analyses: MemoryAnalysis[]): number {
    if (analyses.length < 2) return 0;
    
    const first = analyses[0];
    const last = analyses[analyses.length - 1];
    
    return (last.heapUsed - first.heapUsed) / first.heapUsed;
  }

  // 计算外部内存增长
  private calculateExternalGrowth(analyses: MemoryAnalysis[]): number {
    if (analyses.length < 2) return 0;
    
    const first = analyses[0];
    const last = analyses[analyses.length - 1];
    
    return first.external > 0 ? (last.external - first.external) / first.external : 0;
  }

  // 生成内存建议
  private generateMemoryRecommendations(memoryUsage: NodeJS.MemoryUsage, leakDetections: MemoryLeakDetection[]): string[] {
    const recommendations: string[] = [];
    
    // 基于内存使用量生成建议
    if (memoryUsage.heapUsed > 100 * 1024 * 1024) { // 超过100MB
      recommendations.push('堆内存使用过高，考虑优化内存使用');
    }
    
    if (memoryUsage.external > 50 * 1024 * 1024) { // 超过50MB
      recommendations.push('外部内存使用过高，检查是否有未释放的资源');
    }
    
    if (memoryUsage.rss > 200 * 1024 * 1024) { // 超过200MB
      recommendations.push('RSS内存使用过高，考虑优化应用程序');
    }

    // 基于泄漏检测生成建议
    leakDetections.forEach(leak => {
      if (leak.suspicious) {
        recommendations.push(`检测到可疑的${leak.objectType}增长，增长率为${(leak.growthRate * 100).toFixed(2)}%`);
      }
    });

    // 基于内存使用模式生成建议
    if (this.analyses.length > 5) {
      const memoryTrend = this.calculateMemoryTrend();
      if (memoryTrend > 0.05) {
        recommendations.push('内存使用呈上升趋势，建议检查内存泄漏');
      }
    }

    return recommendations;
  }

  // 计算内存趋势
  private calculateMemoryTrend(): number {
    if (this.analyses.length < 5) return 0;
    
    const recent = this.analyses.slice(-5);
    const first = recent[0];
    const last = recent[recent.length - 1];
    
    return (last.heapUsed - first.heapUsed) / first.heapUsed;
  }

  // 生成内存报告
  private generateReport(duration: number): MemoryReport {
    const summary = this.calculateSummary();
    const recommendations = this.generateOverallRecommendations();

    return {
      timestamp: new Date().toISOString(),
      duration,
      analyses: this.analyses,
      summary,
      recommendations
    };
  }

  // 计算总结信息
  private calculateSummary(): any {
    if (this.analyses.length === 0) {
      return {
        peakMemory: 0,
        averageMemory: 0,
        memoryGrowth: 0,
        leakCount: 0,
        suspiciousObjects: []
      };
    }

    const peakMemory = Math.max(...this.analyses.map(a => a.heapUsed));
    const averageMemory = this.analyses.reduce((sum, a) => sum + a.heapUsed, 0) / this.analyses.length;
    
    const memoryGrowth = this.analyses.length > 1 
      ? (this.analyses[this.analyses.length - 1].heapUsed - this.analyses[0].heapUsed) / this.analyses[0].heapUsed
      : 0;
    
    const leakCount = this.analyses.reduce((sum, a) => sum + a.leakDetections.length, 0);
    const suspiciousObjects = this.analyses
      .flatMap(a => a.leakDetections)
      .filter(l => l.suspicious)
      .map(l => l.objectType);

    return {
      peakMemory,
      averageMemory,
      memoryGrowth,
      leakCount,
      suspiciousObjects: [...new Set(suspiciousObjects)]
    };
  }

  // 生成总体建议
  private generateOverallRecommendations(): string[] {
    const recommendations: string[] = [];
    
    if (this.analyses.length === 0) {
      return recommendations;
    }

    const summary = this.calculateSummary();
    
    if (summary.memoryGrowth > 0.1) {
      recommendations.push('内存使用持续增长，建议进行内存泄漏检查');
    }
    
    if (summary.peakMemory > 200 * 1024 * 1024) {
      recommendations.push('峰值内存使用过高，建议优化内存使用策略');
    }
    
    if (summary.leakCount > 5) {
      recommendations.push('检测到多个内存泄漏，建议进行代码审查');
    }
    
    if (summary.suspiciousObjects.length > 0) {
      recommendations.push(`关注以下可疑对象: ${summary.suspiciousObjects.join(', ')}`);
    }

    return recommendations;
  }

  // 强制垃圾回收
  forceGarbageCollection(): void {
    if (global.gc) {
      global.gc();
      console.log('🗑️ 强制垃圾回收已执行');
    } else {
      console.warn('⚠️ 垃圾回收不可用，请使用 --expose-gc 标志启动Node.js');
    }
  }

  // 获取当前内存状态
  getCurrentMemoryState(): NodeJS.MemoryUsage {
    return process.memoryUsage();
  }

  // 比较内存状态
  compareMemoryStates(before: NodeJS.MemoryUsage, after: NodeJS.MemoryUsage): any {
    return {
      heapUsed: {
        before: before.heapUsed,
        after: after.heapUsed,
        delta: after.heapUsed - before.heapUsed,
        percentage: ((after.heapUsed - before.heapUsed) / before.heapUsed) * 100
      },
      heapTotal: {
        before: before.heapTotal,
        after: after.heapTotal,
        delta: after.heapTotal - before.heapTotal,
        percentage: ((after.heapTotal - before.heapTotal) / before.heapTotal) * 100
      },
      external: {
        before: before.external,
        after: after.external,
        delta: after.external - before.external,
        percentage: ((after.external - before.external) / before.external) * 100
      },
      rss: {
        before: before.rss,
        after: after.rss,
        delta: after.rss - before.rss,
        percentage: ((after.rss - before.rss) / before.rss) * 100
      }
    };
  }

  // 导出内存数据
  exportData(): any {
    return {
      analyses: this.analyses,
      timestamp: new Date().toISOString()
    };
  }

  // 重置内存数据
  reset(): void {
    this.analyses = [];
    this.baselineMemory = null;
    console.log('🔄 内存数据已重置');
  }

  // 获取分析状态
  getStatus(): any {
    return {
      isAnalyzing: this.isAnalyzing,
      analysisCount: this.analyses.length,
      uptime: this.isAnalyzing ? performance.now() - this.startTime : 0
    };
  }
}

// 内存分析装饰器
export function memoryProfile(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;
  
  descriptor.value = function(...args: any[]) {
    const analyzer = (global as any).__memoryAnalyzer as MemoryAnalyzer;
    if (!analyzer || !analyzer.isAnalyzing) {
      return method.apply(this, args);
    }
    
    const beforeMemory = analyzer.getCurrentMemoryState();
    const result = method.apply(this, args);
    const afterMemory = analyzer.getCurrentMemoryState();
    
    const comparison = analyzer.compareMemoryStates(beforeMemory, afterMemory);
    
    if (comparison.heapUsed.delta > 1024 * 1024) { // 内存增长超过1MB
      console.warn(`⚠️ ${propertyName} 内存使用增长: ${(comparison.heapUsed.delta / 1024 / 1024).toFixed(2)}MB`);
    }
    
    return result;
  };
}

// 创建全局内存分析器实例
const memoryAnalyzer = new MemoryAnalyzer();
(global as any).__memoryAnalyzer = memoryAnalyzer;

export { MemoryAnalyzer, memoryAnalyzer };
