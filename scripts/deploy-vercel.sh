#!/bin/bash

# Kalkal Group - Vercel Deployment Script
echo "🚀 Starting Kalkal Group deployment to Vercel..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Pre-deployment checks
echo "🔍 Running pre-deployment checks..."

# Check TypeScript
echo "  ✓ Checking TypeScript..."
npm run type:check
if [ $? -ne 0 ]; then
    echo "❌ TypeScript check failed. Please fix errors before deploying."
    exit 1
fi

# Check if build works
echo "  ✓ Testing build..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix build errors before deploying."
    exit 1
fi

# Clean up build artifacts
rm -rf .next

echo "✅ Pre-deployment checks passed!"

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Your application is now live on Vercel"
    echo ""
    echo "📋 Post-deployment checklist:"
    echo "  1. Verify environment variables are set correctly"
    echo "  2. Test database connectivity"
    echo "  3. Check admin panel functionality"
    echo "  4. Verify image uploads work"
    echo "  5. Test payment integration (if applicable)"
    echo ""
    echo "📊 Monitor your deployment:"
    echo "  - Vercel Dashboard: https://vercel.com/dashboard"
    echo "  - Function logs: vercel logs --follow"
    echo "  - Health check: https://your-domain.vercel.app/api/health"
else
    echo "❌ Deployment failed. Check the error messages above."
    exit 1
fi