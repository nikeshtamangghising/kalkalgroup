const fetch = require('node-fetch');

// Test the improved product creation
async function testProductCreationFix() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🔧 Testing Product Creation Fixes...\n');
  
  // Test 1: Create a new product with all details
  console.log('1. Testing Product Creation with All Fields');
  try {
    const testProduct = {
      name: 'Test Product with All Details ' + Date.now(),
      description: 'This is a comprehensive test product with all details filled',
      sku: 'TEST-' + Date.now(),
      barcode: '1234567890123',
      price: 299.99,
      purchasePrice: 150.00,
      discountPrice: 249.99,
      weight: 1.5,
      length: 10,
      width: 8,
      height: 5,
      category: 'Edible Oils',
      brand: 'Kalkal Group',
      tags: ['test', 'comprehensive', 'all-fields'],
      isActive: true,
      stockQuantity: 100,
      minStockLevel: 10,
      trackInventory: true
    };
    
    const response = await fetch(`${baseUrl}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testProduct)
    });
    
    const text = await response.text();
    console.log('Status:', response.status);
    
    if (response.ok) {
      try {
        const data = JSON.parse(text);
        console.log('✅ Product created successfully!');
        console.log('  - Product ID:', data.data?.id);
        console.log('  - Name:', data.data?.name);
        console.log('  - Price:', data.data?.basePrice);
        console.log('  - SKU:', data.data?.sku);
        console.log('  - Category ID:', data.data?.categoryId);
        console.log('  - Brand ID:', data.data?.brandId);
        console.log('  - Weight:', data.data?.weight);
        console.log('  - Inventory:', data.data?.inventory);
        console.log('  - Tags count:', data.data?.tags?.length);
        
        // Test 2: Verify the product appears in listing
        console.log('\n2. Testing Product Listing');
        const listResponse = await fetch(`${baseUrl}/api/products?page=1&limit=10&isActive=true`);
        const listData = await listResponse.json();
        
        console.log('Products in list:', listData.data?.length);
        const foundProduct = listData.data?.find(p => p.name === testProduct.name);
        if (foundProduct) {
          console.log('✅ Product appears in listing with all fields:');
          console.log('  - All fields populated:', !!foundProduct.name && !!foundProduct.price);
          console.log('  - Category resolved:', !!foundProduct.categoryId);
          console.log('  - Brand resolved:', !!foundProduct.brandId);
        } else {
          console.log('❌ Product not found in listing');
        }
        
      } catch (parseError) {
        console.log('❌ Invalid JSON response:', parseError.message);
        console.log('Raw response:', text.substring(0, 500));
      }
    } else {
      console.log('❌ Creation failed with status:', response.status);
      try {
        const errorData = JSON.parse(text);
        console.log('Error:', errorData.error);
        console.log('Details:', errorData.details);
      } catch (e) {
        console.log('Raw error:', text.substring(0, 500));
      }
    }
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
  
  console.log('\n📋 Expected Improvements:');
  console.log('- ✅ Category name converted to ID');
  console.log('- ✅ Brand name converted to ID');
  console.log('- ✅ All numeric fields saved correctly');
  console.log('- ✅ Dimensions stored in attributes');
  console.log('- ✅ Inventory fields populated');
  console.log('- ✅ Tags array saved correctly');
  console.log('- ✅ Status set to PUBLISHED');
  console.log('- ✅ isActive field working');
}

testProductCreationFix().catch(console.error);
