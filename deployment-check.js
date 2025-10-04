#!/usr/bin/env node

/**
 * FluLink 部署检查脚本
 * 每次推送代码到Gitee前运行此脚本
 * 用法: node deployment-check.js
 */

const fs = require('fs');
const path = require('path');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function warning(message) {
  log(`⚠️ ${message}`, 'yellow');
}

function info(message) {
  log(`ℹ️ ${message}`, 'blue');
}

// 检查文件是否存在
function checkFileExists(filePath) {
  if (!fs.existsSync(filePath)) {
    error(`文件不存在: ${filePath}`);
    return false;
  }
  return true;
}

// 检查重复导入
function checkDuplicateImports(filePath) {
  if (!checkFileExists(filePath)) return false;

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const imports = new Set();
  let hasDuplicates = false;

  lines.forEach((line, index) => {
    const importMatch = line.match(/import\s+.*from\s+['"]([^'"]+)['"]/);
    if (importMatch) {
      const importPath = importMatch[1];
      if (imports.has(importPath)) {
        error(`重复导入: ${importPath} (${filePath}:${index + 1})`);
        hasDuplicates = true;
      }
      imports.add(importPath);
    }
  });

  return !hasDuplicates;
}

// 检查组件默认导出
function checkDefaultExport(filePath) {
  if (!checkFileExists(filePath)) return false;

  const content = fs.readFileSync(filePath, 'utf8');
  const hasDefaultExport = content.includes('export default') || content.includes('module.exports');

  if (!hasDefaultExport) {
    error(`缺少默认导出: ${filePath}`);
    return false;
  }

  return true;
}

// 检查路径别名引用
function checkPathAliases(filePath) {
  if (!checkFileExists(filePath)) return false;

  const content = fs.readFileSync(filePath, 'utf8');
  const aliasImports = content.match(/from\s+['"]@\/[^'"]+['"]/g) || [];
  let allValid = true;

  aliasImports.forEach(importPath => {
    const cleanPath = importPath.replace(/from\s+['"]|['"]/g, '');
    const relativePath = cleanPath.replace('@/', 'src/');

    // 检查组件文件是否存在
    const possibleExtensions = ['.tsx', '.ts', '.jsx', '.js', '/index.tsx', '/index.ts'];
    const fileExists = possibleExtensions.some(ext => {
      const fullPath = path.join(process.cwd(), relativePath + ext);
      return fs.existsSync(fullPath);
    });

    if (!fileExists) {
      error(`路径别名引用不存在: ${cleanPath} (${filePath})`);
      allValid = false;
    }
  });

  return allValid;
}

// 主检查函数
async function runDeploymentCheck() {
  log('🚀 开始 FluLink 部署检查...', 'blue');
  log('='.repeat(50));

  let allChecksPassed = true;

  // 1. 检查关键文件是否存在
  info('1. 检查关键文件...');
  const criticalFiles = [
    'src/app/page.tsx',
    'src/app/login/page.tsx',
    'src/app/dashboard/page.tsx',
    'src/app/features/page.tsx',
    'src/components/layout/MainLayout.tsx',
    'package.json',
    'tsconfig.json',
    'next.config.ts'
  ];

  criticalFiles.forEach(file => {
    if (checkFileExists(file)) {
      success(`文件存在: ${file}`);
    } else {
      allChecksPassed = false;
    }
  });

  // 2. 检查重复导入
  info('2. 检查重复导入...');
  const tsxFiles = [
    'src/app/page.tsx',
    'src/app/dashboard/page.tsx',
    'src/components/layout/MainLayout.tsx',
    'src/components/virus/StrainCreationForm.tsx',
    'src/components/virus/StrainEditForm.tsx'
  ];

  tsxFiles.forEach(file => {
    if (checkDuplicateImports(file)) {
      success(`无重复导入: ${file}`);
    } else {
      allChecksPassed = false;
    }
  });

  // 3. 检查组件默认导出
  info('3. 检查组件默认导出...');
  const componentFiles = [
    'src/app/page.tsx',
    'src/app/dashboard/page.tsx',
    'src/components/layout/MainLayout.tsx',
    'src/components/virus/StrainCreationForm.tsx',
    'src/components/virus/StrainEditForm.tsx'
  ];

  componentFiles.forEach(file => {
    if (checkDefaultExport(file)) {
      success(`有默认导出: ${file}`);
    } else {
      allChecksPassed = false;
    }
  });

  // 4. 检查路径别名
  info('4. 检查路径别名引用...');
  const aliasFiles = [
    'src/app/page.tsx',
    'src/app/dashboard/page.tsx',
    'src/components/layout/MainLayout.tsx'
  ];

  aliasFiles.forEach(file => {
    if (checkPathAliases(file)) {
      success(`路径别名正确: ${file}`);
    } else {
      allChecksPassed = false;
    }
  });

  // 5. 检查TypeScript配置
  info('5. 检查TypeScript配置...');
  if (checkFileExists('tsconfig.json')) {
    const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
    if (tsconfig.compilerOptions?.baseUrl === '.' && tsconfig.compilerOptions?.paths?.['@/*']) {
      success('TypeScript路径别名配置正确');
    } else {
      error('TypeScript路径别名配置错误');
      allChecksPassed = false;
    }
  }

  // 6. 检查Next.js配置
  info('6. 检查Next.js配置...');
  if (checkFileExists('next.config.ts')) {
    const nextConfigContent = fs.readFileSync('next.config.ts', 'utf8');
    if (nextConfigContent.includes("output: 'standalone'")) {
      success('Next.js standalone输出配置正确');
    } else {
      warning('Next.js standalone输出配置可能缺失');
    }
  }

  log('='.repeat(50));

  if (allChecksPassed) {
    success('🎉 所有部署检查通过！可以安全推送到Gitee');
    process.exit(0);
  } else {
    error('❌ 部署检查失败！请修复上述问题后再推送');
    process.exit(1);
  }
}

// 运行检查
runDeploymentCheck().catch(error => {
  console.error('检查脚本执行失败:', error);
  process.exit(1);
});