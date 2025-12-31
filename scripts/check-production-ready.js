#!/usr/bin/env node

/**
 * Production Readiness Check for Kalkal Group
 * Verifies all requirements are met before deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking production readiness for Kalkal Group...\n');

const checks = [];
let allPassed = true;

// Check 1: Required files exist
const requiredFiles = [
  'package.json',
  'next.config.js',
  'vercel.json',
  '.env.example',
  'src/app/layout.tsx',
  'src/lib/db.ts',
  'src/lib/db/schema.ts'
];

requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  checks.push({
    name: `Required file: ${file}`,
    passed: exists,
    message: exists ? '✅ Found' : '❌ Missing'
  });
  if (!exists) allPassed = false;
});

// Check 2: Package.json configuration
try {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  const hasRequiredScripts = ['build', 'start', 'dev'].every(script => pkg.scripts[script]);
  checks.push({
    name: 'Package.json scripts',
    passed: hasRequiredScripts,
    message: hasRequiredScripts ? '✅ All required scripts present' : '❌ Missing required scripts'
  });
  if (!hasRequiredScripts) allPassed = false;

  const hasRequiredDeps = [
    'next',
    'react',
    'react-dom',
    'drizzle-orm',
    'postgres'
  ].every(dep => pkg.dependencies[dep]);
  
  checks.push({
    name: 'Required dependencies',
    passed: hasRequiredDeps,
    message: hasRequiredDeps ? '✅ All core dependencies present' : '❌ Missing core dependencies'
  });
  if (!hasRequiredDeps) allPassed = false;

} catch (error) {
  checks.push({
    name: 'Package.json validation',
    passed: false,
    message: '❌ Invalid package.json'
  });
  allPassed = false;
}

// Check 3: Next.js configuration
try {
  const nextConfig = fs.readFileSync('next.config.js', 'utf8');
  const hasImageConfig = nextConfig.includes('images:');
  const hasTypeScriptConfig = nextConfig.includes('typescript:');
  
  checks.push({
    name: 'Next.js configuration',
    passed: hasImageConfig && hasTypeScriptConfig,
    message: (hasImageConfig && hasTypeScriptConfig) ? '✅ Properly configured' : '⚠️ Missing some configurations'
  });
} catch (error) {
  checks.push({
    name: 'Next.js configuration',
    passed: false,
    message: '❌ Invalid next.config.js'
  });
  allPassed = false;
}

// Check 4: Vercel configuration
try {
  const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  const hasFramework = vercelConfig.framework === 'nextjs';
  const hasFunctions = vercelConfig.functions;
  
  checks.push({
    name: 'Vercel configuration',
    passed: hasFramework,
    message: hasFramework ? '✅ Properly configured for Next.js' : '❌ Framework not set to Next.js'
  });
  if (!hasFramework) allPassed = false;
} catch (error) {
  checks.push({
    name: 'Vercel configuration',
    passed: false,
    message: '❌ Invalid vercel.json'
  });
  allPassed = false;
}

// Check 5: Environment variables template
try {
  const envExample = fs.readFileSync('.env.example', 'utf8');
  const hasDbUrl = envExample.includes('DATABASE_URL');
  const hasNextAuth = envExample.includes('NEXTAUTH_SECRET');
  const hasSupabase = envExample.includes('NEXT_PUBLIC_SUPABASE_URL');
  
  checks.push({
    name: 'Environment variables template',
    passed: hasDbUrl && hasNextAuth && hasSupabase,
    message: (hasDbUrl && hasNextAuth && hasSupabase) ? '✅ All required env vars documented' : '⚠️ Some env vars missing from template'
  });
} catch (error) {
  checks.push({
    name: 'Environment variables template',
    passed: false,
    message: '❌ .env.example not found or invalid'
  });
}

// Check 6: Database schema
try {
  const schemaContent = fs.readFileSync('src/lib/db/schema.ts', 'utf8');
  const hasCategories = schemaContent.includes('categories');
  const hasProducts = schemaContent.includes('products');
  const hasUsers = schemaContent.includes('users');
  
  checks.push({
    name: 'Database schema',
    passed: hasCategories && hasProducts && hasUsers,
    message: (hasCategories && hasProducts && hasUsers) ? '✅ Core tables defined' : '⚠️ Some core tables missing'
  });
} catch (error) {
  checks.push({
    name: 'Database schema',
    passed: false,
    message: '❌ Schema file not found or invalid'
  });
}

// Check 7: API routes structure
const apiRoutes = [
  'src/app/api/categories/route.ts',
  'src/app/api/products/route.ts',
  'src/app/api/auth/[...nextauth]/route.ts'
];

const apiRoutesExist = apiRoutes.filter(route => fs.existsSync(route)).length;
checks.push({
  name: 'API routes',
  passed: apiRoutesExist >= 2,
  message: `${apiRoutesExist >= 2 ? '✅' : '⚠️'} ${apiRoutesExist}/${apiRoutes.length} core API routes found`
});

// Display results
console.log('📋 Production Readiness Report:\n');
checks.forEach(check => {
  console.log(`${check.message} ${check.name}`);
});

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('🎉 All critical checks passed! Your project is ready for deployment.');
  console.log('\n📝 Next steps:');
  console.log('1. Set up environment variables in Vercel dashboard');
  console.log('2. Run: npm run deploy:script');
  console.log('3. Test the deployed application');
  console.log('4. Configure custom domain (optional)');
} else {
  console.log('⚠️  Some issues need to be addressed before deployment.');
  console.log('\n🔧 Please fix the failed checks above and run this script again.');
  process.exit(1);
}

console.log('\n🚀 Happy deploying!');