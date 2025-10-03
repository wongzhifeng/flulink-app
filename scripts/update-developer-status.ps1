# 开发者状态更新脚本 (PowerShell版本)
# 用于更新当前开发状态，让其他开发者了解当前进度

param(
    [string]$TaskName = "",
    [string]$Status = "in-progress",
    [string]$Description = ""
)

# 获取当前时间
$currentTime = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"

Write-Host "🔄 更新开发者状态..." -ForegroundColor Green

# 读取当前状态文件
$statusFile = ".developer-status.json"
if (Test-Path $statusFile) {
    $currentStatus = Get-Content $statusFile | ConvertFrom-Json
} else {
    Write-Host "❌ 状态文件不存在: $statusFile" -ForegroundColor Red
    exit 1
}

# 更新状态
$currentStatus.currentDeveloper.lastActivity = $currentTime

if ($TaskName) {
    $currentStatus.currentDeveloper.currentTask = $TaskName
    $currentStatus.currentDeveloper.status = $Status
    
    Write-Host "✅ 更新任务: $TaskName" -ForegroundColor Green
    Write-Host "✅ 更新状态: $Status" -ForegroundColor Green
    
    if ($Description) {
        Write-Host "✅ 任务描述: $Description" -ForegroundColor Green
    }
} else {
    $currentStatus.currentDeveloper.currentTask = $null
    $currentStatus.currentDeveloper.status = "available"
    
    Write-Host "✅ 标记为可用状态" -ForegroundColor Green
}

# 保存更新后的状态
$currentStatus | ConvertTo-Json -Depth 10 | Out-File -FilePath $statusFile -Encoding UTF8

Write-Host ""
Write-Host "📊 当前状态:" -ForegroundColor Cyan
Write-Host "   开发者: $($currentStatus.currentDeveloper.name)" -ForegroundColor White
Write-Host "   状态: $($currentStatus.currentDeveloper.status)" -ForegroundColor White
Write-Host "   当前任务: $($currentStatus.currentDeveloper.currentTask)" -ForegroundColor White
Write-Host "   分支: $($currentStatus.currentDeveloper.workingBranch)" -ForegroundColor White
Write-Host "   最后活动: $($currentStatus.currentDeveloper.lastActivity)" -ForegroundColor White

Write-Host ""
Write-Host "🎯 下一步操作:" -ForegroundColor Cyan
Write-Host "   1. 提交状态更新: git add .developer-status.json" -ForegroundColor Yellow
Write-Host "   2. 提交更改: git commit -m 'chore: 更新开发者状态'" -ForegroundColor Yellow
Write-Host "   3. 推送到远程: git push origin main" -ForegroundColor Yellow

Write-Host ""
Write-Host "🌍 世界规则提醒:" -ForegroundColor Green
Write-Host "   - 回归本质: 专注社交核心功能" -ForegroundColor White
Write-Host "   - 遵循自然规律: 符合自然发展规律" -ForegroundColor White
Write-Host "   - 追求简约与平衡: 设计简约平衡" -ForegroundColor White
Write-Host "   - 敢作敢当的谦下精神: 敢于创新但保持谦逊" -ForegroundColor White
# 用于更新当前开发状态，让其他开发者了解当前进度

param(
    [string]$TaskName = "",
    [string]$Status = "in-progress",
    [string]$Description = ""
)

# 获取当前时间
$currentTime = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"

Write-Host "🔄 更新开发者状态..." -ForegroundColor Green

# 读取当前状态文件
$statusFile = ".developer-status.json"
if (Test-Path $statusFile) {
    $currentStatus = Get-Content $statusFile | ConvertFrom-Json
} else {
    Write-Host "❌ 状态文件不存在: $statusFile" -ForegroundColor Red
    exit 1
}

# 更新状态
$currentStatus.currentDeveloper.lastActivity = $currentTime

if ($TaskName) {
    $currentStatus.currentDeveloper.currentTask = $TaskName
    $currentStatus.currentDeveloper.status = $Status
    
    Write-Host "✅ 更新任务: $TaskName" -ForegroundColor Green
    Write-Host "✅ 更新状态: $Status" -ForegroundColor Green
    
    if ($Description) {
        Write-Host "✅ 任务描述: $Description" -ForegroundColor Green
    }
} else {
    $currentStatus.currentDeveloper.currentTask = $null
    $currentStatus.currentDeveloper.status = "available"
    
    Write-Host "✅ 标记为可用状态" -ForegroundColor Green
}

# 保存更新后的状态
$currentStatus | ConvertTo-Json -Depth 10 | Out-File -FilePath $statusFile -Encoding UTF8

Write-Host ""
Write-Host "📊 当前状态:" -ForegroundColor Cyan
Write-Host "   开发者: $($currentStatus.currentDeveloper.name)" -ForegroundColor White
Write-Host "   状态: $($currentStatus.currentDeveloper.status)" -ForegroundColor White
Write-Host "   当前任务: $($currentStatus.currentDeveloper.currentTask)" -ForegroundColor White
Write-Host "   分支: $($currentStatus.currentDeveloper.workingBranch)" -ForegroundColor White
Write-Host "   最后活动: $($currentStatus.currentDeveloper.lastActivity)" -ForegroundColor White

Write-Host ""
Write-Host "🎯 下一步操作:" -ForegroundColor Cyan
Write-Host "   1. 提交状态更新: git add .developer-status.json" -ForegroundColor Yellow
Write-Host "   2. 提交更改: git commit -m 'chore: 更新开发者状态'" -ForegroundColor Yellow
Write-Host "   3. 推送到远程: git push origin main" -ForegroundColor Yellow

Write-Host ""
Write-Host "🌍 世界规则提醒:" -ForegroundColor Green
Write-Host "   - 回归本质: 专注社交核心功能" -ForegroundColor White
Write-Host "   - 遵循自然规律: 符合自然发展规律" -ForegroundColor White
Write-Host "   - 追求简约与平衡: 设计简约平衡" -ForegroundColor White
Write-Host "   - 敢作敢当的谦下精神: 敢于创新但保持谦逊" -ForegroundColor White


