const fetch = require('node-fetch');

// Test product deletion functionality
async function testProductDeletion() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🔍 Testing Product Deletion...\n');
  
  // First, create a test product to delete
  console.log('1. Creating a test product to delete...');
  
  const testProduct = {
    name: 'Test Product for Deletion ' + Date.now(),
    description: 'This product will be deleted for testing',
    price: 99.99,
    category: 'Edible Oils',
    stockQuantity: 10,
    tags: ['test', 'delete'],
    images: []
  };
  
  try {
    const createResponse = await fetch(`${baseUrl}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testProduct)
    });
    
    if (!createResponse.ok) {
      throw new Error('Failed to create test product');
    }
    
    const createResult = await createResponse.json();
    const productId = createResult.data?.id;
    
    console.log(`✅ Test product created with ID: ${productId}`);
    
    // Now test deletion
    console.log('\n2. Testing product deletion...');
    
    const deleteResponse = await fetch(`${baseUrl}/api/products/${productId}`, {
      method: 'DELETE'
    });
    
    console.log(`Delete response status: ${deleteResponse.status}`);
    
    const deleteResult = await deleteResponse.json();
    
    if (deleteResponse.ok) {
      console.log('✅ Product deleted successfully!');
      console.log('  - Message:', deleteResult.message);
      console.log('  - Product ID:', deleteResult.product?.id);
      console.log('  - isActive:', deleteResult.product?.isActive);
    } else {
      console.log('❌ Product deletion failed');
      console.log('  - Error:', deleteResult.error);
      console.log('  - Status:', deleteResponse.status);
    }
    
    // Verify the product is soft-deleted (isActive = false)
    console.log('\n3. Verifying soft delete...');
    
    const verifyResponse = await fetch(`${baseUrl}/api/products/${productId}`);
    
    if (verifyResponse.ok) {
      const verifyResult = await verifyResponse.json();
      console.log('✅ Product still exists (soft delete)');
      console.log('  - isActive:', verifyResult.isActive);
      console.log('  - Should be: false');
    } else {
      console.log('❌ Product not found after deletion');
    }
    
    // Test deleting non-existent product
    console.log('\n4. Testing delete with non-existent ID...');
    
    const fakeResponse = await fetch(`${baseUrl}/api/products/non-existent-id`, {
      method: 'DELETE'
    });
    
    console.log(`Fake ID response status: ${fakeResponse.status}`);
    
    if (fakeResponse.status === 404) {
      console.log('✅ Correctly returns 404 for non-existent product');
    } else {
      console.log('❌ Should return 404 for non-existent product');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

// Test the admin products page to see if delete buttons work
async function testAdminPage() {
  console.log('\n' + '='.repeat(50));
  console.log('5. Testing Admin Products Page...');
  
  try {
    const response = await fetch(`${baseUrl}/admin/products`);
    console.log(`Admin products page status: ${response.status}`);
    
    if (response.ok) {
      console.log('✅ Admin products page accessible');
      console.log('Delete buttons should be visible in the UI');
    } else {
      console.log('❌ Admin products page failed');
    }
  } catch (error) {
    console.error('❌ Admin page error:', error.message);
  }
}

testProductDeletion()
  .then(() => testAdminPage())
  .catch(console.error);
