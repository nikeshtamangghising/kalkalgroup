const fetch = require('node-fetch');

// Simple test of products API
async function testProductsAPI() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🔍 Testing Products API...\n');
  
  // Test 1: Basic products API call
  console.log('1. Testing GET /api/products?page=1&limit=1');
  try {
    const response = await fetch(`${baseUrl}/api/products?page=1&limit=1`);
    console.log('Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Response:');
      console.log('  - Success:', data.success);
      console.log('  - Data length:', data.data?.length);
      console.log('  - Pagination:', data.pagination);
    } else {
      console.log('❌ API Error:', response.status);
      const text = await response.text();
      console.log('Error text:', text.substring(0, 500));
    }
  } catch (error) {
    console.error('❌ Request error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 2: Test with no parameters
  console.log('2. Testing GET /api/products (no params)');
  try {
    const response = await fetch(`${baseUrl}/api/products`);
    console.log('Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Response (no params):');
      console.log('  - Success:', data.success);
    } else {
      console.log('❌ API Error (no params):', response.status);
      const text = await response.text();
      console.log('Error text:', text.substring(0, 500));
    }
  } catch (error) {
    console.error('❌ Request error:', error.message);
  }
}

testProductsAPI().catch(console.error);
