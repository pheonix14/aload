# ALoad - Download yt-dlp ARM64 binary
# Author: phoenix14

$yt_dlp_url = "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux_aarch64"
$dest = ".\android\app\src\main\assets\yt-dlp"

Write-Host "[yt-dlp] Downloading ARM64 binary..." -ForegroundColor Cyan

try {
    $assets_dir = ".\android\app\src\main\assets"
    if (-not (Test-Path $assets_dir)) {
        New-Item -ItemType Directory -Force -Path $assets_dir | Out-Null
    }
    
    $wc = New-Object System.Net.WebClient
    $wc.DownloadFile($yt_dlp_url, $dest)
    
    $size = (Get-Item $dest).Length
    Write-Host "[yt-dlp] Downloaded: $([math]::Round($size/1MB, 1)) MB" -ForegroundColor Green
    Write-Host "[yt-dlp] Saved to: $dest" -ForegroundColor Green
} catch {
    Write-Host "[yt-dlp] ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "[yt-dlp] You can manually download from:" -ForegroundColor Yellow
    Write-Host "         https://github.com/yt-dlp/yt-dlp/releases/latest" -ForegroundColor Yellow
    exit 1
}

Write-Host "[yt-dlp] Ready for bundling!" -ForegroundColor Green
