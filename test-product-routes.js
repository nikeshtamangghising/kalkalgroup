const fetch = require('node-fetch');

// Test all admin product routes
async function testProductRoutes() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🔍 Testing Admin Product Routes...\n');
  
  // Test 1: New Product Page
  console.log('1. Testing GET /admin/products/new');
  try {
    const response = await fetch(`${baseUrl}/admin/products/new`);
    console.log('Status:', response.status);
    
    if (response.ok) {
      console.log('✅ New product page works');
    } else {
      console.log('❌ New product page failed:', response.status);
      const text = await response.text();
      console.log('Error:', text.substring(0, 200));
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 2: Main Products Page
  console.log('2. Testing GET /admin/products');
  try {
    const response = await fetch(`${baseUrl}/admin/products`);
    console.log('Status:', response.status);
    
    if (response.ok) {
      console.log('✅ Main products page works');
    } else {
      console.log('❌ Main products page failed:', response.status);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 3: Edit Product Page (using a real product ID)
  console.log('3. Testing GET /admin/products/[id]/edit');
  try {
    // First get a product ID from the API
    const productsResponse = await fetch(`${baseUrl}/api/products?page=1&limit=1`);
    if (productsResponse.ok) {
      const productsData = await productsResponse.json();
      if (productsData.data && productsData.data.length > 0) {
        const productId = productsData.data[0].id;
        console.log('Using product ID:', productId);
        
        const editResponse = await fetch(`${baseUrl}/admin/products/${productId}/edit`);
        console.log('Edit page status:', editResponse.status);
        
        if (editResponse.ok) {
          console.log('✅ Edit product page works');
        } else {
          console.log('❌ Edit product page failed:', editResponse.status);
          const errorText = await editResponse.text();
          console.log('Error:', errorText.substring(0, 200));
        }
      } else {
        console.log('❌ No products found to test edit page');
      }
    } else {
      console.log('❌ Failed to get products for edit test');
    }
  } catch (error) {
    console.error('❌ Error testing edit page:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 4: Check if the edit page file exists
  console.log('4. Checking file structure');
  try {
    const fs = require('fs');
    const editPagePath = './src/app/admin/products/[id]/page.tsx';
    
    if (fs.existsSync(editPagePath)) {
      console.log('✅ Edit page file exists at:', editPagePath);
    } else {
      console.log('❌ Edit page file not found at:', editPagePath);
    }
  } catch (error) {
    console.log('❌ Cannot check file system:', error.message);
  }
  
  console.log('\n📋 Route Debugging Summary:');
  console.log('- Check if Next.js development server is running');
  console.log('- Verify file structure matches Next.js routing conventions');
  console.log('- Check for any import/export errors in the edit page');
  console.log('- Look for any middleware or layout issues');
}

testProductRoutes().catch(console.error);
