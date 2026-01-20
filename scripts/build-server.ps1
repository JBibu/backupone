# Build Zerobyte Server for Windows
# This script compiles the Bun server into a standalone Windows executable

param(
    [string]$OutputDir = "src-tauri/binaries",
    [switch]$Debug
)

$ErrorActionPreference = "Stop"

Write-Host "Building Zerobyte Server for Windows..." -ForegroundColor Cyan

# Ensure the output directory exists
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

# First, build the TypeScript project
Write-Host "Building TypeScript project..." -ForegroundColor Yellow
bun run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "TypeScript build failed!" -ForegroundColor Red
    exit 1
}

# Compile the server to a standalone executable
Write-Host "Compiling server to standalone executable..." -ForegroundColor Yellow

$target = "bun-windows-x64"
$entryPoint = "./dist/server/index.js"
$outputFile = Join-Path $OutputDir "zerobyte-server-x86_64-pc-windows-msvc.exe"

$bunArgs = @(
    "build",
    "--compile",
    "--target=$target",
    $entryPoint,
    "--outfile=$outputFile"
)

if (-not $Debug) {
    $bunArgs += "--minify"
}

Write-Host "Running: bun $($bunArgs -join ' ')" -ForegroundColor Gray
& bun $bunArgs

if ($LASTEXITCODE -ne 0) {
    Write-Host "Server compilation failed!" -ForegroundColor Red
    exit 1
}

# Verify the output file exists
if (Test-Path $outputFile) {
    $fileInfo = Get-Item $outputFile
    Write-Host "Server compiled successfully!" -ForegroundColor Green
    Write-Host "Output: $outputFile" -ForegroundColor Gray
    Write-Host "Size: $([math]::Round($fileInfo.Length / 1MB, 2)) MB" -ForegroundColor Gray
} else {
    Write-Host "Error: Output file not found at $outputFile" -ForegroundColor Red
    exit 1
}

Write-Host "Done!" -ForegroundColor Green
