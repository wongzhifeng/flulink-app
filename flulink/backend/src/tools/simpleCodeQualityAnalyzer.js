import fs from 'fs';
import path from 'path';

class SimpleCodeQualityAnalyzer {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
  }

  async analyzeProject() {
    console.log('🔍 开始代码质量分析...');
    
    const files = this.getAllSourceFiles();
    console.log(`📁 分析 ${files.length} 个源文件...`);
    
    const results = [];
    
    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const metrics = this.analyzeFile(file, content);
        results.push(metrics);
      } catch (error) {
        console.error(`分析文件失败: ${file}`, error.message);
      }
    }
    
    const report = this.generateReport(results);
    console.log(`✅ 代码质量分析完成，分析了 ${results.length} 个文件`);
    
    return report;
  }

  getAllSourceFiles() {
    const files = [];
    const extensions = ['.js', '.ts', '.tsx', '.jsx'];
    
    const scanDirectory = (dir) => {
      try {
        const items = fs.readdirSync(dir);
        
        items.forEach(item => {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            if (!['node_modules', '.git', 'dist', 'build', 'coverage'].includes(item)) {
              scanDirectory(fullPath);
            }
          } else if (stat.isFile()) {
            const ext = path.extname(item);
            if (extensions.includes(ext)) {
              files.push(fullPath);
            }
          }
        });
      } catch (error) {
        // 忽略无法访问的目录
      }
    };
    
    scanDirectory(this.projectRoot);
    return files;
  }

  analyzeFile(filePath, content) {
    const lines = content.split('\n');
    const relativePath = path.relative(this.projectRoot, filePath);
    
    const metrics = {
      file: relativePath,
      linesOfCode: lines.length,
      cyclomaticComplexity: this.calculateComplexity(content),
      maintainabilityIndex: this.calculateMaintainability(content),
      codeDuplication: this.calculateDuplication(content),
      testCoverage: 0, // 简化版本暂不计算
      securityIssues: this.detectSecurityIssues(content),
      performanceIssues: this.detectPerformanceIssues(content),
      codeSmells: this.detectCodeSmells(content),
      suggestions: []
    };
    
    // 生成建议
    if (metrics.cyclomaticComplexity > 10) {
      metrics.suggestions.push('方法复杂度过高，建议拆分');
    }
    if (metrics.linesOfCode > 200) {
      metrics.suggestions.push('文件过长，建议拆分');
    }
    if (metrics.securityIssues > 0) {
      metrics.suggestions.push('存在安全风险，需要修复');
    }
    
    return metrics;
  }

  calculateComplexity(content) {
    let complexity = 1;
    const complexityKeywords = [
      'if', 'else', 'while', 'for', 'switch', 'case', 'catch', '&&', '||', '?', ':'
    ];
    
    complexityKeywords.forEach(keyword => {
      try {
        const regex = new RegExp(`\\b${keyword}\\b`, 'g');
        const matches = content.match(regex);
        if (matches) {
          complexity += matches.length;
        }
      } catch (error) {
        // 忽略正则表达式错误
      }
    });
    
    return complexity;
  }

  calculateMaintainability(content) {
    const lines = content.split('\n');
    const commentLines = lines.filter(line => 
      line.trim().startsWith('//') || 
      line.trim().startsWith('/*') || 
      line.trim().startsWith('*')
    ).length;
    
    const totalLines = lines.length;
    const commentRatio = commentLines / totalLines;
    
    // 简化的可维护性指数
    return Math.min(100, Math.max(0, commentRatio * 100 + 50));
  }

  calculateDuplication(content) {
    const lines = content.split('\n');
    const uniqueLines = new Set(lines.map(line => line.trim()));
    const duplicateRatio = (lines.length - uniqueLines.size) / lines.length;
    
    return Math.round(duplicateRatio * 100);
  }

  detectSecurityIssues(content) {
    const securityPatterns = [
      /eval\s*\(/g,
      /innerHTML\s*=/g,
      /document\.write/g,
      /password\s*=\s*["'][^"']+["']/g,
      /secret\s*=\s*["'][^"']+["']/g
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

  detectPerformanceIssues(content) {
    const performancePatterns = [
      /for\s*\([^)]*\)\s*\{[^}]*for\s*\([^)]*\)/g, // 嵌套循环
      /setTimeout\s*\(\s*0\s*\)/g, // setTimeout(0)
      /while\s*\(\s*true\s*\)/g // 无限循环
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

  detectCodeSmells(content) {
    const smells = [];
    
    if (content.includes('TODO') || content.includes('FIXME')) {
      smells.push('未完成的功能');
    }
    if (content.includes('console.log')) {
      smells.push('调试代码未清理');
    }
    if (content.match(/function\s+\w+\s*\([^)]{50,}\)/)) {
      smells.push('参数过多的函数');
    }
    
    return smells;
  }

  generateReport(results) {
    const totalFiles = results.length;
    const averageComplexity = results.reduce((sum, r) => sum + r.cyclomaticComplexity, 0) / totalFiles;
    const averageMaintainability = results.reduce((sum, r) => sum + r.maintainabilityIndex, 0) / totalFiles;
    const totalIssues = results.reduce((sum, r) => sum + r.securityIssues + r.performanceIssues, 0);
    
    const overallScore = Math.max(0, 100 - (averageComplexity * 2) - (totalIssues * 5) + (averageMaintainability * 0.5));
    
    return {
      timestamp: new Date().toISOString(),
      overallScore: Math.round(overallScore),
      files: results,
      summary: {
        totalFiles,
        averageComplexity: Math.round(averageComplexity),
        averageMaintainability: Math.round(averageMaintainability),
        totalIssues,
        criticalIssues: results.filter(r => r.securityIssues > 0).length,
        recommendations: [
          totalIssues > 0 ? '修复安全性和性能问题' : '代码质量良好',
          averageComplexity > 8 ? '降低代码复杂度' : '复杂度控制良好',
          averageMaintainability < 60 ? '增加代码注释' : '可维护性良好'
        ]
      }
    };
  }

  generateHTMLReport(report) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FluLink 代码质量分析报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px; }
        .metric { background: #f0f2f5; padding: 15px; border-radius: 6px; text-align: center; }
        .metric-value { font-size: 24px; font-weight: bold; color: #1890ff; }
        .metric-label { color: #666; margin-top: 5px; }
        .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #e8e8e8; }
        .table th { background: #fafafa; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>FluLink 代码质量分析报告</h1>
            <p>生成时间: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="metrics">
            <div class="metric">
                <div class="metric-value">${report.overallScore}</div>
                <div class="metric-label">总体评分</div>
            </div>
            <div class="metric">
                <div class="metric-value">${report.summary.totalFiles}</div>
                <div class="metric-label">分析文件数</div>
            </div>
            <div class="metric">
                <div class="metric-value">${report.summary.averageComplexity}</div>
                <div class="metric-label">平均复杂度</div>
            </div>
            <div class="metric">
                <div class="metric-value">${report.summary.totalIssues}</div>
                <div class="metric-label">发现问题</div>
            </div>
        </div>
        
        <h2>文件详情</h2>
        <table class="table">
            <thead>
                <tr>
                    <th>文件</th>
                    <th>代码行数</th>
                    <th>复杂度</th>
                    <th>可维护性</th>
                    <th>问题数</th>
                    <th>建议</th>
                </tr>
            </thead>
            <tbody>
                ${report.files.map(file => `
                    <tr>
                        <td>${file.file}</td>
                        <td>${file.linesOfCode}</td>
                        <td>${file.cyclomaticComplexity}</td>
                        <td>${file.maintainabilityIndex.toFixed(1)}</td>
                        <td>${file.securityIssues + file.performanceIssues}</td>
                        <td>${file.suggestions.join(', ') || '无'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <h2>建议</h2>
        <ul>
            ${report.summary.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
    </div>
</body>
</html>`;
  }
}

export { SimpleCodeQualityAnalyzer };
