#!/bin/bash

# FluLink 发牌手服务 自动部署脚本
# 无人值守全自动部署和测试

echo "🚀 FluLink 发牌手服务 - 自动部署开始"
echo "=================================="

# 检查Node.js环境
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装，请先安装 npm"
    exit 1
fi

echo "✅ Node.js 环境检查通过"

# 安装依赖
echo "📦 安装项目依赖..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

echo "✅ 依赖安装完成"

# 构建项目
echo "🔨 构建项目..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 项目构建失败"
    exit 1
fi

echo "✅ 项目构建完成"

# 启动开发服务器
echo "🌐 启动开发服务器..."
npm run dev &

# 等待服务器启动
echo "⏳ 等待服务器启动..."
sleep 10

# 检查服务器状态
echo "🔍 检查服务器状态..."
if curl -s http://localhost:8080 > /dev/null; then
    echo "✅ 服务器启动成功"
else
    echo "❌ 服务器启动失败"
    exit 1
fi

# 自动打开浏览器
echo "🌍 自动打开浏览器..."
if command -v start &> /dev/null; then
    # Windows
    start http://localhost:8080
    start http://localhost:8080/admin
    start http://localhost:8080/demo
    start http://localhost:8080/monitor
elif command -v open &> /dev/null; then
    # macOS
    open http://localhost:8080
    open http://localhost:8080/admin
    open http://localhost:8080/demo
    open http://localhost:8080/monitor
elif command -v xdg-open &> /dev/null; then
    # Linux
    xdg-open http://localhost:8080
    xdg-open http://localhost:8080/admin
    xdg-open http://localhost:8080/demo
    xdg-open http://localhost:8080/monitor
fi

echo "✅ 浏览器已打开"

# 运行自动测试
echo "🧪 运行自动测试..."
if [ -f "auto-test.js" ]; then
    node auto-test.js
    echo "✅ 自动测试完成"
else
    echo "⚠️  自动测试脚本不存在，跳过测试"
fi

echo ""
echo "🎉 FluLink 发牌手服务部署完成！"
echo "=================================="
echo "📱 主应用: http://localhost:8080"
echo "⚙️  管理员后台: http://localhost:8080/admin"
echo "📚 演示页面: http://localhost:8080/demo"
echo "📊 实时监控: http://localhost:8080/monitor"
echo ""
echo "💡 提示: 按 Ctrl+C 停止服务器"
echo ""

# 保持脚本运行
wait
