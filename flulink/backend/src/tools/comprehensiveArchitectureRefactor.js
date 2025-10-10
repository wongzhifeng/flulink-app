import fs from 'fs';
import path from 'path';
import { ArchitectureAnalyzer } from './architectureAnalyzer.js';
import { DesignPatternDetector } from './designPatternDetector.js';

class ComprehensiveArchitectureRefactor {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.architectureAnalyzer = new ArchitectureAnalyzer(projectRoot);
    this.patternDetector = new DesignPatternDetector(projectRoot);
  }

  async performComprehensiveRefactor() {
    console.log('🔧 开始综合架构重构分析...');
    
    try {
      // 1. 执行架构分析
      console.log('📊 执行架构分析...');
      const architectureReport = await this.architectureAnalyzer.analyzeArchitecture();
      
      // 2. 执行设计模式检测
      console.log('🔍 执行设计模式检测...');
      const patternReport = await this.patternDetector.detectPatterns();
      
      // 3. 生成重构建议
      const refactorSuggestions = this.generateRefactorSuggestions(architectureReport, patternReport);
      
      // 4. 生成重构计划
      const refactorPlan = this.generateRefactorPlan(refactorSuggestions);
      
      // 5. 生成综合报告
      const comprehensiveReport = this.generateComprehensiveReport(
        architectureReport,
        patternReport,
        refactorSuggestions,
        refactorPlan
      );
      
      // 6. 保存报告
      await this.saveReports(comprehensiveReport);
      
      console.log('✅ 综合架构重构分析完成');
      return comprehensiveReport;
      
    } catch (error) {
      console.error('❌ 综合架构重构分析失败:', error);
      throw error;
    }
  }

  generateRefactorSuggestions(architectureReport, patternReport) {
    const suggestions = {
      critical: [],
      high: [],
      medium: [],
      low: []
    };

    // 基于架构分析的建议
    if (architectureReport.circularDependencies.length > 0) {
      suggestions.critical.push({
        type: 'circular_dependency',
        title: '修复循环依赖',
        description: `发现 ${architectureReport.circularDependencies.length} 个循环依赖`,
        impact: 'critical',
        effort: 'high',
        files: architectureReport.circularDependencies.map(circ => circ.cycle.join(' → ')),
        solution: '重构模块依赖关系，使用依赖注入或事件驱动模式'
      });
    }

    if (architectureReport.couplingAnalysis.couplingDistribution.high > 0) {
      suggestions.high.push({
        type: 'high_coupling',
        title: '降低模块耦合度',
        description: `发现 ${architectureReport.couplingAnalysis.couplingDistribution.high} 个高耦合模块`,
        impact: 'high',
        effort: 'medium',
        files: architectureReport.couplingAnalysis.highlyCoupledModules.map(m => m.module),
        solution: '使用接口抽象、依赖注入或事件总线降低耦合'
      });
    }

    // 基于设计模式检测的建议
    if (patternReport.patterns.singletons.length === 0) {
      suggestions.medium.push({
        type: 'missing_singleton',
        title: '考虑使用单例模式',
        description: '未发现单例模式使用',
        impact: 'medium',
        effort: 'low',
        files: [],
        solution: '为全局状态管理引入单例模式'
      });
    }

    if (patternReport.patterns.factories.length === 0) {
      suggestions.medium.push({
        type: 'missing_factory',
        title: '考虑使用工厂模式',
        description: '未发现工厂模式使用',
        impact: 'medium',
        effort: 'medium',
        files: [],
        solution: '为复杂对象创建引入工厂模式'
      });
    }

    if (patternReport.patterns.observers.length === 0) {
      suggestions.medium.push({
        type: 'missing_observer',
        title: '考虑使用观察者模式',
        description: '未发现观察者模式使用',
        impact: 'medium',
        effort: 'medium',
        files: [],
        solution: '为事件驱动架构引入观察者模式'
      });
    }

    // 基于API设计的建议
    if (architectureReport.apiAnalysis.totalEndpoints === 0) {
      suggestions.critical.push({
        type: 'missing_api',
        title: '添加API端点',
        description: '未发现API端点',
        impact: 'critical',
        effort: 'high',
        files: [],
        solution: '实现RESTful API端点'
      });
    }

    return suggestions;
  }

  generateRefactorPlan(refactorSuggestions) {
    const plan = {
      phases: [],
      timeline: {
        critical: '1-2周',
        high: '2-4周',
        medium: '1-2个月',
        low: '2-3个月'
      },
      resources: {
        developers: 2,
        estimatedHours: 0
      }
    };

    // 按优先级组织重构阶段
    const priorities = ['critical', 'high', 'medium', 'low'];
    
    priorities.forEach(priority => {
      const suggestions = refactorSuggestions[priority];
      if (suggestions.length > 0) {
        plan.phases.push({
          phase: priority,
          title: this.getPhaseTitle(priority),
          suggestions: suggestions,
          estimatedEffort: this.calculatePhaseEffort(suggestions),
          dependencies: this.identifyPhaseDependencies(suggestions)
        });
      }
    });

    // 计算总资源需求
    plan.resources.estimatedHours = plan.phases.reduce((total, phase) => {
      return total + phase.estimatedEffort.hours;
    }, 0);

    return plan;
  }

  getPhaseTitle(priority) {
    const titles = {
      critical: '紧急修复阶段',
      high: '高优先级重构阶段',
      medium: '架构优化阶段',
      low: '长期改进阶段'
    };
    return titles[priority] || '未知阶段';
  }

  calculatePhaseEffort(suggestions) {
    const effortMap = {
      critical: { hours: 40, complexity: 'high' },
      high: { hours: 20, complexity: 'medium' },
      medium: { hours: 10, complexity: 'medium' },
      low: { hours: 5, complexity: 'low' }
    };

    let totalHours = 0;
    let maxComplexity = 'low';

    suggestions.forEach(suggestion => {
      const effort = effortMap[suggestion.effort] || effortMap.medium;
      totalHours += effort.hours;
      
      if (effort.complexity === 'high') maxComplexity = 'high';
      else if (effort.complexity === 'medium' && maxComplexity !== 'high') maxComplexity = 'medium';
    });

    return {
      hours: totalHours,
      complexity: maxComplexity,
      suggestions: suggestions.length
    };
  }

  identifyPhaseDependencies(suggestions) {
    const dependencies = [];
    
    suggestions.forEach(suggestion => {
      if (suggestion.type === 'circular_dependency') {
        dependencies.push('需要先解决循环依赖才能进行其他重构');
      }
      if (suggestion.type === 'high_coupling') {
        dependencies.push('需要先降低耦合度才能进行模块化重构');
      }
    });

    return dependencies;
  }

  generateComprehensiveReport(architectureReport, patternReport, refactorSuggestions, refactorPlan) {
    const overallScore = Math.round(
      (architectureReport.healthScore + patternReport.patternScore) / 2
    );

    return {
      timestamp: new Date().toISOString(),
      overallScore,
      architectureReport,
      patternReport,
      refactorSuggestions,
      refactorPlan,
      summary: {
        totalSuggestions: Object.values(refactorSuggestions).flat().length,
        criticalIssues: refactorSuggestions.critical.length,
        highPriorityIssues: refactorSuggestions.high.length,
        estimatedEffort: refactorPlan.resources.estimatedHours,
        timeline: refactorPlan.timeline,
        recommendations: this.generateFinalRecommendations(refactorSuggestions)
      }
    };
  }

  generateFinalRecommendations(refactorSuggestions) {
    const recommendations = [];
    
    if (refactorSuggestions.critical.length > 0) {
      recommendations.push('立即处理关键问题，避免系统稳定性风险');
    }
    
    if (refactorSuggestions.high.length > 0) {
      recommendations.push('优先处理高优先级问题，提升系统质量');
    }
    
    if (refactorSuggestions.medium.length > 0) {
      recommendations.push('逐步引入设计模式，改善代码结构');
    }
    
    if (refactorSuggestions.low.length > 0) {
      recommendations.push('长期规划架构演进，持续改进');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('架构设计良好，继续保持');
    }
    
    return recommendations;
  }

  async saveReports(report) {
    const reportsDir = path.join(this.projectRoot, 'reports');
    
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // 保存JSON报告
    const jsonReportPath = path.join(reportsDir, 'comprehensive-architecture-refactor-report.json');
    fs.writeFileSync(jsonReportPath, JSON.stringify(report, null, 2));
    console.log(`✅ JSON报告已保存: ${jsonReportPath}`);

    // 生成HTML报告
    const htmlReport = this.generateHTMLReport(report);
    const htmlReportPath = path.join(reportsDir, 'comprehensive-architecture-refactor-report.html');
    fs.writeFileSync(htmlReportPath, htmlReport);
    console.log(`✅ HTML报告已保存: ${htmlReportPath}`);

    // 生成重构计划文档
    const planDoc = this.generateRefactorPlanDoc(report);
    const planDocPath = path.join(reportsDir, 'refactor-plan.md');
    fs.writeFileSync(planDocPath, planDoc);
    console.log(`✅ 重构计划已保存: ${planDocPath}`);
  }

  generateHTMLReport(report) {
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
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px; }
        .metric { background: #f0f2f5; padding: 15px; border-radius: 6px; text-align: center; }
        .metric-value { font-size: 24px; font-weight: bold; color: #1890ff; }
        .metric-label { color: #666; margin-top: 5px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #1890ff; border-bottom: 2px solid #1890ff; padding-bottom: 10px; }
        .priority-critical { color: #ff4d4f; }
        .priority-high { color: #faad14; }
        .priority-medium { color: #1890ff; }
        .priority-low { color: #52c41a; }
        .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #e8e8e8; }
        .table th { background: #fafafa; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>FluLink 综合架构重构报告</h1>
            <p>生成时间: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="metrics">
            <div class="metric">
                <div class="metric-value">${report.overallScore}</div>
                <div class="metric-label">综合评分</div>
            </div>
            <div class="metric">
                <div class="metric-value">${report.summary.totalSuggestions}</div>
                <div class="metric-label">重构建议</div>
            </div>
            <div class="metric">
                <div class="metric-value">${report.summary.criticalIssues}</div>
                <div class="metric-label">关键问题</div>
            </div>
            <div class="metric">
                <div class="metric-value">${report.summary.estimatedEffort}</div>
                <div class="metric-label">预估工时</div>
            </div>
        </div>
        
        <div class="section">
            <h2>重构建议</h2>
            ${Object.entries(report.refactorSuggestions).map(([priority, suggestions]) => `
                <h3 class="priority-${priority}">${priority.toUpperCase()} 优先级 (${suggestions.length} 项)</h3>
                ${suggestions.length > 0 ? `
                    <table class="table">
                        <thead>
                            <tr>
                                <th>标题</th>
                                <th>描述</th>
                                <th>影响</th>
                                <th>工作量</th>
                                <th>解决方案</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${suggestions.map(suggestion => `
                                <tr>
                                    <td>${suggestion.title}</td>
                                    <td>${suggestion.description}</td>
                                    <td>${suggestion.impact}</td>
                                    <td>${suggestion.effort}</td>
                                    <td>${suggestion.solution}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                ` : '<p>无建议</p>'}
            `).join('')}
        </div>
        
        <div class="section">
            <h2>重构计划</h2>
            ${report.refactorPlan.phases.map(phase => `
                <h3>${phase.title}</h3>
                <p>预估工时: ${phase.estimatedEffort.hours} 小时</p>
                <p>复杂度: ${phase.estimatedEffort.complexity}</p>
                <p>建议数量: ${phase.estimatedEffort.suggestions}</p>
                ${phase.dependencies.length > 0 ? `
                    <p>依赖: ${phase.dependencies.join(', ')}</p>
                ` : ''}
            `).join('')}
        </div>
        
        <div class="section">
            <h2>最终建议</h2>
            <ul>
                ${report.summary.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
    </div>
</body>
</html>`;
  }

  generateRefactorPlanDoc(report) {
    let doc = '# FluLink 架构重构计划\n\n';
    doc += `生成时间: ${report.timestamp}\n\n`;
    doc += `## 执行摘要\n\n`;
    doc += `- 综合评分: ${report.overallScore}/100\n`;
    doc += `- 总建议数: ${report.summary.totalSuggestions}\n`;
    doc += `- 关键问题: ${report.summary.criticalIssues}\n`;
    doc += `- 预估工时: ${report.summary.estimatedEffort} 小时\n\n`;
    
    doc += `## 重构阶段\n\n`;
    report.refactorPlan.phases.forEach((phase, index) => {
      doc += `### 阶段 ${index + 1}: ${phase.title}\n\n`;
      doc += `- 预估工时: ${phase.estimatedEffort.hours} 小时\n`;
      doc += `- 复杂度: ${phase.estimatedEffort.complexity}\n`;
      doc += `- 建议数量: ${phase.estimatedEffort.suggestions}\n\n`;
      
      if (phase.suggestions.length > 0) {
        doc += `#### 具体建议\n\n`;
        phase.suggestions.forEach(suggestion => {
          doc += `- **${suggestion.title}**: ${suggestion.description}\n`;
          doc += `  - 影响: ${suggestion.impact}\n`;
          doc += `  - 工作量: ${suggestion.effort}\n`;
          doc += `  - 解决方案: ${suggestion.solution}\n\n`;
        });
      }
    });
    
    doc += `## 时间线\n\n`;
    Object.entries(report.summary.timeline).forEach(([priority, timeline]) => {
      doc += `- ${priority}: ${timeline}\n`;
    });
    
    doc += `\n## 建议\n\n`;
    report.summary.recommendations.forEach((rec, index) => {
      doc += `${index + 1}. ${rec}\n`;
    });
    
    return doc;
  }
}

export { ComprehensiveArchitectureRefactor };