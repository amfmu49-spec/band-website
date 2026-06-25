# deploy_github.ps1
# GitHub Pages Deployment Script

$PSScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $PSScriptRoot

# 1. Check if git status has any changes
$status = git status --porcelain
if ([string]::IsNullOrEmpty($status)) {
    Write-Output "No changes to deploy."
    exit 0
}

# 2. Add all changes (HTML, config.js, CSS, assets) to stage
git add -A

# 3. Create a commit
$commitMsg = "Update content via admin panel [$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')]"
git commit -m $commitMsg

# 4. Push to remote origin
$pushResult = git push origin main 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Output "Successfully deployed to GitHub Pages!"
} else {
    Write-Error "Failed to push to GitHub: $pushResult"
    exit 1
}
