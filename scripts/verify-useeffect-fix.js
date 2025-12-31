#!/usr/bin/env node

/**
 * Verification script for useEffect fix in admin products page
 * Checks that the useEffect has proper return values in all code paths
 */

const fs = require('fs');
const path = require('path');

function verifyUseEffectFix() {
  console.log('🔍 Verifying useEffect fix in admin products page...\n');
  
  const filePath = path.join(process.cwd(), 'src/app/admin/products/page.tsx');
  
  if (!fs.existsSync(filePath)) {
    console.error('❌ File not found:', filePath);
    process.exit(1);
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check for the specific useEffect patterns
  const checks = [
    {
      name: 'First useEffect (fetchCategories and URL params)',
      pattern: /useEffect\(\(\) => \{[\s\S]*?fetchCategories\(\)[\s\S]*?\}, \[searchParams\]\)/,
      description: 'Should handle fetchCategories and URL params without return value issues'
    },
    {
      name: 'Second useEffect (success message timer)',
      pattern: /useEffect\(\(\) => \{[\s\S]*?if \(successMessage\) \{[\s\S]*?return \(\) => clearTimeout\(timer\)[\s\S]*?\}[\s\S]*?return undefined[\s\S]*?\}, \[successMessage\]\)/,
      description: 'Should have proper return value in all code paths'
    },
    {
      name: 'Third useEffect (fetchProducts)',
      pattern: /useEffect\(\(\) => \{[\s\S]*?fetchProducts\(\)[\s\S]*?\}, \[currentPage, searchQuery, selectedCategory, showActiveOnly\]\)/,
      description: 'Should call fetchProducts with proper dependencies'
    }
  ];
  
  let allPassed = true;
  
  checks.forEach((check, index) => {
    const found = check.pattern.test(content);
    if (found) {
      console.log(`✅ ${check.name}: PASSED`);
      console.log(`   ${check.description}\n`);
    } else {
      console.log(`❌ ${check.name}: FAILED`);
      console.log(`   ${check.description}\n`);
      allPassed = false;
    }
  });
  
  // Additional check for the specific fix
  const hasReturnUndefined = content.includes('return undefined');
  if (hasReturnUndefined) {
    console.log('✅ Return undefined fix: PASSED');
    console.log('   useEffect properly returns undefined when no cleanup is needed\n');
  } else {
    console.log('❌ Return undefined fix: FAILED');
    console.log('   useEffect should return undefined in the else path\n');
    allPassed = false;
  }
  
  // Check that useEffects are properly separated
  const useEffectCount = (content.match(/useEffect\(/g) || []).length;
  if (useEffectCount >= 3) {
    console.log('✅ useEffect separation: PASSED');
    console.log(`   Found ${useEffectCount} useEffect hooks (expected at least 3)\n`);
  } else {
    console.log('❌ useEffect separation: FAILED');
    console.log(`   Found ${useEffectCount} useEffect hooks (expected at least 3)\n`);
    allPassed = false;
  }
  
  if (allPassed) {
    console.log('🎉 All useEffect fixes verified successfully!');
    console.log('✅ The "Not all code paths return a value" error should be resolved.');
    return true;
  } else {
    console.log('❌ Some useEffect issues remain. Please check the implementation.');
    return false;
  }
}

// Run verification
const success = verifyUseEffectFix();
process.exit(success ? 0 : 1);