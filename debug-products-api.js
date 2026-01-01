const fetch = require('node-fetch');

// Debug the products API to see why products aren't showing
async function debugProductsAPI() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🔍 Debugging Products API...\n');
  
  // Test 1: Basic products fetch (like admin dashboard)
  console.log('1. Testing GET /api/products (basic)');
  try {
    const response = await fetch(`${baseUrl}/api/products`);
    const text = await response.text();
    console.log('Status:', response.status);
    console.log('Response (first 500 chars):', text.substring(0, 500));
    
    if (response.ok) {
      try {
        const data = JSON.parse(text);
        console.log('✅ Products API response:');
        console.log('  - Success:', data.success);
        console.log('  - Data length:', data.data?.length || 0);
        console.log('  - Pagination:', data.pagination);
        console.log('  - Message:', data.message);
        
        if (data.data && data.data.length > 0) {
          console.log('  - Sample product:', JSON.stringify(data.data[0], null, 2));
        }
      } catch (e) {
        console.log('❌ Invalid JSON response');
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 2: Products with pagination (like admin dashboard)
  console.log('2. Testing GET /api/products?page=1&limit=10&isActive=true');
  try {
    const response = await fetch(`${baseUrl}/api/products?page=1&limit=10&isActive=true`);
    const text = await response.text();
    console.log('Status:', response.status);
    console.log('Response (first 500 chars):', text.substring(0, 500));
    
    if (response.ok) {
      try {
        const data = JSON.parse(text);
        console.log('✅ Products API with filters:');
        console.log('  - Success:', data.success);
        console.log('  - Data length:', data.data?.length || 0);
        console.log('  - Pagination:', data.pagination);
        
        if (data.data && data.data.length > 0) {
          console.log('  - Sample product:', JSON.stringify(data.data[0], null, 2));
        }
      } catch (e) {
        console.log('❌ Invalid JSON response');
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 3: Products without isActive filter
  console.log('3. Testing GET /api/products?page=1&limit=10 (no isActive filter)');
  try {
    const response = await fetch(`${baseUrl}/api/products?page=1&limit=10`);
    const text = await response.text();
    console.log('Status:', response.status);
    
    if (response.ok) {
      try {
        const data = JSON.parse(text);
        console.log('✅ Products API without isActive filter:');
        console.log('  - Success:', data.success);
        console.log('  - Data length:', data.data?.length || 0);
        
        if (data.data && data.data.length > 0) {
          console.log('  - Sample product name:', data.data[0].name);
          console.log('  - Sample product isActive:', data.data[0].isActive);
        }
      } catch (e) {
        console.log('❌ Invalid JSON response');
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 4: Check if products exist with isActive=false
  console.log('4. Testing GET /api/products?isActive=false');
  try {
    const response = await fetch(`${baseUrl}/api/products?isActive=false`);
    const text = await response.text();
    console.log('Status:', response.status);
    
    if (response.ok) {
      try {
        const data = JSON.parse(text);
        console.log('✅ Inactive products:');
        console.log('  - Data length:', data.data?.length || 0);
        
        if (data.data && data.data.length > 0) {
          console.log('  - Found inactive products - this might be the issue!');
        }
      } catch (e) {
        console.log('❌ Invalid JSON response');
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  console.log('\n📋 Debugging Summary:');
  console.log('- Check if products are being created with isActive=false');
  console.log('- Verify the productRepository.findMany method works correctly');
  console.log('- Check if there are any database connection issues');
  console.log('- Look for any filtering logic problems');
}

debugProductsAPI().catch(console.error);
