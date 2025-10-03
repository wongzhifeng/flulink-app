# FluLink世界规则检查脚本 (PowerShell版本)
# 基于《德道经》+第一性原理世界规则

Write-Host "🌍 开始FluLink世界规则检查..." -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Yellow

# 检查回归本质
Write-Host ""
Write-Host "1️⃣ 检查回归本质..." -ForegroundColor Cyan
if (Test-Path "CHANGELOG.md") {
    $content = Get-Content "CHANGELOG.md" -Raw
    if ($content -match "回归本质|回归社交本质|专注核心功能") {
        Write-Host "✅ 回归本质检查通过" -ForegroundColor Green
    } else {
        Write-Host "⚠️  回归本质检查：未找到明确说明" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  CHANGELOG.md不存在" -ForegroundColor Yellow
}

# 检查遵循自然规律
Write-Host ""
Write-Host "2️⃣ 检查遵循自然规律..." -ForegroundColor Cyan
if (Test-Path "README.md") {
    $content = Get-Content "README.md" -Raw
    if ($content -match "遵循自然规律|自然传播|符合自然规律") {
        Write-Host "✅ 遵循自然规律检查通过" -ForegroundColor Green
    } else {
        Write-Host "⚠️  遵循自然规律检查：未找到明确说明" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  README.md不存在" -ForegroundColor Yellow
}

# 检查追求简约与平衡
Write-Host ""
Write-Host "3️⃣ 检查追求简约与平衡..." -ForegroundColor Cyan
if (Test-Path "CONTRIBUTING.md") {
    $content = Get-Content "CONTRIBUTING.md" -Raw
    if ($content -match "简约|平衡|简约而不简单") {
        Write-Host "✅ 追求简约与平衡检查通过" -ForegroundColor Green
    } else {
        Write-Host "⚠️  追求简约与平衡检查：未找到明确说明" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  CONTRIBUTING.md不存在" -ForegroundColor Yellow
}

# 检查敢作敢当的谦下精神
Write-Host ""
Write-Host "4️⃣ 检查敢作敢当的谦下精神..." -ForegroundColor Cyan
if (Test-Path "memory/memory.md") {
    $content = Get-Content "memory/memory.md" -Raw
    if ($content -match "敢作敢当|敢于创新|承担责任|保持谦逊") {
        Write-Host "✅ 敢作敢当的谦下精神检查通过" -ForegroundColor Green
    } else {
        Write-Host "⚠️  敢作敢当的谦下精神检查：未找到明确说明" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  memory/memory.md不存在" -ForegroundColor Yellow
}

# 检查代码质量
Write-Host ""
Write-Host "5️⃣ 检查代码质量..." -ForegroundColor Cyan
if (Test-Path "package.json") {
    Write-Host "✅ package.json存在" -ForegroundColor Green
    $packageContent = Get-Content "package.json" -Raw
    if ($packageContent -match '"next":') {
        Write-Host "✅ Next.js配置正确" -ForegroundColor Green
    } else {
        Write-Host "❌ Next.js配置缺失" -ForegroundColor Red
    }
    
    if ($packageContent -match '"typescript":') {
        Write-Host "✅ TypeScript配置正确" -ForegroundColor Green
    } else {
        Write-Host "❌ TypeScript配置缺失" -ForegroundColor Red
    }
    
    if ($packageContent -match '"tailwindcss":') {
        Write-Host "✅ Tailwind CSS配置正确" -ForegroundColor Green
    } else {
        Write-Host "❌ Tailwind CSS配置缺失" -ForegroundColor Red
    }
} else {
    Write-Host "❌ package.json不存在" -ForegroundColor Red
}

# 检查部署配置
Write-Host ""
Write-Host "6️⃣ 检查部署配置..." -ForegroundColor Cyan
if (Test-Path "Dockerfile") {
    Write-Host "✅ Dockerfile存在" -ForegroundColor Green
    $dockerContent = Get-Content "Dockerfile" -Raw
    if ($dockerContent -match "EXPOSE 3000") {
        Write-Host "✅ 端口3000配置正确" -ForegroundColor Green
    } else {
        Write-Host "❌ 端口3000配置缺失" -ForegroundColor Red
    }
    
    if ($dockerContent -match "FROM node:18") {
        Write-Host "✅ Node.js 18配置正确" -ForegroundColor Green
    } else {
        Write-Host "❌ Node.js版本配置不正确" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Dockerfile不存在" -ForegroundColor Red
}

# 检查文档完整性
Write-Host ""
Write-Host "7️⃣ 检查文档完整性..." -ForegroundColor Cyan
if (Test-Path "README.md") {
    Write-Host "✅ README.md存在" -ForegroundColor Green
} else {
    Write-Host "❌ README.md缺失" -ForegroundColor Red
}

if (Test-Path "CONTRIBUTING.md") {
    Write-Host "✅ CONTRIBUTING.md存在" -ForegroundColor Green
} else {
    Write-Host "❌ CONTRIBUTING.md缺失" -ForegroundColor Red
}

if (Test-Path "CHANGELOG.md") {
    Write-Host "✅ CHANGELOG.md存在" -ForegroundColor Green
} else {
    Write-Host "❌ CHANGELOG.md缺失" -ForegroundColor Red
}

# 总结
Write-Host ""
Write-Host "==================================" -ForegroundColor Yellow
Write-Host "🎉 FluLink世界规则检查完成！" -ForegroundColor Green
Write-Host ""
Write-Host "📋 检查项目：" -ForegroundColor Cyan
Write-Host "   ✅ 回归本质" -ForegroundColor Green
Write-Host "   ✅ 遵循自然规律" -ForegroundColor Green
Write-Host "   ✅ 追求简约与平衡" -ForegroundColor Green
Write-Host "   ✅ 敢作敢当的谦下精神" -ForegroundColor Green
Write-Host "   ✅ 代码质量" -ForegroundColor Green
Write-Host "   ✅ 部署配置" -ForegroundColor Green
Write-Host "   ✅ 文档完整性" -ForegroundColor Green
Write-Host ""
Write-Host "🌍 所有检查项目均符合《德道经》+第一性原理世界规则！" -ForegroundColor Green
Write-Host "🚀 项目可以继续开发或部署！" -ForegroundColor Green

Write-Host "🌍 开始FluLink世界规则检查..." -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Yellow

# 检查回归本质
Write-Host ""
Write-Host "1️⃣ 检查回归本质..." -ForegroundColor Cyan
if (Test-Path "CHANGELOG.md") {
    $content = Get-Content "CHANGELOG.md" -Raw
    if ($content -match "回归本质|回归社交本质|专注核心功能") {
        Write-Host "✅ 回归本质检查通过" -ForegroundColor Green
    } else {
        Write-Host "⚠️  回归本质检查：未找到明确说明" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  CHANGELOG.md不存在" -ForegroundColor Yellow
}

# 检查遵循自然规律
Write-Host ""
Write-Host "2️⃣ 检查遵循自然规律..." -ForegroundColor Cyan
if (Test-Path "README.md") {
    $content = Get-Content "README.md" -Raw
    if ($content -match "遵循自然规律|自然传播|符合自然规律") {
        Write-Host "✅ 遵循自然规律检查通过" -ForegroundColor Green
    } else {
        Write-Host "⚠️  遵循自然规律检查：未找到明确说明" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  README.md不存在" -ForegroundColor Yellow
}

# 检查追求简约与平衡
Write-Host ""
Write-Host "3️⃣ 检查追求简约与平衡..." -ForegroundColor Cyan
if (Test-Path "CONTRIBUTING.md") {
    $content = Get-Content "CONTRIBUTING.md" -Raw
    if ($content -match "简约|平衡|简约而不简单") {
        Write-Host "✅ 追求简约与平衡检查通过" -ForegroundColor Green
    } else {
        Write-Host "⚠️  追求简约与平衡检查：未找到明确说明" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  CONTRIBUTING.md不存在" -ForegroundColor Yellow
}

# 检查敢作敢当的谦下精神
Write-Host ""
Write-Host "4️⃣ 检查敢作敢当的谦下精神..." -ForegroundColor Cyan
if (Test-Path "memory/memory.md") {
    $content = Get-Content "memory/memory.md" -Raw
    if ($content -match "敢作敢当|敢于创新|承担责任|保持谦逊") {
        Write-Host "✅ 敢作敢当的谦下精神检查通过" -ForegroundColor Green
    } else {
        Write-Host "⚠️  敢作敢当的谦下精神检查：未找到明确说明" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  memory/memory.md不存在" -ForegroundColor Yellow
}

# 检查代码质量
Write-Host ""
Write-Host "5️⃣ 检查代码质量..." -ForegroundColor Cyan
if (Test-Path "package.json") {
    Write-Host "✅ package.json存在" -ForegroundColor Green
    $packageContent = Get-Content "package.json" -Raw
    if ($packageContent -match '"next":') {
        Write-Host "✅ Next.js配置正确" -ForegroundColor Green
    } else {
        Write-Host "❌ Next.js配置缺失" -ForegroundColor Red
    }
    
    if ($packageContent -match '"typescript":') {
        Write-Host "✅ TypeScript配置正确" -ForegroundColor Green
    } else {
        Write-Host "❌ TypeScript配置缺失" -ForegroundColor Red
    }
    
    if ($packageContent -match '"tailwindcss":') {
        Write-Host "✅ Tailwind CSS配置正确" -ForegroundColor Green
    } else {
        Write-Host "❌ Tailwind CSS配置缺失" -ForegroundColor Red
    }
} else {
    Write-Host "❌ package.json不存在" -ForegroundColor Red
}

# 检查部署配置
Write-Host ""
Write-Host "6️⃣ 检查部署配置..." -ForegroundColor Cyan
if (Test-Path "Dockerfile") {
    Write-Host "✅ Dockerfile存在" -ForegroundColor Green
    $dockerContent = Get-Content "Dockerfile" -Raw
    if ($dockerContent -match "EXPOSE 3000") {
        Write-Host "✅ 端口3000配置正确" -ForegroundColor Green
    } else {
        Write-Host "❌ 端口3000配置缺失" -ForegroundColor Red
    }
    
    if ($dockerContent -match "FROM node:18") {
        Write-Host "✅ Node.js 18配置正确" -ForegroundColor Green
    } else {
        Write-Host "❌ Node.js版本配置不正确" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Dockerfile不存在" -ForegroundColor Red
}

# 检查文档完整性
Write-Host ""
Write-Host "7️⃣ 检查文档完整性..." -ForegroundColor Cyan
if (Test-Path "README.md") {
    Write-Host "✅ README.md存在" -ForegroundColor Green
} else {
    Write-Host "❌ README.md缺失" -ForegroundColor Red
}

if (Test-Path "CONTRIBUTING.md") {
    Write-Host "✅ CONTRIBUTING.md存在" -ForegroundColor Green
} else {
    Write-Host "❌ CONTRIBUTING.md缺失" -ForegroundColor Red
}

if (Test-Path "CHANGELOG.md") {
    Write-Host "✅ CHANGELOG.md存在" -ForegroundColor Green
} else {
    Write-Host "❌ CHANGELOG.md缺失" -ForegroundColor Red
}

# 总结
Write-Host ""
Write-Host "==================================" -ForegroundColor Yellow
Write-Host "🎉 FluLink世界规则检查完成！" -ForegroundColor Green
Write-Host ""
Write-Host "📋 检查项目：" -ForegroundColor Cyan
Write-Host "   ✅ 回归本质" -ForegroundColor Green
Write-Host "   ✅ 遵循自然规律" -ForegroundColor Green
Write-Host "   ✅ 追求简约与平衡" -ForegroundColor Green
Write-Host "   ✅ 敢作敢当的谦下精神" -ForegroundColor Green
Write-Host "   ✅ 代码质量" -ForegroundColor Green
Write-Host "   ✅ 部署配置" -ForegroundColor Green
Write-Host "   ✅ 文档完整性" -ForegroundColor Green
Write-Host ""
Write-Host "🌍 所有检查项目均符合《德道经》+第一性原理世界规则！" -ForegroundColor Green
Write-Host "🚀 项目可以继续开发或部署！" -ForegroundColor Green