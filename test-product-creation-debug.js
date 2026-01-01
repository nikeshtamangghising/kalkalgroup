const fetch = require('node-fetch');

// Test product creation with detailed error logging
async function testProductCreation() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🔍 Testing Product Creation...\n');
  
  // Test 1: Create a simple test product
  console.log('1. Testing Simple Product Creation');
  try {
    const testProduct = {
      name: 'Test Product ' + Date.now(),
      description: 'This is a test product',
      price: 99.99,
      category: 'Edible Oils',
      isActive: true,
      stockQuantity: 10
    };
    
    console.log('Sending product data:', JSON.stringify(testProduct, null, 2));
    
    const response = await fetch(`${baseUrl}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testProduct)
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log('Response body:', text);
    
    if (response.ok) {
      try {
        const data = JSON.parse(text);
        console.log('✅ Product created successfully!');
        console.log('  - Product ID:', data.data?.id);
        console.log('  - Product Name:', data.data?.name);
      } catch (parseError) {
        console.log('❌ Invalid JSON response:', parseError.message);
      }
    } else {
      console.log('❌ Product creation failed');
      try {
        const errorData = JSON.parse(text);
        console.log('Error details:', errorData);
      } catch (e) {
        console.log('Raw error:', text);
      }
    }
  } catch (error) {
    console.error('❌ Request error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 2: Check if categories API is working
  console.log('2. Testing Categories API');
  try {
    const response = await fetch(`${baseUrl}/api/categories`);
    console.log('Categories API status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Categories working:', data.categories?.length, 'categories found');
      console.log('Sample categories:', data.categories?.slice(0, 3));
    } else {
      console.log('❌ Categories API failed:', response.status);
    }
  } catch (error) {
    console.error('❌ Categories API error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 3: Check if products API (GET) is working
  console.log('3. Testing Products GET API');
  try {
    const response = await fetch(`${baseUrl}/api/products?page=1&limit=1`);
    console.log('Products GET status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Products GET working:', data.data?.length, 'products found');
    } else {
      console.log('❌ Products GET failed:', response.status);
      const text = await response.text();
      console.log('Error:', text.substring(0, 200));
    }
  } catch (error) {
    console.error('❌ Products GET error:', error.message);
  }
}

testProductCreation().catch(console.error);
