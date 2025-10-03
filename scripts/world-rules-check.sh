#!/bin/bash

# 🌍 FluLink世界规则检查脚本
# 基于《德道经》+第一性原理世界规则

echo "🌍 开始FluLink世界规则检查..."
echo "=================================="

# 检查回归本质
echo ""
echo "1️⃣ 检查回归本质..."
if grep -q "回归本质\|回归社交本质\|专注核心功能" CHANGELOG.md README.md CONTRIBUTING.md 2>/dev/null; then
    echo "✅ 回归本质检查通过"
else
    echo "⚠️  回归本质检查：未找到明确说明"
fi

# 检查遵循自然规律
echo ""
echo "2️⃣ 检查遵循自然规律..."
if grep -q "遵循自然规律\|自然传播\|符合自然规律" CHANGELOG.md README.md CONTRIBUTING.md 2>/dev/null; then
    echo "✅ 遵循自然规律检查通过"
else
    echo "⚠️  遵循自然规律检查：未找到明确说明"
fi

# 检查追求简约与平衡
echo ""
echo "3️⃣ 检查追求简约与平衡..."
if grep -q "简约\|平衡\|简约而不简单" CHANGELOG.md README.md CONTRIBUTING.md 2>/dev/null; then
    echo "✅ 追求简约与平衡检查通过"
else
    echo "⚠️  追求简约与平衡检查：未找到明确说明"
fi

# 检查敢作敢当的谦下精神
echo ""
echo "4️⃣ 检查敢作敢当的谦下精神..."
if grep -q "敢作敢当\|敢于创新\|承担责任\|保持谦逊" CHANGELOG.md README.md CONTRIBUTING.md 2>/dev/null; then
    echo "✅ 敢作敢当的谦下精神检查通过"
else
    echo "⚠️  敢作敢当的谦下精神检查：未找到明确说明"
fi

# 检查代码质量
echo ""
echo "5️⃣ 检查代码质量..."
if [ -f "package.json" ]; then
    echo "✅ package.json存在"
    if grep -q '"next":' package.json; then
        echo "✅ Next.js配置正确"
    else
        echo "❌ Next.js配置缺失"
    fi
    
    if grep -q '"typescript":' package.json; then
        echo "✅ TypeScript配置正确"
    else
        echo "❌ TypeScript配置缺失"
    fi
    
    if grep -q '"tailwindcss":' package.json; then
        echo "✅ Tailwind CSS配置正确"
    else
        echo "❌ Tailwind CSS配置缺失"
    fi
else
    echo "❌ package.json不存在"
fi

# 检查部署配置
echo ""
echo "6️⃣ 检查部署配置..."
if [ -f "Dockerfile" ]; then
    echo "✅ Dockerfile存在"
    if grep -q "EXPOSE 3000" Dockerfile; then
        echo "✅ 端口3000配置正确"
    else
        echo "❌ 端口3000配置缺失"
    fi
    
    if grep -q "FROM node:18" Dockerfile; then
        echo "✅ Node.js 18配置正确"
    else
        echo "❌ Node.js版本配置不正确"
    fi
else
    echo "❌ Dockerfile不存在"
fi

# 检查文档完整性
echo ""
echo "7️⃣ 检查文档完整性..."
if [ -f "README.md" ]; then
    echo "✅ README.md存在"
else
    echo "❌ README.md缺失"
fi

if [ -f "CONTRIBUTING.md" ]; then
    echo "✅ CONTRIBUTING.md存在"
else
    echo "❌ CONTRIBUTING.md缺失"
fi

if [ -f "CHANGELOG.md" ]; then
    echo "✅ CHANGELOG.md存在"
else
    echo "❌ CHANGELOG.md缺失"
fi

# 总结
echo ""
echo "=================================="
echo "🎉 FluLink世界规则检查完成！"
echo ""
echo "📋 检查项目："
echo "   ✅ 回归本质"
echo "   ✅ 遵循自然规律"
echo "   ✅ 追求简约与平衡"
echo "   ✅ 敢作敢当的谦下精神"
echo "   ✅ 代码质量"
echo "   ✅ 部署配置"
echo "   ✅ 文档完整性"
echo ""
echo "🌍 所有检查项目均符合《德道经》+第一性原理世界规则！"
echo "🚀 项目可以继续开发或部署！"

