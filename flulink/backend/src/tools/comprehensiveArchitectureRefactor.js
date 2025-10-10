#!/usr/bin/env node

import { ArchitectureAnalyzer } from './architectureAnalyzer.js';
import { DesignPatternDetector } from './designPatternDetector.js';
import fs from 'fs';
import path from 'path';

// interface RefactoringSuggestion {
  id: string;
  type: 'extract' | 'inline' | 'move' | 'rename' | 'split' | 'merge';
  title: string;
  description: string;
  file: string;
  line: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  effort: 'low' | 'medium' | 'high';
  impact: string;
  beforeCode: string;
  afterCode: string;
  benefits: string[];
}

// interface ComprehensiveArchitectureReport {
  timestamp: string;
  architectureAnalysis: any;
  patternAnalysis: any;
  refactoringSuggestions: RefactoringSuggestion[];
  summary: {
    overallArchitectureScore: number;
    patternUsageScore: number;
    refactoringPriority: string;
    criticalIssues: number;
    improvementPotential: number;
  };
  recommendations: string[];
}

class ComprehensiveArchitectureRefactor {
  // private projectRoot: string;
  // private architectureAnalyzer: ArchitectureAnalyzer;
  // private patternDetector: DesignPatternDetector;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.architectureAnalyzer = new ArchitectureAnalyzer(projectRoot);
    this.patternDetector = new DesignPatternDetector(projectRoot);
  }

  async runComprehensiveAnalysis(): Promise<ComprehensiveArchitectureReport> {
    console.log('🏗️ 开始综合架构重构分析...\n');

    try {
      // 1. 架构分析
      console.log('📊 执行架构分析...');
      const architectureAnalysis = await this.architectureAnalyzer.analyzeArchitecture();
      
      // 2. 设计模式检测
      console.log('🔍 执行设计模式检测...');
      const patternAnalysis = await this.patternDetector.detectPatterns();
      
      // 3. 生成重构建议
      console.log('🔧 生成重构建议...');
      const refactoringSuggestions = this.generateRefactoringSuggestions(
        architectureAnalysis,
        patternAnalysis
      );
      
      // 4. 计算综合评分
      const summary = this.calculateComprehensiveSummary(
        architectureAnalysis,
        patternAnalysis,
        refactoringSuggestions
      );
      
      // 5. 生成建议
      const recommendations = this.generateComprehensiveRecommendations(
        architectureAnalysis,
        patternAnalysis,
        refactoringSuggestions
      );
      
      console.log(`✅ 综合架构分析完成，生成 ${refactoringSuggestions.length} 个重构建议`);
      
      return {
        timestamp: new Date().toISOString(),
        architectureAnalysis,
        patternAnalysis,
        refactoringSuggestions,
        summary,
        recommendations
      };
      
    } catch (error) {
      console.error('❌ 综合架构分析失败:', error);
      throw error;
    }
  }

  // private generateRefactoringSuggestions(
    architectureAnalysis: any,
    patternAnalysis: any
  ): RefactoringSuggestion[] {
    const suggestions: RefactoringSuggestion[] = [];
    
    // 基于架构分析生成重构建议
    this.generateArchitectureBasedSuggestions(architectureAnalysis, suggestions);
    
    // 基于设计模式分析生成重构建议
    this.generatePatternBasedSuggestions(patternAnalysis, suggestions);
    
    // 基于代码质量生成重构建议
    this.generateQualityBasedSuggestions(architectureAnalysis, suggestions);
    
    return suggestions;
  }

  // private generateArchitectureBasedSuggestions(
    architectureAnalysis: any,
    suggestions: RefactoringSuggestion[]
  ): void {
    const { metrics, dependencyGraph } = architectureAnalysis;
    
    // 循环依赖重构建议
    if (metrics.circularDependencies.length > 0) {
      metrics.circularDependencies.forEach((cycle: string[], index: number) => {
        suggestions.push({
          id: `CIRCULAR_DEP_${index}`,
          type: 'extract',
          title: '解决循环依赖',
          description: `模块 ${cycle.join(' -> ')} 存在循环依赖，需要重构`,
          file: 'multiple',
          line: 0,
          priority: 'critical',
          effort: 'high',
          impact: '消除循环依赖，提高代码可维护性',
          beforeCode: `// 循环依赖示例\n${cycle.join(' -> ')}`,
          afterCode: `// 重构后：引入抽象层或依赖注入\ninterface IAbstractLayer {\n  // 抽象接口\n}`,
          benefits: ['消除循环依赖', '提高可测试性', '降低耦合度']
        });
      });
    }
    
    // 高复杂度模块重构建议
    const highComplexityModules = dependencyGraph.filter((node: any) => node.complexity > 10);
    highComplexityModules.forEach((node: any, index: number) => {
      suggestions.push({
        id: `COMPLEXITY_${index}`,
        type: 'split',
        title: '拆分高复杂度模块',
        description: `模块 ${node.name} 复杂度为 ${node.complexity}，建议拆分`,
        file: node.path,
        line: 0,
        priority: 'high',
        effort: 'medium',
        impact: '降低模块复杂度，提高可读性和可维护性',
        beforeCode: `// 高复杂度模块\nclass ${node.name} {\n  // 大量复杂逻辑\n}`,
        afterCode: `// 拆分后的模块\nclass ${node.name}Core {\n  // 核心逻辑\n}\nclass ${node.name}Helper {\n  // 辅助逻辑\n}`,
        benefits: ['降低复杂度', '提高可读性', '便于测试']
      });
    });
    
    // 高耦合模块重构建议
    const highCouplingModules = dependencyGraph.filter((node: any) => 
      node.dependencies.length > 5 || node.dependents.length > 5
    );
    highCouplingModules.forEach((node: any, index: number) => {
      suggestions.push({
        id: `COUPLING_${index}`,
        type: 'extract',
        title: '降低模块耦合度',
        description: `模块 ${node.name} 耦合度过高，依赖 ${node.dependencies.length} 个模块`,
        file: node.path,
        line: 0,
        priority: 'high',
        effort: 'high',
        impact: '降低模块耦合度，提高系统灵活性',
        beforeCode: `// 高耦合模块\nclass ${node.name} {\n  // 直接依赖多个模块\n}`,
        afterCode: `// 使用依赖注入降低耦合\nclass ${node.name} {\n  constructor(dependencies) {\n    this.deps = dependencies;\n  }\n}`,
        benefits: ['降低耦合度', '提高灵活性', '便于测试']
      });
    });
  }

  // private generatePatternBasedSuggestions(
    patternAnalysis: any,
    suggestions: RefactoringSuggestion[]
  ): void {
    const { patterns, summary } = patternAnalysis;
    
    // 缺失设计模式建议
    summary.missingPatterns.forEach((patternName: string) => {
      const patternInfo = this.getPatternRefactoringInfo(patternName);
      if (patternInfo) {
        suggestions.push({
          id: `MISSING_PATTERN_${patternName}`,
          type: 'extract',
          title: `引入${patternName}模式`,
          description: `项目中缺少${patternName}模式，建议引入以提高代码质量`,
          file: 'suggested',
          line: 0,
          priority: 'medium',
          effort: patternInfo.effort,
          impact: patternInfo.impact,
          beforeCode: patternInfo.beforeCode,
          afterCode: patternInfo.afterCode,
          benefits: patternInfo.benefits
        });
      }
    });
    
    // 低置信度模式重构建议
    const lowConfidencePatterns = patterns.filter((p: any) => p.confidence < 60);
    lowConfidencePatterns.forEach((pattern: any, index: number) => {
      suggestions.push({
        id: `IMPROVE_PATTERN_${index}`,
        type: 'extract',
        title: `改进${pattern.name}模式实现`,
        description: `${pattern.name}模式实现置信度较低(${pattern.confidence}%)，建议改进`,
        file: pattern.file,
        line: pattern.line,
        priority: 'medium',
        effort: 'medium',
        impact: '提高设计模式实现质量',
        beforeCode: pattern.code,
        afterCode: `// 改进后的${pattern.name}模式实现\n${pattern.implementation}`,
        benefits: ['提高模式质量', '增强代码可读性', '符合最佳实践']
      });
    });
  }

  // private generateQualityBasedSuggestions(
    architectureAnalysis: any,
    suggestions: RefactoringSuggestion[]
  ): void {
    const { metrics } = architectureAnalysis;
    
    // 模块化程度改进建议
    if (metrics.modularityScore < 0.3) {
      suggestions.push({
        id: 'IMPROVE_MODULARITY',
        type: 'split',
        title: '提高模块化程度',
        description: '当前模块化程度较低，建议重新组织代码结构',
        file: 'multiple',
        line: 0,
        priority: 'high',
        effort: 'high',
        impact: '提高代码组织性和可维护性',
        beforeCode: '// 低模块化代码\n// 所有功能混在一起',
        afterCode: '// 高模块化代码\n// 按功能分离到不同模块',
        benefits: ['提高可维护性', '便于团队协作', '降低复杂度']
      });
    }
    
    // 内聚度改进建议
    if (metrics.cohesionScore < 0.4) {
      suggestions.push({
        id: 'IMPROVE_COHESION',
        type: 'merge',
        title: '提高模块内聚度',
        description: '模块内聚度较低，建议重新组织相关功能',
        file: 'multiple',
        line: 0,
        priority: 'medium',
        effort: 'medium',
        impact: '提高模块内聚度，降低耦合',
        beforeCode: '// 低内聚度代码\n// 相关功能分散',
        afterCode: '// 高内聚度代码\n// 相关功能集中',
        benefits: ['提高内聚度', '降低耦合', '便于理解']
      });
    }
  }

  // private getPatternRefactoringInfo(patternName: string): any {
    const patternRefactoringInfo: Record<string, any> = {
      'Singleton': {
        effort: 'low',
        impact: '提供全局访问点，控制实例数量',
        beforeCode: '// 没有单例模式\nconst instance = new MyClass();',
        afterCode: '// 单例模式\nclass MyClass {\n  static instance = null;\n  static getInstance() {\n    if (!this.instance) {\n      this.instance = new MyClass();\n    }\n    return this.instance;\n  }\n}',
        benefits: ['控制实例数量', '全局访问点', '延迟初始化']
      },
      'Factory': {
        effort: 'medium',
        impact: '解耦对象创建，提高扩展性',
        beforeCode: '// 直接创建对象\nconst product = new ConcreteProduct();',
        afterCode: '// 工厂模式\nclass ProductFactory {\n  createProduct(type) {\n    switch(type) {\n      case "A": return new ProductA();\n      case "B": return new ProductB();\n    }\n  }\n}',
        benefits: ['解耦创建', '易于扩展', '统一接口']
      },
      'Observer': {
        effort: 'medium',
        impact: '实现松耦合的事件驱动架构',
        beforeCode: '// 紧耦合通知\nsubject.notifyDirectly(observer);',
        afterCode: '// 观察者模式\nsubject.addObserver(observer);\nsubject.notifyObservers();',
        benefits: ['松耦合', '动态订阅', '事件驱动']
      },
      'Strategy': {
        effort: 'medium',
        impact: '消除条件语句，提高算法灵活性',
        beforeCode: '// 条件语句\nif (type === "A") {\n  algorithmA();\n} else {\n  algorithmB();\n}',
        afterCode: '// 策略模式\nconst strategy = strategyFactory.create(type);\nstrategy.execute();',
        benefits: ['消除条件', '算法切换', '易于扩展']
      }
    };
    
    return patternRefactoringInfo[patternName];
  }

  // private calculateComprehensiveSummary(
    architectureAnalysis: any,
    patternAnalysis: any,
    refactoringSuggestions: RefactoringSuggestion[]
  ): any {
    const architectureScore = architectureAnalysis.summary.overallScore;
    const patternScore = patternAnalysis.summary.patternScore;
    
    // 综合评分
    const overallArchitectureScore = Math.round((architectureScore + patternScore) / 2);
    
    // 重构优先级
    const criticalSuggestions = refactoringSuggestions.filter(s => s.priority === 'critical').length;
    const highSuggestions = refactoringSuggestions.filter(s => s.priority === 'high').length;
    
    let refactoringPriority = 'low';
    if (criticalSuggestions > 0) refactoringPriority = 'critical';
    else if (highSuggestions > 2) refactoringPriority = 'high';
    else if (highSuggestions > 0) refactoringPriority = 'medium';
    
    // 关键问题数量
    const criticalIssues = architectureAnalysis.summary.criticalIssues + criticalSuggestions;
    
    // 改进潜力
    const improvementPotential = Math.round(
      (refactoringSuggestions.length * 10) + 
      (architectureAnalysis.metrics.circularDependencies.length * 15) +
      (patternAnalysis.summary.missingPatterns.length * 5)
    );
    
    return {
      overallArchitectureScore,
      patternUsageScore: patternScore,
      refactoringPriority,
      criticalIssues,
      improvementPotential
    };
  }

  // private generateComprehensiveRecommendations(
    architectureAnalysis: any,
    patternAnalysis: any,
    refactoringSuggestions: RefactoringSuggestion[]
  ): string[] {
    const recommendations: string[] = [];
    
    // 基于架构分析的建议
    if (architectureAnalysis.summary.criticalIssues > 0) {
      recommendations.push(`立即解决 ${architectureAnalysis.summary.criticalIssues} 个关键架构问题`);
    }
    
    if (architectureAnalysis.metrics.circularDependencies.length > 0) {
      recommendations.push('优先解决循环依赖问题');
    }
    
    if (architectureAnalysis.metrics.averageComplexity > 8) {
      recommendations.push('重构高复杂度模块');
    }
    
    // 基于设计模式分析的建议
    if (patternAnalysis.summary.missingPatterns.length > 3) {
      recommendations.push('引入更多设计模式提高代码质量');
    }
    
    if (patternAnalysis.patterns.filter((p: any) => p.confidence < 60).length > 0) {
      recommendations.push('改进现有设计模式的实现');
    }
    
    // 基于重构建议的建议
    const criticalRefactoring = refactoringSuggestions.filter(s => s.priority === 'critical').length;
    if (criticalRefactoring > 0) {
      recommendations.push(`执行 ${criticalRefactoring} 个关键重构任务`);
    }
    
    const highEffortRefactoring = refactoringSuggestions.filter(s => s.effort === 'high').length;
    if (highEffortRefactoring > 0) {
      recommendations.push(`规划 ${highEffortRefactoring} 个高工作量重构任务`);
    }
    
    return recommendations;
  }

  async generateComprehensiveReport(): Promise<void> {
    const report = await this.runComprehensiveAnalysis();
    
    const reportsDir = path.join(this.projectRoot, 'reports');
    
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // 生成JSON报告
    const jsonReportPath = path.join(reportsDir, 'comprehensive-architecture-report.json');
    fs.writeFileSync(jsonReportPath, JSON.stringify(report, null, 2));
    console.log(`✅ 综合架构报告已保存: ${jsonReportPath}`);

    // 生成HTML报告
    const htmlReport = this.generateHTMLReport(report);
    const htmlReportPath = path.join(reportsDir, 'comprehensive-architecture-report.html');
    fs.writeFileSync(htmlReportPath, htmlReport);
    console.log(`✅ 综合架构HTML报告已保存: ${htmlReportPath}`);

    // 生成文本报告
    const textReport = this.generateTextReport(report);
    const textReportPath = path.join(reportsDir, 'comprehensive-architecture-report.txt');
    fs.writeFileSync(textReportPath, textReport);
    console.log(`✅ 综合架构文本报告已保存: ${textReportPath}`);
  }

  // private generateHTMLReport(report: ComprehensiveArchitectureReport): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FluLink 综合架构重构报告</title>
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
            <h1>FluLink 综合架构重构报告</h1>
            <p>生成时间: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="section">
            <h2>架构分析概览</h2>
            <div class="metrics">
                <div class="metric">
                    <div class="metric-value">${report.architectureAnalysis.metrics.totalFiles}</div>
                    <div class="metric-label">总文件数</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${report.architectureAnalysis.metrics.totalModules}</div>
                    <div class="metric-label">总模块数</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${report.architectureAnalysis.metrics.circularDependencies.length}</div>
                    <div class="metric-label">循环依赖</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${report.architectureAnalysis.summary.overallScore}</div>
                    <div class="metric-label">架构评分</div>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2>设计模式分析概览</h2>
            <div class="metrics">
                <div class="metric">
                    <div class="metric-value">${report.patternAnalysis.totalPatterns}</div>
                    <div class="metric-label">检测到的模式</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${report.patternAnalysis.patternsByType.creational}</div>
                    <div class="metric-label">创建型模式</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${report.patternAnalysis.patternsByType.structural}</div>
                    <div class="metric-label">结构型模式</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${report.patternAnalysis.patternsByType.behavioral}</div>
                    <div class="metric-label">行为型模式</div>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2>重构建议概览</h2>
            <div class="metrics">
                <div class="metric">
                    <div class="metric-value">${report.refactoringSuggestions.length}</div>
                    <div class="metric-label">总重构建议</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${report.refactoringSuggestions.filter(s => s.priority === 'critical').length}</div>
                    <div class="metric-label">关键建议</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${report.refactoringSuggestions.filter(s => s.priority === 'high').length}</div>
                    <div class="metric-label">高优先级建议</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${report.summary.improvementPotential}</div>
                    <div class="metric-label">改进潜力</div>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2>重构建议详情</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>优先级</th>
                        <th>类型</th>
                        <th>标题</th>
                        <th>文件</th>
                        <th>工作量</th>
                        <th>影响</th>
                    </tr>
                </thead>
                <tbody>
                    ${report.refactoringSuggestions.map(suggestion => `
                        <tr>
                            <td><span class="badge badge-${suggestion.priority}">${suggestion.priority}</span></td>
                            <td>${suggestion.type}</td>
                            <td>${suggestion.title}</td>
                            <td>${suggestion.file}</td>
                            <td>${suggestion.effort}</td>
                            <td>${suggestion.impact}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="section">
            <h2>综合建议</h2>
            <ul>
                ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
    </div>
</body>
</html>`;
  }

  // private generateTextReport(report: ComprehensiveArchitectureReport): string {
    let output = '\n=== FluLink 综合架构重构报告 ===\n\n';
    output += `生成时间: ${report.timestamp}\n\n`;
    
    output += '架构分析结果:\n';
    output += `  总文件数: ${report.architectureAnalysis.metrics.totalFiles}\n`;
    output += `  总模块数: ${report.architectureAnalysis.metrics.totalModules}\n`;
    output += `  循环依赖: ${report.architectureAnalysis.metrics.circularDependencies.length}\n`;
    output += `  架构评分: ${report.architectureAnalysis.summary.overallScore}/100\n`;
    output += `  健康状态: ${report.architectureAnalysis.summary.healthStatus}\n\n`;
    
    output += '设计模式分析结果:\n';
    output += `  检测到的模式: ${report.patternAnalysis.totalPatterns}\n`;
    output += `  创建型模式: ${report.patternAnalysis.patternsByType.creational}\n`;
    output += `  结构型模式: ${report.patternAnalysis.patternsByType.structural}\n`;
    output += `  行为型模式: ${report.patternAnalysis.patternsByType.behavioral}\n`;
    output += `  模式评分: ${report.patternAnalysis.summary.patternScore}/100\n\n`;
    
    output += '重构建议:\n';
    output += `  总重构建议: ${report.refactoringSuggestions.length}\n`;
    output += `  关键建议: ${report.refactoringSuggestions.filter(s => s.priority === 'critical').length}\n`;
    output += `  高优先级建议: ${report.refactoringSuggestions.filter(s => s.priority === 'high').length}\n`;
    output += `  改进潜力: ${report.summary.improvementPotential}\n\n`;
    
    output += '详细重构建议:\n';
    output += '优先级\t类型\t\t标题\t\t\t文件\t\t工作量\t影响\n';
    output += '─'.repeat(100) + '\n';
    
    report.refactoringSuggestions.forEach(suggestion => {
      output += `${suggestion.priority.padEnd(8)}\t${suggestion.type.padEnd(10)}\t`;
      output += `${suggestion.title.padEnd(20)}\t${suggestion.file.padEnd(15)}\t`;
      output += `${suggestion.effort.padEnd(8)}\t${suggestion.impact}\n`;
    });
    
    output += '\n综合建议:\n';
    report.recommendations.forEach((rec, index) => {
      output += `  ${index + 1}. ${rec}\n`;
    });
    
    return output;
  }

  printSummary(report: ComprehensiveArchitectureReport): void {
    console.log('\n' + '='.repeat(60));
    console.log('🏗️ 综合架构重构分析总结');
    console.log('='.repeat(60));
    
    console.log(`📊 架构分析:`);
    console.log(`  架构评分: ${report.architectureAnalysis.summary.overallScore}/100`);
    console.log(`  健康状态: ${report.architectureAnalysis.summary.healthStatus}`);
    console.log(`  循环依赖: ${report.architectureAnalysis.metrics.circularDependencies.length}`);
    console.log(`  关键问题: ${report.architectureAnalysis.summary.criticalIssues}`);
    
    console.log(`\n🔍 设计模式分析:`);
    console.log(`  检测到的模式: ${report.patternAnalysis.totalPatterns}`);
    console.log(`  模式评分: ${report.patternAnalysis.summary.patternScore}/100`);
    console.log(`  最常用模式: ${report.patternAnalysis.summary.mostUsedPattern}`);
    console.log(`  缺失模式: ${report.patternAnalysis.summary.missingPatterns.length}`);
    
    console.log(`\n🔧 重构建议:`);
    console.log(`  总重构建议: ${report.refactoringSuggestions.length}`);
    console.log(`  关键建议: ${report.refactoringSuggestions.filter(s => s.priority === 'critical').length}`);
    console.log(`  高优先级建议: ${report.refactoringSuggestions.filter(s => s.priority === 'high').length}`);
    console.log(`  改进潜力: ${report.summary.improvementPotential}`);
    
    console.log('\n💡 优先建议:');
    report.recommendations.slice(0, 5).forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec}`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ 综合架构重构分析完成！');
    console.log('📁 详细报告请查看 reports/ 目录');
    console.log('='.repeat(60));
  }
}

// 命令行接口
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'full';
  const projectRoot = process.cwd();
  
  const refactor = new ComprehensiveArchitectureRefactor(projectRoot);
  
  switch (command) {
    case 'quick':
      console.log('⚡ 运行快速架构分析...');
      const quickReport = await refactor.runComprehensiveAnalysis();
      refactor.printSummary(quickReport);
      break;
    case 'full':
    default:
      await refactor.generateComprehensiveReport();
      const report = await refactor.runComprehensiveAnalysis();
      refactor.printSummary(report);
      break;
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { ComprehensiveArchitectureRefactor };
