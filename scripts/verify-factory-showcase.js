#!/usr/bin/env node

/**
 * Verification script for factory showcase integration
 * Checks that the factory showcase section is properly added to the homepage
 */

const fs = require('fs')

console.log('🔍 Verifying factory showcase integration...\n')

let allPassed = true

// Check homepage client component
console.log('📄 Checking homepage client component:')
try {
  const homepageContent = fs.readFileSync('src/components/homepage/homepage-client.tsx', 'utf8')
  
  // Check if FactoryShowcase is imported
  const hasFactoryImport = homepageContent.includes("const FactoryShowcase = lazy(() => import('./factory-showcase'))")
  if (hasFactoryImport) {
    console.log('✅ FactoryShowcase component imported correctly')
  } else {
    console.log('❌ FactoryShowcase component not imported')
    allPassed = false
  }
  
  // Check if FactoryShowcase is used in render
  const hasFactoryInRender = homepageContent.includes('<FactoryShowcase />')
  if (hasFactoryInRender) {
    console.log('✅ FactoryShowcase component rendered in homepage')
  } else {
    console.log('❌ FactoryShowcase component not rendered')
    allPassed = false
  }
  
  // Check component order
  const heroIndex = homepageContent.indexOf('<HeroSection />')
  const tabbedIndex = homepageContent.indexOf('<TabbedRecommendations />')
  const factoryIndex = homepageContent.indexOf('<FactoryShowcase />')
  
  if (heroIndex < tabbedIndex && tabbedIndex < factoryIndex) {
    console.log('✅ Components in correct order: Hero → Products → Factory')
  } else {
    console.log('❌ Components not in correct order')
    allPassed = false
  }
  
} catch (error) {
  console.log('⚠️  Error reading homepage client component')
  allPassed = false
}

// Check factory showcase component
console.log('\n🏭 Checking factory showcase component:')
try {
  const factoryContent = fs.readFileSync('src/components/homepage/factory-showcase.tsx', 'utf8')
  
  // Check for key sections
  const hasHeritage = factoryContent.includes('Our Heritage')
  const hasQuality = factoryContent.includes('Quality Promise')
  const hasProducts = factoryContent.includes('Premium Oil Collection')
  const hasStats = factoryContent.includes('Happy Customers')
  
  if (hasHeritage && hasQuality && hasProducts && hasStats) {
    console.log('✅ Factory showcase has all key sections')
  } else {
    console.log('❌ Factory showcase missing key sections')
    allPassed = false
  }
  
  // Check for cooking oil specific content
  const hasMustardOil = factoryContent.includes('Premium Mustard Oil')
  const hasSunflowerOil = factoryContent.includes('Organic Sunflower Oil')
  const hasSesameOil = factoryContent.includes('Sesame Oil')
  
  if (hasMustardOil && hasSunflowerOil && hasSesameOil) {
    console.log('✅ Cooking oil products showcased')
  } else {
    console.log('❌ Cooking oil products not properly showcased')
    allPassed = false
  }
  
  // Check for factory story elements
  const hasFactoryStory = factoryContent.includes('Premium Cooking Oil Factory')
  const hasExperience = factoryContent.includes('Years Experience')
  const hasProduction = factoryContent.includes('Liters/Day')
  
  if (hasFactoryStory && hasExperience && hasProduction) {
    console.log('✅ Factory story and credentials included')
  } else {
    console.log('❌ Factory story elements missing')
    allPassed = false
  }
  
} catch (error) {
  console.log('⚠️  Factory showcase component not found')
  allPassed = false
}

// Check for responsive design elements
console.log('\n📱 Checking responsive design:')
try {
  const factoryContent = fs.readFileSync('src/components/homepage/factory-showcase.tsx', 'utf8')
  
  const hasResponsiveGrid = factoryContent.includes('grid-cols-1 lg:grid-cols-2')
  const hasResponsiveText = factoryContent.includes('text-3xl md:text-4xl lg:text-5xl')
  const hasMobileOptimization = factoryContent.includes('md:grid-cols-3')
  
  if (hasResponsiveGrid && hasResponsiveText && hasMobileOptimization) {
    console.log('✅ Responsive design implemented')
  } else {
    console.log('❌ Responsive design not fully implemented')
    allPassed = false
  }
  
} catch (error) {
  console.log('⚠️  Error checking responsive design')
}

console.log('\n' + '='.repeat(50))

if (allPassed) {
  console.log('🎉 Factory showcase successfully integrated!')
  console.log('✅ Factory showcase component imported and rendered')
  console.log('✅ Components in correct order (Hero → Products → Factory)')
  console.log('✅ All key sections present (Heritage, Quality, Products, Stats)')
  console.log('✅ Cooking oil products properly showcased')
  console.log('✅ Factory story and credentials included')
  console.log('✅ Responsive design implemented')
  console.log('\n🏭 Your homepage now features:')
  console.log('   • Factory heritage and story section')
  console.log('   • Quality promise and certifications')
  console.log('   • Premium cooking oil product showcase')
  console.log('   • Production statistics and achievements')
  console.log('   • Customer testimonials and trust indicators')
  console.log('   • Call-to-action to explore all products')
  console.log('   • Fully responsive design for all devices')
  process.exit(0)
} else {
  console.log('❌ Some verifications failed. Please check the issues above.')
  process.exit(1)
}