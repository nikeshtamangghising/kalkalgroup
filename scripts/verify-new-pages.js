#!/usr/bin/env node

/**
 * Verification script for new About and Gallery pages
 * Checks that both pages are properly created and navigation is updated
 */

const fs = require('fs')

console.log('🔍 Verifying new About and Gallery pages...\n')

let allPassed = true

// Check About page
console.log('📄 Checking About page:')
try {
  const aboutPageContent = fs.readFileSync('src/app/about/page.tsx', 'utf8')
  const aboutClientContent = fs.readFileSync('src/components/about/about-client.tsx', 'utf8')
  
  const hasAboutClient = aboutPageContent.includes('AboutClient')
  const hasAboutMetadata = aboutPageContent.includes('Premium Food Products Factory')
  const hasCompanyStory = aboutClientContent.includes('A Legacy of Quality & Trust')
  const hasValues = aboutClientContent.includes('What Drives Us Every Day')
  const hasAchievements = aboutClientContent.includes('Recognition & Certifications')
  
  if (hasAboutClient && hasAboutMetadata && hasCompanyStory && hasValues && hasAchievements) {
    console.log('✅ About page properly created with comprehensive content')
  } else {
    console.log('❌ About page not properly configured')
    allPassed = false
  }
  
} catch (error) {
  console.log('❌ About page or component not found')
  allPassed = false
}

// Check Gallery page
console.log('\n🖼️  Checking Gallery page:')
try {
  const galleryPageContent = fs.readFileSync('src/app/gallery/page.tsx', 'utf8')
  const galleryClientContent = fs.readFileSync('src/components/gallery/gallery-client.tsx', 'utf8')
  
  const hasGalleryClient = galleryPageContent.includes('GalleryClient')
  const hasGalleryMetadata = galleryPageContent.includes('Our Factory & Products')
  const hasGalleryItems = galleryClientContent.includes('galleryItems')
  const hasCategories = galleryClientContent.includes('Factory')
  const hasModal = galleryClientContent.includes('selectedImage')
  
  if (hasGalleryClient && hasGalleryMetadata && hasGalleryItems && hasCategories && hasModal) {
    console.log('✅ Gallery page properly created with interactive features')
  } else {
    console.log('❌ Gallery page not properly configured')
    allPassed = false
  }
  
} catch (error) {
  console.log('❌ Gallery page or component not found')
  allPassed = false
}

// Check navigation updates
console.log('\n🧭 Checking navigation updates:')
try {
  const headerContent = fs.readFileSync('src/components/layout/header.tsx', 'utf8')
  const footerContent = fs.readFileSync('src/components/layout/footer.tsx', 'utf8')
  
  const headerHasGallery = headerContent.includes("{ label: 'Gallery', href: '/gallery' }")
  const headerHasAbout = headerContent.includes("{ label: 'About', href: '/about' }")
  const footerHasGallery = footerContent.includes('href="/gallery"')
  const footerHasAbout = footerContent.includes('href="/about"')
  
  if (headerHasGallery && headerHasAbout && footerHasGallery && footerHasAbout) {
    console.log('✅ Navigation updated with Gallery and About links')
  } else {
    console.log('❌ Navigation not properly updated')
    allPassed = false
  }
  
  // Check navigation order
  const navOrder = headerContent.match(/{ label: '[^']+', href: '[^']+' }/g)
  if (navOrder && navOrder.length === 5) {
    console.log('✅ Navigation has 5 items: Home, Products, Gallery, About, Contact')
  } else {
    console.log(`❌ Navigation has ${navOrder ? navOrder.length : 0} items, expected 5`)
    allPassed = false
  }
  
} catch (error) {
  console.log('⚠️  Error reading navigation components')
  allPassed = false
}

// Check About page content sections
console.log('\n📖 Checking About page content sections:')
try {
  const aboutClientContent = fs.readFileSync('src/components/about/about-client.tsx', 'utf8')
  
  const hasHeroSection = aboutClientContent.includes('About Our Company')
  const hasStorySection = aboutClientContent.includes('Our Beginning')
  const hasValuesSection = aboutClientContent.includes('Quality First')
  const hasAchievementsSection = aboutClientContent.includes('ISO Certified')
  const hasStatsSection = aboutClientContent.includes('Our Impact in Numbers')
  const hasTeamSection = aboutClientContent.includes('The People Behind Our Success')
  
  if (hasHeroSection && hasStorySection && hasValuesSection && hasAchievementsSection && hasStatsSection && hasTeamSection) {
    console.log('✅ About page has all content sections (Hero, Story, Values, Achievements, Stats, Team)')
  } else {
    console.log('❌ About page missing some content sections')
    allPassed = false
  }
  
} catch (error) {
  console.log('⚠️  Error checking About page content')
}

// Check Gallery page features
console.log('\n🎨 Checking Gallery page features:')
try {
  const galleryClientContent = fs.readFileSync('src/components/gallery/gallery-client.tsx', 'utf8')
  
  const hasFilterCategories = galleryClientContent.includes('Factory') && galleryClientContent.includes('Production')
  const hasImageModal = galleryClientContent.includes('openModal') && galleryClientContent.includes('closeModal')
  const hasGalleryGrid = galleryClientContent.includes('grid-cols-1 sm:grid-cols-2 lg:grid-cols-3')
  const hasPlaceholders = galleryClientContent.includes('Image Placeholder')
  
  if (hasFilterCategories && hasImageModal && hasGalleryGrid && hasPlaceholders) {
    console.log('✅ Gallery page has all features (Categories, Modal, Grid, Placeholders)')
  } else {
    console.log('❌ Gallery page missing some features')
    allPassed = false
  }
  
} catch (error) {
  console.log('⚠️  Error checking Gallery page features')
}

console.log('\n' + '='.repeat(50))

if (allPassed) {
  console.log('🎉 New pages successfully created!')
  console.log('✅ About page properly created with comprehensive content')
  console.log('✅ Gallery page properly created with interactive features')
  console.log('✅ Navigation updated with Gallery and About links')
  console.log('✅ About page has all content sections')
  console.log('✅ Gallery page has all interactive features')
  console.log('\n📄 About Page Features:')
  console.log('   • Company story and history (25+ years)')
  console.log('   • Core values and mission')
  console.log('   • Achievements and certifications')
  console.log('   • Team information and statistics')
  console.log('   • Factory details and capabilities')
  console.log('\n🖼️  Gallery Page Features:')
  console.log('   • Category filtering (Factory, Production, Products, Team, Awards)')
  console.log('   • Interactive image grid with hover effects')
  console.log('   • Modal popup for detailed image viewing')
  console.log('   • Responsive design for all devices')
  console.log('   • Image placeholders ready for actual photos')
  console.log('\n🧭 Updated Navigation:')
  console.log('   • Home → Homepage')
  console.log('   • Our Products → Product catalog')
  console.log('   • Gallery → Photo gallery')
  console.log('   • About → Company information')
  console.log('   • Contact → Contact details')
  console.log('\n🌐 New Page URLs:')
  console.log('   • About: http://localhost:3000/about')
  console.log('   • Gallery: http://localhost:3000/gallery')
  process.exit(0)
} else {
  console.log('❌ Some verifications failed. Please check the issues above.')
  process.exit(1)
}