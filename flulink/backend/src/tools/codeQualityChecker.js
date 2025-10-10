#!/usr/bin/env node

import { CodeQualityAnalyzer } from './codeQualityAnalyzer.js';
import { CodeRefactoringTool } from './codeRefactoringTool.js';
import fs from 'fs';
import path from 'path';

class CodeQualityChecker {
  private projectRoot: string;
  private analyzer: CodeQualityAnalyzer;
  private refactoringTool: CodeRefactoringTool;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.analyzer = new CodeQualityAnalyzer(projectRoot);
    this.refactoringTool = new CodeRefactoringTool();
  }

  async runFullAnalysis(): Promise<void> {
    console.log('🚀 开始全面代码质量分析...\n');

    try {
      // 1. 代码质量分析
      console.log('📊 执行代码质量分析...');
      const qualityReport = await this.analyzer.analyzeProject();
      
      // 2. 代码重构分析
      console.log('🔧 执行代码重构分析...');
      const refactoringResults = await this.refactoringTool.refactorProject(this.projectRoot);
      
      // 3. 生成报告
      console.log('📝 生成分析报告...');
      await this.generateReports(qualityReport, refactoringResults);
      
      // 4. 输出总结
      this.printSummary(qualityReport, refactoringResults);
      
    } catch (error) {
      console.error('❌ 代码质量分析失败:', error);
      process.exit(1);
    }
  }

  private async generateReports(qualityReport: any, refactoringResults: any[]): Promise<void> {
    const reportsDir = path.join(this.projectRoot, 'reports');
    
    // 确保reports目录存在
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // 生成代码质量报告
    const qualityReportPath = path.join(reportsDir, 'code-quality-report.json');
    fs.writeFileSync(qualityReportPath, JSON.stringify(qualityReport, null, 2));
    console.log(`✅ 代码质量报告已保存: ${qualityReportPath}`);

    // 生成HTML报告
    const htmlReport = this.analyzer.generateHTMLReport(qualityReport);
    const htmlReportPath = path.join(reportsDir, 'code-quality-report.html');
    fs.writeFileSync(htmlReportPath, htmlReport);
    console.log(`✅ HTML报告已保存: ${htmlReportPath}`);

    // 生成重构报告
    const refactoringReport = this.refactoringTool.generateReport();
    const refactoringReportPath = path.join(reportsDir, 'refactoring-report.txt');
    fs.writeFileSync(refactoringReportPath, refactoringReport);
    console.log(`✅ 重构报告已保存: ${refactoringReportPath}`);

    // 生成重构结果JSON
    const refactoringJsonPath = path.join(reportsDir, 'refactoring-results.json');
    fs.writeFileSync(refactoringJsonPath, JSON.stringify(refactoringResults, null, 2));
    console.log(`✅ 重构结果已保存: ${refactoringJsonPath}`);
  }

  private printSummary(qualityReport: any, refactoringResults: any[]): void {
    console.log('\n' + '='.repeat(60));
    console.log('📋 代码质量分析总结');
    console.log('='.repeat(60));
    
    // 质量评分
    const score = qualityReport.overallScore;
    const scoreEmoji = score >= 80 ? '🟢' : score >= 60 ? '🟡' : '🔴';
    console.log(`${scoreEmoji} 总体质量评分: ${score}/100`);
    
    // 文件统计
    console.log(`📁 分析文件数量: ${qualityReport.summary.totalFiles}`);
    console.log(`📊 平均复杂度: ${qualityReport.summary.averageComplexity}`);
    console.log(`🔧 平均可维护性: ${qualityReport.summary.averageMaintainability}`);
    console.log(`⚠️  总问题数量: ${qualityReport.summary.totalIssues}`);
    console.log(`🚨 严重问题数量: ${qualityReport.summary.criticalIssues}`);
    
    // 重构统计
    console.log(`\n🔧 重构建议数量: ${refactoringResults.length}`);
    const refactoringBySeverity = refactoringResults.reduce((acc, r) => {
      acc[r.severity] = (acc[r.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(refactoringBySeverity).forEach(([severity, count]) => {
      const emoji = severity === 'high' ? '🔴' : severity === 'medium' ? '🟡' : '🟢';
      console.log(`${emoji} ${severity} 级别: ${count} 个`);
    });
    
    // 建议
    console.log('\n💡 改进建议:');
    qualityReport.summary.recommendations.forEach((rec: string, index: number) => {
      console.log(`   ${index + 1}. ${rec}`);
    });
    
    const refactoringSuggestions = this.refactoringTool.generateSuggestions();
    refactoringSuggestions.forEach((suggestion: string, index: number) => {
      console.log(`   ${qualityReport.summary.recommendations.length + index + 1}. ${suggestion}`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ 代码质量分析完成！');
    console.log('📁 详细报告请查看 reports/ 目录');
    console.log('='.repeat(60));
  }

  // 运行特定类型的分析
  async runQualityAnalysisOnly(): Promise<void> {
    console.log('📊 执行代码质量分析...');
    const qualityReport = await this.analyzer.analyzeProject();
    
    const reportsDir = path.join(this.projectRoot, 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const reportPath = path.join(reportsDir, 'quality-analysis.json');
    fs.writeFileSync(reportPath, JSON.stringify(qualityReport, null, 2));
    
    console.log(`✅ 质量分析报告已保存: ${reportPath}`);
    console.log(`📊 总体评分: ${qualityReport.overallScore}/100`);
  }

  async runRefactoringAnalysisOnly(): Promise<void> {
    console.log('🔧 执行代码重构分析...');
    const refactoringResults = await this.refactoringTool.refactorProject(this.projectRoot);
    
    const reportsDir = path.join(this.projectRoot, 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const reportPath = path.join(reportsDir, 'refactoring-analysis.json');
    fs.writeFileSync(reportPath, JSON.stringify(refactoringResults, null, 2));
    
    console.log(`✅ 重构分析报告已保存: ${reportPath}`);
    console.log(`🔧 重构建议数量: ${refactoringResults.length}`);
  }

  // 应用重构
  async applyRefactoring(): Promise<void> {
    console.log('🔧 应用代码重构...');
    
    const refactoringResults = await this.refactoringTool.refactorProject(this.projectRoot);
    
    // 只应用高严重程度的重构
    const highSeverityResults = refactoringResults.filter(r => r.severity === 'high');
    
    if (highSeverityResults.length === 0) {
      console.log('✅ 没有需要应用的高严重程度重构');
      return;
    }
    
    console.log(`🔧 应用 ${highSeverityResults.length} 个高严重程度重构...`);
    
    // 按文件分组
    const resultsByFile = highSeverityResults.reduce((acc, result) => {
      if (!acc[result.file]) {
        acc[result.file] = [];
      }
      acc[result.file].push(result);
      return acc;
    }, {} as Record<string, any[]>);
    
    // 应用重构
    Object.entries(resultsByFile).forEach(([filePath, results]) => {
      const fullPath = path.join(this.projectRoot, filePath);
      if (fs.existsSync(fullPath)) {
        this.refactoringTool.applyRefactoring(fullPath, results);
        console.log(`✅ 重构完成: ${filePath}`);
      }
    });
    
    console.log('🎉 重构应用完成！');
  }
}

// 命令行接口
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'full';
  const projectRoot = process.cwd();
  
  const checker = new CodeQualityChecker(projectRoot);
  
  switch (command) {
    case 'quality':
      await checker.runQualityAnalysisOnly();
      break;
    case 'refactor':
      await checker.runRefactoringAnalysisOnly();
      break;
    case 'apply':
      await checker.applyRefactoring();
      break;
    case 'full':
    default:
      await checker.runFullAnalysis();
      break;
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { CodeQualityChecker };
