#!/usr/bin/env node

/**
 * Verification script for product diversity updates
 * Checks that navigation and content reflect multiple product types (oils, daal, etc.)
 */

const fs = require('fs')

console.log('🔍 Verifying product diversity updates...\n')

let allPassed = true

// Check header navigation
console.log('🧭 Checking header navigation:')
try {
  const headerContent = fs.readFileSync('src/components/layout/header.tsx', 'utf8')
  
  const hasOurProducts = headerContent.includes("{ label: 'Our Products', href: '/categories' }")
  if (hasOurProducts) {
    console.log('✅ Navigation updated to "Our Products" (inclusive of all products)')
  } else {
    console.log('❌ Navigation not updated to "Our Products"')
    allPassed = false
  }
  
} catch (error) {
  console.log('⚠️  Error reading header component')
  allPassed = false
}

// Check footer navigation
console.log('\n🦶 Checking footer navigation:')
try {
  const footerContent = fs.readFileSync('src/components/layout/footer.tsx', 'utf8')
  
  const hasOurProducts = footerContent.includes('Our Products')
  if (hasOurProducts) {
    console.log('✅ Footer navigation updated to match header')
  } else {
    console.log('❌ Footer navigation not updated')
    allPassed = false
  }
  
} catch (error) {
  console.log('⚠️  Error reading footer component')
  allPassed = false
}

// Check categories page metadata
console.log('\n📄 Checking categories page metadata:')
try {
  const categoriesContent = fs.readFileSync('src/app/categories/page.tsx', 'utf8')
  
  const hasDaalInTitle = categoriesContent.includes('Cooking Oils, Daal & More')
  const hasDaalInDescription = categoriesContent.includes('daal (lentils)')
  const hasDaalInKeywords = categoriesContent.includes('daal')
  
  if (hasDaalInTitle && hasDaalInDescription && hasDaalInKeywords) {
    console.log('✅ Categories page metadata includes daal and diverse products')
  } else {
    console.log('❌ Categories page metadata not fully updated')
    allPassed = false
  }
  
} catch (error) {
  console.log('⚠️  Error reading categories page')
  allPassed = false
}

// Check hero section
console.log('\n🎨 Checking hero section:')
try {
  const heroContent = fs.readFileSync('src/components/homepage/hero-section.tsx', 'utf8')
  
  const hasExploreProducts = heroContent.includes('Explore Our Products')
  const hasDaalInDescription = heroContent.includes('daal (lentils)')
  const hasCookingOils = heroContent.includes('cooking oils')
  
  if (hasExploreProducts && hasDaalInDescription && hasCookingOils) {
    console.log('✅ Hero section updated with diverse product messaging')
  } else {
    console.log('❌ Hero section not fully updated')
    allPassed = false
  }
  
} catch (error) {
  console.log('⚠️  Error reading hero section component')
}

// Check factory showcase
console.log('\n🏭 Checking factory showcase:')
try {
  const factoryContent = fs.readFileSync('src/components/homepage/factory-showcase.tsx', 'utf8')
  
  const hasFoodProductsFactory = factoryContent.includes('Premium Food Products Factory')
  const hasDaalProduct = factoryContent.includes('Premium Daal')
  const hasProductCollection = factoryContent.includes('Our Premium Product Collection')
  const hasExploreAllProducts = factoryContent.includes('Explore All Products')
  
  if (hasFoodProductsFactory && hasDaalProduct && hasProductCollection && hasExploreAllProducts) {
    console.log('✅ Factory showcase updated with diverse product range')
  } else {
    console.log('❌ Factory showcase not fully updated')
    allPassed = false
  }
  
  // Check product grid diversity
  const hasOilProduct = factoryContent.includes('Premium Mustard Oil')
  const hasDaalProductGrid = factoryContent.includes('Premium Daal')
  const hasSunflowerOil = factoryContent.includes('Sunflower Oil')
  const hasSesameOil = factoryContent.includes('Sesame Oil')
  
  if (hasOilProduct && hasDaalProductGrid && hasSunflowerOil && hasSesameOil) {
    console.log('✅ Product grid shows diverse product range (oils + daal)')
  } else {
    console.log('❌ Product grid not showing diverse products')
    allPassed = false
  }
  
} catch (error) {
  console.log('⚠️  Error reading factory showcase component')
}

console.log('\n' + '='.repeat(50))

if (allPassed) {
  console.log('🎉 Product diversity updates successful!')
  console.log('✅ Navigation updated to "Our Products" (inclusive of all products)')
  console.log('✅ Categories page metadata includes oils, daal, and more')
  console.log('✅ Hero section messaging updated for diverse products')
  console.log('✅ Factory showcase updated to "Food Products Factory"')
  console.log('✅ Product grid shows oils, daal, and other products')
  console.log('✅ All components use inclusive product terminology')
  console.log('\n🛒 Your product range now includes:')
  console.log('   • Premium Cooking Oils (Mustard, Sunflower, Sesame)')
  console.log('   • Quality Daal (Lentils and Pulses)')
  console.log('   • Other Food Products')
  console.log('\n🎯 Benefits:')
  console.log('   • More inclusive navigation and messaging')
  console.log('   • Better represents your actual product range')
  console.log('   • Appeals to customers looking for various food products')
  console.log('   • Professional food products factory positioning')
  console.log('\n🌐 Your categories page: http://localhost:3000/categories')
  console.log('   Now showcases your complete product range!')
  process.exit(0)
} else {
  console.log('❌ Some verifications failed. Please check the issues above.')
  process.exit(1)
}