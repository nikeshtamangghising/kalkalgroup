const https = require('https');

// Test the gallery API endpoints
async function testGalleryAPI() {
  const baseUrl = 'https://kalkalgroup.vercel.app';
  
  console.log('🔍 Testing Gallery API...\n');
  
  // Test 1: GET gallery status
  console.log('1. Testing GET /api/gallery/status');
  try {
    const response = await fetch(`${baseUrl}/api/gallery/status`);
    const text = await response.text();
    console.log('Status:', response.status);
    console.log('Response type:', response.headers.get('content-type'));
    console.log('Response (first 200 chars):', text.substring(0, 200));
    
    if (response.ok) {
      try {
        const data = JSON.parse(text);
        console.log('✅ Status endpoint working:', data.success);
      } catch (e) {
        console.log('❌ Invalid JSON response');
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 2: GET gallery items
  console.log('2. Testing GET /api/gallery');
  try {
    const response = await fetch(`${baseUrl}/api/gallery`);
    const text = await response.text();
    console.log('Status:', response.status);
    console.log('Response type:', response.headers.get('content-type'));
    console.log('Response (first 200 chars):', text.substring(0, 200));
    
    if (response.ok) {
      try {
        const data = JSON.parse(text);
        console.log('✅ Gallery endpoint working:', data.success);
        console.log('Items count:', data.count || 0);
      } catch (e) {
        console.log('❌ Invalid JSON response');
        console.log('Full response:', text);
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 3: POST to gallery (simulate image upload)
  console.log('3. Testing POST /api/gallery (without image)');
  try {
    const formData = new FormData();
    formData.append('title', 'Test Image');
    formData.append('description', 'Test Description');
    formData.append('category', 'FACTORY');
    formData.append('altText', 'Test Alt Text');
    formData.append('tags', JSON.stringify(['test']));
    
    const response = await fetch(`${baseUrl}/api/gallery`, {
      method: 'POST',
      body: formData
    });
    
    const text = await response.text();
    console.log('Status:', response.status);
    console.log('Response type:', response.headers.get('content-type'));
    console.log('Response (first 200 chars):', text.substring(0, 200));
    
    if (response.ok) {
      try {
        const data = JSON.parse(text);
        console.log('✅ POST endpoint working:', data.success);
      } catch (e) {
        console.log('❌ Invalid JSON response');
        console.log('Full response:', text);
      }
    } else {
      console.log('❌ POST failed with status:', response.status);
      console.log('Error response:', text);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  console.log('\n📋 Summary:');
  console.log('- If you see "Invalid JSON response" errors, the API is returning HTML instead of JSON');
  console.log('- This usually indicates a server error or unhandled exception');
  console.log('- Check Vercel logs for detailed error messages');
  console.log('- The issue might be related to Cloudinary configuration or database connection');
}

testGalleryAPI();
