import fs from 'fs';
import path from 'path';

// interface DependencyNode {
  name: string;
  path: string;
  type: 'file' | 'module' | 'package';
  dependencies: string[];
  dependents: string[];
  size: number;
  complexity: number;
}

// interface ArchitectureMetrics {
  totalFiles: number;
  totalModules: number;
  totalPackages: number;
  averageComplexity: number;
  maxComplexity: number;
  circularDependencies: string[][];
  couplingScore: number;
  cohesionScore: number;
  modularityScore: number;
}

// interface ArchitectureReport {
  timestamp: string;
  metrics: ArchitectureMetrics;
  dependencyGraph: DependencyNode[];
  recommendations: string[];
  summary: {
    overallScore: number;
    healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
    criticalIssues: number;
    improvementAreas: string[];
  };
}

class ArchitectureAnalyzer {
  // private projectRoot: string;
  // private dependencyGraph: Map<string, DependencyNode> = new Map();
  // private circularDependencies: string[][] = [];

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  async analyzeArchitecture(): Promise<ArchitectureReport> {
    console.log('🏗️ 开始架构分析...');
    
    // 1. 构建依赖图
    await this.buildDependencyGraph();
    
    // 2. 检测循环依赖
    this.detectCircularDependencies();
    
    // 3. 计算架构指标
    const metrics = this.calculateArchitectureMetrics();
    
    // 4. 生成建议
    const recommendations = this.generateRecommendations();
    
    // 5. 计算总体评分
    const summary = this.calculateSummary(metrics);
    
    console.log(`✅ 架构分析完成，发现 ${this.circularDependencies.length} 个循环依赖`);
    
    return {
      timestamp: new Date().toISOString(),
      metrics,
      dependencyGraph: Array.from(this.dependencyGraph.values()),
      recommendations,
      summary
    };
  }

  // private async buildDependencyGraph(): Promise<void> {
    const files = this.getAllSourceFiles();
    console.log(`📁 分析 ${files.length} 个源文件的依赖关系...`);
    
    for (const file of files) {
      const node = await this.analyzeFile(file);
      this.dependencyGraph.set(node.name, node);
    }
    
