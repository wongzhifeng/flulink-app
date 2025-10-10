import fs from 'fs';
import path from 'path';

class SimplePerformanceAnalyzer {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
  }

  async analyzePerformance() {
    console.log('🚀 开始性能分析...');
    
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
    console.log(`✅ 性能分析完成，分析了 ${results.length} 个文件`);
    
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
      performanceIssues: this.detectPerformanceIssues(content),
      memoryIssues: this.detectMemoryIssues(content),
      asyncIssues: this.detectAsyncIssues(content),
      suggestions: []
    };
    
    // 生成建议
    if (metrics.performanceIssues > 0) {
      metrics.suggestions.push('存在性能问题，需要优化');
    }
    if (metrics.memoryIssues > 0) {
      metrics.suggestions.push('存在内存问题，需要优化');
    }
    if (metrics.asyncIssues > 0) {
      metrics.suggestions.push('异步处理需要优化');
    }
    
    return metrics;
  }

  detectPerformanceIssues(content) {
    const performancePatterns = [
      /for\s*\([^)]*\)\s*\{[^}]*for\s*\([^)]*\)/g, // 嵌套循环
      /while\s*\(\s*true\s*\)/g, // 无限循环
      /setTimeout\s*\(\s*0\s*\)/g, // setTimeout(0)
      /setInterval/g, // setInterval
      /\.forEach\s*\([^)]*\.forEach/g // 嵌套forEach
    ];
    
    let issues = 0;
    performancePatterns.forEach(pattern => {
      try {
        const matches = content.match(pattern);
        if (matches) {
          issues += matches.length;
        }
      } catch (error) {
        // 忽略正则表达式错误
      }
    });
    
    return issues;
  }

  detectMemoryIssues(content) {
    const memoryPatterns = [
      /new\s+Array\s*\(\s*\d+\s*\)/g, // 大数组
      /JSON\.parse/g, // JSON解析
      /JSON\.stringify/g, // JSON序列化
      /eval\s*\(/g, // eval
      /Function\s*\(/g // Function构造函数
    ];
    
    let issues = 0;
    memoryPatterns.forEach(pattern => {
      try {
        const matches = content.match(pattern);
        if (matches) {
          issues += matches.length;
        }
      } catch (error) {
        // 忽略正则表达式错误
      }
    });
    
    return issues;
  }

  detectAsyncIssues(content) {
    const asyncPatterns = [
      /await\s+[^;]*await/g, // 嵌套await
      /Promise\.all\s*\([^)]*Promise\.all/g, // 嵌套Promise.all
      /\.then\s*\([^)]*\.then/g, // 嵌套then
      /async\s+function[^}]*async\s+function/g // 嵌套async函数
    ];
    
    let issues = 0;
    asyncPatterns.forEach(pattern => {
      try {
        const matches = content.match(pattern);
        if (matches) {
          issues += matches.length;
        }
      } catch (error) {
        // 忽略正则表达式错误
      }
    });
    
    return issues;
  }

  generateReport(results) {
    const totalFiles = results.length;
    const totalPerformanceIssues = results.reduce((sum, r) => sum + r.performanceIssues, 0);
    const totalMemoryIssues = results.reduce((sum, r) => sum + r.memoryIssues, 0);
    const totalAsyncIssues = results.reduce((sum, r) => sum + r.asyncIssues, 0);
    
    const performanceScore = Math.max(0, 100 - (totalPerformanceIssues * 5) - (totalMemoryIssues * 3) - (totalAsyncIssues * 2));
    
    return {
      timestamp: new Date().toISOString(),
      performanceScore: Math.round(performanceScore),
      files: results,
      summary: {
        totalFiles,
        totalPerformanceIssues,
        totalMemoryIssues,
        totalAsyncIssues,
        criticalIssues: results.filter(r => r.performanceIssues > 2 || r.memoryIssues > 2).length,
        recommendations: [
          totalPerformanceIssues > 0 ? '优化性能瓶颈' : '性能良好',
          totalMemoryIssues > 0 ? '优化内存使用' : '内存使用良好',
          totalAsyncIssues > 0 ? '优化异步处理' : '异步处理良好'
        ]
      }
    };
  }
}

export { SimplePerformanceAnalyzer };
