import fs from 'fs';
import path from 'path';

class ArchitectureAnalyzer {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.dependencies = new Map();
    this.modules = new Map();
    this.circularDependencies = [];
  }

  async analyzeArchitecture() {
    console.log('🏗️ 开始架构分析...');
    
    try {
      // 1. 分析项目结构
      const projectStructure = this.analyzeProjectStructure();
      
      // 2. 分析依赖关系
      const dependencyGraph = await this.analyzeDependencies();
      
      // 3. 检测循环依赖
      const circularDeps = this.detectCircularDependencies();
      
      // 4. 分析模块耦合度
      const couplingAnalysis = this.analyzeCoupling();
      
      // 5. 分析API设计
      const apiAnalysis = this.analyzeAPIDesign();
      
      // 6. 生成架构报告
      const report = this.generateArchitectureReport({
        projectStructure,
        dependencyGraph,
        circularDependencies: circularDeps,
        couplingAnalysis,
        apiAnalysis
      });
      
      console.log('✅ 架构分析完成');
      return report;
      
    } catch (error) {
      console.error('❌ 架构分析失败:', error);
      throw error;
    }
  }

  analyzeProjectStructure() {
    const structure = {
      totalFiles: 0,
      directories: [],
      fileTypes: {},
      layers: {
        controllers: 0,
        services: 0,
        models: 0,
        middleware: 0,
        routes: 0,
        utils: 0
      }
    };

    const scanDirectory = (dir, level = 0) => {
      try {
        const items = fs.readdirSync(dir);
        
        items.forEach(item => {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            if (!['node_modules', '.git', 'dist', 'build', 'coverage'].includes(item)) {
              structure.directories.push({
                name: item,
                path: path.relative(this.projectRoot, fullPath),
                level
              });
              scanDirectory(fullPath, level + 1);
            }
          } else if (stat.isFile()) {
            structure.totalFiles++;
            const ext = path.extname(item);
            structure.fileTypes[ext] = (structure.fileTypes[ext] || 0) + 1;
            
            // 分析文件层次
            const relativePath = path.relative(this.projectRoot, fullPath);
            if (relativePath.includes('/routes/')) structure.layers.routes++;
            else if (relativePath.includes('/services/')) structure.layers.services++;
            else if (relativePath.includes('/models/')) structure.layers.models++;
            else if (relativePath.includes('/middleware/')) structure.layers.middleware++;
            else if (relativePath.includes('/utils/')) structure.layers.utils++;
          }
        });
      } catch (error) {
        // 忽略无法访问的目录
      }
    };

    scanDirectory(this.projectRoot);
    return structure;
  }

  async analyzeDependencies() {
    const dependencyGraph = {
      internal: new Map(),
      external: new Map(),
      totalModules: 0,
      totalDependencies: 0
    };

    const analyzeFile = (filePath) => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const relativePath = path.relative(this.projectRoot, filePath);
        
        // 分析require/import语句
        const requirePattern = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
        const importPattern = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
        
        const dependencies = [];
        let match;
        
        // 匹配require语句
        while ((match = requirePattern.exec(content)) !== null) {
          dependencies.push(match[1]);
        }
        
        // 匹配import语句
        while ((match = importPattern.exec(content)) !== null) {
          dependencies.push(match[1]);
        }
        
        // 分类依赖
        dependencies.forEach(dep => {
          if (dep.startsWith('./') || dep.startsWith('../')) {
            // 内部依赖
            if (!dependencyGraph.internal.has(relativePath)) {
              dependencyGraph.internal.set(relativePath, []);
            }
            dependencyGraph.internal.get(relativePath).push(dep);
          } else {
            // 外部依赖
            if (!dependencyGraph.external.has(relativePath)) {
              dependencyGraph.external.set(relativePath, []);
            }
            dependencyGraph.external.get(relativePath).push(dep);
          }
        });
        
        dependencyGraph.totalModules++;
        dependencyGraph.totalDependencies += dependencies.length;
        
      } catch (error) {
        // 忽略无法读取的文件
      }
    };

    // 扫描所有源文件
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
              analyzeFile(fullPath);
            }
          }
        });
      } catch (error) {
        // 忽略无法访问的目录
      }
    };

    scanDirectory(this.projectRoot);
    return dependencyGraph;
  }

  detectCircularDependencies() {
    const circularDeps = [];
    const visited = new Set();
    const recursionStack = new Set();

    const dfs = (node, path = []) => {
      if (recursionStack.has(node)) {
        // 发现循环依赖
        const cycleStart = path.indexOf(node);
        const cycle = path.slice(cycleStart).concat([node]);
        circularDeps.push({
          cycle: cycle,
          length: cycle.length - 1,
          severity: cycle.length > 5 ? 'high' : cycle.length > 3 ? 'medium' : 'low'
        });
        return;
      }

      if (visited.has(node)) return;

      visited.add(node);
      recursionStack.add(node);

      const dependencies = this.dependencies.get(node) || [];
      dependencies.forEach(dep => {
        dfs(dep, [...path, node]);
      });

      recursionStack.delete(node);
    };

    // 从每个未访问的节点开始DFS
    for (const [node] of this.dependencies) {
      if (!visited.has(node)) {
        dfs(node);
      }
    }

    return circularDeps;
  }

  analyzeCoupling() {
    const couplingMetrics = {
      averageCoupling: 0,
      highlyCoupledModules: [],
      looselyCoupledModules: [],
      couplingDistribution: {
        low: 0,    // 0-2 dependencies
        medium: 0, // 3-5 dependencies
        high: 0    // 6+ dependencies
      }
    };

    let totalCoupling = 0;
    let moduleCount = 0;

    for (const [module, dependencies] of this.dependencies) {
      const depCount = dependencies.length;
      totalCoupling += depCount;
      moduleCount++;

      if (depCount <= 2) {
        couplingMetrics.couplingDistribution.low++;
        couplingMetrics.looselyCoupledModules.push({
          module,
          dependencies: depCount
        });
      } else if (depCount <= 5) {
        couplingMetrics.couplingDistribution.medium++;
      } else {
        couplingMetrics.couplingDistribution.high++;
        couplingMetrics.highlyCoupledModules.push({
          module,
          dependencies: depCount
        });
      }
    }

    couplingMetrics.averageCoupling = moduleCount > 0 ? totalCoupling / moduleCount : 0;

    return couplingMetrics;
  }

  analyzeAPIDesign() {
    const apiAnalysis = {
      totalEndpoints: 0,
      endpointTypes: {
        GET: 0,
        POST: 0,
        PUT: 0,
        DELETE: 0,
        PATCH: 0
      },
      routePatterns: [],
      middlewareUsage: {},
      responsePatterns: []
    };

    const scanRoutes = (dir) => {
      try {
        const items = fs.readdirSync(dir);
        
        items.forEach(item => {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            scanRoutes(fullPath);
          } else if (stat.isFile() && item.includes('routes')) {
            try {
              const content = fs.readFileSync(fullPath, 'utf8');
              
              // 分析HTTP方法
              const methodPatterns = [
                /\.get\s*\(\s*['"]([^'"]+)['"]/g,
                /\.post\s*\(\s*['"]([^'"]+)['"]/g,
                /\.put\s*\(\s*['"]([^'"]+)['"]/g,
                /\.delete\s*\(\s*['"]([^'"]+)['"]/g,
                /\.patch\s*\(\s*['"]([^'"]+)['"]/g
              ];
              
              const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
              
              methodPatterns.forEach((pattern, index) => {
                let match;
                while ((match = pattern.exec(content)) !== null) {
                  apiAnalysis.totalEndpoints++;
                  apiAnalysis.endpointTypes[methods[index]]++;
                  apiAnalysis.routePatterns.push({
                    method: methods[index],
                    path: match[1],
                    file: path.relative(this.projectRoot, fullPath)
                  });
                }
              });
              
            } catch (error) {
              // 忽略无法读取的文件
            }
          }
        });
      } catch (error) {
        // 忽略无法访问的目录
      }
    };

    scanRoutes(this.projectRoot);
    return apiAnalysis;
  }

  generateArchitectureReport(analysisData) {
    const {
      projectStructure,
      dependencyGraph,
      circularDependencies,
      couplingAnalysis,
      apiAnalysis
    } = analysisData;

    // 计算架构健康度评分
    const healthScore = this.calculateArchitectureHealthScore({
      circularDependencies,
      couplingAnalysis,
      apiAnalysis
    });

    return {
      timestamp: new Date().toISOString(),
      healthScore: Math.round(healthScore),
      projectStructure,
      dependencyGraph,
      circularDependencies,
      couplingAnalysis,
      apiAnalysis,
      recommendations: this.generateArchitectureRecommendations({
        circularDependencies,
        couplingAnalysis,
        apiAnalysis
      })
    };
  }

  calculateArchitectureHealthScore(data) {
    let score = 100;
    
    // 循环依赖扣分
    score -= data.circularDependencies.length * 10;
    
    // 高耦合度扣分
    score -= data.couplingAnalysis.couplingDistribution.high * 5;
    
    // API设计问题扣分
    if (data.apiAnalysis.totalEndpoints === 0) {
      score -= 20;
    }
    
    return Math.max(0, score);
  }

  generateArchitectureRecommendations(data) {
    const recommendations = [];
    
    if (data.circularDependencies.length > 0) {
      recommendations.push('修复循环依赖问题');
    }
    
    if (data.couplingAnalysis.couplingDistribution.high > 0) {
      recommendations.push('降低模块耦合度');
    }
    
    if (data.apiAnalysis.totalEndpoints === 0) {
      recommendations.push('添加API端点');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('架构设计良好');
    }
    
    return recommendations;
  }

  generateHTMLReport(report) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FluLink 架构分析报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px; }
        .metric { background: #f0f2f5; padding: 15px; border-radius: 6px; text-align: center; }
        .metric-value { font-size: 24px; font-weight: bold; color: #1890ff; }
        .metric-label { color: #666; margin-top: 5px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #1890ff; border-bottom: 2px solid #1890ff; padding-bottom: 10px; }
        .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #e8e8e8; }
        .table th { background: #fafafa; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>FluLink 架构分析报告</h1>
            <p>生成时间: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="metrics">
            <div class="metric">
                <div class="metric-value">${report.healthScore}</div>
                <div class="metric-label">架构健康度</div>
            </div>
            <div class="metric">
                <div class="metric-value">${report.projectStructure.totalFiles}</div>
                <div class="metric-label">总文件数</div>
            </div>
            <div class="metric">
                <div class="metric-value">${report.dependencyGraph.totalModules}</div>
                <div class="metric-label">模块数</div>
            </div>
            <div class="metric">
                <div class="metric-value">${report.circularDependencies.length}</div>
                <div class="metric-label">循环依赖</div>
            </div>
        </div>
        
        <div class="section">
            <h2>项目结构</h2>
            <p>总文件数: ${report.projectStructure.totalFiles}</p>
            <p>目录数: ${report.projectStructure.directories.length}</p>
            <p>文件类型分布: ${Object.entries(report.projectStructure.fileTypes).map(([ext, count]) => `${ext}: ${count}`).join(', ')}</p>
        </div>
        
        <div class="section">
            <h2>依赖分析</h2>
            <p>总模块数: ${report.dependencyGraph.totalModules}</p>
            <p>总依赖数: ${report.dependencyGraph.totalDependencies}</p>
            <p>内部依赖: ${report.dependencyGraph.internal.size}</p>
            <p>外部依赖: ${report.dependencyGraph.external.size}</p>
        </div>
        
        <div class="section">
            <h2>循环依赖检测</h2>
            ${report.circularDependencies.length > 0 ? `
                <table class="table">
                    <thead>
                        <tr>
                            <th>循环路径</th>
                            <th>长度</th>
                            <th>严重程度</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${report.circularDependencies.map(circ => `
                            <tr>
                                <td>${circ.cycle.join(' → ')}</td>
                                <td>${circ.length}</td>
                                <td>${circ.severity}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            ` : '<p>未发现循环依赖</p>'}
        </div>
        
        <div class="section">
            <h2>耦合度分析</h2>
            <p>平均耦合度: ${report.couplingAnalysis.averageCoupling.toFixed(2)}</p>
            <p>低耦合模块: ${report.couplingAnalysis.couplingDistribution.low}</p>
            <p>中等耦合模块: ${report.couplingAnalysis.couplingDistribution.medium}</p>
            <p>高耦合模块: ${report.couplingAnalysis.couplingDistribution.high}</p>
        </div>
        
        <div class="section">
            <h2>API设计分析</h2>
            <p>总端点数: ${report.apiAnalysis.totalEndpoints}</p>
            <p>GET: ${report.apiAnalysis.endpointTypes.GET}</p>
            <p>POST: ${report.apiAnalysis.endpointTypes.POST}</p>
            <p>PUT: ${report.apiAnalysis.endpointTypes.PUT}</p>
            <p>DELETE: ${report.apiAnalysis.endpointTypes.DELETE}</p>
        </div>
        
        <div class="section">
            <h2>建议</h2>
            <ul>
                ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
    </div>
</body>
</html>`;
  }
}

export { ArchitectureAnalyzer };