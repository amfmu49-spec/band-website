# deploy_github.ps1
# GitHub Pages Deployment Script

$PSScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $PSScriptRoot

# Ensure Git is available
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error "Git command not found."
    exit 1
}

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
git push origin main
$success = ($LASTEXITCODE -eq 0)

if ($success) {
    Write-Output "Successfully deployed to GitHub Pages!"
    exit 0
} else {
    Write-Error "Failed to push to GitHub repository."
    exit 1
}
