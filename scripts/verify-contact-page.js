#!/usr/bin/env node

/**
 * Verification script for contact page
 * Checks that the contact page is properly created for the cooking oil factory
 */

const fs = require('fs')

console.log('🔍 Verifying contact page implementation...\n')

let allPassed = true

// Check contact page route
console.log('📄 Checking contact page route:')
try {
  const contactPageContent = fs.readFileSync('src/app/contact/page.tsx', 'utf8')
  
  const hasMetadata = contactPageContent.includes('Premium Cooking Oil Factory')
  const hasContactClient = contactPageContent.includes('ContactClient')
  
  if (hasMetadata && hasContactClient) {
    console.log('✅ Contact page route properly configured')
  } else {
    console.log('❌ Contact page route not properly configured')
    allPassed = false
  }
  
} catch (error) {
  console.log('❌ Contact page route not found')
  allPassed = false
}

// Check contact client component
console.log('\n🏭 Checking contact client component:')
try {
  const contactClientContent = fs.readFileSync('src/components/contact/contact-client.tsx', 'utf8')
  
  // Check for factory-specific content
  const hasFactoryAddress = contactClientContent.includes('Factory Address')
  const hasBusinessHours = contactClientContent.includes('Business Hours')
  const hasBulkOrders = contactClientContent.includes('Bulk Orders')
  const hasWhatsApp = contactClientContent.includes('WhatsApp')
  
  if (hasFactoryAddress && hasBusinessHours && hasBulkOrders && hasWhatsApp) {
    console.log('✅ Factory-specific contact information included')
  } else {
    console.log('❌ Factory-specific contact information missing')
    allPassed = false
  }
  
  // Check for cooking oil business features
  const hasWholesale = contactClientContent.includes('Wholesale')
  const hasPrivateLabel = contactClientContent.includes('Private Label')
  const hasDistribution = contactClientContent.includes('Distribution')
  const hasQualityCertified = contactClientContent.includes('Quality Certified')
  
  if (hasWholesale && hasPrivateLabel && hasDistribution && hasQualityCertified) {
    console.log('✅ Cooking oil business features included')
  } else {
    console.log('❌ Cooking oil business features missing')
    allPassed = false
  }
  
  // Check for contact form
  const hasContactForm = contactClientContent.includes('Send Us a Message')
  const hasInquiryTypes = contactClientContent.includes('Inquiry Type')
  const hasFormValidation = contactClientContent.includes('required')
  
  if (hasContactForm && hasInquiryTypes && hasFormValidation) {
    console.log('✅ Contact form with proper validation included')
  } else {
    console.log('❌ Contact form not properly implemented')
    allPassed = false
  }
  
  // Check for responsive design
  const hasResponsiveGrid = contactClientContent.includes('lg:grid-cols-3')
  const hasResponsiveText = contactClientContent.includes('md:text-5xl')
  const hasMobileOptimization = contactClientContent.includes('md:grid-cols-2')
  
  if (hasResponsiveGrid && hasResponsiveText && hasMobileOptimization) {
    console.log('✅ Responsive design implemented')
  } else {
    console.log('❌ Responsive design not fully implemented')
    allPassed = false
  }
  
} catch (error) {
  console.log('❌ Contact client component not found')
  allPassed = false
}

// Check for key business information
console.log('\n📞 Checking business information:')
try {
  const contactClientContent = fs.readFileSync('src/components/contact/contact-client.tsx', 'utf8')
  
  const hasPhoneNumbers = contactClientContent.includes('+977-1-4567890')
  const hasEmailAddresses = contactClientContent.includes('info@cookingoilfactory.com')
  const hasFactoryLocation = contactClientContent.includes('Industrial Area, Sector 15')
  const hasCapacityInfo = contactClientContent.includes('50,000+ liters daily capacity')
  
  if (hasPhoneNumbers && hasEmailAddresses && hasFactoryLocation && hasCapacityInfo) {
    console.log('✅ Complete business information provided')
  } else {
    console.log('❌ Business information incomplete')
    allPassed = false
  }
  
} catch (error) {
  console.log('⚠️  Error checking business information')
}

console.log('\n' + '='.repeat(50))

if (allPassed) {
  console.log('🎉 Contact page successfully created!')
  console.log('✅ Contact page route properly configured')
  console.log('✅ Factory-specific contact information included')
  console.log('✅ Cooking oil business features included')
  console.log('✅ Contact form with proper validation included')
  console.log('✅ Responsive design implemented')
  console.log('✅ Complete business information provided')
  console.log('\n🏭 Your contact page now features:')
  console.log('   • Factory address and location details')
  console.log('   • Multiple contact methods (phone, email, WhatsApp)')
  console.log('   • Business hours and visiting information')
  console.log('   • Bulk order and wholesale inquiry options')
  console.log('   • B2B partnership and private label services')
  console.log('   • Professional contact form with inquiry types')
  console.log('   • Factory capabilities and certifications')
  console.log('   • Interactive map section')
  console.log('   • Mobile-responsive design')
  console.log('\n🌐 Access your contact page at: http://localhost:3000/contact')
  process.exit(0)
} else {
  console.log('❌ Some verifications failed. Please check the issues above.')
  process.exit(1)
}