    // 建立依赖关系
    this.buildDependencyRelations();
  }

  // private getAllSourceFiles(): string[] {
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

  // private async analyzeFile(filePath: string): Promise<DependencyNode> {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(this.projectRoot, filePath);
    const fileName = path.basename(filePath, path.extname(filePath));
    
    // 分析文件依赖
    const dependencies = this.extractDependencies(content);
    
    // 计算复杂度
    const complexity = this.calculateComplexity(content);
    
    // 计算文件大小
    const size = Buffer.byteLength(content, 'utf8');
    
    return {
      name: fileName,
      path: relativePath,
      type: this.determineFileType(relativePath),
      dependencies,
      dependents: [],
      size,
      complexity
    };
  }

  // private extractDependencies(content: string): string[] {
    const dependencies: string[] = [];
    
    // 提取import语句
    const importRegex = /import\s+(?:{[^}]*}|\w+|\*\s+as\s+\w+)\s+from\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const dep = match[1];
      if (!dep.startsWith('.') && !dep.startsWith('/')) {
        // 外部依赖
        dependencies.push(dep.split('/')[0]);
      } else {
        // 内部依赖
        dependencies.push(dep.replace(/^\.\//, '').replace(/\.js$/, ''));
      }
    }
    
    // 提取require语句
    const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    while ((match = requireRegex.exec(content)) !== null) {
      const dep = match[1];
      if (!dep.startsWith('.') && !dep.startsWith('/')) {
        dependencies.push(dep.split('/')[0]);
      } else {
        dependencies.push(dep.replace(/^\.\//, '').replace(/\.js$/, ''));
      }
    }
    
    return [...new Set(dependencies)]; // 去重
  }

  // private determineFileType(relativePath: string): 'file' | 'module' | 'package' {
    if (relativePath.includes('node_modules')) {
      return 'package';
    } else if (relativePath.includes('/src/') || relativePath.includes('/lib/')) {
      return 'module';
    } else {
      return 'file';
    }
  }

  // private calculateComplexity(content: string): number {
    const lines = content.split('\n');
    let complexity = 1; // 基础复杂度
    
    // 计算圈复杂度
    const complexityKeywords = [
      'if', 'else', 'while', 'for', 'switch', 'case', 'catch', '&&', '||', '?', ':'
    ];
    
    complexityKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      const matches = content.match(regex);
      if (matches) {
        complexity += matches.length;
      }
    });
    
    // 计算嵌套深度
    let maxNesting = 0;
    let currentNesting = 0;
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.includes('{') || trimmed.includes('(')) {
        currentNesting++;
        maxNesting = Math.max(maxNesting, currentNesting);
      }
      if (trimmed.includes('}') || trimmed.includes(')')) {
        currentNesting = Math.max(0, currentNesting - 1);
      }
    });
    
    return complexity + maxNesting;
  }

  // private buildDependencyRelations(): void {
    // 建立依赖关系
    for (const [nodeName, node] of this.dependencyGraph) {
      node.dependencies.forEach(depName => {
        const depNode = this.dependencyGraph.get(depName);
        if (depNode) {
          depNode.dependents.push(nodeName);
        }
      });
    }
  }

  // private detectCircularDependencies(): void {
    this.circularDependencies = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    for (const nodeName of this.dependencyGraph.keys()) {
      if (!visited.has(nodeName)) {
        this.dfsDetectCycle(nodeName, visited, recursionStack, []);
      }
    }
  }

  // private dfsDetectCycle(
    nodeName: string,
    visited: Set<string>,
    recursionStack: Set<string>,
    path: string[]
  ): void {
    visited.add(nodeName);
    recursionStack.add(nodeName);
    path.push(nodeName);
    
    const node = this.dependencyGraph.get(nodeName);
    if (node) {
      for (const dep of node.dependencies) {
        if (!visited.has(dep)) {
          this.dfsDetectCycle(dep, visited, recursionStack, [...path]);
        } else if (recursionStack.has(dep)) {
          // 发现循环依赖
          const cycleStart = path.indexOf(dep);
          const cycle = path.slice(cycleStart);
          cycle.push(dep);
          this.circularDependencies.push(cycle);
        }
      }
    }
    
    recursionStack.delete(nodeName);
  }

  // private calculateArchitectureMetrics(): ArchitectureMetrics {
    const nodes = Array.from(this.dependencyGraph.values());
    const files = nodes.filter(n => n.type === 'file');
    const modules = nodes.filter(n => n.type === 'module');
    const packages = nodes.filter(n => n.type === 'package');
    
    const complexities = nodes.map(n => n.complexity);
    const averageComplexity = complexities.reduce((sum, c) => sum + c, 0) / complexities.length;
    const maxComplexity = Math.max(...complexities);
    
    // 计算耦合度
    const couplingScore = this.calculateCouplingScore(nodes);
    
    // 计算内聚度
    const cohesionScore = this.calculateCohesionScore(nodes);
    
    // 计算模块化程度
    const modularityScore = this.calculateModularityScore(nodes);
    
    return {
      totalFiles: files.length,
      totalModules: modules.length,
      totalPackages: packages.length,
      averageComplexity,
      maxComplexity,
      circularDependencies: this.circularDependencies,
      couplingScore,
      cohesionScore,
      modularityScore
    };
  }

  // private calculateCouplingScore(nodes: DependencyNode[]): number {
    let totalCoupling = 0;
    let totalPossibleCoupling = 0;
    
    nodes.forEach(node => {
      totalCoupling += node.dependencies.length + node.dependents.length;
      totalPossibleCoupling += nodes.length - 1;
    });
    
    return totalPossibleCoupling > 0 ? totalCoupling / totalPossibleCoupling : 0;
  }

  // private calculateCohesionScore(nodes: DependencyNode[]): number {
    // 简化的内聚度计算：基于模块内部文件的相关性
    const modules = new Map<string, DependencyNode[]>();
    
    nodes.forEach(node => {
      const moduleName = this.getModuleName(node.path);
      if (!modules.has(moduleName)) {
        modules.set(moduleName, []);
      }
      modules.get(moduleName)!.push(node);
    });
    
    let totalCohesion = 0;
    let moduleCount = 0;
    
    modules.forEach(moduleNodes => {
      if (moduleNodes.length > 1) {
        let internalConnections = 0;
        let totalPossibleConnections = moduleNodes.length * (moduleNodes.length - 1);
        
        moduleNodes.forEach(node => {
          node.dependencies.forEach(dep => {
            if (moduleNodes.some(n => n.name === dep)) {
              internalConnections++;
            }
          });
        });
        
        totalCohesion += totalPossibleConnections > 0 ? internalConnections / totalPossibleConnections : 0;
        moduleCount++;
      }
    });
    
    return moduleCount > 0 ? totalCohesion / moduleCount : 0;
  }

  // private calculateModularityScore(nodes: DependencyNode[]): number {
    const modules = new Map<string, DependencyNode[]>();
    
    nodes.forEach(node => {
      const moduleName = this.getModuleName(node.path);
      if (!modules.has(moduleName)) {
        modules.set(moduleName, []);
      }
      modules.get(moduleName)!.push(node);
    });
    
    const moduleCount = modules.size;
    const totalFiles = nodes.length;
    
    // 模块化程度 = 模块数量 / 总文件数
    return totalFiles > 0 ? moduleCount / totalFiles : 0;
  }

  // private getModuleName(filePath: string): string {
    const parts = filePath.split('/');
    if (parts.includes('src')) {
      const srcIndex = parts.indexOf('src');
      return parts.slice(srcIndex, srcIndex + 2).join('/');
    }
    return parts[0];
  }

  // private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    // 循环依赖建议
    if (this.circularDependencies.length > 0) {
      recommendations.push(`解决 ${this.circularDependencies.length} 个循环依赖问题`);
    }
    
    // 复杂度建议
    const highComplexityNodes = Array.from(this.dependencyGraph.values())
      .filter(n => n.complexity > 10);
    
    if (highComplexityNodes.length > 0) {
      recommendations.push(`重构 ${highComplexityNodes.length} 个高复杂度模块`);
    }
    
    // 耦合度建议
    const highCouplingNodes = Array.from(this.dependencyGraph.values())
      .filter(n => n.dependencies.length > 5 || n.dependents.length > 5);
    
    if (highCouplingNodes.length > 0) {
      recommendations.push(`降低 ${highCouplingNodes.length} 个高耦合模块的依赖关系`);
    }
    
    // 模块化建议
    const modules = new Map<string, DependencyNode[]>();
    Array.from(this.dependencyGraph.values()).forEach(node => {
      const moduleName = this.getModuleName(node.path);
      if (!modules.has(moduleName)) {
        modules.set(moduleName, []);
      }
      modules.get(moduleName)!.push(node);
    });
    
    const largeModules = Array.from(modules.values()).filter(m => m.length > 10);
    if (largeModules.length > 0) {
      recommendations.push(`拆分 ${largeModules.length} 个过大的模块`);
    }
    
    return recommendations;
  }

  // private calculateSummary(metrics: ArchitectureMetrics): any {
    let score = 100;
    
    // 循环依赖扣分
    score -= this.circularDependencies.length * 10;
    
    // 复杂度扣分
    if (metrics.averageComplexity > 5) {
      score -= (metrics.averageComplexity - 5) * 5;
    }
    
    // 耦合度扣分
    if (metrics.couplingScore > 0.3) {
      score -= (metrics.couplingScore - 0.3) * 100;
    }
    
    // 内聚度加分
    score += metrics.cohesionScore * 20;
    
    // 模块化程度加分
    score += metrics.modularityScore * 10;
    
    score = Math.max(0, Math.min(100, score));
    
    let healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
    if (score >= 80) healthStatus = 'excellent';
    else if (score >= 60) healthStatus = 'good';
    else if (score >= 40) healthStatus = 'fair';
    else healthStatus = 'poor';
    
    const criticalIssues = this.circularDependencies.length + 
      Array.from(this.dependencyGraph.values()).filter(n => n.complexity > 15).length;
    
    const improvementAreas = [];
    if (this.circularDependencies.length > 0) improvementAreas.push('循环依赖');
    if (metrics.averageComplexity > 8) improvementAreas.push('代码复杂度');
    if (metrics.couplingScore > 0.4) improvementAreas.push('模块耦合');
    if (metrics.cohesionScore < 0.3) improvementAreas.push('模块内聚');
    
    return {
      overallScore: Math.round(score),
      healthStatus,
      criticalIssues,
      improvementAreas
    };
  }

  generateDependencyGraph(): string {
    const nodes = Array.from(this.dependencyGraph.values());
    let dot = 'digraph DependencyGraph {\n';
    dot += '  rankdir=TB;\n';
    dot += '  node [shape=box, style=filled];\n';
    
    // 添加节点
    nodes.forEach(node => {
      const color = node.type === 'package' ? 'lightblue' : 
                   node.type === 'module' ? 'lightgreen' : 'lightgray';
      dot += `  "${node.name}" [fillcolor=${color}];\n`;
    });
    
    // 添加边
    nodes.forEach(node => {
      node.dependencies.forEach(dep => {
        const depNode = this.dependencyGraph.get(dep);
        if (depNode) {
          dot += `  "${node.name}" -> "${dep}";\n`;
        }
      });
    });
    
    dot += '}\n';
    return dot;
  }
}

export { ArchitectureAnalyzer };
