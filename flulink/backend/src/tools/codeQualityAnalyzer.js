import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Code Quality Metrics
// interface CodeQualityMetrics {
//   file: string;
//   linesOfCode: number;
//   cyclomaticComplexity: number;
//   maintainabilityIndex: number;
//   codeDuplication: number;
//   testCoverage: number;
//   securityIssues: number;
//   performanceIssues: number;
//   accessibilityIssues: number;
//   codeSmells: string[];
//   suggestions: string[];
// }

// interface QualityReport {
//   timestamp: string;
  overallScore: number;
  files: CodeQualityMetrics[];
  summary: {
    totalFiles: number;
    averageComplexity: number;
    averageMaintainability: number;
    totalIssues: number;
    criticalIssues: number;
    recommendations: string[];
  };
}

class CodeQualityAnalyzer {
  private projectRoot: string;
  private results: CodeQualityMetrics[] = [];

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  // 分析单个文件
  analyzeFile(filePath: string): CodeQualityMetrics {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    const metrics: CodeQualityMetrics = {
      file: path.relative(this.projectRoot, filePath),
      linesOfCode: this.calculateLinesOfCode(lines),
      cyclomaticComplexity: this.calculateCyclomaticComplexity(content),
      maintainabilityIndex: this.calculateMaintainabilityIndex(content),
      codeDuplication: this.calculateCodeDuplication(content),
      testCoverage: this.calculateTestCoverage(filePath),
      securityIssues: this.analyzeSecurityIssues(content),
      performanceIssues: this.analyzePerformanceIssues(content),
      accessibilityIssues: this.analyzeAccessibilityIssues(content),
      codeSmells: this.detectCodeSmells(content),
      suggestions: []
    };

    // 生成建议
    metrics.suggestions = this.generateSuggestions(metrics);
    
    return metrics;
  }

