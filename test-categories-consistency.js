const https = require('https');

// Test both categories and brands APIs to compare their behavior
async function testCategoriesVsBrands() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🔍 Testing Categories vs Brands APIs...\n');
  
  // Test Categories API
  console.log('1. Testing GET /api/categories');
  try {
    const response = await fetch(`${baseUrl}/api/categories`);
    const text = await response.text();
    console.log('Status:', response.status);
    console.log('Response type:', response.headers.get('content-type'));
    console.log('Response (first 300 chars):', text.substring(0, 300));
    
    if (response.ok) {
      try {
        const data = JSON.parse(text);
        console.log('✅ Categories API structure:');
        console.log('  - Has categories array:', Array.isArray(data.categories));
        console.log('  - Categories count:', data.categories?.length || 0);
        console.log('  - Has total field:', 'total' in data);
        console.log('  - Total value:', data.total);
        console.log('  - Sample category:', data.categories?.[0] ? JSON.stringify(data.categories[0], null, 2) : 'None');
      } catch (e) {
        console.log('❌ Invalid JSON response');
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test Brands API
  console.log('2. Testing GET /api/brands');
  try {
    const response = await fetch(`${baseUrl}/api/brands`);
    const text = await response.text();
    console.log('Status:', response.status);
    console.log('Response type:', response.headers.get('content-type'));
    console.log('Response (first 300 chars):', text.substring(0, 300));
    
    if (response.ok) {
      try {
        const data = JSON.parse(text);
        console.log('✅ Brands API structure:');
        console.log('  - Has brands array:', Array.isArray(data.brands));
        console.log('  - Brands count:', data.brands?.length || 0);
        console.log('  - Has total field:', 'total' in data);
        console.log('  - Total value:', data.total);
        console.log('  - Sample brand:', data.brands?.[0] ? JSON.stringify(data.brands[0], null, 2) : 'None');
      } catch (e) {
        console.log('❌ Invalid JSON response');
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test Category Creation
  console.log('3. Testing POST /api/categories');
  try {
    const testCategory = {
      name: 'Test Category ' + Date.now(),
      description: 'This is a test category'
    };
    
    const response = await fetch(`${baseUrl}/api/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testCategory)
    });
    
    const text = await response.text();
    console.log('Status:', response.status);
    console.log('Response (first 300 chars):', text.substring(0, 300));
    
    if (response.ok) {
      try {
        const data = JSON.parse(text);
        console.log('✅ Category created successfully');
        console.log('  - Message:', data.message);
        console.log('  - Category ID:', data.category?.id);
        console.log('  - Category name:', data.category?.name);
      } catch (e) {
        console.log('❌ Invalid JSON response');
      }
    } else {
      console.log('❌ Category creation failed');
      try {
        const errorData = JSON.parse(text);
        console.log('  - Error:', errorData.error);
      } catch (e) {
        console.log('  - Raw error:', text);
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  console.log('\n📋 Summary:');
  console.log('- Categories API should now work like Brands API');
  console.log('- Both return: { categories/brands: [...], total: N }');
  console.log('- Both support POST for creation');
  console.log('- Both should be consistent in admin dashboard and product forms');
}

// Test multiple times to check consistency
async function runMultipleTests() {
  for (let i = 1; i <= 3; i++) {
    console.log(`\n🔄 Test Run ${i}/3`);
    console.log('='.repeat(60));
    await testCategoriesVsBrands();
    
    if (i < 3) {
      console.log('\n⏱️ Waiting 2 seconds before next test...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

runMultipleTests().catch(console.error);
