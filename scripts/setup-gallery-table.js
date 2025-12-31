#!/usr/bin/env node

/**
 * Simple script to create the gallery table and seed initial data
 * Run this if you're getting "gallery table not found" errors
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Gallery Table...\n');

// Check if we're in a Next.js project
if (!fs.existsSync('package.json')) {
  console.error('❌ Error: This script must be run from the project root directory');
  process.exit(1);
}

try {
  // Check if drizzle is available
  console.log('📋 Checking Drizzle setup...');
  
  // Try to run drizzle push to create the table
  console.log('🔨 Creating gallery table...');
  execSync('npx drizzle-kit push', { stdio: 'inherit' });
  
  console.log('\n✅ Gallery table created successfully!');
  console.log('📸 You can now use the gallery feature in your application.');
  console.log('\n🎯 Next steps:');
  console.log('1. Visit http://localhost:3000/gallery to see the public gallery');
  console.log('2. Visit http://localhost:3000/admin and click "Gallery" to manage items');
  console.log('3. The gallery will start with sample data, which you can modify in the admin panel');
  
} catch (error) {
  console.error('\n❌ Error setting up gallery table:');
  console.error(error.message);
  console.log('\n🔧 Manual setup instructions:');
  console.log('1. Make sure your database is running');
  console.log('2. Check your database connection in .env file');
  console.log('3. Run: npx drizzle-kit push');
  console.log('4. If that fails, you may need to run the SQL migration manually');
  
  process.exit(1);
}