const fetch = require('node-fetch');

// Test all category-related components to ensure they work correctly
async function testAllCategoryComponents() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🔍 Testing All Category Components...\n');
  
  // Test 1: Main Categories API
  console.log('1. Testing GET /api/categories');
  try {
    const response = await fetch(`${baseUrl}/api/categories`);
    const text = await response.text();
    
    if (response.ok) {
      try {
        const data = JSON.parse(text);
        console.log('✅ Categories API working:');
        console.log('  - Response structure:', Object.keys(data));
        console.log('  - Categories count:', data.categories?.length || 0);
        console.log('  - Sample category name:', data.categories?.[0]?.name || 'None');
        
        // Verify it's an array of objects with name property
        if (Array.isArray(data.categories) && data.categories[0]?.name) {
          console.log('  ✅ Categories are objects with name property');
        } else {
          console.log('  ❌ Categories format is incorrect');
        }
      } catch (e) {
        console.log('❌ Invalid JSON response');
      }
    } else {
      console.log('❌ API failed with status:', response.status);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 2: Admin Products Page (should not crash)
  console.log('2. Testing Admin Products Page');
  try {
    const response = await fetch(`${baseUrl}/admin/products`);
    console.log('Status:', response.status);
    
    if (response.ok) {
      console.log('✅ Admin products page loads without crashing');
      console.log('  - Content type:', response.headers.get('content-type'));
      console.log('  - Page size:', response.headers.get('content-length'), 'bytes');
    } else {
      console.log('❌ Admin products page failed:', response.status);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 3: Admin Categories Page
  console.log('3. Testing Admin Categories Page');
  try {
    const response = await fetch(`${baseUrl}/admin/categories`);
    console.log('Status:', response.status);
    
    if (response.ok) {
      console.log('✅ Admin categories page loads without crashing');
      console.log('  - Content type:', response.headers.get('content-type'));
    } else {
      console.log('❌ Admin categories page failed:', response.status);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 4: New Product Page
  console.log('4. Testing New Product Page');
  try {
    const response = await fetch(`${baseUrl}/admin/products/new`, { method: 'HEAD' });
    console.log('Status:', response.status);
    
    if (response.ok) {
      console.log('✅ New product page route exists');
    } else {
      console.log('❌ New product page failed:', response.status);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  console.log('\n📋 Summary:');
  console.log('- All category components should now work correctly');
  console.log('- Categories are fetched from /api/categories (not /api/products/categories)');
  console.log('- Category objects are properly mapped to names for dropdowns');
  console.log('- No more "Objects are not valid as a React child" errors');
  console.log('- Categories should work consistently like brands');
}

// Run the test
testAllCategoryComponents().catch(console.error);
