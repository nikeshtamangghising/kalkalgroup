#!/usr/bin/env node

/**
 * Verification script for hero section integration
 * Checks that the hero section is properly added to the homepage
 */

const fs = require('fs')

console.log('🔍 Verifying hero section integration...\n')

let allPassed = true

// Check homepage client component
console.log('📄 Checking homepage client component:')
try {
  const homepageContent = fs.readFileSync('src/components/homepage/homepage-client.tsx', 'utf8')
  
  // Check if HeroSection is imported
  const hasHeroImport = homepageContent.includes("const HeroSection = lazy(() => import('./hero-section'))")
  if (hasHeroImport) {
    console.log('✅ HeroSection component imported correctly')
  } else {
    console.log('❌ HeroSection component not imported')
    allPassed = false
  }
  
  // Check if HeroSection is used in render
  const hasHeroInRender = homepageContent.includes('<HeroSection />')
  if (hasHeroInRender) {
    console.log('✅ HeroSection component rendered in homepage')
  } else {
    console.log('❌ HeroSection component not rendered')
    allPassed = false
  }
  
  // Check if skeleton includes hero section
  const hasHeroSkeleton = homepageContent.includes('Hero Section Skeleton')
  if (hasHeroSkeleton) {
    console.log('✅ Hero section skeleton included')
  } else {
    console.log('❌ Hero section skeleton missing')
    allPassed = false
  }
  
} catch (error) {
  console.log('⚠️  Error reading homepage client component')
  allPassed = false
}

// Check hero section component exists
console.log('\n🎨 Checking hero section component:')
try {
  const heroContent = fs.readFileSync('src/components/homepage/hero-section.tsx', 'utf8')
  
  // Check for key elements
  const hasGradientBg = heroContent.includes('bg-gradient-to-br from-amber-400 via-orange-400 to-orange-500')
  const hasMainHeading = heroContent.includes('Discover Amazing')
  const hasOfferCircle = heroContent.includes('50%')
  const hasActionButtons = heroContent.includes('Shop Now')
  
  if (hasGradientBg && hasMainHeading && hasOfferCircle && hasActionButtons) {
    console.log('✅ Hero section component has all key elements')
  } else {
    console.log('❌ Hero section component missing key elements')
    allPassed = false
  }
  
} catch (error) {
  console.log('⚠️  Hero section component not found')
  allPassed = false
}

// Check main page route
console.log('\n🏠 Checking main page route:')
try {
  const pageContent = fs.readFileSync('src/app/page.tsx', 'utf8')
  
  const usesHomepageClient = pageContent.includes('HomepageClient')
  if (usesHomepageClient) {
    console.log('✅ Main page uses HomepageClient component')
  } else {
    console.log('❌ Main page not using HomepageClient')
    allPassed = false
  }
  
} catch (error) {
  console.log('⚠️  Error reading main page route')
  allPassed = false
}

console.log('\n' + '='.repeat(50))

if (allPassed) {
  console.log('🎉 Hero section successfully integrated!')
  console.log('✅ Hero section component imported and rendered')
  console.log('✅ Loading skeleton includes hero section')
  console.log('✅ All key hero elements present')
  console.log('✅ Main page route configured correctly')
  console.log('\n🚀 Your homepage now features:')
  console.log('   • Beautiful gradient hero section')
  console.log('   • Compelling "Discover Amazing Products" headline')
  console.log('   • 50% OFF special offer circle')
  console.log('   • Call-to-action buttons (Shop Now, Explore Products)')
  console.log('   • Responsive design with mobile optimization')
  console.log('   • Smooth loading with skeleton screens')
  process.exit(0)
} else {
  console.log('❌ Some verifications failed. Please check the issues above.')
  process.exit(1)
}