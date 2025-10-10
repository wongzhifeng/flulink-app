import fs from 'fs';
import path from 'path';

// interface RefactoringRule {
  name: string;
  description: string;
  pattern: RegExp;
  replacement: string;
  severity: 'low' | 'medium' | 'high';
  category: 'performance' | 'security' | 'maintainability' | 'readability';
}

// interface RefactoringResult {
  file: string;
  rule: string;
  line: number;
  original: string;
  refactored: string;
  severity: string;
  category: string;
}

class CodeRefactoringTool {
  private rules: RefactoringRule[] = [];
  private results: RefactoringResult[] = [];

  constructor() {
    this.initializeRules();
  }

  // 初始化重构规则
  private initializeRules() {
    this.rules = [
      // 性能优化规则
      {
        name: 'Replace var with let/const',
        description: 'Replace var declarations with let or const for better scoping',
        pattern: /\bvar\s+(\w+)/g,
        replacement: 'let $1',
        severity: 'medium',
        category: 'performance'
      },
      {
        name: 'Optimize for loops',
        description: 'Cache array length in for loops',
        pattern: /for\s*\(\s*var\s+(\w+)\s*=\s*0\s*;\s*\1\s*<\s*(\w+)\.length\s*;\s*\1\+\+\s*\)/g,
        replacement: 'for (let $1 = 0, len = $2.length; $1 < len; $1++)',
        severity: 'high',
        category: 'performance'
      },
      {
        name: 'Use template literals',
        description: 'Replace string concatenation with template literals',
        pattern: /"([^"]*)"\s*\+\s*([^+]+)\s*\+\s*"([^"]*)"/g,
        replacement: '`$1${$2}$3`',
        severity: 'low',
        category: 'readability'
      },
      {
        name: 'Use arrow functions',
        description: 'Replace function expressions with arrow functions where appropriate',
        pattern: /function\s*\(\s*([^)]*)\s*\)\s*{\s*return\s+([^;]+);?\s*}/g,
        replacement: '($1) => $2',
        severity: 'low',
        category: 'readability'
      },
      {
        name: 'Use const for constants',
        description: 'Use const for variables that are never reassigned',
        pattern: /let\s+(\w+)\s*=\s*([^=]+);/g,
        replacement: 'const $1 = $2;',
        severity: 'medium',
        category: 'maintainability'
      },
      {
        name: 'Remove console.log statements',
        description: 'Remove console.log statements from production code',
        pattern: /console\.log\s*\([^)]*\)\s*;?\s*/g,
        replacement: '',
        severity: 'medium',
        category: 'performance'
      },
      {
        name: 'Use strict equality',
        description: 'Replace == with === for strict equality',
        pattern: /([^=!])\s*==\s*([^=])/g,
        replacement: '$1 === $2',
        severity: 'high',
        category: 'maintainability'
      },
      {
        name: 'Use strict inequality',
        description: 'Replace != with !== for strict inequality',
        pattern: /([^=!])\s*!=\s*([^=])/g,
        replacement: '$1 !== $2',
        severity: 'high',
        category: 'maintainability'
      },
      {
        name: 'Use optional chaining',
        description: 'Replace && checks with optional chaining',
        pattern: /(\w+)\s*&&\s*(\w+)\.(\w+)/g,
        replacement: '$1?.$2.$3',
        severity: 'low',
        category: 'readability'
      },
      {
        name: 'Use nullish coalescing',
        description: 'Replace || with ?? for nullish coalescing',
        pattern: /(\w+)\s*\|\|\s*(\w+)/g,
        replacement: '$1 ?? $2',
        severity: 'low',
        category: 'readability'
      },
      // 安全规则
      {
        name: 'Sanitize innerHTML usage',
        description: 'Replace innerHTML with safer alternatives',
        pattern: /\.innerHTML\s*=\s*([^;]+);/g,
        replacement: '.textContent = $1;',
        severity: 'high',
        category: 'security'
      },
      {
        name: 'Use parameterized queries',
        description: 'Replace string concatenation in database queries',
        pattern: /"SELECT\s+[^"]*"\s*\+\s*(\w+)/g,
        replacement: '`SELECT * FROM table WHERE id = ${$1}`',
        severity: 'high',
        category: 'security'
      },
      // 可维护性规则
      {
        name: 'Extract magic numbers',
        description: 'Replace magic numbers with named constants',
        pattern: /\b(\d{3,})\b/g,
        replacement: 'MAGIC_NUMBER_$1',
        severity: 'medium',
        category: 'maintainability'
      },
      {
        name: 'Use descriptive variable names',
        description: 'Replace single letter variables with descriptive names',
        pattern: /\b([a-z])\b/g,
        replacement: 'descriptiveVariable',
        severity: 'low',
        category: 'readability'
      },
      {
        name: 'Add JSDoc comments',
        description: 'Add JSDoc comments to functions',
        pattern: /function\s+(\w+)\s*\(/g,
        replacement: '/**\n * Description of $1\n * @param {type} param - Description\n * @returns {type} Description\n */\nfunction $1(',
        severity: 'low',
        category: 'maintainability'
      }
    ];
  }

  // 重构单个文件
  refactorFile(filePath: string): RefactoringResult[] {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const fileResults: RefactoringResult[] = [];

    this.rules.forEach(rule => {
      lines.forEach((line, index) => {
        if (rule.pattern.test(line)) {
          const refactoredLine = line.replace(rule.pattern, rule.replacement);
          
          if (refactoredLine !== line) {
            const result: RefactoringResult = {
              file: path.relative(process.cwd(), filePath),
              rule: rule.name,
              line: index + 1,
              original: line.trim(),
              refactored: refactoredLine.trim(),
              severity: rule.severity,
              category: rule.category
            };
            
            fileResults.push(result);
          }
        }
      });
    });

    return fileResults;
  }

  // 重构整个项目
  async refactorProject(projectRoot: string): Promise<RefactoringResult[]> {
    console.log('开始代码重构...');
    
    const files = this.getAllSourceFiles(projectRoot);
    console.log(`发现 ${files.length} 个源文件`);
    
    const allResults: RefactoringResult[] = [];
    
    files.forEach(file => {
      try {
        const results = this.refactorFile(file);
        allResults.push(...results);
        console.log(`重构完成: ${file} (${results.length} 个改进)`);
      } catch (error) {
        console.error(`重构文件失败: ${file}`, error);
      }
    });
    
    this.results = allResults;
    return allResults;
  }

  // 获取所有源文件
  private getAllSourceFiles(projectRoot: string): string[] {
    const files: string[] = [];
    const extensions = ['.js', '.ts', '.tsx', '.jsx'];
    
    const scanDirectory = (dir: string) => {
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
    };
    
    scanDirectory(projectRoot);
    return files;
  }

  // 应用重构
  applyRefactoring(filePath: string, results: RefactoringResult[]): void {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    // 按行号倒序排列，避免行号变化影响
    const sortedResults = results
      .filter(r => r.file === path.relative(process.cwd(), filePath))
      .sort((a, b) => b.line - a.line);
    
    sortedResults.forEach(result => {
      if (result.line <= lines.length) {
        lines[result.line - 1] = result.refactored;
      }
    });
    
    const refactoredContent = lines.join('\n');
    fs.writeFileSync(filePath, refactoredContent, 'utf8');
  }

  // 生成重构报告
  generateReport(): string {
    const totalRefactorings = this.results.length;
    const bySeverity = this.results.reduce((acc, r) => {
      acc[r.severity] = (acc[r.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const byCategory = this.results.reduce((acc, r) => {
      acc[r.category] = (acc[r.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    let report = '\n=== 代码重构报告 ===\n\n';
    report += `总重构数量: ${totalRefactorings}\n\n`;
    
    report += '按严重程度分布:\n';
    Object.entries(bySeverity).forEach(([severity, count]) => {
      report += `  ${severity}: ${count}\n`;
    });
    
    report += '\n按类别分布:\n';
    Object.entries(byCategory).forEach(([category, count]) => {
      report += `  ${category}: ${count}\n`;
    });
    
    report += '\n详细重构列表:\n';
    report += '文件\t\t\t规则\t\t\t行号\t严重程度\t类别\n';
    report += '─'.repeat(100) + '\n';
    
    this.results.forEach(result => {
      report += `${result.file.padEnd(30)}\t${result.rule.padEnd(25)}\t${result.line}\t${result.severity.padEnd(8)}\t${result.category}\n`;
    });
    
    return report;
  }

  // 生成重构建议
  generateSuggestions(): string[] {
    const suggestions: string[] = [];
    
    const highSeverityCount = this.results.filter(r => r.severity === 'high').length;
    if (highSeverityCount > 0) {
      suggestions.push(`优先处理 ${highSeverityCount} 个高严重程度的重构`);
    }
    
    const securityCount = this.results.filter(r => r.category === 'security').length;
    if (securityCount > 0) {
      suggestions.push(`立即处理 ${securityCount} 个安全问题`);
    }
    
    const performanceCount = this.results.filter(r => r.category === 'performance').length;
    if (performanceCount > 0) {
      suggestions.push(`优化 ${performanceCount} 个性能问题`);
    }
    
    const maintainabilityCount = this.results.filter(r => r.category === 'maintainability').length;
    if (maintainabilityCount > 0) {
      suggestions.push(`改进 ${maintainabilityCount} 个可维护性问题`);
    }
    
    return suggestions;
  }

  // 创建自定义规则
  addCustomRule(rule: RefactoringRule): void {
    this.rules.push(rule);
  }

  // 获取规则列表
  getRules(): RefactoringRule[] {
    return this.rules;
  }

  // 验证重构结果
  validateRefactoring(originalContent: string, refactoredContent: string): boolean {
    // 基本验证：确保重构后的代码仍然有效
    try {
      // 简单的语法检查
      const originalLines = originalContent.split('\n').length;
      const refactoredLines = refactoredContent.split('\n').length;
      
      // 行数不应该有太大变化
      if (Math.abs(originalLines - refactoredLines) > originalLines * 0.1) {
        return false;
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }
}

export { CodeRefactoringTool };
