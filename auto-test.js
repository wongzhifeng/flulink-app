#!/usr/bin/env node

/**
 * FluLink 发牌手服务 自动测试脚本
 * 无人值守全自动功能测试
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class FluLinkAutoTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.testResults = [];
    this.baseUrl = 'http://localhost:8080';
  }

  async init() {
    console.log('🚀 启动 FluLink 自动测试...');
    this.browser = await puppeteer.launch({ 
      headless: false, // 显示浏览器窗口
      defaultViewport: null,
      args: ['--start-maximized']
    });
    this.page = await this.browser.newPage();
    
    // 设置用户代理
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
  }

  async testPageLoad(url, pageName) {
    console.log(`📄 测试页面加载: ${pageName}`);
    try {
      await this.page.goto(url, { waitUntil: 'networkidle0', timeout: 10000 });
      await this.page.waitForSelector('body', { timeout: 5000 });
      
      const title = await this.page.title();
      const url_final = this.page.url();
      
      this.testResults.push({
        test: `页面加载 - ${pageName}`,
        status: 'PASS',
        details: `标题: ${title}, URL: ${url_final}`
      });
      
      console.log(`✅ ${pageName} 加载成功`);
      return true;
    } catch (error) {
      this.testResults.push({
        test: `页面加载 - ${pageName}`,
        status: 'FAIL',
        details: error.message
      });
      console.log(`❌ ${pageName} 加载失败: ${error.message}`);
      return false;
    }
  }

  async testMainApp() {
    console.log('🎯 测试主应用功能...');
    
    // 测试位置验证
    try {
      await this.page.goto(`${this.baseUrl}`, { waitUntil: 'networkidle0' });
      
      // 查找位置验证按钮
      const locationButton = await this.page.$('button:has-text("发送位置信息")');
      if (locationButton) {
        await locationButton.click();
        await this.page.waitForTimeout(2000);
        
        this.testResults.push({
          test: '位置验证按钮',
          status: 'PASS',
          details: '位置验证按钮可点击'
        });
        console.log('✅ 位置验证按钮测试通过');
      }
      
      // 测试输入框
      const inputField = await this.page.$('input[placeholder*="亮牌"]');
      if (inputField) {
        await inputField.type('测试毒株内容：这是一个自动测试消息');
        await this.page.waitForTimeout(1000);
        
        this.testResults.push({
          test: '内容输入框',
          status: 'PASS',
          details: '可以输入毒株内容'
        });
        console.log('✅ 内容输入框测试通过');
      }
      
    } catch (error) {
      this.testResults.push({
        test: '主应用功能',
        status: 'FAIL',
        details: error.message
      });
      console.log(`❌ 主应用功能测试失败: ${error.message}`);
    }
  }

  async testAdminDashboard() {
    console.log('⚙️ 测试管理员后台...');
    
    try {
      await this.page.goto(`${this.baseUrl}/admin`, { waitUntil: 'networkidle0' });
      
      // 检查管理员界面元素
      const adminTitle = await this.page.$('h1:has-text("管理员后台")');
      if (adminTitle) {
        this.testResults.push({
          test: '管理员后台标题',
          status: 'PASS',
          details: '管理员后台标题显示正常'
        });
        console.log('✅ 管理员后台标题测试通过');
      }
      
      // 检查系统指标
      const metricsCards = await this.page.$$('.bg-white.rounded-lg');
      if (metricsCards.length > 0) {
        this.testResults.push({
          test: '系统指标卡片',
          status: 'PASS',
          details: `找到 ${metricsCards.length} 个指标卡片`
        });
        console.log(`✅ 系统指标卡片测试通过 (${metricsCards.length}个)`);
      }
      
    } catch (error) {
      this.testResults.push({
        test: '管理员后台',
        status: 'FAIL',
        details: error.message
      });
      console.log(`❌ 管理员后台测试失败: ${error.message}`);
    }
  }

  async testDemoPage() {
    console.log('📚 测试演示页面...');
    
    try {
      await this.page.goto(`${this.baseUrl}/demo`, { waitUntil: 'networkidle0' });
      
      // 检查演示内容
      const demoTitle = await this.page.$('h1:has-text("FluLink")');
      if (demoTitle) {
        this.testResults.push({
          test: '演示页面标题',
          status: 'PASS',
          details: '演示页面标题显示正常'
        });
        console.log('✅ 演示页面标题测试通过');
      }
      
      // 检查毒性示例
      const toxicityExamples = await this.page.$$('button:has-text("毒性")');
      if (toxicityExamples.length > 0) {
        this.testResults.push({
          test: '毒性示例',
          status: 'PASS',
          details: `找到 ${toxicityExamples.length} 个毒性示例`
        });
        console.log(`✅ 毒性示例测试通过 (${toxicityExamples.length}个)`);
      }
      
    } catch (error) {
      this.testResults.push({
        test: '演示页面',
        status: 'FAIL',
        details: error.message
      });
      console.log(`❌ 演示页面测试失败: ${error.message}`);
    }
  }

  async testMonitorDashboard() {
    console.log('📊 测试监控面板...');
    
    try {
      await this.page.goto(`${this.baseUrl}/monitor`, { waitUntil: 'networkidle0' });
      
      // 检查监控界面
      const monitorTitle = await this.page.$('h1:has-text("实时监控")');
      if (monitorTitle) {
        this.testResults.push({
          test: '监控面板标题',
          status: 'PASS',
          details: '监控面板标题显示正常'
        });
        console.log('✅ 监控面板标题测试通过');
      }
      
      // 检查实时数据
      await this.page.waitForTimeout(3000); // 等待实时数据更新
      const metrics = await this.page.$$('.text-2xl.font-bold');
      if (metrics.length > 0) {
        this.testResults.push({
          test: '实时指标显示',
          status: 'PASS',
          details: `找到 ${metrics.length} 个实时指标`
        });
        console.log(`✅ 实时指标显示测试通过 (${metrics.length}个)`);
      }
      
    } catch (error) {
      this.testResults.push({
        test: '监控面板',
        status: 'FAIL',
        details: error.message
      });
      console.log(`❌ 监控面板测试失败: ${error.message}`);
    }
  }

  async generateReport() {
    console.log('\n📋 生成测试报告...');
    
    const report = {
      timestamp: new Date().toISOString(),
      totalTests: this.testResults.length,
      passedTests: this.testResults.filter(r => r.status === 'PASS').length,
      failedTests: this.testResults.filter(r => r.status === 'FAIL').length,
      results: this.testResults
    };
    
    // 保存报告到文件
    const reportPath = path.join(__dirname, 'test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // 控制台输出
    console.log('\n🎯 测试报告摘要:');
    console.log(`总测试数: ${report.totalTests}`);
    console.log(`通过: ${report.passedTests} ✅`);
    console.log(`失败: ${report.failedTests} ❌`);
    console.log(`成功率: ${((report.passedTests / report.totalTests) * 100).toFixed(1)}%`);
    
    if (report.failedTests > 0) {
      console.log('\n❌ 失败的测试:');
      report.results.filter(r => r.status === 'FAIL').forEach(test => {
        console.log(`  - ${test.test}: ${test.details}`);
      });
    }
    
    console.log(`\n📄 详细报告已保存到: ${reportPath}`);
  }

  async runAllTests() {
    try {
      await this.init();
      
      // 测试所有页面
      await this.testPageLoad(`${this.baseUrl}`, '主应用');
      await this.testPageLoad(`${this.baseUrl}/admin`, '管理员后台');
      await this.testPageLoad(`${this.baseUrl}/demo`, '演示页面');
      await this.testPageLoad(`${this.baseUrl}/monitor`, '监控面板');
      
      // 测试功能
      await this.testMainApp();
      await this.testAdminDashboard();
      await this.testDemoPage();
      await this.testMonitorDashboard();
      
      // 生成报告
      await this.generateReport();
      
    } catch (error) {
      console.error('❌ 测试执行失败:', error);
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }
}

// 运行测试
if (require.main === module) {
  const tester = new FluLinkAutoTester();
  tester.runAllTests().catch(console.error);
}

module.exports = FluLinkAutoTester;
