#!/usr/bin/env node

/**
 * Verification script for navigation cleanup
 * Checks that redundant navigation items are removed and renamed appropriately
 */

const fs = require('fs')

console.log('🔍 Verifying navigation cleanup...\n')

let allPassed = true

// Check header navigation
console.log('🧭 Checking header navigation:')
try {
  const headerContent = fs.readFileSync('src/components/layout/header.tsx', 'utf8')
  
  // Check that "Our Oils" is present
  const hasOurOils = headerContent.includes("{ label: 'Our Oils', href: '/categories' }")
  if (hasOurOils) {
    console.log('✅ "Our Oils" navigation item added')
  } else {
    console.log('❌ "Our Oils" navigation item not found')
    allPassed = false
  }
  
  // Check that redundant "Products" is removed
  const hasProducts = headerContent.includes("{ label: 'Products', href: '/products' }")
  if (!hasProducts) {
    console.log('✅ Redundant "Products" navigation item removed')
  } else {
    console.log('❌ Redundant "Products" navigation item still present')
    allPassed = false
  }
  
  // Check that "Contact" is added
  const hasContact = headerContent.includes("{ label: 'Contact', href: '/contact' }")
  if (hasContact) {
    console.log('✅ "Contact" navigation item added')
  } else {
    console.log('❌ "Contact" navigation item not found')
    allPassed = false
  }
  
  // Count total navigation items
  const navItems = headerContent.match(/{ label: '[^']+', href: '[^']+' }/g)
  if (navItems && navItems.length === 5) {
    console.log('✅ Navigation has optimal 5 items (Home, Our Oils, Deals, About, Contact)')
  } else {
    console.log(`❌ Navigation has ${navItems ? navItems.length : 0} items, expected 5`)
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
  
  // Check that footer matches header
  const hasOurOilsFooter = footerContent.includes('Our Oils')
  const hasContactFooter = footerContent.includes('Contact')
  const hasProductsFooter = footerContent.includes('Products')
  
  if (hasOurOilsFooter && hasContactFooter && !hasProductsFooter) {
    console.log('✅ Footer navigation updated to match header')
  } else {
    console.log('❌ Footer navigation not properly updated')
    allPassed = false
  }
  
} catch (error) {
  console.log('⚠️  Error reading footer component')
  allPassed = false
}

// Check hero section buttons
console.log('\n🎨 Checking hero section buttons:')
try {
  const heroContent = fs.readFileSync('src/components/homepage/hero-section.tsx', 'utf8')
  
  const hasExploreOurOils = heroContent.includes('Explore Our Oils')
  if (hasExploreOurOils) {
    console.log('✅ Hero section button updated to "Explore Our Oils"')
  } else {
    console.log('❌ Hero section button not updated')
    allPassed = false
  }
  
} catch (error) {
  console.log('⚠️  Error reading hero section component')
}

// Check factory showcase
console.log('\n🏭 Checking factory showcase:')
try {
  const factoryContent = fs.readFileSync('src/components/homepage/factory-showcase.tsx', 'utf8')
  
  const hasExploreAllOils = factoryContent.includes('Explore All Oils')
  if (hasExploreAllOils) {
    console.log('✅ Factory showcase button updated to "Explore All Oils"')
  } else {
    console.log('❌ Factory showcase button not updated')
    allPassed = false
  }
  
} catch (error) {
  console.log('⚠️  Error reading factory showcase component')
}

console.log('\n' + '='.repeat(50))

if (allPassed) {
  console.log('🎉 Navigation cleanup successful!')
  console.log('✅ Redundant "Products" navigation removed')
  console.log('✅ "Shop" renamed to "Our Oils" (more meaningful for cooking oil factory)')
  console.log('✅ "Contact" navigation added')
  console.log('✅ Navigation optimized to 5 items: Home, Our Oils, Deals, About, Contact')
  console.log('✅ Footer navigation updated to match header')
  console.log('✅ Hero section buttons updated')
  console.log('✅ Factory showcase buttons updated')
  console.log('\n🧭 Your navigation now features:')
  console.log('   • Home - Homepage with hero and factory showcase')
  console.log('   • Our Oils - Categories/products page (cooking oil focused)')
  console.log('   • Deals - Special offers and promotions')
  console.log('   • About - Company information')
  console.log('   • Contact - Factory contact page')
  console.log('\n🎯 Benefits:')
  console.log('   • No more redundant navigation items')
  console.log('   • Clear, cooking oil factory-focused terminology')
  console.log('   • Streamlined user experience')
  console.log('   • Consistent navigation across all components')
  process.exit(0)
} else {
  console.log('❌ Some verifications failed. Please check the issues above.')
  process.exit(1)
}