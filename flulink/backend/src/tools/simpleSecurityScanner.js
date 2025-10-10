import fs from 'fs';
import path from 'path';

class SimpleSecurityScanner {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
  }

  async scanSecurity() {
    console.log('🔒 开始安全扫描...');
    
    const files = this.getAllSourceFiles();
    console.log(`📁 扫描 ${files.length} 个源文件...`);
    
    const results = [];
    
    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const vulnerabilities = this.scanFile(file, content);
        if (vulnerabilities.length > 0) {
          results.push({
            file: path.relative(this.projectRoot, file),
            vulnerabilities
          });
        }
      } catch (error) {
        console.error(`扫描文件失败: ${file}`, error.message);
      }
    }
    
    const report = this.generateReport(results);
    console.log(`✅ 安全扫描完成，发现 ${results.length} 个文件存在安全问题`);
    
    return report;
  }

  getAllSourceFiles() {
    const files = [];
    const extensions = ['.js', '.ts', '.tsx', '.jsx', '.json'];
    
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

  scanFile(filePath, content) {
    const vulnerabilities = [];
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      
      // SQL注入检测
      if (this.detectSQLInjection(line)) {
        vulnerabilities.push({
          type: 'SQL注入',
          severity: 'critical',
          line: lineNumber,
          description: '检测到可能的SQL注入漏洞',
          suggestion: '使用参数化查询'
        });
      }
      
      // XSS检测
      if (this.detectXSS(line)) {
        vulnerabilities.push({
          type: 'XSS',
          severity: 'high',
          line: lineNumber,
          description: '检测到可能的XSS漏洞',
          suggestion: '对用户输入进行转义'
        });
      }
      
      // 硬编码凭据检测
      if (this.detectHardcodedCredentials(line)) {
        vulnerabilities.push({
          type: '硬编码凭据',
          severity: 'critical',
          line: lineNumber,
          description: '检测到硬编码的凭据',
          suggestion: '使用环境变量'
        });
      }
      
      // 弱加密检测
      if (this.detectWeakCrypto(line)) {
        vulnerabilities.push({
          type: '弱加密',
          severity: 'medium',
          line: lineNumber,
          description: '检测到弱加密算法',
          suggestion: '使用强加密算法'
        });
      }
      
      // 敏感数据暴露检测
      if (this.detectDataExposure(line)) {
        vulnerabilities.push({
          type: '数据暴露',
          severity: 'high',
          line: lineNumber,
          description: '检测到敏感数据暴露',
          suggestion: '加密敏感数据'
        });
      }
    });
    
    return vulnerabilities;
  }

  detectSQLInjection(line) {
    const patterns = [
      /SELECT\s+.*\s+FROM\s+.*\s+WHERE\s+.*\$\{/i,
      /INSERT\s+INTO\s+.*\s+VALUES\s*\(.*\$\{/i,
      /UPDATE\s+.*\s+SET\s+.*\$\{/i,
      /DELETE\s+FROM\s+.*\s+WHERE\s+.*\$\{/i
    ];
    
    return patterns.some(pattern => {
      try {
        return pattern.test(line);
      } catch (error) {
        return false;
      }
    });
  }

  detectXSS(line) {
    const patterns = [
      /\.innerHTML\s*=/i,
      /dangerouslySetInnerHTML/i,
      /document\.write/i,
      /eval\s*\(/i
    ];
    
    return patterns.some(pattern => {
      try {
        return pattern.test(line);
      } catch (error) {
        return false;
      }
    });
  }

  detectHardcodedCredentials(line) {
    const patterns = [
      /password\s*=\s*["'][^"']{8,}["']/i,
      /secret\s*=\s*["'][^"']{8,}["']/i,
      /key\s*=\s*["'][^"']{16,}["']/i,
      /token\s*=\s*["'][^"']{16,}["']/i
    ];
    
    return patterns.some(pattern => {
      try {
        return pattern.test(line);
      } catch (error) {
        return false;
      }
    });
  }

  detectWeakCrypto(line) {
    const patterns = [
      /md5\s*\(/i,
      /sha1\s*\(/i,
      /des\s*\(/i,
      /rc4\s*\(/i
    ];
    
    return patterns.some(pattern => {
      try {
        return pattern.test(line);
      } catch (error) {
        return false;
      }
    });
  }

  detectDataExposure(line) {
    const patterns = [
      /console\.log\s*\([^)]*password/i,
      /console\.log\s*\([^)]*secret/i,
      /console\.log\s*\([^)]*token/i,
      /console\.log\s*\([^)]*key/i
    ];
    
    return patterns.some(pattern => {
      try {
        return pattern.test(line);
      } catch (error) {
        return false;
      }
    });
  }

  generateReport(results) {
    const totalFiles = results.length;
    const totalVulnerabilities = results.reduce((sum, r) => sum + r.vulnerabilities.length, 0);
    const criticalVulnerabilities = results.reduce((sum, r) => 
      sum + r.vulnerabilities.filter(v => v.severity === 'critical').length, 0);
    const highVulnerabilities = results.reduce((sum, r) => 
      sum + r.vulnerabilities.filter(v => v.severity === 'high').length, 0);
    
    const securityScore = Math.max(0, 100 - (criticalVulnerabilities * 20) - (highVulnerabilities * 10));
    
    return {
      timestamp: new Date().toISOString(),
      securityScore: Math.round(securityScore),
      files: results,
      summary: {
        totalFiles,
        totalVulnerabilities,
        criticalVulnerabilities,
        highVulnerabilities,
        mediumVulnerabilities: totalVulnerabilities - criticalVulnerabilities - highVulnerabilities,
        recommendations: [
          criticalVulnerabilities > 0 ? '立即修复关键安全漏洞' : '无关键安全漏洞',
          highVulnerabilities > 0 ? '优先修复高危安全漏洞' : '无高危安全漏洞',
          totalVulnerabilities > 0 ? '加强安全防护措施' : '安全状况良好'
        ]
      }
    };
  }
}

export { SimpleSecurityScanner };
