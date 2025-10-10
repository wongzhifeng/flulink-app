#!/usr/bin/env node

import { SimpleCodeQualityAnalyzer } from './simpleCodeQualityAnalyzer.js';
import { SimplePerformanceAnalyzer } from './simplePerformanceAnalyzer.js';
import { SimpleSecurityScanner } from './simpleSecurityScanner.js';
import fs from 'fs';
import path from 'path';

class ComprehensiveAnalyzer {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
  }

  async runComprehensiveAnalysis() {
    console.log('🚀 开始综合代码分析...\n');

    try {
      // 1. 代码质量分析
      console.log('📊 执行代码质量分析...');
      const qualityAnalyzer = new SimpleCodeQualityAnalyzer(this.projectRoot);
      const qualityReport = await qualityAnalyzer.analyzeProject();
      
      // 2. 性能分析
      console.log('⚡ 执行性能分析...');
      const performanceAnalyzer = new SimplePerformanceAnalyzer(this.projectRoot);
      const performanceReport = await performanceAnalyzer.analyzePerformance();
      
      // 3. 安全扫描
      console.log('🔒 执行安全扫描...');
      const securityScanner = new SimpleSecurityScanner(this.projectRoot);
      const securityReport = await securityScanner.scanSecurity();
      
      // 4. 生成综合报告
      const comprehensiveReport = this.generateComprehensiveReport(
        qualityReport,
        performanceReport,
        securityReport
      );
      
      // 5. 保存报告
      await this.saveReports(comprehensiveReport);
      
      console.log('\n✅ 综合代码分析完成！');
      return comprehensiveReport;
      
    } catch (error) {
      console.error('❌ 综合分析失败:', error);
      throw error;
    }
  }

  generateComprehensiveReport(qualityReport, performanceReport, securityReport) {
    const overallScore = Math.round(
      (qualityReport.overallScore + performanceReport.performanceScore + securityReport.securityScore) / 3
    );
    
    return {
      timestamp: new Date().toISOString(),
      overallScore,
      qualityReport,
      performanceReport,
      securityReport,
      summary: {
        totalFiles: qualityReport.summary.totalFiles,
        overallScore,
        qualityScore: qualityReport.overallScore,
        performanceScore: performanceReport.performanceScore,
        securityScore: securityReport.securityScore,
        criticalIssues: securityReport.summary.criticalVulnerabilities,
        recommendations: [
          ...qualityReport.summary.recommendations,
          ...performanceReport.summary.recommendations,
          ...securityReport.summary.recommendations
        ]
      }
    };
  }

  async saveReports(report) {
    const reportsDir = path.join(this.projectRoot, 'reports');
    
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // 保存JSON报告
    const jsonReportPath = path.join(reportsDir, 'comprehensive-analysis-report.json');
    fs.writeFileSync(jsonReportPath, JSON.stringify(report, null, 2));
    console.log(`✅ JSON报告已保存: ${jsonReportPath}`);

    // 生成HTML报告
    const htmlReport = this.generateHTMLReport(report);
    const htmlReportPath = path.join(reportsDir, 'comprehensive-analysis-report.html');
    fs.writeFileSync(htmlReportPath, htmlReport);
    console.log(`✅ HTML报告已保存: ${htmlReportPath}`);

    // 生成文本报告
    const textReport = this.generateTextReport(report);
    const textReportPath = path.join(reportsDir, 'comprehensive-analysis-report.txt');
    fs.writeFileSync(textReportPath, textReport);
    console.log(`✅ 文本报告已保存: ${textReportPath}`);
  }

  generateHTMLReport(report) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FluLink 综合代码分析报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px; }
        .metric { background: #f0f2f5; padding: 15px; border-radius: 6px; text-align: center; }
        .metric-value { font-size: 24px; font-weight: bold; }
        .metric-excellent { color: #52c41a; }
        .metric-good { color: #1890ff; }
        .metric-warning { color: #faad14; }
        .metric-danger { color: #ff4d4f; }
        .metric-label { color: #666; margin-top: 5px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #1890ff; border-bottom: 2px solid #1890ff; padding-bottom: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>FluLink 综合代码分析报告</h1>
            <p>生成时间: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="metrics">
            <div class="metric">
                <div class="metric-value ${this.getScoreClass(report.overallScore)}">${report.overallScore}</div>
                <div class="metric-label">综合评分</div>
            </div>
            <div class="metric">
                <div class="metric-value ${this.getScoreClass(report.qualityReport.overallScore)}">${report.qualityReport.overallScore}</div>
                <div class="metric-label">代码质量</div>
            </div>
            <div class="metric">
                <div class="metric-value ${this.getScoreClass(report.performanceReport.performanceScore)}">${report.performanceReport.performanceScore}</div>
                <div class="metric-label">性能评分</div>
            </div>
            <div class="metric">
                <div class="metric-value ${this.getScoreClass(report.securityReport.securityScore)}">${report.securityReport.securityScore}</div>
                <div class="metric-label">安全评分</div>
            </div>
        </div>
        
        <div class="section">
            <h2>分析摘要</h2>
            <p>总文件数: ${report.summary.totalFiles}</p>
            <p>关键问题: ${report.summary.criticalIssues}</p>
            <p>分析时间: ${report.timestamp}</p>
        </div>
        
        <div class="section">
            <h2>建议</h2>
            <ul>
                ${report.summary.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
    </div>
</body>
</html>`;
  }

  getScoreClass(score) {
    if (score >= 80) return 'metric-excellent';
    if (score >= 60) return 'metric-good';
    if (score >= 40) return 'metric-warning';
    return 'metric-danger';
  }

  generateTextReport(report) {
    let output = '\n=== FluLink 综合代码分析报告 ===\n\n';
    output += `生成时间: ${report.timestamp}\n`;
    output += `总文件数: ${report.summary.totalFiles}\n\n`;
    
    output += '评分结果:\n';
    output += `  综合评分: ${report.overallScore}/100\n`;
    output += `  代码质量: ${report.qualityReport.overallScore}/100\n`;
    output += `  性能评分: ${report.performanceReport.performanceScore}/100\n`;
    output += `  安全评分: ${report.securityReport.securityScore}/100\n\n`;
    
    output += '问题统计:\n';
    output += `  关键安全漏洞: ${report.summary.criticalIssues}\n`;
    output += `  性能问题: ${report.performanceReport.summary.totalPerformanceIssues}\n`;
    output += `  内存问题: ${report.performanceReport.summary.totalMemoryIssues}\n`;
    output += `  代码质量问题: ${report.qualityReport.summary.totalIssues}\n\n`;
    
    output += '建议:\n';
    report.summary.recommendations.forEach((rec, index) => {
      output += `  ${index + 1}. ${rec}\n`;
    });
    
    return output;
  }

  printSummary(report) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 综合代码分析总结');
    console.log('='.repeat(60));
    
    console.log(`📈 综合评分: ${report.overallScore}/100`);
    console.log(`📝 代码质量: ${report.qualityReport.overallScore}/100`);
    console.log(`⚡ 性能评分: ${report.performanceReport.performanceScore}/100`);
    console.log(`🔒 安全评分: ${report.securityReport.securityScore}/100`);
    
    console.log(`\n📁 分析文件数: ${report.summary.totalFiles}`);
    console.log(`🚨 关键问题: ${report.summary.criticalIssues}`);
    
    console.log('\n💡 优先建议:');
    report.summary.recommendations.slice(0, 5).forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec}`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ 综合代码分析完成！');
    console.log('📁 详细报告请查看 reports/ 目录');
    console.log('='.repeat(60));
  }
}

// 命令行接口
async function main() {
  const args = process.argv.slice(2);
  const projectRoot = args[0] || process.cwd();
  
  const analyzer = new ComprehensiveAnalyzer(projectRoot);
  
  try {
    const report = await analyzer.runComprehensiveAnalysis();
    analyzer.printSummary(report);
  } catch (error) {
    console.error('❌ 分析失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { ComprehensiveAnalyzer };
