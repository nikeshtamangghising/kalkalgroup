require('dotenv').config();
const { v2: cloudinary } = require('cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

async function testCloudinary() {
  console.log('🔍 Testing Cloudinary configuration...\n');
  
  // Check environment variables
  console.log('Environment Variables:');
  console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Missing');
  console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Missing');
  console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Missing');
  
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.log('\n❌ Cloudinary configuration incomplete');
    return;
  }
  
  console.log('\n🔧 Testing Cloudinary connection...');
  
  try {
    // Test authentication by listing folders
    const result = await new Promise((resolve, reject) => {
      cloudinary.api.resources(
        { type: 'upload', max_results: 1 },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });
    
    console.log('✅ Cloudinary connection successful');
    console.log('Resources found:', result?.resources?.length || 0);
    
    // Test upload with a dummy buffer
    console.log('\n🔧 Testing image upload...');
    const testBuffer = Buffer.from('fake-image-data-for-testing');
    
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { 
          folder: 'kalkal/test',
          resource_type: 'auto',
          public_id: 'test-' + Date.now()
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(testBuffer);
    });
    
    console.log('✅ Upload test successful');
    console.log('Upload result:', {
      public_id: uploadResult.public_id,
      secure_url: uploadResult.secure_url,
      bytes: uploadResult.bytes
    });
    
    // Clean up test image
    await new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(uploadResult.public_id, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });
    
    console.log('✅ Test image cleaned up');
    
  } catch (error) {
    console.error('❌ Cloudinary error:', error.message);
    
    if (error.message.includes('Cloudinary')) {
      console.log('\n📋 Possible solutions:');
      console.log('1. Check Cloudinary credentials in .env file');
      console.log('2. Verify Cloudinary account is active');
      console.log('3. Check if API keys have correct permissions');
      console.log('4. Ensure cloud_name is correct');
    }
  }
}

testCloudinary();
