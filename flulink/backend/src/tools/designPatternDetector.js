import fs from 'fs';
import path from 'path';

class DesignPatternDetector {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.patterns = new Map();
  }

  async detectPatterns() {
    console.log('🔍 开始设计模式检测...');
    
    try {
      // 1. 检测单例模式
      const singletons = this.detectSingletonPattern();
      
      // 2. 检测工厂模式
      const factories = this.detectFactoryPattern();
      
      // 3. 检测观察者模式
      const observers = this.detectObserverPattern();
      
      // 4. 检测策略模式
      const strategies = this.detectStrategyPattern();
      
      // 5. 检测装饰器模式
      const decorators = this.detectDecoratorPattern();
      
      // 6. 检测适配器模式
      const adapters = this.detectAdapterPattern();
      
      // 7. 检测命令模式
      const commands = this.detectCommandPattern();
      
      // 8. 检测MVC模式
      const mvc = this.detectMVCPattern();
      
      // 9. 生成模式报告
      const report = this.generatePatternReport({
        singletons,
        factories,
        observers,
        strategies,
        decorators,
        adapters,
        commands,
        mvc
      });
      
      console.log('✅ 设计模式检测完成');
      return report;
      
    } catch (error) {
      console.error('❌ 设计模式检测失败:', error);
      throw error;
    }
  }

  detectSingletonPattern() {
    const singletons = [];
    
    const scanFile = (filePath) => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const relativePath = path.relative(this.projectRoot, filePath);
        
        // 检测单例模式的特征
        const singletonPatterns = [
          // 静态实例变量
          /static\s+\w+\s*=\s*null/g,
          // getInstance方法
          /getInstance\s*\(/g,
          // 私有构造函数
          /private\s+constructor/g,
          // 实例检查
          /if\s*\(\s*!\s*\w+\s*\)/g
        ];
        
        let patternCount = 0;
        singletonPatterns.forEach(pattern => {
          const matches = content.match(pattern);
          if (matches) patternCount += matches.length;
        });
        
        if (patternCount >= 2) {
          singletons.push({
            file: relativePath,
            confidence: Math.min(100, patternCount * 25),
            evidence: this.extractSingletonEvidence(content)
          });
        }
        
      } catch (error) {
        // 忽略无法读取的文件
      }
    };
    
    this.scanSourceFiles(scanFile);
    return singletons;
  }

  detectFactoryPattern() {
    const factories = [];
    
    const scanFile = (filePath) => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const relativePath = path.relative(this.projectRoot, filePath);
        
        // 检测工厂模式的特征
        const factoryPatterns = [
          // create方法
          /create\w*\s*\(/g,
          // Factory类名
          /\w*Factory\w*/g,
          // 类型参数
          /type\s*:\s*['"][^'"]+['"]/g,
          // switch/if-else创建逻辑
          /switch\s*\([^)]+\)\s*\{[^}]*new\s+\w+/g
        ];
        
        let patternCount = 0;
        factoryPatterns.forEach(pattern => {
          const matches = content.match(pattern);
          if (matches) patternCount += matches.length;
        });
        
        if (patternCount >= 2) {
          factories.push({
            file: relativePath,
            confidence: Math.min(100, patternCount * 20),
            evidence: this.extractFactoryEvidence(content)
          });
        }
        
      } catch (error) {
        // 忽略无法读取的文件
      }
    };
    
    this.scanSourceFiles(scanFile);
    return factories;
  }

  detectObserverPattern() {
    const observers = [];
    
    const scanFile = (filePath) => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const relativePath = path.relative(this.projectRoot, filePath);
        
        // 检测观察者模式的特征
        const observerPatterns = [
          // 事件监听
          /addEventListener|on\s*\(|subscribe\s*\(/g,
          // 事件触发
          /emit\s*\(|trigger\s*\(|notify\s*\(/g,
          // 观察者列表
          /observers\s*\[|listeners\s*\[/g,
          // 回调函数
          /callback\s*\(|handler\s*\(/g
        ];
        
        let patternCount = 0;
        observerPatterns.forEach(pattern => {
          const matches = content.match(pattern);
          if (matches) patternCount += matches.length;
        });
        
        if (patternCount >= 2) {
          observers.push({
            file: relativePath,
            confidence: Math.min(100, patternCount * 20),
            evidence: this.extractObserverEvidence(content)
          });
        }
        
      } catch (error) {
        // 忽略无法读取的文件
      }
    };
    
    this.scanSourceFiles(scanFile);
    return observers;
  }

  detectStrategyPattern() {
    const strategies = [];
    
    const scanFile = (filePath) => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const relativePath = path.relative(this.projectRoot, filePath);
        
        // 检测策略模式的特征
        const strategyPatterns = [
          // 策略接口
          /interface\s+\w*Strategy\w*/g,
          // 策略实现
          /implements\s+\w*Strategy/g,
          // 策略选择
          /strategy\s*\[|strategy\s*\./g,
          // 算法选择
          /algorithm\s*\[|algorithm\s*\./g
        ];
        
        let patternCount = 0;
        strategyPatterns.forEach(pattern => {
          const matches = content.match(pattern);
          if (matches) patternCount += matches.length;
        });
        
        if (patternCount >= 2) {
          strategies.push({
            file: relativePath,
            confidence: Math.min(100, patternCount * 25),
            evidence: this.extractStrategyEvidence(content)
          });
        }
        
      } catch (error) {
        // 忽略无法读取的文件
      }
    };
    
    this.scanSourceFiles(scanFile);
    return strategies;
  }

  detectDecoratorPattern() {
    const decorators = [];
    
    const scanFile = (filePath) => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const relativePath = path.relative(this.projectRoot, filePath);
        
        // 检测装饰器模式的特征
        const decoratorPatterns = [
          // 装饰器语法
          /@\w+/g,
          // 包装器
          /wrapper\s*\(|decorate\s*\(/g,
          // 中间件
          /middleware\s*\(/g,
          // 链式调用
          /\.\w+\s*\([^)]*\)\s*\.\w+\s*\(/g
        ];
        
        let patternCount = 0;
        decoratorPatterns.forEach(pattern => {
          const matches = content.match(pattern);
          if (matches) patternCount += matches.length;
        });
        
        if (patternCount >= 2) {
          decorators.push({
            file: relativePath,
            confidence: Math.min(100, patternCount * 20),
            evidence: this.extractDecoratorEvidence(content)
          });
        }
        
      } catch (error) {
        // 忽略无法读取的文件
      }
    };
    
    this.scanSourceFiles(scanFile);
    return decorators;
  }

  detectAdapterPattern() {
    const adapters = [];
    
    const scanFile = (filePath) => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const relativePath = path.relative(this.projectRoot, filePath);
        
        // 检测适配器模式的特征
        const adapterPatterns = [
          // Adapter类名
          /\w*Adapter\w*/g,
          // 适配方法
          /adapt\s*\(|convert\s*\(/g,
          // 接口转换
          /transform\s*\(|translate\s*\(/g,
          // 兼容性处理
          /compatibility|legacy/g
        ];
        
        let patternCount = 0;
        adapterPatterns.forEach(pattern => {
          const matches = content.match(pattern);
          if (matches) patternCount += matches.length;
        });
        
        if (patternCount >= 2) {
          adapters.push({
            file: relativePath,
            confidence: Math.min(100, patternCount * 25),
            evidence: this.extractAdapterEvidence(content)
          });
        }
        
      } catch (error) {
        // 忽略无法读取的文件
      }
    };
    
    this.scanSourceFiles(scanFile);
    return adapters;
  }

  detectCommandPattern() {
    const commands = [];
    
    const scanFile = (filePath) => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const relativePath = path.relative(this.projectRoot, filePath);
        
        // 检测命令模式的特征
        const commandPatterns = [
          // Command类名
          /\w*Command\w*/g,
          // 执行方法
          /execute\s*\(|run\s*\(/g,
          // 撤销方法
          /undo\s*\(|rollback\s*\(/g,
          // 命令队列
          /queue\s*\[|commands\s*\[/g
        ];
        
        let patternCount = 0;
        commandPatterns.forEach(pattern => {
          const matches = content.match(pattern);
          if (matches) patternCount += matches.length;
        });
        
        if (patternCount >= 2) {
          commands.push({
            file: relativePath,
            confidence: Math.min(100, patternCount * 25),
            evidence: this.extractCommandEvidence(content)
          });
        }
        
      } catch (error) {
        // 忽略无法读取的文件
      }
    };
    
    this.scanSourceFiles(scanFile);
    return commands;
  }

  detectMVCPattern() {
    const mvc = [];
    
    const scanFile = (filePath) => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const relativePath = path.relative(this.projectRoot, filePath);
        
        // 检测MVC模式的特征
        const mvcPatterns = [
          // Controller
          /\w*Controller\w*/g,
          // Model
          /\w*Model\w*/g,
          // View
          /\w*View\w*/g,
          // 路由处理
          /router\s*\.|route\s*\./g
        ];
        
        let patternCount = 0;
        mvcPatterns.forEach(pattern => {
          const matches = content.match(pattern);
          if (matches) patternCount += matches.length;
        });
        
        if (patternCount >= 2) {
          mvc.push({
            file: relativePath,
            confidence: Math.min(100, patternCount * 20),
            evidence: this.extractMVCEvidence(content)
          });
        }
        
      } catch (error) {
        // 忽略无法读取的文件
      }
    };
    
    this.scanSourceFiles(scanFile);
    return mvc;
  }

  scanSourceFiles(callback) {
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
            if (['.js', '.ts', '.tsx', '.jsx'].includes(ext)) {
              callback(fullPath);
            }
          }
        });
      } catch (error) {
        // 忽略无法访问的目录
      }
    };
    
    scanDirectory(this.projectRoot);
  }

  extractSingletonEvidence(content) {
    const evidence = [];
    if (content.includes('getInstance')) evidence.push('getInstance方法');
    if (content.includes('static')) evidence.push('静态实例');
    if (content.includes('private constructor')) evidence.push('私有构造函数');
    return evidence;
  }

  extractFactoryEvidence(content) {
    const evidence = [];
    if (content.includes('create')) evidence.push('create方法');
    if (content.includes('Factory')) evidence.push('Factory类名');
    if (content.includes('switch')) evidence.push('switch创建逻辑');
    return evidence;
  }

  extractObserverEvidence(content) {
    const evidence = [];
    if (content.includes('addEventListener')) evidence.push('事件监听');
    if (content.includes('emit')) evidence.push('事件触发');
    if (content.includes('subscribe')) evidence.push('订阅机制');
    return evidence;
  }

  extractStrategyEvidence(content) {
    const evidence = [];
    if (content.includes('Strategy')) evidence.push('Strategy接口');
    if (content.includes('implements')) evidence.push('策略实现');
    if (content.includes('algorithm')) evidence.push('算法选择');
    return evidence;
  }

  extractDecoratorEvidence(content) {
    const evidence = [];
    if (content.includes('@')) evidence.push('装饰器语法');
    if (content.includes('middleware')) evidence.push('中间件');
    if (content.includes('wrapper')) evidence.push('包装器');
    return evidence;
  }

  extractAdapterEvidence(content) {
    const evidence = [];
    if (content.includes('Adapter')) evidence.push('Adapter类名');
    if (content.includes('adapt')) evidence.push('适配方法');
    if (content.includes('convert')) evidence.push('转换方法');
    return evidence;
  }

  extractCommandEvidence(content) {
    const evidence = [];
    if (content.includes('Command')) evidence.push('Command类名');
    if (content.includes('execute')) evidence.push('执行方法');
    if (content.includes('undo')) evidence.push('撤销方法');
    return evidence;
  }

  extractMVCEvidence(content) {
    const evidence = [];
    if (content.includes('Controller')) evidence.push('Controller层');
    if (content.includes('Model')) evidence.push('Model层');
    if (content.includes('View')) evidence.push('View层');
    return evidence;
  }

  generatePatternReport(patternData) {
    const {
      singletons,
      factories,
      observers,
      strategies,
      decorators,
      adapters,
      commands,
      mvc
    } = patternData;

    const totalPatterns = singletons.length + factories.length + observers.length + 
                         strategies.length + decorators.length + adapters.length + 
                         commands.length + mvc.length;

    const patternScore = this.calculatePatternScore(patternData);

    return {
      timestamp: new Date().toISOString(),
      patternScore: Math.round(patternScore),
      totalPatterns,
      patterns: {
        singletons,
        factories,
        observers,
        strategies,
        decorators,
        adapters,
        commands,
        mvc
      },
      summary: {
        mostUsedPattern: this.findMostUsedPattern(patternData),
        patternDistribution: this.calculatePatternDistribution(patternData),
        recommendations: this.generatePatternRecommendations(patternData)
      }
    };
  }

  calculatePatternScore(patternData) {
    let score = 0;
    const weights = {
      singletons: 10,
      factories: 15,
      observers: 20,
      strategies: 15,
      decorators: 10,
      adapters: 10,
      commands: 10,
      mvc: 20
    };

    Object.keys(patternData).forEach(patternType => {
      const patterns = patternData[patternType];
      const weight = weights[patternType] || 10;
      score += patterns.length * weight;
    });

    return Math.min(100, score);
  }

  findMostUsedPattern(patternData) {
    let maxCount = 0;
    let mostUsed = 'none';

    Object.entries(patternData).forEach(([patternType, patterns]) => {
      if (patterns.length > maxCount) {
        maxCount = patterns.length;
        mostUsed = patternType;
      }
    });

    return { pattern: mostUsed, count: maxCount };
  }

  calculatePatternDistribution(patternData) {
    const distribution = {};
    let total = 0;

    Object.entries(patternData).forEach(([patternType, patterns]) => {
      distribution[patternType] = patterns.length;
      total += patterns.length;
    });

    // 计算百分比
    Object.keys(distribution).forEach(patternType => {
      distribution[patternType] = {
        count: distribution[patternType],
        percentage: total > 0 ? Math.round((distribution[patternType] / total) * 100) : 0
      };
    });

    return distribution;
  }

  generatePatternRecommendations(patternData) {
    const recommendations = [];
    
    if (patternData.singletons.length === 0) {
      recommendations.push('考虑使用单例模式管理全局状态');
    }
    
    if (patternData.factories.length === 0) {
      recommendations.push('考虑使用工厂模式简化对象创建');
    }
    
    if (patternData.observers.length === 0) {
      recommendations.push('考虑使用观察者模式实现事件驱动');
    }
    
    if (patternData.strategies.length === 0) {
      recommendations.push('考虑使用策略模式处理算法变化');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('设计模式使用良好');
    }
    
    return recommendations;
  }
}

export { DesignPatternDetector };