const fetch = require('node-fetch');

// Test product creation with the exact data structure from the frontend
async function testCompleteProductCreation() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🔍 Testing Complete Product Creation with Frontend Data...\n');
  
  // Simulate the exact data structure the frontend sends
  const formData = {
    name: 'Complete Test Product ' + Date.now(),
    slug: '',
    description: 'This is a complete test product with all fields',
    sku: 'TEST-' + Date.now(),
    barcode: '1234567890123',
    price: '450.00',
    purchasePrice: '350.00',
    discountPrice: '400.00',
    weight: '1.5',
    dimensions: {
      length: '20',
      width: '15',
      height: '10'
    },
    category: 'Edible Oils',
    brand: '',
    tags: 'mustard oil, cooking oil, edible oil, kalkal oil, nepali oil',
    isActive: true,
    stockQuantity: '500',
    minStockLevel: '50',
    trackInventory: true,
    images: ['https://res.cloudinary.com/demo/image/upload/sample.jpg'] // Mock image
  };
  
  // Apply the same conversions as the frontend
  const productData = {
    name: formData.name,
    slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    description: formData.description || null,
    sku: formData.sku || null,
    barcode: formData.barcode || null,
    price: parseFloat(formData.price) || 0,
    purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : null,
    discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
    weight: formData.weight ? parseFloat(formData.weight) : null,
    length: formData.dimensions.length ? parseFloat(formData.dimensions.length) : null,
    width: formData.dimensions.width ? parseFloat(formData.dimensions.width) : null,
    height: formData.dimensions.height ? parseFloat(formData.dimensions.height) : null,
    category: formData.category,
    brand: formData.brand || null,
    tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
    isActive: formData.isActive,
    stockQuantity: parseInt(formData.stockQuantity) || 0,
    minStockLevel: parseInt(formData.minStockLevel) || 5,
    trackInventory: formData.trackInventory,
    images: formData.images
  };
  
  console.log('Sending complete product data...');
  console.log('Name:', productData.name);
  console.log('Price:', productData.price);
  console.log('Stock:', productData.stockQuantity);
  console.log('Tags:', productData.tags);
  console.log('Dimensions:', { length: productData.length, width: productData.width, height: productData.height });
  
  try {
    const response = await fetch(`${baseUrl}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    });
    
    console.log('Response status:', response.status);
    
    const text = await response.text();
    
    if (response.ok) {
      try {
        const data = JSON.parse(text);
        console.log('✅ Complete product creation successful!');
        console.log('  - Product ID:', data.data?.id);
        console.log('  - Product Name:', data.data?.name);
        console.log('  - SKU:', data.data?.sku);
        console.log('  - Barcode:', data.data?.barcode);
        console.log('  - Base Price:', data.data?.basePrice);
        console.log('  - Purchase Price:', data.data?.purchasePrice);
        console.log('  - Discount Price:', data.data?.discountPrice);
        console.log('  - Weight:', data.data?.weight);
        console.log('  - Dimensions:', data.data?.dimensions);
        console.log('  - Category:', data.data?.category?.name);
        console.log('  - Tags:', data.data?.tags);
        console.log('  - Inventory:', data.data?.inventory);
        console.log('  - Images:', data.data?.images?.length);
      } catch (parseError) {
        console.log('❌ Invalid JSON response:', parseError.message);
        console.log('Raw response:', text);
      }
    } else {
      console.log('❌ Complete product creation failed');
      console.log('Status:', response.status);
      try {
        const errorData = JSON.parse(text);
        console.log('Error details:', errorData);
        if (errorData.details) {
          console.log('Validation errors:');
          errorData.details.forEach((error, index) => {
            console.log(`  ${index + 1}. ${error.path?.join('.')}: ${error.message}`);
          });
        }
      } catch (e) {
        console.log('Raw error:', text);
      }
    }
  } catch (error) {
    console.error('❌ Request error:', error.message);
  }
}

testCompleteProductCreation().catch(console.error);
