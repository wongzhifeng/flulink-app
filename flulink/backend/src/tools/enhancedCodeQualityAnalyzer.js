import fs from 'fs';
import path from 'path';

class EnhancedCodeQualityAnalyzer {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
  }

  async analyzeProject() {
    console.log('🔍 开始增强代码质量分析...');
    
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
    console.log(`✅ 增强代码质量分析完成，分析了 ${results.length} 个文件`);
    
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
      designPatterns: this.detectDesignPatterns(content),
      codeStyle: this.analyzeCodeStyle(content),
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
    if (metrics.codeSmells.length > 5) {
      metrics.suggestions.push('代码异味过多，需要重构');
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
    if (content.match(/if\s*\([^)]*\)\s*\{[^}]*if\s*\([^)]*\)\s*\{[^}]*if\s*\([^)]*\)/)) {
      smells.push('嵌套过深的if语句');
    }
    if (content.match(/var\s+\w+/)) {
      smells.push('使用var声明变量');
    }
    if (content.match(/==\s*[^=]/)) {
      smells.push('使用==而非===');
    }
    if (content.match(/function\s+\w+\s*\([^)]*\)\s*\{[^}]{500,}/)) {
      smells.push('函数过长');
    }
    
    return smells;
  }

  detectDesignPatterns(content) {
    const patterns = [];
    
    if (content.includes('getInstance')) {
      patterns.push('单例模式');
    }
    if (content.includes('Factory') || content.includes('create')) {
      patterns.push('工厂模式');
    }
    if (content.includes('addEventListener') || content.includes('emit')) {
      patterns.push('观察者模式');
    }
    if (content.includes('Strategy') || content.includes('algorithm')) {
      patterns.push('策略模式');
    }
    if (content.includes('middleware') || content.includes('decorator')) {
      patterns.push('装饰器模式');
    }
    
    return patterns;
  }

  analyzeCodeStyle(content) {
    const styleIssues = [];
    
    // 检查缩进
    const lines = content.split('\n');
    let inconsistentIndentation = false;
    const indentations = new Set();
    
    lines.forEach(line => {
      if (line.trim()) {
        const leadingSpaces = line.length - line.trimStart().length;
        indentations.add(leadingSpaces);
      }
    });
    
    if (indentations.size > 2) {
      styleIssues.push('缩进不一致');
    }
    
    // 检查行长度
    const longLines = lines.filter(line => line.length > 120);
    if (longLines.length > 0) {
      styleIssues.push(`${longLines.length}行超过120字符`);
    }
    
    // 检查空行
    const emptyLines = lines.filter(line => line.trim() === '').length;
    const emptyLineRatio = emptyLines / lines.length;
    if (emptyLineRatio > 0.3) {
      styleIssues.push('空行过多');
    }
    
    return styleIssues;
  }

  generateReport(results) {
    const totalFiles = results.length;
    const averageComplexity = results.reduce((sum, r) => sum + r.cyclomaticComplexity, 0) / totalFiles;
    const averageMaintainability = results.reduce((sum, r) => sum + r.maintainabilityIndex, 0) / totalFiles;
    const totalIssues = results.reduce((sum, r) => sum + r.securityIssues + r.performanceIssues, 0);
    const totalSmells = results.reduce((sum, r) => sum + r.codeSmells.length, 0);
    
    const overallScore = Math.max(0, 100 - (averageComplexity * 2) - (totalIssues * 5) - (totalSmells * 2) + (averageMaintainability * 0.5));
    
    return {
      timestamp: new Date().toISOString(),
      overallScore: Math.round(overallScore),
      files: results,
      summary: {
        totalFiles,
        averageComplexity: Math.round(averageComplexity),
        averageMaintainability: Math.round(averageMaintainability),
        totalIssues,
        totalSmells,
        criticalIssues: results.filter(r => r.securityIssues > 0).length,
        recommendations: [
          totalIssues > 0 ? '修复安全性和性能问题' : '代码质量良好',
          averageComplexity > 8 ? '降低代码复杂度' : '复杂度控制良好',
          averageMaintainability < 60 ? '增加代码注释' : '可维护性良好',
          totalSmells > 10 ? '重构代码异味' : '代码异味控制良好'
        ]
      }
    };
  }
}

export { EnhancedCodeQualityAnalyzer };