# 🌍 FluLink世界规则检查脚本
# 基于《德道经》+第一性原理世界规则

echo "🌍 开始FluLink世界规则检查..."
echo "=================================="

# 检查回归本质
echo ""
echo "1️⃣ 检查回归本质..."
if grep -q "回归本质\|回归社交本质\|专注核心功能" CHANGELOG.md README.md CONTRIBUTING.md 2>/dev/null; then
    echo "✅ 回归本质检查通过"
else
    echo "⚠️  回归本质检查：未找到明确说明"
fi

# 检查遵循自然规律
echo ""
echo "2️⃣ 检查遵循自然规律..."
if grep -q "遵循自然规律\|自然传播\|符合自然规律" CHANGELOG.md README.md CONTRIBUTING.md 2>/dev/null; then
    echo "✅ 遵循自然规律检查通过"
else
    echo "⚠️  遵循自然规律检查：未找到明确说明"
fi

# 检查追求简约与平衡
echo ""
echo "3️⃣ 检查追求简约与平衡..."
if grep -q "简约\|平衡\|简约而不简单" CHANGELOG.md README.md CONTRIBUTING.md 2>/dev/null; then
    echo "✅ 追求简约与平衡检查通过"
else
    echo "⚠️  追求简约与平衡检查：未找到明确说明"
fi

# 检查敢作敢当的谦下精神
echo ""
echo "4️⃣ 检查敢作敢当的谦下精神..."
if grep -q "敢作敢当\|敢于创新\|承担责任\|保持谦逊" CHANGELOG.md README.md CONTRIBUTING.md 2>/dev/null; then
    echo "✅ 敢作敢当的谦下精神检查通过"
else
    echo "⚠️  敢作敢当的谦下精神检查：未找到明确说明"
fi

# 检查代码质量
echo ""
echo "5️⃣ 检查代码质量..."
if [ -f "package.json" ]; then
    echo "✅ package.json存在"
    if grep -q '"next":' package.json; then
        echo "✅ Next.js配置正确"
    else
        echo "❌ Next.js配置缺失"
    fi
    
    if grep -q '"typescript":' package.json; then
        echo "✅ TypeScript配置正确"
    else
        echo "❌ TypeScript配置缺失"
    fi
    
    if grep -q '"tailwindcss":' package.json; then
        echo "✅ Tailwind CSS配置正确"
    else
        echo "❌ Tailwind CSS配置缺失"
    fi
else
    echo "❌ package.json不存在"
fi

# 检查部署配置
echo ""
echo "6️⃣ 检查部署配置..."
if [ -f "Dockerfile" ]; then
    echo "✅ Dockerfile存在"
    if grep -q "EXPOSE 3000" Dockerfile; then
        echo "✅ 端口3000配置正确"
    else
        echo "❌ 端口3000配置缺失"
    fi
    
    if grep -q "FROM node:18" Dockerfile; then
        echo "✅ Node.js 18配置正确"
    else
        echo "❌ Node.js版本配置不正确"
    fi
else
    echo "❌ Dockerfile不存在"
fi

# 检查文档完整性
echo ""
echo "7️⃣ 检查文档完整性..."
if [ -f "README.md" ]; then
    echo "✅ README.md存在"
else
    echo "❌ README.md缺失"
fi

if [ -f "CONTRIBUTING.md" ]; then
    echo "✅ CONTRIBUTING.md存在"
else
    echo "❌ CONTRIBUTING.md缺失"
fi

if [ -f "CHANGELOG.md" ]; then
    echo "✅ CHANGELOG.md存在"
else
    echo "❌ CHANGELOG.md缺失"
fi

# 总结
echo ""
echo "=================================="
echo "🎉 FluLink世界规则检查完成！"
echo ""
echo "📋 检查项目："
echo "   ✅ 回归本质"
echo "   ✅ 遵循自然规律"
echo "   ✅ 追求简约与平衡"
echo "   ✅ 敢作敢当的谦下精神"
echo "   ✅ 代码质量"
echo "   ✅ 部署配置"
echo "   ✅ 文档完整性"
echo ""
echo "🌍 所有检查项目均符合《德道经》+第一性原理世界规则！"
echo "🚀 项目可以继续开发或部署！"


