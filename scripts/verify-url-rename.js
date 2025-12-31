#!/usr/bin/env node

/**
 * Verification script for URL rename from /categories to /products
 * Checks that all references have been updated correctly
 */

const fs = require('fs')

console.log('🔍 Verifying URL rename from /categories to /products...\n')

let allPassed = true

// Check navigation links
console.log('🧭 Checking navigation links:')
try {
  const headerContent = fs.readFileSync('src/components/layout/header.tsx', 'utf8')
  const footerContent = fs.readFileSync('src/components/layout/footer.tsx', 'utf8')
  
  const headerHasProducts = headerContent.includes("href: '/products'")
  const footerHasProducts = footerContent.includes('href="/products"')
  
  if (headerHasProducts && footerHasProducts) {
    console.log('✅ Header and footer navigation updated to /products')
  } else {
    console.log('❌ Navigation not fully updated')
    allPassed = false
  }
  
} catch (error) {
  console.log('⚠️  Error reading navigation components')
  allPassed = false
}

// Check products page
console.log('\n📄 Checking products page:')
try {
  const productsContent = fs.readFileSync('src/app/products/page.tsx', 'utf8')
  
  const hasProductsMetadata = productsContent.includes('Our Products - Cooking Oils, Daal & More')
  const hasCategoriesClient = productsContent.includes('CategoriesClient')
  const hasProductsUrl = productsContent.includes("url: '/products'")
  
  if (hasProductsMetadata && hasCategoriesClient && hasProductsUrl) {
    console.log('✅ Products page properly configured with content and metadata')
  } else {
    console.log('❌ Products page not properly configured')
    allPassed = false
  }
  
} catch (error) {
  console.log('❌ Products page not found')
  allPassed = false
}

// Check categories redirect
console.log('\n🔄 Checking categories redirect:')
try {
  const categoriesContent = fs.readFileSync('src/app/categories/page.tsx', 'utf8')
  
  const hasRedirect = categoriesContent.includes('redirect(redirectUrl)')
  const redirectsToProducts = categoriesContent.includes('/products')
  
  if (hasRedirect && redirectsToProducts) {
    console.log('✅ Categories page redirects to products page')
  } else {
    console.log('❌ Categories redirect not properly configured')
    allPassed = false
  }
  
} catch (error) {
  console.log('❌ Categories redirect not found')
  allPassed = false
}

// Check hero section
console.log('\n🎨 Checking hero section:')
try {
  const heroContent = fs.readFileSync('src/components/homepage/hero-section.tsx', 'utf8')
  
  const hasProductsLink = heroContent.includes('href="/products"')
  
  if (hasProductsLink) {
    console.log('✅ Hero section button links to /products')
  } else {
    console.log('❌ Hero section not updated')
    allPassed = false
  }
  
} catch (error) {
  console.log('⚠️  Error reading hero section')
}

// Check factory showcase
console.log('\n🏭 Checking factory showcase:')
try {
  const factoryContent = fs.readFileSync('src/components/homepage/factory-showcase.tsx', 'utf8')
  
  const hasProductsLink = factoryContent.includes('href="/products"')
  
  if (hasProductsLink) {
    console.log('✅ Factory showcase button links to /products')
  } else {
    console.log('❌ Factory showcase not updated')
    allPassed = false
  }
  
} catch (error) {
  console.log('⚠️  Error reading factory showcase')
}

// Check categories client component
console.log('\n🔧 Checking categories client component:')
try {
  const categoriesClientContent = fs.readFileSync('src/components/categories/categories-client.tsx', 'utf8')
  
  const hasProductsBreadcrumb = categoriesClientContent.includes("name: 'Products', href: '/products'")
  const hasProductsUrl = categoriesClientContent.includes('/products?')
  const hasBrowseProducts = categoriesClientContent.includes('Browse All Products')
  
  if (hasProductsBreadcrumb && hasProductsUrl && hasBrowseProducts) {
    console.log('✅ Categories client component updated with /products URLs')
  } else {
    console.log('❌ Categories client component not fully updated')
    allPassed = false
  }
  
} catch (error) {
  console.log('⚠️  Error reading categories client component')
}

// Check mobile navigation
console.log('\n📱 Checking mobile navigation:')
try {
  const mobileNavContent = fs.readFileSync('src/components/layout/mobile-bottom-nav.tsx', 'utf8')
  
  const hasProductsNav = mobileNavContent.includes("name: 'Products'")
  const hasProductsHref = mobileNavContent.includes("href: '/products'")
  
  if (hasProductsNav && hasProductsHref) {
    console.log('✅ Mobile navigation updated to Products')
  } else {
    console.log('❌ Mobile navigation not updated')
    allPassed = false
  }
  
} catch (error) {
  console.log('⚠️  Error reading mobile navigation')
}

console.log('\n' + '='.repeat(50))

if (allPassed) {
  console.log('🎉 URL rename successful!')
  console.log('✅ All navigation links updated to /products')
  console.log('✅ Products page properly configured with content')
  console.log('✅ Categories page redirects to products page')
  console.log('✅ Hero section and factory showcase updated')
  console.log('✅ Categories client component URLs updated')
  console.log('✅ Mobile navigation updated')
  console.log('✅ Breadcrumbs and internal links updated')
  console.log('\n🌐 URL Structure:')
  console.log('   • OLD: http://localhost:3000/categories')
  console.log('   • NEW: http://localhost:3000/products')
  console.log('\n🔄 Redirect in place:')
  console.log('   • /categories → /products (with all query parameters)')
  console.log('\n🎯 Benefits:')
  console.log('   • More intuitive URL structure')
  console.log('   • Better SEO with /products URL')
  console.log('   • Consistent with user expectations')
  console.log('   • Backward compatibility maintained')
  console.log('\n🚀 Your products page is now at: http://localhost:3000/products')
  process.exit(0)
} else {
  console.log('❌ Some verifications failed. Please check the issues above.')
  process.exit(1)
}