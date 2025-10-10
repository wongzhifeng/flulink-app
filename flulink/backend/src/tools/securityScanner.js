import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// interface SecurityVulnerability {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'injection' | 'authentication' | 'authorization' | 'data-exposure' | 'crypto' | 'dependencies';
  title: string;
  description: string;
  file: string;
  line: number;
  code: string;
  impact: string;
  remediation: string;
  cwe?: string;
  owasp?: string;
}

// interface SecurityReport {
  timestamp: string;
  totalVulnerabilities: number;
  criticalVulnerabilities: number;
  highVulnerabilities: number;
  mediumVulnerabilities: number;
  lowVulnerabilities: number;
  vulnerabilities: SecurityVulnerability[];
  summary: {
    riskScore: number;
    mostCommonCategory: string;
    filesAffected: number;
    dependenciesWithIssues: number;
  };
  recommendations: string[];
}

class SecurityScanner {
  private vulnerabilities: SecurityVulnerability[] = [];
  private projectRoot: string;
  private securityRules: SecurityVulnerability[] = [];

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.initializeSecurityRules();
  }

  private initializeSecurityRules() {
    this.securityRules = [
      // SQL注入检测
      {
        id: 'SQL_INJECTION_001',
        severity: 'critical',
        category: 'injection',
        title: 'SQL注入漏洞',
        description: '检测到可能的SQL注入漏洞',
        file: '',
        line: 0,
        code: '',
        impact: '攻击者可以执行任意SQL命令，访问敏感数据',
        remediation: '使用参数化查询或ORM',
        cwe: 'CWE-89',
        owasp: 'A03:2021'
      },
      // XSS检测
      {
        id: 'XSS_001',
        severity: 'high',
        category: 'injection',
        title: '跨站脚本攻击(XSS)',
        description: '检测到可能的XSS漏洞',
        file: '',
        line: 0,
        code: '',
        impact: '攻击者可以执行恶意脚本，窃取用户数据',
        remediation: '对用户输入进行适当的转义和验证',
        cwe: 'CWE-79',
        owasp: 'A03:2021'
      },
      // 认证绕过
      {
        id: 'AUTH_BYPASS_001',
        severity: 'critical',
        category: 'authentication',
        title: '认证绕过漏洞',
        description: '检测到可能的认证绕过',
        file: '',
        line: 0,
        code: '',
        impact: '攻击者可以绕过认证机制，获得未授权访问',
        remediation: '实施强认证机制和会话管理',
        cwe: 'CWE-287',
        owasp: 'A07:2021'
      },
      // 敏感数据暴露
      {
        id: 'DATA_EXPOSURE_001',
        severity: 'high',
        category: 'data-exposure',
        title: '敏感数据暴露',
        description: '检测到敏感数据可能被暴露',
        file: '',
        line: 0,
        code: '',
        impact: '敏感信息可能被未授权访问',
        remediation: '加密敏感数据，实施访问控制',
        cwe: 'CWE-200',
        owasp: 'A02:2021'
      },
      // 弱加密
      {
        id: 'WEAK_CRYPTO_001',
        severity: 'medium',
        category: 'crypto',
        title: '弱加密算法',
        description: '检测到使用弱加密算法',
        file: '',
        line: 0,
        code: '',
        impact: '加密数据可能被破解',
        remediation: '使用强加密算法和密钥管理',
        cwe: 'CWE-327',
        owasp: 'A02:2021'
      },
      // 硬编码凭据
      {
        id: 'HARDCODED_CREDS_001',
        severity: 'critical',
        category: 'data-exposure',
        title: '硬编码凭据',
        description: '检测到硬编码的凭据',
        file: '',
        line: 0,
        code: '',
        impact: '凭据可能被泄露，导致安全风险',
        remediation: '使用环境变量或安全的密钥管理系统',
        cwe: 'CWE-798',
        owasp: 'A07:2021'
      }
    ];
  }

  async scanProject(): Promise<SecurityReport> {
    console.log('🔍 开始安全扫描...');
    
    this.vulnerabilities = [];
    
    // 扫描源代码
    await this.scanSourceCode();
    
    // 扫描依赖项
    await this.scanDependencies();
    
    // 扫描配置文件
    await this.scanConfigurationFiles();
    
    // 生成报告
    const report = this.generateReport();
    
    console.log(`✅ 安全扫描完成，发现 ${this.vulnerabilities.length} 个问题`);
    
    return report;
  }

  private async scanSourceCode(): Promise<void> {
    const files = this.getAllSourceFiles();
    console.log(`📁 扫描 ${files.length} 个源文件...`);
    
    files.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        this.scanFileContent(file, content);
      } catch (error) {
        console.error(`扫描文件失败: ${file}`, error);
      }
    });
  }

  private getAllSourceFiles(): string[] {
    const files: string[] = [];
    const extensions = ['.js', '.ts', '.tsx', '.jsx', '.json'];
    
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
    
    scanDirectory(this.projectRoot);
    return files;
  }

  private scanFileContent(filePath: string, content: string): void {
    const lines = content.split('\n');
    const relativePath = path.relative(this.projectRoot, filePath);
    
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      const trimmedLine = line.trim();
      
      // SQL注入检测
      if (this.detectSQLInjection(trimmedLine)) {
        this.addVulnerability({
          ...this.securityRules[0],
          file: relativePath,
          line: lineNumber,
          code: trimmedLine
        });
      }
      
      // XSS检测
      if (this.detectXSS(trimmedLine)) {
        this.addVulnerability({
          ...this.securityRules[1],
          file: relativePath,
          line: lineNumber,
          code: trimmedLine
        });
      }
      
      // 认证绕过检测
      if (this.detectAuthBypass(trimmedLine)) {
        this.addVulnerability({
          ...this.securityRules[2],
          file: relativePath,
          line: lineNumber,
          code: trimmedLine
        });
      }
      
      // 敏感数据暴露检测
      if (this.detectDataExposure(trimmedLine)) {
        this.addVulnerability({
          ...this.securityRules[3],
          file: relativePath,
          line: lineNumber,
          code: trimmedLine
        });
      }
      
      // 弱加密检测
      if (this.detectWeakCrypto(trimmedLine)) {
        this.addVulnerability({
          ...this.securityRules[4],
          file: relativePath,
          line: lineNumber,
          code: trimmedLine
        });
      }
      
      // 硬编码凭据检测
      if (this.detectHardcodedCredentials(trimmedLine)) {
        this.addVulnerability({
          ...this.securityRules[5],
          file: relativePath,
          line: lineNumber,
          code: trimmedLine
        });
      }
    });
  }

  private detectSQLInjection(line: string): boolean {
    const patterns = [
      /SELECT\s+.*\s+FROM\s+.*\s+WHERE\s+.*\$\{/i,
      /INSERT\s+INTO\s+.*\s+VALUES\s*\(.*\$\{/i,
      /UPDATE\s+.*\s+SET\s+.*\$\{/i,
      /DELETE\s+FROM\s+.*\s+WHERE\s+.*\$\{/i,
      /query\s*\(\s*["`'].*\+.*["`']/i,
      /\.find\s*\(\s*["`'].*\+.*["`']/i
    ];
    
    return patterns.some(pattern => pattern.test(line));
  }

  private detectXSS(line: string): boolean {
    const patterns = [
      /\.innerHTML\s*=\s*[^;]+/i,
      /dangerouslySetInnerHTML/i,
      /document\.write\s*\(/i,
      /eval\s*\(/i,
      /\.html\s*\([^)]*\+/i,
      /response\.write\s*\(/i
    ];
    
    return patterns.some(pattern => pattern.test(line));
  }

  private detectAuthBypass(line: string): boolean {
    const patterns = [
      /if\s*\(\s*!.*auth/i,
      /if\s*\(\s*!.*login/i,
      /if\s*\(\s*!.*token/i,
      /bypass.*auth/i,
      /skip.*auth/i,
      /\.isAuthenticated\s*\(\s*\)\s*===\s*false/i
    ];
    
    return patterns.some(pattern => pattern.test(line));
  }

  private detectDataExposure(line: string): boolean {
    const patterns = [
      /password\s*:\s*["`'][^"`']+["`']/i,
      /secret\s*:\s*["`'][^"`']+["`']/i,
      /api[_-]?key\s*:\s*["`'][^"`']+["`']/i,
      /token\s*:\s*["`'][^"`']+["`']/i,
      /\.env\s*=\s*["`'][^"`']+["`']/i,
      /process\.env\.[A-Z_]+\s*=\s*["`'][^"`']+["`']/i
    ];
    
    return patterns.some(pattern => pattern.test(line));
  }

  private detectWeakCrypto(line: string): boolean {
    const patterns = [
      /md5\s*\(/i,
      /sha1\s*\(/i,
      /des\s*\(/i,
      /rc4\s*\(/i,
      /crypto\.createHash\s*\(\s*["`']md5["`']/i,
      /crypto\.createHash\s*\(\s*["`']sha1["`']/i
    ];
    
    return patterns.some(pattern => pattern.test(line));
  }

  private detectHardcodedCredentials(line: string): boolean {
    const patterns = [
      /password\s*=\s*["`'][^"`']{8,}["`']/i,
      /secret\s*=\s*["`'][^"`']{8,}["`']/i,
      /key\s*=\s*["`'][^"`']{16,}["`']/i,
      /token\s*=\s*["`'][^"`']{16,}["`']/i,
      /mongodb:\/\/[^:]+:[^@]+@/i,
      /mysql:\/\/[^:]+:[^@]+@/i,
      /postgresql:\/\/[^:]+:[^@]+@/i
    ];
    
    return patterns.some(pattern => pattern.test(line));
  }

  private addVulnerability(vulnerability: SecurityVulnerability): void {
    // 避免重复添加相同的漏洞
    const exists = this.vulnerabilities.some(v => 
      v.file === vulnerability.file && 
      v.line === vulnerability.line && 
      v.id === vulnerability.id
    );
    
    if (!exists) {
      this.vulnerabilities.push(vulnerability);
    }
  }

  private async scanDependencies(): Promise<void> {
    try {
      console.log('📦 扫描依赖项安全漏洞...');
      
      // 检查package.json
      const packageJsonPath = path.join(this.projectRoot, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
        
        // 检查已知的易受攻击的包
        const vulnerablePackages = this.checkVulnerablePackages(dependencies);
        
        vulnerablePackages.forEach(pkg => {
          this.addVulnerability({
            id: 'DEP_VULN_001',
            severity: 'high',
            category: 'dependencies',
            title: '易受攻击的依赖包',
            description: `依赖包 ${pkg.name} 存在已知安全漏洞`,
            file: 'package.json',
            line: 0,
            code: `"${pkg.name}": "${pkg.version}"`,
            impact: '依赖包的安全漏洞可能影响应用程序安全',
            remediation: `升级 ${pkg.name} 到安全版本`,
            cwe: 'CWE-1104',
            owasp: 'A06:2021'
          });
        });
      }
    } catch (error) {
      console.error('扫描依赖项失败:', error);
    }
  }

  private checkVulnerablePackages(dependencies: Record<string, string>): Array<{name: string, version: string}> {
    const vulnerablePackages: Array<{name: string, version: string}> = [];
    
    // 已知的易受攻击的包列表
    const knownVulnerablePackages = [
      'lodash', 'moment', 'jquery', 'express', 'mongoose',
      'redis', 'bcrypt', 'jsonwebtoken', 'cors', 'helmet'
    ];
    
    Object.entries(dependencies).forEach(([name, version]) => {
      if (knownVulnerablePackages.includes(name)) {
        // 检查版本是否过旧
        const versionNumber = version.replace(/[\^~]/, '');
        if (this.isOldVersion(name, versionNumber)) {
          vulnerablePackages.push({ name, version });
        }
      }
    });
    
    return vulnerablePackages;
  }

  private isOldVersion(packageName: string, version: string): boolean {
    // 简化的版本检查逻辑
    const versionParts = version.split('.').map(Number);
    const major = versionParts[0] || 0;
    
    // 根据包名检查主要版本
    const minVersions: Record<string, number> = {
      'lodash': 4,
      'moment': 2,
      'jquery': 3,
      'express': 4,
      'mongoose': 6,
      'redis': 3,
      'bcrypt': 5,
      'jsonwebtoken': 8,
      'cors': 2,
      'helmet': 4
    };
    
    return major < (minVersions[packageName] || 1);
  }

  private async scanConfigurationFiles(): Promise<void> {
    console.log('⚙️ 扫描配置文件...');
    
    const configFiles = [
      '.env',
      '.env.local',
      '.env.production',
      'docker-compose.yml',
      'Dockerfile',
      'nginx.conf',
      'apache.conf'
    ];
    
    configFiles.forEach(configFile => {
      const filePath = path.join(this.projectRoot, configFile);
      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          this.scanConfigFile(configFile, content);
        } catch (error) {
          console.error(`扫描配置文件失败: ${configFile}`, error);
        }
      }
    });
  }

  private scanConfigFile(fileName: string, content: string): void {
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      
      // 检查配置文件中的敏感信息
      if (this.detectConfigSensitiveData(line)) {
        this.addVulnerability({
          id: 'CONFIG_SENSITIVE_001',
          severity: 'high',
          category: 'data-exposure',
          title: '配置文件中的敏感信息',
          description: `配置文件 ${fileName} 包含敏感信息`,
          file: fileName,
          line: lineNumber,
          code: line.trim(),
          impact: '敏感信息可能被泄露',
          remediation: '将敏感信息移至环境变量或安全的密钥管理系统',
          cwe: 'CWE-200',
          owasp: 'A02:2021'
        });
      }
    });
  }

  private detectConfigSensitiveData(line: string): boolean {
    const patterns = [
      /password\s*=\s*[^=\s]+/i,
      /secret\s*=\s*[^=\s]+/i,
      /key\s*=\s*[^=\s]+/i,
      /token\s*=\s*[^=\s]+/i,
      /api[_-]?key\s*=\s*[^=\s]+/i,
      /mongodb:\/\/[^:]+:[^@]+@/i,
      /mysql:\/\/[^:]+:[^@]+@/i
    ];
    
    return patterns.some(pattern => pattern.test(line));
  }

  private generateReport(): SecurityReport {
    const totalVulnerabilities = this.vulnerabilities.length;
    const criticalVulnerabilities = this.vulnerabilities.filter(v => v.severity === 'critical').length;
    const highVulnerabilities = this.vulnerabilities.filter(v => v.severity === 'high').length;
    const mediumVulnerabilities = this.vulnerabilities.filter(v => v.severity === 'medium').length;
    const lowVulnerabilities = this.vulnerabilities.filter(v => v.severity === 'low').length;
    
    const summary = this.calculateSummary();
    const recommendations = this.generateRecommendations();
    
    return {
      timestamp: new Date().toISOString(),
      totalVulnerabilities,
      criticalVulnerabilities,
      highVulnerabilities,
      mediumVulnerabilities,
      lowVulnerabilities,
      vulnerabilities: this.vulnerabilities,
      summary,
      recommendations
    };
  }

  private calculateSummary(): any {
    const totalVulnerabilities = this.vulnerabilities.length;
    
    if (totalVulnerabilities === 0) {
      return {
        riskScore: 0,
        mostCommonCategory: 'none',
        filesAffected: 0,
        dependenciesWithIssues: 0
      };
    }
    
    // 计算风险评分
    const riskScore = this.vulnerabilities.reduce((score, vuln) => {
      const weights = { critical: 10, high: 7, medium: 4, low: 1 };
      return score + weights[vuln.severity];
    }, 0);
    
    // 找出最常见的类别
    const categoryCounts = this.vulnerabilities.reduce((acc, vuln) => {
      acc[vuln.category] = (acc[vuln.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostCommonCategory = Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'none';
    
    // 计算受影响的文件数
    const filesAffected = new Set(this.vulnerabilities.map(v => v.file)).size;
    
    // 计算有问题的依赖项数
    const dependenciesWithIssues = this.vulnerabilities
      .filter(v => v.category === 'dependencies').length;
    
    return {
      riskScore: Math.min(100, riskScore),
      mostCommonCategory,
      filesAffected,
      dependenciesWithIssues
    };
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    const criticalCount = this.vulnerabilities.filter(v => v.severity === 'critical').length;
    const highCount = this.vulnerabilities.filter(v => v.severity === 'high').length;
    
    if (criticalCount > 0) {
      recommendations.push(`立即修复 ${criticalCount} 个关键安全漏洞`);
    }
    
    if (highCount > 0) {
      recommendations.push(`优先修复 ${highCount} 个高危安全漏洞`);
    }
    
    const injectionCount = this.vulnerabilities.filter(v => v.category === 'injection').length;
    if (injectionCount > 0) {
      recommendations.push('实施输入验证和输出编码以防止注入攻击');
    }
    
    const authCount = this.vulnerabilities.filter(v => v.category === 'authentication').length;
    if (authCount > 0) {
      recommendations.push('加强认证和授权机制');
    }
    
    const dataExposureCount = this.vulnerabilities.filter(v => v.category === 'data-exposure').length;
    if (dataExposureCount > 0) {
      recommendations.push('加密敏感数据并实施访问控制');
    }
    
    const cryptoCount = this.vulnerabilities.filter(v => v.category === 'crypto').length;
    if (cryptoCount > 0) {
      recommendations.push('使用强加密算法和安全的密钥管理');
    }
    
    const depCount = this.vulnerabilities.filter(v => v.category === 'dependencies').length;
    if (depCount > 0) {
      recommendations.push('更新易受攻击的依赖包到安全版本');
    }
    
    return recommendations;
  }

  generateHTMLReport(report: SecurityReport): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FluLink 安全扫描报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
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
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>FluLink 安全扫描报告</h1>
            <p>生成时间: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="metrics">
            <div class="metric">
                <div class="metric-value metric-critical">${report.criticalVulnerabilities}</div>
                <div class="metric-label">关键漏洞</div>
            </div>
            <div class="metric">
                <div class="metric-value metric-high">${report.highVulnerabilities}</div>
                <div class="metric-label">高危漏洞</div>
            </div>
            <div class="metric">
                <div class="metric-value metric-medium">${report.mediumVulnerabilities}</div>
                <div class="metric-label">中危漏洞</div>
            </div>
            <div class="metric">
                <div class="metric-value metric-low">${report.lowVulnerabilities}</div>
                <div class="metric-label">低危漏洞</div>
            </div>
        </div>
        
        <h2>漏洞详情</h2>
        <table class="table">
            <thead>
                <tr>
                    <th>严重程度</th>
                    <th>类别</th>
                    <th>标题</th>
                    <th>文件</th>
                    <th>行号</th>
                    <th>CWE</th>
                </tr>
            </thead>
            <tbody>
                ${report.vulnerabilities.map(vuln => `
                    <tr>
                        <td><span class="badge badge-${vuln.severity}">${vuln.severity}</span></td>
                        <td>${vuln.category}</td>
                        <td>${vuln.title}</td>
                        <td>${vuln.file}</td>
                        <td>${vuln.line}</td>
                        <td>${vuln.cwe || 'N/A'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <h2>建议</h2>
        <ul>
            ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
    </div>
</body>
</html>`;
  }
}

export { SecurityScanner };
