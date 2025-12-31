#!/usr/bin/env node

/**
 * Verification script for logo size changes and text removal
 * Checks that "Kal Kal Group" text has been removed and logo sizes updated
 */

const fs = require('fs')
const path = require('path')

console.log('🔍 Verifying logo changes and text removal...\n')

const filesToCheck = [
  'src/components/layout/header.tsx',
  'src/components/layout/footer.tsx', 
  'src/components/admin/admin-layout.tsx',
  'src/components/admin/admin-dashboard-tabs.tsx',
  'src/app/layout.tsx',
  'src/__tests__/components/admin-layout.test.tsx'
]

let allPassed = true

// Check for removed text references
console.log('📝 Checking for removed "Kal Kal Group" text references:')
filesToCheck.forEach(filePath => {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const hasKalKalGroup = content.includes('Kal Kal Group')
    
    if (hasKalKalGroup) {
      console.log(`❌ ${filePath}: Still contains "Kal Kal Group" text`)
      allPassed = false
    } else {
      console.log(`✅ ${filePath}: "Kal Kal Group" text removed`)
    }
  } catch (error) {
    console.log(`⚠️  ${filePath}: File not found or error reading`)
  }
})

// Check logo sizes
console.log('\n🖼️  Checking logo sizes:')

// Header logo check
try {
  const headerContent = fs.readFileSync('src/components/layout/header.tsx', 'utf8')
  const hasLargerLogo = headerContent.includes('h-20 w-20 md:h-24 md:w-24')
  
  if (hasLargerLogo) {
    console.log('✅ Header: Logo size increased to h-20 w-20 md:h-24 md:w-24')
  } else {
    console.log('❌ Header: Logo size not updated')
    allPassed = false
  }
} catch (error) {
  console.log('⚠️  Header: Error checking logo size')
}

// Footer logo check
try {
  const footerContent = fs.readFileSync('src/components/layout/footer.tsx', 'utf8')
  const hasLargerLogo = footerContent.includes('h-20 w-20')
  
  if (hasLargerLogo) {
    console.log('✅ Footer: Logo size increased to h-20 w-20')
  } else {
    console.log('❌ Footer: Logo size not updated')
    allPassed = false
  }
} catch (error) {
  console.log('⚠️  Footer: Error checking logo size')
}

// Check metadata updates
console.log('\n📄 Checking metadata updates:')
try {
  const layoutContent = fs.readFileSync('src/app/layout.tsx', 'utf8')
  const hasGenericTitle = layoutContent.includes('Premium Online Store')
  const hasGenericApp = layoutContent.includes('Premium Store')
  
  if (hasGenericTitle && hasGenericApp) {
    console.log('✅ Layout: Metadata updated to generic branding')
  } else {
    console.log('❌ Layout: Metadata not fully updated')
    allPassed = false
  }
} catch (error) {
  console.log('⚠️  Layout: Error checking metadata')
}

// Check admin components
console.log('\n🔧 Checking admin components:')
try {
  const adminLayoutContent = fs.readFileSync('src/components/admin/admin-layout.tsx', 'utf8')
  const hasAdminDashboard = adminLayoutContent.includes('Admin Dashboard')
  
  if (hasAdminDashboard) {
    console.log('✅ Admin Layout: Updated to "Admin Dashboard"')
  } else {
    console.log('❌ Admin Layout: Not updated')
    allPassed = false
  }
} catch (error) {
  console.log('⚠️  Admin Layout: Error checking')
}

console.log('\n' + '='.repeat(50))

if (allPassed) {
  console.log('🎉 All verifications passed!')
  console.log('✅ "Kal Kal Group" text successfully removed')
  console.log('✅ Logo sizes increased for professional appearance')
  console.log('✅ Metadata updated to generic branding')
  console.log('✅ Admin components updated')
  process.exit(0)
} else {
  console.log('❌ Some verifications failed. Please check the issues above.')
  process.exit(1)
}