import fs from 'fs';
import path from 'path';

interface DesignPattern {
  name: string;
  type: 'creational' | 'structural' | 'behavioral';
  description: string;
  confidence: number; // 0-100
  file: string;
  line: number;
  code: string;
  benefits: string[];
  implementation: string;
}

interface PatternReport {
  timestamp: string;
  totalPatterns: number;
  patternsByType: {
    creational: number;
    structural: number;
    behavioral: number;
  };
  patterns: DesignPattern[];
  summary: {
    patternScore: number;
    mostUsedPattern: string;
    missingPatterns: string[];
    recommendations: string[];
  };
}

class DesignPatternDetector {
  private projectRoot: string;
  private patterns: DesignPattern[] = [];
  private patternRules: Map<string, RegExp[]> = new Map();

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.initializePatternRules();
  }

  private initializePatternRules() {
    // 单例模式
    this.patternRules.set('Singleton', [
      /class\s+\w+\s*\{[^}]*static\s+instance[^}]*\}/s,
      /getInstance\s*\(\s*\)\s*\{[^}]*if\s*\(\s*!\s*\w+\.instance\s*\)[^}]*\}/s,
      /private\s+constructor\s*\(/,
      /static\s+\w+\s+instance\s*=/,
      /Object\.freeze\s*\(/,
      /new\s+\w+\s*\(\s*\)\s*\{[^}]*return\s+this[^}]*\}/s
    ]);

    // 工厂模式
    this.patternRules.set('Factory', [
      /create\w+\s*\(\s*[^)]*type[^)]*\)\s*\{[^}]*switch[^}]*case[^}]*new\s+\w+[^}]*\}/s,
      /factory\s*\(\s*[^)]*\)\s*\{[^}]*return\s+new\s+\w+[^}]*\}/s,
      /createProduct\s*\(\s*[^)]*\)\s*\{/,
      /abstract\s+class\s+\w+Factory/,
      /interface\s+\w+Factory/
    ]);

    // 观察者模式
    this.patternRules.set('Observer', [
      /addObserver\s*\(\s*[^)]*observer[^)]*\)/,
      /removeObserver\s*\(\s*[^)]*observer[^)]*\)/,
      /notifyObservers\s*\(\s*[^)]*\)/,
      /subscribe\s*\(\s*[^)]*callback[^)]*\)/,
      /unsubscribe\s*\(\s*[^)]*callback[^)]*\)/,
      /emit\s*\(\s*[^)]*event[^)]*\)/,
      /on\s*\(\s*[^)]*event[^)]*,\s*[^)]*handler[^)]*\)/,
      /off\s*\(\s*[^)]*event[^)]*,\s*[^)]*handler[^)]*\)/
    ]);

    // 装饰器模式
    this.patternRules.set('Decorator', [
      /class\s+\w+Decorator\s+extends\s+\w+/,
      /decorate\s*\(\s*[^)]*component[^)]*\)/,
      /@\w+\s*\(/,
      /\.decorate\s*\(/,
      /wrapper\s*\(\s*[^)]*original[^)]*\)/
    ]);

    // 适配器模式
    this.patternRules.set('Adapter', [
      /class\s+\w+Adapter\s*\{[^}]*adapt[^}]*\}/s,
      /adapt\s*\(\s*[^)]*\)\s*\{[^}]*return[^}]*\}/s,
      /interface\s+\w+Adapter/,
      /implements\s+\w+Adapter/
    ]);

    // 策略模式
    this.patternRules.set('Strategy', [
      /interface\s+\w+Strategy/,
      /class\s+\w+Strategy\s+implements\s+\w+Strategy/,
      /setStrategy\s*\(\s*[^)]*strategy[^)]*\)/,
      /executeStrategy\s*\(\s*[^)]*\)/,
      /strategy\.execute\s*\(/
    ]);

    // 命令模式
    this.patternRules.set('Command', [
      /interface\s+\w+Command/,
      /class\s+\w+Command\s+implements\s+\w+Command/,
      /execute\s*\(\s*[^)]*\)\s*\{[^}]*\}/s,
      /undo\s*\(\s*[^)]*\)\s*\{[^}]*\}/s,
      /invoker\s*\(\s*[^)]*command[^)]*\)/
    ]);

    // 模板方法模式
    this.patternRules.set('Template Method', [
      /abstract\s+class\s+\w+\s*\{[^}]*templateMethod[^}]*\}/s,
      /templateMethod\s*\(\s*[^)]*\)\s*\{[^}]*step1[^}]*step2[^}]*\}/s,
      /abstract\s+\w+\s+step\w+\s*\(\s*[^)]*\)/,
      /protected\s+\w+\s+step\w+\s*\(\s*[^)]*\)/
    ]);

    // 建造者模式
    this.patternRules.set('Builder', [
      /class\s+\w+Builder\s*\{[^}]*build[^}]*\}/s,
      /\.set\w+\s*\(\s*[^)]*\)\s*\{[^}]*return\s+this[^}]*\}/s,
      /build\s*\(\s*[^)]*\)\s*\{[^}]*return\s+new\s+\w+[^}]*\}/s,
      /Builder\s*\(\s*[^)]*\)\s*\{/,
      /\.build\s*\(\s*\)/
    ]);

    // 外观模式
    this.patternRules.set('Facade', [
      /class\s+\w+Facade\s*\{[^}]*simplify[^}]*\}/s,
      /facade\s*\(\s*[^)]*\)\s*\{[^}]*subsystem1[^}]*subsystem2[^}]*\}/s,
      /simplify\w+\s*\(\s*[^)]*\)/,
      /hide\w+Complexity\s*\(\s*[^)]*\)/
    ]);
  }

  async detectPatterns(): Promise<PatternReport> {
    console.log('🔍 开始设计模式检测...');
    
    this.patterns = [];
    const files = this.getAllSourceFiles();
    
    console.log(`📁 分析 ${files.length} 个源文件中的设计模式...`);
    
    for (const file of files) {
      await this.analyzeFileForPatterns(file);
    }
    
    const patternsByType = this.categorizePatterns();
    const summary = this.generateSummary();
    
    console.log(`✅ 设计模式检测完成，发现 ${this.patterns.length} 个模式实例`);
    
    return {
      timestamp: new Date().toISOString(),
      totalPatterns: this.patterns.length,
      patternsByType,
      patterns: this.patterns,
      summary
    };
  }

  private getAllSourceFiles(): string[] {
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
    
    scanDirectory(this.projectRoot);
    return files;
  }

  private async analyzeFileForPatterns(filePath: string): Promise<void> {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(this.projectRoot, filePath);
    const lines = content.split('\n');
    
    for (const [patternName, rules] of this.patternRules) {
      for (const rule of rules) {
        const matches = content.match(rule);
        if (matches) {
          const match = matches[0];
          const lineNumber = this.findLineNumber(content, match);
          
          const pattern = this.createPatternInstance(
            patternName,
            relativePath,
            lineNumber,
            match,
            content
          );
          
          if (pattern) {
            this.patterns.push(pattern);
          }
        }
      }
    }
  }

  private findLineNumber(content: string, match: string): number {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(match.substring(0, 50))) {
        return i + 1;
      }
    }
    return 1;
  }

  private createPatternInstance(
    patternName: string,
    file: string,
    line: number,
    code: string,
    fullContent: string
  ): DesignPattern | null {
    const patternInfo = this.getPatternInfo(patternName);
    const confidence = this.calculateConfidence(patternName, code, fullContent);
    
    if (confidence < 30) {
      return null; // 置信度太低，忽略
    }
    
    return {
      name: patternName,
      type: patternInfo.type,
      description: patternInfo.description,
      confidence,
      file,
      line,
      code: code.substring(0, 200) + (code.length > 200 ? '...' : ''),
      benefits: patternInfo.benefits,
      implementation: patternInfo.implementation
    };
  }

  private getPatternInfo(patternName: string): any {
    const patternInfo: Record<string, any> = {
      'Singleton': {
        type: 'creational',
        description: '确保一个类只有一个实例，并提供全局访问点',
        benefits: ['控制实例数量', '全局访问点', '延迟初始化'],
        implementation: '使用静态实例和私有构造函数'
      },
      'Factory': {
        type: 'creational',
        description: '创建对象而不指定具体的类',
        benefits: ['解耦对象创建', '易于扩展', '统一创建接口'],
        implementation: '使用工厂方法根据参数创建不同对象'
      },
      'Observer': {
        type: 'behavioral',
        description: '定义对象间的一对多依赖关系',
        benefits: ['松耦合', '动态订阅', '事件驱动'],
        implementation: '使用订阅/发布机制'
      },
      'Decorator': {
        type: 'structural',
        description: '动态地给对象添加功能',
        benefits: ['灵活扩展', '组合优于继承', '运行时装饰'],
        implementation: '使用装饰器函数或类包装'
      },
      'Adapter': {
        type: 'structural',
        description: '使不兼容的接口能够协同工作',
        benefits: ['接口转换', '复用现有代码', '解耦'],
        implementation: '创建适配器类转换接口'
      },
      'Strategy': {
        type: 'behavioral',
        description: '定义算法族，使它们可以互换',
        benefits: ['算法切换', '消除条件语句', '易于扩展'],
        implementation: '使用策略接口和具体策略类'
      },
      'Command': {
        type: 'behavioral',
        description: '将请求封装为对象',
        benefits: ['参数化对象', '队列请求', '支持撤销'],
        implementation: '使用命令接口和执行方法'
      },
      'Template Method': {
        type: 'behavioral',
        description: '定义算法骨架，子类实现具体步骤',
        benefits: ['代码复用', '控制流程', '钩子方法'],
        implementation: '使用抽象类和模板方法'
      },
      'Builder': {
        type: 'creational',
        description: '分步构建复杂对象',
        benefits: ['分步构建', '相同构建过程', '产品表示独立'],
        implementation: '使用建造者类和指导者'
      },
      'Facade': {
        type: 'structural',
        description: '为子系统提供统一接口',
        benefits: ['简化接口', '隐藏复杂性', '解耦'],
        implementation: '创建外观类封装子系统'
      }
    };
    
    return patternInfo[patternName] || {
      type: 'unknown',
      description: '未知模式',
      benefits: [],
      implementation: '未知实现'
    };
  }

  private calculateConfidence(patternName: string, code: string, fullContent: string): number {
    let confidence = 50; // 基础置信度
    
    // 根据模式名称调整置信度
    const patternKeywords: Record<string, string[]> = {
      'Singleton': ['instance', 'getInstance', 'private constructor', 'static'],
      'Factory': ['create', 'factory', 'new', 'switch', 'case'],
      'Observer': ['subscribe', 'unsubscribe', 'notify', 'emit', 'on', 'off'],
      'Decorator': ['decorate', '@', 'wrapper', 'enhance'],
      'Adapter': ['adapt', 'convert', 'transform', 'wrapper'],
      'Strategy': ['strategy', 'algorithm', 'execute', 'context'],
      'Command': ['command', 'execute', 'undo', 'invoke'],
      'Template Method': ['template', 'abstract', 'step', 'hook'],
      'Builder': ['builder', 'build', 'set', 'construct'],
      'Facade': ['facade', 'simplify', 'unified', 'interface']
    };
    
    const keywords = patternKeywords[patternName] || [];
    const keywordMatches = keywords.filter(keyword => 
      code.toLowerCase().includes(keyword.toLowerCase())
    ).length;
    
    confidence += keywordMatches * 10;
    
    // 检查代码结构
    if (code.includes('class') && code.includes('{')) {
      confidence += 10;
    }
    
    if (code.includes('interface') || code.includes('abstract')) {
      confidence += 5;
    }
    
    // 检查文件上下文
    const contextKeywords = keywords.filter(keyword => 
      fullContent.toLowerCase().includes(keyword.toLowerCase())
    );
    
    confidence += contextKeywords.length * 5;
    
    return Math.min(100, Math.max(0, confidence));
  }

  private categorizePatterns(): any {
    const creational = this.patterns.filter(p => p.type === 'creational').length;
    const structural = this.patterns.filter(p => p.type === 'structural').length;
    const behavioral = this.patterns.filter(p => p.type === 'behavioral').length;
    
    return { creational, structural, behavioral };
  }

  private generateSummary(): any {
    const totalPatterns = this.patterns.length;
    
    if (totalPatterns === 0) {
      return {
        patternScore: 0,
        mostUsedPattern: 'none',
        missingPatterns: Object.keys(this.patternRules),
        recommendations: ['考虑使用设计模式提高代码质量']
      };
    }
    
    // 计算模式评分
    const averageConfidence = this.patterns.reduce((sum, p) => sum + p.confidence, 0) / totalPatterns;
    const patternScore = Math.round(averageConfidence);
    
    // 找出最常用的模式
    const patternCounts = this.patterns.reduce((acc, p) => {
      acc[p.name] = (acc[p.name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostUsedPattern = Object.entries(patternCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'none';
    
    // 找出缺失的模式
    const detectedPatterns = new Set(this.patterns.map(p => p.name));
    const allPatterns = Array.from(this.patternRules.keys());
    const missingPatterns = allPatterns.filter(p => !detectedPatterns.has(p));
    
    // 生成建议
    const recommendations = [];
    
    if (missingPatterns.includes('Singleton')) {
      recommendations.push('考虑使用单例模式管理全局状态');
    }
    
    if (missingPatterns.includes('Factory')) {
      recommendations.push('考虑使用工厂模式简化对象创建');
    }
    
    if (missingPatterns.includes('Observer')) {
      recommendations.push('考虑使用观察者模式实现事件驱动架构');
    }
    
    if (missingPatterns.includes('Strategy')) {
      recommendations.push('考虑使用策略模式消除条件语句');
    }
    
    if (totalPatterns < 3) {
      recommendations.push('增加设计模式的使用以提高代码质量');
    }
    
    return {
      patternScore,
      mostUsedPattern,
      missingPatterns,
      recommendations
    };
  }

  generatePatternReport(): string {
    const report = this.detectPatterns();
    
    let output = '\n=== 设计模式检测报告 ===\n\n';
    output += `检测时间: ${report.timestamp}\n`;
    output += `总模式数: ${report.totalPatterns}\n`;
    output += `创建型模式: ${report.patternsByType.creational}\n`;
    output += `结构型模式: ${report.patternsByType.structural}\n`;
    output += `行为型模式: ${report.patternsByType.behavioral}\n\n`;
    
    output += '模式评分:\n';
    output += `  模式评分: ${report.summary.patternScore}/100\n`;
    output += `  最常用模式: ${report.summary.mostUsedPattern}\n`;
    output += `  缺失模式: ${report.summary.missingPatterns.join(', ')}\n\n`;
    
    output += '检测到的模式:\n';
    output += '模式名称\t\t类型\t\t置信度\t文件\t\t行号\n';
    output += '─'.repeat(80) + '\n';
    
    report.patterns.forEach(pattern => {
      output += `${pattern.name.padEnd(15)}\t${pattern.type.padEnd(10)}\t`;
      output += `${pattern.confidence}%\t\t${pattern.file.padEnd(20)}\t${pattern.line}\n`;
    });
    
    output += '\n建议:\n';
    report.summary.recommendations.forEach((rec, index) => {
      output += `  ${index + 1}. ${rec}\n`;
    });
    
    return output;
  }
}

export { DesignPatternDetector };
