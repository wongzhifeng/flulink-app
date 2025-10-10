#!/usr/bin/env node

import { SecurityScanner } from './securityScanner.js';
import { SecurityHardeningTool } from './securityHardeningTool.js';
import fs from 'fs';
import path from 'path';

class ComprehensiveSecurityAnalyzer {
  // private projectRoot: string;
  // private securityScanner: SecurityScanner;
  // private hardeningTool: SecurityHardeningTool;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.securityScanner = new SecurityScanner(projectRoot);
    this.hardeningTool = new SecurityHardeningTool(projectRoot);
  }

  async runFullSecurityAnalysis(): Promise<void> {
    console.log('🔒 开始全面安全分析...\n');

    try {
      // 1. 安全漏洞扫描
      console.log('🔍 执行安全漏洞扫描...');
      const securityReport = await this.securityScanner.scanProject();
      
      // 2. 安全加固分析
      console.log('🛡️ 执行安全加固分析...');
      const hardeningReport = this.hardeningTool.analyzeProject();
      
      // 3. 生成综合报告
      console.log('📝 生成综合安全报告...');
      await this.generateComprehensiveReport(securityReport, hardeningReport);
      
      // 4. 输出总结
      this.printSummary(securityReport, hardeningReport);
      
    } catch (error) {
      console.error('❌ 安全分析失败:', error);
      process.exit(1);
    }
  }

  // private async generateComprehensiveReport(
    securityReport: any,
    hardeningReport: any
  ): Promise<void> {
    const reportsDir = path.join(this.projectRoot, 'reports');
    
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // 生成安全扫描报告
    const securityReportPath = path.join(reportsDir, 'security-scan-report.json');
    fs.writeFileSync(securityReportPath, JSON.stringify(securityReport, null, 2));
    console.log(`✅ 安全扫描报告已保存: ${securityReportPath}`);

    // 生成安全加固报告
    const hardeningReportPath = path.join(reportsDir, 'security-hardening-report.json');
    fs.writeFileSync(hardeningReportPath, JSON.stringify(hardeningReport, null, 2));
    console.log(`✅ 安全加固报告已保存: ${hardeningReportPath}`);

    // 生成综合HTML报告
    const htmlReport = this.generateHTMLReport(securityReport, hardeningReport);
    const htmlReportPath = path.join(reportsDir, 'comprehensive-security-report.html');
    fs.writeFileSync(htmlReportPath, htmlReport);
    console.log(`✅ 综合安全HTML报告已保存: ${htmlReportPath}`);

    // 生成综合文本报告
    const textReport = this.generateTextReport(securityReport, hardeningReport);
    const textReportPath = path.join(reportsDir, 'comprehensive-security-report.txt');
    fs.writeFileSync(textReportPath, textReport);
    console.log(`✅ 综合安全文本报告已保存: ${textReportPath}`);
  }

  // private generateHTMLReport(securityReport: any, hardeningReport: any): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FluLink 综合安全分析报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #ff4d4f; border-bottom: 2px solid #ff4d4f; padding-bottom: 10px; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px; }
        .metric { background: #f0f2f5; padding: 15px; border-radius: 6px; text-align: center; }
        .metric-value { font-size: 24px; font-weight: bold; }
        .metric-critical { color: #ff4d4f; }
        .metric-high { color: #faad14; }
        .metric-medium { color: #52c41a; }
        .metric-low { color: #1890ff; }
        .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #e8e8e8; }
        .table th { background: #fafafa; font-weight: bold; }
        .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .badge-critical { background: #fff2f0; color: #ff4d4f; }
        .badge-high { background: #fffbe6; color: #faad14; }
        .badge-medium { background: #f6ffed; color: #52c41a; }
        .badge-low { background: #e6f7ff; color: #1890ff; }
        .risk-indicator { display: inline-block; width: 20px; height: 20px; border-radius: 50%; margin-right: 8px; }
        .risk-critical { background: #ff4d4f; }
        .risk-high { background: #faad14; }
        .risk-medium { background: #52c41a; }
        .risk-low { background: #1890ff; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>FluLink 综合安全分析报告</h1>
            <p>生成时间: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="section">
            <h2>安全漏洞概览</h2>
            <div class="metrics">
                <div class="metric">
                    <div class="metric-value metric-critical">${securityReport.criticalVulnerabilities}</div>
                    <div class="metric-label">关键漏洞</div>
                </div>
                <div class="metric">
                    <div class="metric-value metric-high">${securityReport.highVulnerabilities}</div>
                    <div class="metric-label">高危漏洞</div>
                </div>
                <div class="metric">
                    <div class="metric-value metric-medium">${securityReport.mediumVulnerabilities}</div>
                    <div class="metric-label">中危漏洞</div>
                </div>
                <div class="metric">
                    <div class="metric-value metric-low">${securityReport.lowVulnerabilities}</div>
                    <div class="metric-label">低危漏洞</div>
                </div>
            </div>
            <div class="metrics">
                <div class="metric">
                    <div class="metric-value">${securityReport.summary.riskScore}</div>
                    <div class="metric-label">风险评分</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${securityReport.summary.filesAffected}</div>
                    <div class="metric-label">受影响文件</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${securityReport.summary.dependenciesWithIssues}</div>
                    <div class="metric-label">问题依赖</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${securityReport.summary.mostCommonCategory}</div>
                    <div class="metric-label">最常见类别</div>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2>安全加固概览</h2>
            <div class="metrics">
                <div class="metric">
                    <div class="metric-value metric-critical">${hardeningReport.criticalHardening}</div>
                    <div class="metric-label">关键加固</div>
                </div>
                <div class="metric">
                    <div class="metric-value metric-high">${hardeningReport.highHardening}</div>
                    <div class="metric-label">高优先级加固</div>
                </div>
                <div class="metric">
                    <div class="metric-value metric-medium">${hardeningReport.mediumHardening}</div>
                    <div class="metric-label">中优先级加固</div>
                </div>
                <div class="metric">
                    <div class="metric-value metric-low">${hardeningReport.lowHardening}</div>
                    <div class="metric-label">低优先级加固</div>
                </div>
            </div>
            <div class="metrics">
                <div class="metric">
                    <div class="metric-value">${hardeningReport.summary.securityScore}</div>
                    <div class="metric-label">安全评分</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${hardeningReport.summary.mostImportantCategory}</div>
                    <div class="metric-label">最重要类别</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${hardeningReport.summary.implementationEffort}</div>
                    <div class="metric-label">实施工作量</div>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2>安全漏洞详情</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>风险等级</th>
                        <th>类别</th>
                        <th>标题</th>
                        <th>文件</th>
                        <th>行号</th>
                        <th>CWE</th>
                    </tr>
                </thead>
                <tbody>
                    ${securityReport.vulnerabilities.map(vuln => `
                        <tr>
                            <td>
                                <span class="risk-indicator risk-${vuln.severity}"></span>
                                <span class="badge badge-${vuln.severity}">${vuln.severity}</span>
                            </td>
                            <td>${vuln.category}</td>
                            <td>${vuln.title}</td>
                            <td>${vuln.file}</td>
                            <td>${vuln.line}</td>
                            <td>${vuln.cwe || 'N/A'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="section">
            <h2>安全加固措施</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>优先级</th>
                        <th>类别</th>
                        <th>标题</th>
                        <th>工作量</th>
                        <th>影响</th>
                    </tr>
                </thead>
                <tbody>
                    ${hardeningReport.hardening.map(hardening => `
                        <tr>
                            <td><span class="badge badge-${hardening.priority}">${hardening.priority}</span></td>
                            <td>${hardening.category}</td>
                            <td>${hardening.title}</td>
                            <td>${hardening.effort}</td>
                            <td>${hardening.impact}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="section">
            <h2>安全建议</h2>
            <h3>漏洞修复建议</h3>
            <ul>
                ${securityReport.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
            
            <h3>安全加固建议</h3>
            <ul>
                ${hardeningReport.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
    </div>
</body>
</html>`;
  }

  // private generateTextReport(securityReport: any, hardeningReport: any): string {
    let report = '\n=== FluLink 综合安全分析报告 ===\n\n';
    report += `生成时间: ${new Date().toLocaleString()}\n\n`;
    
    report += '安全漏洞扫描结果:\n';
    report += `  总漏洞数: ${securityReport.totalVulnerabilities}\n`;
    report += `  关键漏洞: ${securityReport.criticalVulnerabilities}\n`;
    report += `  高危漏洞: ${securityReport.highVulnerabilities}\n`;
    report += `  中危漏洞: ${securityReport.mediumVulnerabilities}\n`;
    report += `  低危漏洞: ${securityReport.lowVulnerabilities}\n`;
    report += `  风险评分: ${securityReport.summary.riskScore}/100\n`;
    report += `  受影响文件: ${securityReport.summary.filesAffected}\n`;
    report += `  问题依赖: ${securityReport.summary.dependenciesWithIssues}\n\n`;
    
    report += '安全加固分析结果:\n';
    report += `  总加固措施: ${hardeningReport.totalHardening}\n`;
    report += `  关键加固: ${hardeningReport.criticalHardening}\n`;
    report += `  高优先级加固: ${hardeningReport.highHardening}\n`;
    report += `  中优先级加固: ${hardeningReport.mediumHardening}\n`;
    report += `  低优先级加固: ${hardeningReport.lowHardening}\n`;
    report += `  安全评分: ${hardeningReport.summary.securityScore}/100\n`;
    report += `  最重要类别: ${hardeningReport.summary.mostImportantCategory}\n`;
    report += `  实施工作量: ${hardeningReport.summary.implementationEffort}\n\n`;
    
    report += '漏洞修复建议:\n';
    securityReport.recommendations.forEach((rec, index) => {
      report += `  ${index + 1}. ${rec}\n`;
    });
    
    report += '\n安全加固建议:\n';
    hardeningReport.recommendations.forEach((rec, index) => {
      report += `  ${index + 1}. ${rec}\n`;
    });
    
    return report;
  }

  // private printSummary(securityReport: any, hardeningReport: any): void {
    console.log('\n' + '='.repeat(60));
    console.log('🔒 综合安全分析总结');
    console.log('='.repeat(60));
    
    console.log(`🔍 安全漏洞扫描:`);
    console.log(`  总漏洞数: ${securityReport.totalVulnerabilities}`);
    console.log(`  关键漏洞: ${securityReport.criticalVulnerabilities}`);
    console.log(`  高危漏洞: ${securityReport.highVulnerabilities}`);
    console.log(`  风险评分: ${securityReport.summary.riskScore}/100`);
    
    console.log(`\n🛡️ 安全加固分析:`);
    console.log(`  总加固措施: ${hardeningReport.totalHardening}`);
    console.log(`  关键加固: ${hardeningReport.criticalHardening}`);
    console.log(`  高优先级加固: ${hardeningReport.highHardening}`);
    console.log(`  安全评分: ${hardeningReport.summary.securityScore}/100`);
    
    console.log('\n💡 优先建议:');
    const allRecommendations = [
      ...securityReport.recommendations,
      ...hardeningReport.recommendations
    ];
    allRecommendations.slice(0, 5).forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec}`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ 综合安全分析完成！');
    console.log('📁 详细报告请查看 reports/ 目录');
    console.log('='.repeat(60));
  }

  async runQuickSecurityAnalysis(): Promise<void> {
    console.log('⚡ 运行快速安全分析...');
    
    const hardeningReport = this.hardeningTool.analyzeProject();
    
    const reportsDir = path.join(this.projectRoot, 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const reportPath = path.join(reportsDir, 'quick-security-analysis.json');
    fs.writeFileSync(reportPath, JSON.stringify(hardeningReport, null, 2));
    
    console.log(`✅ 快速安全分析报告已保存: ${reportPath}`);
    console.log(`🛡️ 安全加固措施数量: ${hardeningReport.totalHardening}`);
    console.log(`🚨 关键加固措施: ${hardeningReport.criticalHardening}`);
  }
}

// 命令行接口
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'full';
  const projectRoot = process.cwd();
  
  const analyzer = new ComprehensiveSecurityAnalyzer(projectRoot);
  
  switch (command) {
    case 'quick':
      await analyzer.runQuickSecurityAnalysis();
      break;
    case 'full':
    default:
      await analyzer.runFullSecurityAnalysis();
      break;
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { ComprehensiveSecurityAnalyzer };
