const fetch = require('node-fetch');

// Test the exact data that the frontend form sends
async function testFrontendProductCreation() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🔍 Testing Frontend Product Creation...\n');
  
  // Test 1: Simulate the exact form data structure from the frontend
  console.log('1. Testing Frontend Form Data Structure');
  try {
    // This matches the exact structure from the frontend handleSubmit function
    const formData = {
      name: 'Frontend Test Product ' + Date.now(),
      slug: '',
      description: 'This is a test product from frontend form',
      sku: '',
      barcode: '',
      price: '299.99',
      purchasePrice: '',
      discountPrice: '',
      weight: '',
      dimensions: {
        length: '',
        width: '',
        height: ''
      },
      category: 'Edible Oils',
      brand: '',
      tags: '',
      isActive: true,
      stockQuantity: '25',
      minStockLevel: '5',
      trackInventory: true,
      images: []
    };
    
    console.log('Sending frontend form data...');
    console.log('Name:', formData.name);
    console.log('Price:', formData.price);
    console.log('Category:', formData.category);
    
    const response = await fetch(`${baseUrl}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    console.log('Response status:', response.status);
    
    const text = await response.text();
    
    if (response.ok) {
      try {
        const data = JSON.parse(text);
        console.log('✅ Frontend product creation successful!');
        console.log('  - Product ID:', data.data?.id);
        console.log('  - Product Name:', data.data?.name);
        console.log('  - Category:', data.data?.category?.name);
        console.log('  - Price:', data.data?.basePrice);
      } catch (parseError) {
        console.log('❌ Invalid JSON response:', parseError.message);
        console.log('Raw response:', text);
      }
    } else {
      console.log('❌ Frontend product creation failed');
      console.log('Status:', response.status);
      try {
        const errorData = JSON.parse(text);
        console.log('Error details:', errorData);
        console.log('Error message:', errorData.error);
        console.log('Error details:', errorData.details);
      } catch (e) {
        console.log('Raw error:', text);
      }
    }
  } catch (error) {
    console.error('❌ Request error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 2: Test with missing required fields to see validation
  console.log('2. Testing Validation Errors');
  try {
    const invalidData = {
      name: '', // Missing name
      description: 'Test product',
      price: '99.99',
      category: '', // Missing category
      isActive: true
    };
    
    console.log('Testing with missing required fields...');
    
    const response = await fetch(`${baseUrl}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(invalidData)
    });
    
    console.log('Validation test status:', response.status);
    
    const text = await response.text();
    
    if (!response.ok) {
      try {
        const errorData = JSON.parse(text);
        console.log('✅ Validation working as expected');
        console.log('  - Error:', errorData.error);
        console.log('  - Details:', errorData.details);
      } catch (e) {
        console.log('Raw validation error:', text);
      }
    } else {
      console.log('❌ Validation should have failed');
    }
  } catch (error) {
    console.error('❌ Validation test error:', error.message);
  }
}

testFrontendProductCreation().catch(console.error);
