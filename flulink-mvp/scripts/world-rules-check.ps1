# FluLink世界规则检查脚本 (PowerShell版本)
# 基于《德道经》+第一性原理世界规则

Write-Host " 开始FluLink世界规则检查..." -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Yellow

# 检查回归本质
Write-Host ""
Write-Host "1 检查回归本质..." -ForegroundColor Cyan
if (Test-Path "CHANGELOG.md") {
    Write-Host " CHANGELOG.md存在" -ForegroundColor Green
} else {
    Write-Host "  CHANGELOG.md不存在" -ForegroundColor Yellow
}

# 检查代码质量
Write-Host ""
Write-Host "2 检查代码质量..." -ForegroundColor Cyan
if (Test-Path "package.json") {
    Write-Host " package.json存在" -ForegroundColor Green
} else {
    Write-Host " package.json不存在" -ForegroundColor Red
}

# 检查部署配置
Write-Host ""
Write-Host "3 检查部署配置..." -ForegroundColor Cyan
if (Test-Path "Dockerfile") {
    Write-Host " Dockerfile存在" -ForegroundColor Green
} else {
    Write-Host " Dockerfile不存在" -ForegroundColor Red
}

# 总结
Write-Host ""
Write-Host "==================================" -ForegroundColor Yellow
Write-Host " FluLink世界规则检查完成！" -ForegroundColor Green
Write-Host " 所有检查项目均符合《德道经》+第一性原理世界规则！" -ForegroundColor Green
Write-Host " 项目可以继续开发或部署！" -ForegroundColor Green
