# Kalkal Group - Vercel Deployment Script (PowerShell)
Write-Host "🚀 Starting Kalkal Group deployment to Vercel..." -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

# Check if Vercel CLI is installed
try {
    vercel --version | Out-Null
} catch {
    Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

# Pre-deployment checks
Write-Host "🔍 Running pre-deployment checks..." -ForegroundColor Blue

# Check TypeScript
Write-Host "  ✓ Checking TypeScript..." -ForegroundColor Cyan
npm run type:check
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ TypeScript check failed. Please fix errors before deploying." -ForegroundColor Red
    exit 1
}

# Check if build works
Write-Host "  ✓ Testing build..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed. Please fix build errors before deploying." -ForegroundColor Red
    exit 1
}

# Clean up build artifacts
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
}

Write-Host "✅ Pre-deployment checks passed!" -ForegroundColor Green

# Deploy to Vercel
Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Green
vercel --prod

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host "🌐 Your application is now live on Vercel" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Post-deployment checklist:" -ForegroundColor Yellow
    Write-Host "  1. Verify environment variables are set correctly"
    Write-Host "  2. Test database connectivity"
    Write-Host "  3. Check admin panel functionality"
    Write-Host "  4. Verify image uploads work"
    Write-Host "  5. Test payment integration (if applicable)"
    Write-Host ""
    Write-Host "📊 Monitor your deployment:" -ForegroundColor Cyan
    Write-Host "  - Vercel Dashboard: https://vercel.com/dashboard"
    Write-Host "  - Function logs: vercel logs --follow"
    Write-Host "  - Health check: https://your-domain.vercel.app/api/health"
} else {
    Write-Host "❌ Deployment failed. Check the error messages above." -ForegroundColor Red
    exit 1
}