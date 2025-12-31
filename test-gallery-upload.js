const FormData = require('form-data');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Create a test image file (1x1 pixel PNG)
const testImageData = Buffer.from([
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
  0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
  0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 dimensions
  0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, // bit depth, color type
  0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, // IDAT chunk
  0x54, 0x08, 0x99, 0x01, 0x01, 0x01, 0x00, 0x00,
  0xFE, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // image data
  0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, // IEND chunk
  0xAE, 0x42, 0x60, 0x82
]);

async function testGalleryUpload() {
  const baseUrl = 'https://kalkalgroup.vercel.app';
  
  console.log('🔍 Testing Gallery Image Upload...\n');
  
  // Create a temporary test image file
  const tempImagePath = path.join(__dirname, 'test-image.png');
  fs.writeFileSync(tempImagePath, testImageData);
  
  try {
    // Create form data with image
    const formData = new FormData();
    formData.append('title', 'Test Gallery Image');
    formData.append('description', 'This is a test image uploaded via API');
    formData.append('category', 'FACTORY');
    formData.append('altText', 'Test image alt text');
    formData.append('tags', JSON.stringify(['test', 'api-upload']));
    formData.append('metadata', JSON.stringify({ source: 'api-test' }));
    formData.append('image', fs.createReadStream(tempImagePath), {
      filename: 'test-image.png',
      contentType: 'image/png'
    });
    
    console.log('📤 Sending POST request to /api/gallery...');
    
    const response = await fetch(`${baseUrl}/api/gallery`, {
      method: 'POST',
      body: formData,
      timeout: 30000 // 30 second timeout
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Response length:', responseText.length);
    console.log('Response (first 500 chars):', responseText.substring(0, 500));
    
    if (response.ok) {
      try {
        const data = JSON.parse(responseText);
        console.log('\n✅ Upload successful!');
        console.log('Success:', data.success);
        console.log('Message:', data.message);
        console.log('Item ID:', data.data?.id);
        console.log('Image URL:', data.data?.imageUrl);
        
        // Test fetching the uploaded item
        if (data.data?.id) {
          console.log('\n🔍 Testing GET uploaded item...');
          const getItemResponse = await fetch(`${baseUrl}/api/gallery/${data.data.id}`);
          const getItemData = await getItemResponse.json();
          
          if (getItemResponse.ok && getItemData.success) {
            console.log('✅ Item retrieved successfully');
            console.log('Item title:', getItemData.data?.title);
            console.log('Item category:', getItemData.data?.category);
          } else {
            console.log('❌ Failed to retrieve uploaded item');
          }
        }
        
      } catch (parseError) {
        console.log('\n❌ Failed to parse JSON response');
        console.log('Parse error:', parseError.message);
        console.log('Raw response:', responseText);
      }
    } else {
      console.log('\n❌ Upload failed with status:', response.status);
      
      try {
        const errorData = JSON.parse(responseText);
        console.log('Error:', errorData.error);
        console.log('Details:', errorData.details);
      } catch (e) {
        console.log('Non-JSON error response:', responseText);
      }
    }
    
  } catch (error) {
    console.error('\n❌ Upload error:', error.message);
    
    if (error.code === 'ECONNRESET') {
      console.log('Connection was reset - possibly due to large file or timeout');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('Request timed out - try with a smaller image');
    }
  } finally {
    // Clean up temporary file
    if (fs.existsSync(tempImagePath)) {
      fs.unlinkSync(tempImagePath);
      console.log('\n🧹 Temporary test file cleaned up');
    }
  }
  
  console.log('\n📋 Troubleshooting tips:');
  console.log('1. If upload fails, check Vercel function logs');
  console.log('2. Verify Cloudinary credentials in Vercel environment');
  console.log('3. Check if image size exceeds limits');
  console.log('4. Ensure all required form fields are included');
  console.log('5. Test with different image formats (JPG, PNG)');
}

testGalleryUpload();