  // 计算代码行数
  private calculateLinesOfCode(lines: string[]): number {
    return lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 0 && !trimmed.startsWith('//') && !trimmed.startsWith('/*');
    }).length;
  }

  // 计算圈复杂度
  private calculateCyclomaticComplexity(content: string): number {
    const complexityKeywords = [
      'if', 'else', 'while', 'for', 'switch', 'case', 'catch', '&&', '||', '?', ':'
    ];
    
    let complexity = 1; // 基础复杂度
    
    complexityKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      const matches = content.match(regex);
      if (matches) {
        complexity += matches.length;
      }
    });
    
    return complexity;
  }

  // 计算可维护性指数
  private calculateMaintainabilityIndex(content: string): number {
    const linesOfCode = content.split('\n').length;
    const cyclomaticComplexity = this.calculateCyclomaticComplexity(content);
    const commentRatio = this.calculateCommentRatio(content);
    
    // 简化的可维护性指数计算
    const maintainability = Math.max(0, 100 - 
      (linesOfCode * 0.1) - 
      (cyclomaticComplexity * 2) + 
      (commentRatio * 10)
    );
    
    return Math.min(100, maintainability);
  }

  // 计算注释比例
  private calculateCommentRatio(content: string): number {
    const lines = content.split('\n');
    const commentLines = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*');
    }).length;
    
    return lines.length > 0 ? commentLines / lines.length : 0;
  }

  // 计算代码重复率
  private calculateCodeDuplication(content: string): number {
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    const uniqueLines = new Set(lines);
    
    return lines.length > 0 ? (lines.length - uniqueLines.size) / lines.length : 0;
  }

  // 计算测试覆盖率
  private calculateTestCoverage(filePath: string): number {
    const testFile = filePath.replace(/\.(js|ts|tsx)$/, '.test.$1');
    
    if (fs.existsSync(testFile)) {
      const testContent = fs.readFileSync(testFile, 'utf8');
      const testLines = testContent.split('\n').length;
      const sourceLines = fs.readFileSync(filePath, 'utf8').split('\n').length;
      
      return Math.min(100, (testLines / sourceLines) * 100);
    }
    
    return 0;
  }

  // 分析安全问题
  private analyzeSecurityIssues(content: string): number {
    const securityPatterns = [
      /eval\s*\(/g,
      /innerHTML\s*=/g,
      /document\.write/g,
      /setTimeout\s*\(\s*["']/g,
      /setInterval\s*\(\s*["']/g,
      /new\s+Function\s*\(/g,
      /\.innerHTML\s*=/g,
      /dangerouslySetInnerHTML/g,
      /process\.env\./g,
      /localStorage\./g,
      /sessionStorage\./g
    ];
    
    let issues = 0;
    securityPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        issues += matches.length;
      }
    });
    
    return issues;
  }

  // 分析性能问题
  private analyzePerformanceIssues(content: string): number {
    const performancePatterns = [
      /for\s*\(\s*var\s+/g,
      /\.length\s*>\s*0/g,
      /\.length\s*===\s*0/g,
      /\.length\s*!==\s*0/g,
      /console\.log/g,
      /console\.warn/g,
      /console\.error/g,
      /debugger/g,
      /\.map\s*\(\s*function/g,
      /\.filter\s*\(\s*function/g,
      /\.forEach\s*\(\s*function/g
    ];
    
    let issues = 0;
    performancePatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        issues += matches.length;
      }
    });
    
    return issues;
  }

  // 分析可访问性问题
  private analyzeAccessibilityIssues(content: string): number {
    const accessibilityPatterns = [
      /<img\s+(?!.*alt=)/g,
      /<input\s+(?!.*aria-)/g,
      /<button\s+(?!.*aria-)/g,
      /<div\s+role=/g,
      /tabindex\s*=\s*["']-1["']/g,
      /onClick\s*=/g,
      /onKeyDown\s*=/g,
      /aria-hidden\s*=\s*["']true["']/g
    ];
    
    let issues = 0;
    accessibilityPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        issues += matches.length;
      }
    });
    
    return issues;
  }

  // 检测代码异味
  private detectCodeSmells(content: string): string[] {
    const smells: string[] = [];
    
    // 长函数
    const lines = content.split('\n');
    if (lines.length > 50) {
      smells.push('Long function (>50 lines)');
    }
    
    // 长参数列表
    const functionMatches = content.match(/function\s+\w+\s*\([^)]{50,}\)/g);
    if (functionMatches) {
      smells.push('Long parameter list');
    }
    
    // 重复代码
    const duplicateLines = this.findDuplicateLines(content);
    if (duplicateLines.length > 5) {
      smells.push('Code duplication detected');
    }
    
    // 魔法数字
    const magicNumbers = content.match(/\b\d{3,}\b/g);
    if (magicNumbers && magicNumbers.length > 3) {
      smells.push('Magic numbers detected');
    }
    
    // 深层嵌套
    const maxIndentation = Math.max(...lines.map(line => {
      const match = line.match(/^(\s*)/);
      return match ? match[1].length : 0;
    }));
    if (maxIndentation > 20) {
      smells.push('Deep nesting detected');
    }
    
    return smells;
  }

  // 查找重复行
  private findDuplicateLines(content: string): string[] {
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    const lineCount = new Map<string, number>();
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.length > 10) { // 只考虑长度大于10的行
        lineCount.set(trimmed, (lineCount.get(trimmed) || 0) + 1);
      }
    });
    
    return Array.from(lineCount.entries())
      .filter(([_, count]) => count > 1)
      .map(([line, _]) => line);
  }

  // 生成建议
  private generateSuggestions(metrics: CodeQualityMetrics): string[] {
    const suggestions: string[] = [];
    
    if (metrics.cyclomaticComplexity > 10) {
      suggestions.push('Consider breaking down complex functions into smaller ones');
    }
    
    if (metrics.maintainabilityIndex < 50) {
      suggestions.push('Improve code maintainability by adding comments and reducing complexity');
    }
    
    if (metrics.codeDuplication > 0.1) {
      suggestions.push('Refactor duplicate code into reusable functions or components');
    }
    
    if (metrics.testCoverage < 80) {
      suggestions.push('Increase test coverage by adding more unit tests');
    }
    
    if (metrics.securityIssues > 0) {
      suggestions.push('Address security vulnerabilities in the code');
    }
    
    if (metrics.performanceIssues > 5) {
      suggestions.push('Optimize performance by removing console logs and improving algorithms');
    }
    
    if (metrics.accessibilityIssues > 0) {
      suggestions.push('Improve accessibility by adding proper ARIA attributes and alt text');
    }
    
    if (metrics.codeSmells.length > 0) {
      suggestions.push('Refactor code to eliminate code smells');
    }
    
    return suggestions;
  }

  // 分析整个项目
  async analyzeProject(): Promise<QualityReport> {
    console.log('开始代码质量分析...');
    
    const files = this.getAllSourceFiles();
    console.log(`发现 ${files.length} 个源文件`);
    
    for (const file of files) {
      try {
        const metrics = this.analyzeFile(file);
        this.results.push(metrics);
        console.log(`分析完成: ${metrics.file}`);
      } catch (error) {
        console.error(`分析文件失败: ${file}`, error);
      }
    }
    
    return this.generateReport();
  }

  // 获取所有源文件
  private getAllSourceFiles(): string[] {
    const files: string[] = [];
    const extensions = ['.js', '.ts', '.tsx', '.jsx'];
    
    const scanDirectory = (dir: string) => {
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          // 跳过node_modules和.git目录
          if (!['node_modules', '.git', 'dist', 'build'].includes(item)) {
            scanDirectory(fullPath);
          }
        } else if (stat.isFile()) {
          const ext = path.extname(item);
          if (extensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      });
    };
    
    scanDirectory(this.projectRoot);
    return files;
  }

  // 生成报告
  private generateReport(): QualityReport {
    const totalFiles = this.results.length;
    const averageComplexity = this.results.reduce((sum, r) => sum + r.cyclomaticComplexity, 0) / totalFiles;
    const averageMaintainability = this.results.reduce((sum, r) => sum + r.maintainabilityIndex, 0) / totalFiles;
    const totalIssues = this.results.reduce((sum, r) => 
      sum + r.securityIssues + r.performanceIssues + r.accessibilityIssues, 0);
    const criticalIssues = this.results.filter(r => r.securityIssues > 0 || r.cyclomaticComplexity > 15).length;
    
    // 计算总体评分
    const overallScore = Math.max(0, 100 - 
      (averageComplexity * 2) - 
      (totalIssues * 0.5) - 
      ((100 - averageMaintainability) * 0.3)
    );
    
    const recommendations: string[] = [];
    
    if (averageComplexity > 8) {
      recommendations.push('Reduce average cyclomatic complexity');
    }
    
    if (averageMaintainability < 60) {
      recommendations.push('Improve code maintainability');
    }
    
    if (totalIssues > 20) {
      recommendations.push('Address security and performance issues');
    }
    
    if (criticalIssues > 0) {
      recommendations.push('Fix critical issues immediately');
    }
    
    return {
      timestamp: new Date().toISOString(),
      overallScore: Math.round(overallScore),
      files: this.results,
      summary: {
        totalFiles,
        averageComplexity: Math.round(averageComplexity * 100) / 100,
        averageMaintainability: Math.round(averageMaintainability * 100) / 100,
        totalIssues,
        criticalIssues,
        recommendations
      }
    };
  }

  // 生成HTML报告
  generateHTMLReport(report: QualityReport): string {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Quality Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .score { font-size: 48px; font-weight: bold; color: ${report.overallScore >= 80 ? '#52c41a' : report.overallScore >= 60 ? '#faad14' : '#ff4d4f'}; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric { background: #f0f2f5; padding: 15px; border-radius: 6px; text-align: center; }
        .metric-value { font-size: 24px; font-weight: bold; color: #1890ff; }
        .metric-label { color: #666; margin-top: 5px; }
        .files-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .files-table th, .files-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e8e8e8; }
        .files-table th { background: #fafafa; font-weight: bold; }
        .files-table tr:hover { background: #f5f5f5; }
        .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .badge-good { background: #f6ffed; color: #52c41a; }
        .badge-warning { background: #fffbe6; color: #faad14; }
        .badge-danger { background: #fff2f0; color: #ff4d4f; }
        .recommendations { background: #e6f7ff; padding: 20px; border-radius: 6px; margin-top: 20px; }
        .recommendations h3 { margin-top: 0; color: #1890ff; }
        .recommendations ul { margin: 0; }
        .recommendations li { margin-bottom: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Code Quality Report</h1>
            <div class="score">${report.overallScore}</div>
            <p>Overall Quality Score</p>
        </div>
        
        <div class="summary">
            <div class="metric">
                <div class="metric-value">${report.summary.totalFiles}</div>
                <div class="metric-label">Total Files</div>
            </div>
            <div class="metric">
                <div class="metric-value">${report.summary.averageComplexity}</div>
                <div class="metric-label">Avg Complexity</div>
            </div>
            <div class="metric">
                <div class="metric-value">${report.summary.averageMaintainability}</div>
                <div class="metric-label">Avg Maintainability</div>
            </div>
            <div class="metric">
                <div class="metric-value">${report.summary.totalIssues}</div>
                <div class="metric-label">Total Issues</div>
            </div>
            <div class="metric">
                <div class="metric-value">${report.summary.criticalIssues}</div>
                <div class="metric-label">Critical Issues</div>
            </div>
        </div>
        
        <table class="files-table">
            <thead>
                <tr>
                    <th>File</th>
                    <th>Lines</th>
                    <th>Complexity</th>
                    <th>Maintainability</th>
                    <th>Test Coverage</th>
                    <th>Issues</th>
                    <th>Smells</th>
                </tr>
            </thead>
            <tbody>
                ${report.files.map(file => `
                    <tr>
                        <td>${file.file}</td>
                        <td>${file.linesOfCode}</td>
                        <td><span class="badge ${file.cyclomaticComplexity > 10 ? 'badge-danger' : file.cyclomaticComplexity > 5 ? 'badge-warning' : 'badge-good'}">${file.cyclomaticComplexity}</span></td>
                        <td><span class="badge ${file.maintainabilityIndex > 70 ? 'badge-good' : file.maintainabilityIndex > 50 ? 'badge-warning' : 'badge-danger'}">${Math.round(file.maintainabilityIndex)}</span></td>
                        <td><span class="badge ${file.testCoverage > 80 ? 'badge-good' : file.testCoverage > 50 ? 'badge-warning' : 'badge-danger'}">${Math.round(file.testCoverage)}%</span></td>
                        <td>${file.securityIssues + file.performanceIssues + file.accessibilityIssues}</td>
                        <td>${file.codeSmells.length}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <div class="recommendations">
            <h3>Recommendations</h3>
            <ul>
                ${report.summary.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
    </div>
</body>
</html>`;
    
    return html;
  }
}

export { CodeQualityAnalyzer };
