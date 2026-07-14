param(
    [switch]$Force,
    [switch]$SkipGitPush,
    [string]$BackupDir = ".\backend\data\pre-deploy-backups"
)

$ErrorActionPreference = "Stop"

Write-Output "============================================"
Write-Output "  FIT TRAINING - PRE-DEPLOY BACKUP v2.0"
Write-Output "============================================"

# 1. Ensure backup directory exists
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
    Write-Output "[OK] Backup dir created: $BackupDir"
}

# 2. Check if production DB exists locally
$localDb = ".\backend\data\fittraining.db"
if (-not (Test-Path $localDb)) {
    Write-Output "[WARN] Local DB not found at $localDb"
}

# 3. Create timestamped backup of local DB
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupFile = Join-Path $BackupDir "fittraining-pre-deploy-$timestamp.db"
if (Test-Path $localDb) {
    Copy-Item $localDb $backupFile -Force
    Write-Output "[OK] Local DB backed up: $backupFile"
    
    # Show DB stats
    $size = (Get-Item $backupFile).Length
    Write-Output "[INFO] Backup size: $([math]::Round($size/1KB, 1)) KB"
} else {
    Write-Output "[SKIP] No local DB to backup"
}

# 4. Try to download backup from production API
$apiUrl = "https://app.enriquezmania.com/api/admin/backup/"
try {
    # Login as admin
    $loginBody = @{email='1717798274'; password='I5M]El'} | ConvertTo-Json
    $loginResp = Invoke-RestMethod -Uri 'https://app.enriquezmania.com/api/auth/login' -Method Post -ContentType 'application/json' -Body $loginBody -ErrorAction Stop
    $token = $loginResp.token
    
    # Download backup ZIP
    $headers = @{Authorization = "Bearer $token"}
    $prodBackup = Join-Path $BackupDir "fittraining-production-$timestamp.zip"
    Invoke-WebRequest -Uri $apiUrl -Headers $headers -OutFile $prodBackup -ErrorAction SilentlyContinue
    Write-Output "[OK] Production DB backed up: $prodBackup"
    $size = (Get-Item $prodBackup).Length
    Write-Output "[INFO] Production backup size: $([math]::Round($size/1KB, 1)) KB"
} catch {
    Write-Output "[WARN] Could not download production backup: $($_.Exception.Message)"
}

# 5. List all existing backups
$existingBackups = Get-ChildItem -Path $BackupDir -Filter "*.db" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending
if ($existingBackups) {
    Write-Output "`n=== EXISTING BACKUPS ==="
    $existingBackups | Select-Object -First 10 | ForEach-Object {
        $s = [math]::Round($_.Length/1KB, 1)
        Write-Output "  $($_.LastWriteTime.ToString('yyyy-MM-dd HH:mm'))  $($_.Name)  (${s} KB)"
    }
    Write-Output "  Total: $($existingBackups.Count) backups"
}

# 6. Keep only last 30 backups (cleanup old ones)
$allBackups = Get-ChildItem -Path $BackupDir -Include "*.db","*.zip" -Recurse | Sort-Object LastWriteTime -Descending
if ($allBackups.Count -gt 30) {
    $toDelete = $allBackups | Select-Object -Skip 30
    foreach ($f in $toDelete) {
        Remove-Item $f.FullName -Force
        Write-Output "[CLEANUP] Removed old backup: $($f.Name)"
    }
}

# 7. Check git status
Write-Output "`n=== GIT STATUS ==="
git status --short

Write-Output "`n============================================"
Write-Output "  PRE-DEPLOY BACKUP COMPLETE"
Write-Output "============================================"
Write-Output "Run 'git push' to deploy to Railway."
Write-Output "To skip git push, use: .\pre-deploy.ps1 -SkipGitPush"