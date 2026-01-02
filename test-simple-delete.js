const fetch = require('node-fetch');

async function testDelete() {
  try {
    // Test 1: Check if admin page loads
    console.log('Testing admin products page...');
    const pageResponse = await fetch('http://localhost:3000/admin/products');
    console.log('Page status:', pageResponse.status);
    
    if (pageResponse.ok) {
      console.log('✅ Admin page accessible');
    } else {
      console.log('❌ Admin page failed');
      const text = await pageResponse.text();
      console.log('Error:', text.substring(0, 200));
    }
    
    // Test 2: Try to delete a product (using a sample ID)
    console.log('\nTesting delete endpoint...');
    const deleteResponse = await fetch('http://localhost:3000/api/products/test-id', {
      method: 'DELETE'
    });
    console.log('Delete status:', deleteResponse.status);
    
    if (deleteResponse.ok) {
      const result = await deleteResponse.json();
      console.log('✅ Delete works:', result.message);
    } else {
      const error = await deleteResponse.json();
      console.log('❌ Delete failed:', error.error);
    }
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

testDelete();
