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
$entryPoint = "./.output/server/index.mjs"
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

# Copy migrations for bundling (must happen before cargo build, as Tauri's
# build.rs validates all resource paths exist at compile time)
Write-Host "Copying migrations..." -ForegroundColor Yellow
$migrationsDir = Join-Path $OutputDir "assets\migrations"
if (-not (Test-Path $migrationsDir)) {
    New-Item -ItemType Directory -Path $migrationsDir -Force | Out-Null
}
Copy-Item -Path "app\drizzle\*" -Destination $migrationsDir -Recurse -Force
Write-Host "Migrations copied to: $migrationsDir" -ForegroundColor Green

# Copy client assets for SSR hydration
Write-Host "Copying client assets..." -ForegroundColor Yellow
$distDir = Join-Path $OutputDir "dist"
if (-not (Test-Path $distDir)) {
    New-Item -ItemType Directory -Path $distDir -Force | Out-Null
}
Copy-Item -Path ".output\public" -Destination (Join-Path $distDir "client") -Recurse -Force
Write-Host "Client assets copied to: $(Join-Path $distDir 'client')" -ForegroundColor Green

# Build the Windows Service binary
Write-Host "Building Windows Service binary..." -ForegroundColor Yellow
$serviceOutput = Join-Path $OutputDir "zerobyte-service-x86_64-pc-windows-msvc.exe"

# Create placeholder so Tauri's build.rs validation passes during cargo build
if (-not (Test-Path $serviceOutput)) {
    New-Item -ItemType File -Path $serviceOutput -Force | Out-Null
}

& cargo build --release --bin zerobyte-service --manifest-path src-tauri/Cargo.toml

if ($LASTEXITCODE -ne 0) {
    Write-Host "Service binary compilation failed!" -ForegroundColor Red
    exit 1
}

$serviceSource = "src-tauri/target/release/zerobyte-service.exe"
if (Test-Path $serviceSource) {
    Copy-Item -Path $serviceSource -Destination $serviceOutput -Force
    $serviceInfo = Get-Item $serviceOutput
    Write-Host "Service binary compiled successfully!" -ForegroundColor Green
    Write-Host "Output: $serviceOutput" -ForegroundColor Gray
    Write-Host "Size: $([math]::Round($serviceInfo.Length / 1MB, 2)) MB" -ForegroundColor Gray
} else {
    Write-Host "Error: Service binary not found at $serviceSource" -ForegroundColor Red
    exit 1
}

Write-Host "Done!" -ForegroundColor Green
