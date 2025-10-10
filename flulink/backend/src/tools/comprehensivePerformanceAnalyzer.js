#!/usr/bin/env node

import { AdvancedPerformanceProfiler } from './advancedPerformanceProfiler.js';
import { MemoryAnalyzer } from './memoryAnalyzer.js';
import { PerformanceOptimizationAnalyzer } from './performanceOptimizationAnalyzer.js';
import fs from 'fs';
import path from 'path';

class ComprehensivePerformanceAnalyzer {
  private projectRoot: string;
  private profiler: AdvancedPerformanceProfiler;
  private memoryAnalyzer: MemoryAnalyzer;
  private optimizationAnalyzer: PerformanceOptimizationAnalyzer;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.profiler = new AdvancedPerformanceProfiler();
    this.memoryAnalyzer = new MemoryAnalyzer();
    this.optimizationAnalyzer = new PerformanceOptimizationAnalyzer(projectRoot);
  }

  async runFullAnalysis(duration: number = 60000): Promise<void> {
    console.log('🚀 开始全面性能分析...\n');

    try {
      // 1. 启动性能分析
      console.log('📊 启动性能分析器...');
      this.profiler.startProfiling();
      this.memoryAnalyzer.startAnalysis(5000);

      // 2. 运行分析
      console.log(`⏱️ 运行分析 ${duration/1000} 秒...`);
      await this.runAnalysisTasks();

      // 等待指定时间
      await new Promise(resolve => setTimeout(resolve, duration));

      // 3. 停止分析并生成报告
      console.log('⏹️ 停止分析并生成报告...');
      const performanceReport = this.profiler.stopProfiling();
      const memoryReport = this.memoryAnalyzer.stopAnalysis();
      const optimizationReport = this.optimizationAnalyzer.analyzeProject();

      // 4. 生成综合报告
      await this.generateComprehensiveReport(performanceReport, memoryReport, optimizationReport);

      // 5. 输出总结
      this.printSummary(performanceReport, memoryReport, optimizationReport);

    } catch (error) {
      console.error('❌ 性能分析失败:', error);
      process.exit(1);
    }
  }

  private async runAnalysisTasks(): Promise<void> {
    // 模拟一些分析任务
    const tasks = [
      () => this.simulateDatabaseQueries(),
      () => this.simulateApiCalls(),
      () => this.simulateAlgorithmExecution(),
      () => this.simulateMemoryOperations()
    ];

    // 并行运行任务
    const promises = tasks.map(task => this.runTaskWithProfiling(task));
    await Promise.all(promises);
  }

  private async runTaskWithProfiling(task: () => Promise<void>): Promise<void> {
    const taskName = task.name || 'UnknownTask';
    const fileName = 'PerformanceAnalyzer';
    
    return this.profiler.profileFunction(taskName, fileName, 0, task);
  }

  private async simulateDatabaseQueries(): Promise<void> {
    for (let i = 0; i < 10; i++) {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
    }
  }

  private async simulateApiCalls(): Promise<void> {
    for (let i = 0; i < 20; i++) {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 50));
    }
  }

  private async simulateAlgorithmExecution(): Promise<void> {
    // 模拟共鸣计算
    const users = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      tags: Array.from({ length: 5 }, () => `tag${Math.floor(Math.random() * 10)}`)
    }));

    for (let i = 0; i < users.length; i++) {
      for (let j = i + 1; j < users.length; j++) {
        const similarity = this.calculateSimilarity(users[i].tags, users[j].tags);
        if (similarity > 0.5) {
          // 模拟处理
        }
      }
    }
  }

  private calculateSimilarity(tags1: string[], tags2: string[]): number {
    const set1 = new Set(tags1);
    const set2 = new Set(tags2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return intersection.size / union.size;
  }

  private async simulateMemoryOperations(): Promise<void> {
    const arrays = [];
    for (let i = 0; i < 100; i++) {
      arrays.push(new Array(1000).fill(Math.random()));
    }
    
    // 模拟一些内存操作
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 清理数组
    arrays.length = 0;
  }

  private async generateComprehensiveReport(
    performanceReport: any,
    memoryReport: any,
    optimizationReport: any
  ): Promise<void> {
    const reportsDir = path.join(this.projectRoot, 'reports');
    
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // 生成性能报告
    const performanceReportPath = path.join(reportsDir, 'performance-analysis.json');
    fs.writeFileSync(performanceReportPath, JSON.stringify(performanceReport, null, 2));
    console.log(`✅ 性能分析报告已保存: ${performanceReportPath}`);

    // 生成内存报告
    const memoryReportPath = path.join(reportsDir, 'memory-analysis.json');
    fs.writeFileSync(memoryReportPath, JSON.stringify(memoryReport, null, 2));
    console.log(`✅ 内存分析报告已保存: ${memoryReportPath}`);

    // 生成优化报告
    const optimizationReportPath = path.join(reportsDir, 'optimization-analysis.json');
    fs.writeFileSync(optimizationReportPath, JSON.stringify(optimizationReport, null, 2));
    console.log(`✅ 优化分析报告已保存: ${optimizationReportPath}`);

    // 生成综合HTML报告
    const htmlReport = this.generateHTMLReport(performanceReport, memoryReport, optimizationReport);
    const htmlReportPath = path.join(reportsDir, 'comprehensive-performance-report.html');
    fs.writeFileSync(htmlReportPath, htmlReport);
    console.log(`✅ 综合HTML报告已保存: ${htmlReportPath}`);

    // 生成文本报告
    const textReport = this.generateTextReport(performanceReport, memoryReport, optimizationReport);
    const textReportPath = path.join(reportsDir, 'comprehensive-performance-report.txt');
    fs.writeFileSync(textReportPath, textReport);
    console.log(`✅ 综合文本报告已保存: ${textReportPath}`);
  }

  private generateHTMLReport(performanceReport: any, memoryReport: any, optimizationReport: any): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FluLink 综合性能分析报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #1890ff; border-bottom: 2px solid #1890ff; padding-bottom: 10px; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px; }
        .metric { background: #f0f2f5; padding: 15px; border-radius: 6px; text-align: center; }
        .metric-value { font-size: 24px; font-weight: bold; color: #1890ff; }
        .metric-label { color: #666; margin-top: 5px; }
        .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #e8e8e8; }
        .table th { background: #fafafa; font-weight: bold; }
        .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .badge-critical { background: #fff2f0; color: #ff4d4f; }
        .badge-high { background: #fffbe6; color: #faad14; }
        .badge-medium { background: #f6ffed; color: #52c41a; }
        .badge-low { background: #e6f7ff; color: #1890ff; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>FluLink 综合性能分析报告</h1>
            <p>生成时间: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="section">
            <h2>性能分析概览</h2>
            <div class="metrics">
                <div class="metric">
                    <div class="metric-value">${performanceReport.summary.totalFunctions}</div>
                    <div class="metric-label">分析函数数</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${performanceReport.summary.averageResponseTime.toFixed(2)}ms</div>
                    <div class="metric-label">平均响应时间</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${(performanceReport.summary.memoryPeak / 1024 / 1024).toFixed(2)}MB</div>
                    <div class="metric-label">峰值内存使用</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${performanceReport.bottlenecks.length}</div>
                    <div class="metric-label">性能瓶颈</div>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2>内存分析概览</h2>
            <div class="metrics">
                <div class="metric">
                    <div class="metric-value">${(memoryReport.summary.peakMemory / 1024 / 1024).toFixed(2)}MB</div>
                    <div class="metric-label">峰值内存</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${(memoryReport.summary.averageMemory / 1024 / 1024).toFixed(2)}MB</div>
                    <div class="metric-label">平均内存</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${(memoryReport.summary.memoryGrowth * 100).toFixed(2)}%</div>
                    <div class="metric-label">内存增长</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${memoryReport.summary.leakCount}</div>
                    <div class="metric-label">泄漏检测</div>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2>优化建议概览</h2>
            <div class="metrics">
                <div class="metric">
                    <div class="metric-value">${optimizationReport.totalOptimizations}</div>
                    <div class="metric-label">总优化建议</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${optimizationReport.summary.estimatedPerformanceGain}%</div>
                    <div class="metric-label">预期性能提升</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${optimizationReport.summary.estimatedMemoryReduction}%</div>
                    <div class="metric-label">预期内存减少</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${optimizationReport.criticalOptimizations}</div>
                    <div class="metric-label">关键优化</div>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2>优化建议详情</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>类别</th>
                        <th>优先级</th>
                        <th>标题</th>
                        <th>性能提升</th>
                        <th>内存减少</th>
                        <th>复杂度降低</th>
                    </tr>
                </thead>
                <tbody>
                    ${optimizationReport.optimizations.map(opt => `
                        <tr>
                            <td>${opt.category}</td>
                            <td><span class="badge badge-${opt.priority}">${opt.priority}</span></td>
                            <td>${opt.title}</td>
                            <td>${opt.metrics.performanceGain}%</td>
                            <td>${opt.metrics.memoryReduction}%</td>
                            <td>${opt.metrics.complexityReduction}%</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="section">
            <h2>建议</h2>
            <ul>
                ${optimizationReport.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
    </div>
</body>
</html>`;
  }

  private generateTextReport(performanceReport: any, memoryReport: any, optimizationReport: any): string {
    let report = '\n=== FluLink 综合性能分析报告 ===\n\n';
    report += `生成时间: ${new Date().toLocaleString()}\n`;
    report += `分析持续时间: ${(performanceReport.duration / 1000).toFixed(2)} 秒\n\n`;
    
    report += '性能分析结果:\n';
    report += `  分析函数数: ${performanceReport.summary.totalFunctions}\n`;
    report += `  平均响应时间: ${performanceReport.summary.averageResponseTime.toFixed(2)}ms\n`;
    report += `  峰值内存使用: ${(performanceReport.summary.memoryPeak / 1024 / 1024).toFixed(2)}MB\n`;
    report += `  性能瓶颈: ${performanceReport.bottlenecks.length} 个\n\n`;
    
    report += '内存分析结果:\n';
    report += `  峰值内存: ${(memoryReport.summary.peakMemory / 1024 / 1024).toFixed(2)}MB\n`;
    report += `  平均内存: ${(memoryReport.summary.averageMemory / 1024 / 1024).toFixed(2)}MB\n`;
    report += `  内存增长: ${(memoryReport.summary.memoryGrowth * 100).toFixed(2)}%\n`;
    report += `  泄漏检测: ${memoryReport.summary.leakCount} 个\n\n`;
    
    report += '优化建议:\n';
    report += `  总优化建议: ${optimizationReport.totalOptimizations}\n`;
    report += `  关键优化: ${optimizationReport.criticalOptimizations}\n`;
    report += `  高优先级优化: ${optimizationReport.highPriorityOptimizations}\n`;
    report += `  预期性能提升: ${optimizationReport.summary.estimatedPerformanceGain}%\n`;
    report += `  预期内存减少: ${optimizationReport.summary.estimatedMemoryReduction}%\n\n`;
    
    report += '详细建议:\n';
    optimizationReport.recommendations.forEach((rec, index) => {
      report += `  ${index + 1}. ${rec}\n`;
    });
    
    return report;
  }

  private printSummary(performanceReport: any, memoryReport: any, optimizationReport: any): void {
    console.log('\n' + '='.repeat(60));
    console.log('📋 综合性能分析总结');
    console.log('='.repeat(60));
    
    console.log(`📊 性能分析:`);
    console.log(`  分析函数数: ${performanceReport.summary.totalFunctions}`);
    console.log(`  平均响应时间: ${performanceReport.summary.averageResponseTime.toFixed(2)}ms`);
    console.log(`  性能瓶颈: ${performanceReport.bottlenecks.length} 个`);
    
    console.log(`\n🧠 内存分析:`);
    console.log(`  峰值内存: ${(memoryReport.summary.peakMemory / 1024 / 1024).toFixed(2)}MB`);
    console.log(`  内存增长: ${(memoryReport.summary.memoryGrowth * 100).toFixed(2)}%`);
    console.log(`  泄漏检测: ${memoryReport.summary.leakCount} 个`);
    
    console.log(`\n🔧 优化建议:`);
    console.log(`  总优化建议: ${optimizationReport.totalOptimizations}`);
    console.log(`  关键优化: ${optimizationReport.criticalOptimizations}`);
    console.log(`  预期性能提升: ${optimizationReport.summary.estimatedPerformanceGain}%`);
    console.log(`  预期内存减少: ${optimizationReport.summary.estimatedMemoryReduction}%`);
    
    console.log('\n💡 优先建议:');
    optimizationReport.recommendations.slice(0, 3).forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec}`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ 综合性能分析完成！');
    console.log('📁 详细报告请查看 reports/ 目录');
    console.log('='.repeat(60));
  }

  async runQuickAnalysis(): Promise<void> {
    console.log('⚡ 运行快速性能分析...');
    
    const optimizationReport = this.optimizationAnalyzer.analyzeProject();
    
    const reportsDir = path.join(this.projectRoot, 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const reportPath = path.join(reportsDir, 'quick-optimization-analysis.json');
    fs.writeFileSync(reportPath, JSON.stringify(optimizationReport, null, 2));
    
    console.log(`✅ 快速分析报告已保存: ${reportPath}`);
    console.log(`🔧 优化建议数量: ${optimizationReport.totalOptimizations}`);
    console.log(`🚨 关键优化: ${optimizationReport.criticalOptimizations}`);
  }
}

// 命令行接口
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'full';
  const duration = parseInt(args[1]) || 60000; // 默认60秒
  const projectRoot = process.cwd();
  
  const analyzer = new ComprehensivePerformanceAnalyzer(projectRoot);
  
  switch (command) {
    case 'quick':
      await analyzer.runQuickAnalysis();
      break;
    case 'full':
    default:
      await analyzer.runFullAnalysis(duration);
      break;
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { ComprehensivePerformanceAnalyzer };
