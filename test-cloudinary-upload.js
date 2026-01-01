const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Test Cloudinary image upload
async function testCloudinaryUpload() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🔍 Testing Cloudinary Image Upload...\n');
  
  // Test 1: Check if Cloudinary is configured
  console.log('1. Testing Cloudinary Configuration');
  try {
    const response = await fetch(`${baseUrl}/api/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    const result = await response.json();
    
    if (result.error && result.error.includes('Cloudinary not configured')) {
      console.log('❌ Cloudinary not configured');
      console.log('Please set up Cloudinary environment variables:');
      console.log('- CLOUDINARY_URL or');
      console.log('- CLOUDINARY_CLOUD_NAME');
      console.log('- CLOUDINARY_API_KEY');
      console.log('- CLOUDINARY_API_SECRET');
      return;
    } else {
      console.log('✅ Cloudinary is configured');
    }
  } catch (error) {
    console.log('❌ Error checking Cloudinary config:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 2: Test with a sample image (if available)
  console.log('2. Testing Image Upload');
  try {
    // Create a simple test image buffer (1x1 pixel PNG)
    const testImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      'base64'
    );
    
    const formData = new FormData();
    formData.append('files', testImageBuffer, {
      filename: 'test-image.png',
      contentType: 'image/png'
    });
    
    console.log('Uploading test image...');
    
    const response = await fetch(`${baseUrl}/api/upload`, {
      method: 'POST',
      body: formData
    });
    
    console.log('Upload response status:', response.status);
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Image upload successful!');
      console.log('  - Uploaded URLs:', result.urls);
      console.log('  - Count:', result.count);
      console.log('  - Message:', result.message);
      
      if (result.partialSuccess && result.warnings) {
        console.log('  - Warnings:', result.warnings);
      }
    } else {
      console.log('❌ Image upload failed');
      console.log('  - Error:', result.error);
      if (result.details) {
        console.log('  - Details:', result.details);
      }
    }
  } catch (error) {
    console.error('❌ Upload test error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 3: Test product creation with images
  console.log('3. Testing Product Creation with Images');
  try {
    const productData = {
      name: 'Test Product with Images ' + Date.now(),
      description: 'This is a test product with image upload',
      price: 199.99,
      category: 'Edible Oils',
      isActive: true,
      stockQuantity: 15,
      images: ['https://res.cloudinary.com/demo/image/upload/sample.jpg'] // Mock image URL
    };
    
    console.log('Creating product with mock images...');
    
    const response = await fetch(`${baseUrl}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    });
    
    console.log('Product creation status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Product with images created successfully!');
      console.log('  - Product ID:', result.data?.id);
      console.log('  - Images:', result.data?.images);
      console.log('  - Thumbnail:', result.data?.thumbnailUrl);
    } else {
      const error = await response.json();
      console.log('❌ Product creation failed');
      console.log('  - Error:', error.error);
    }
  } catch (error) {
    console.error('❌ Product creation test error:', error.message);
  }
}

testCloudinaryUpload().catch(console.error);
