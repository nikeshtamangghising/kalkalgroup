const fetch = require('node-fetch');

// Test with properly converted data like the frontend should send
async function testCorrectedProductCreation() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🔍 Testing Corrected Product Creation...\n');
  
  // Simulate the exact data conversion that the frontend does
  const formData = {
    name: 'Corrected Test Product ' + Date.now(),
    slug: '',
    description: 'This is a test product with corrected data types',
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
    images: []
  };
  
  console.log('Sending corrected product data...');
  console.log('Name:', productData.name);
  console.log('Price (type):', typeof productData.price, 'value:', productData.price);
  console.log('StockQuantity (type):', typeof productData.stockQuantity, 'value:', productData.stockQuantity);
  console.log('Tags (type):', typeof productData.tags, 'value:', productData.tags);
  
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
        console.log('✅ Corrected product creation successful!');
        console.log('  - Product ID:', data.data?.id);
        console.log('  - Product Name:', data.data?.name);
        console.log('  - Category:', data.data?.category?.name);
        console.log('  - Price:', data.data?.basePrice);
        console.log('  - Stock:', data.data?.inventory);
      } catch (parseError) {
        console.log('❌ Invalid JSON response:', parseError.message);
        console.log('Raw response:', text);
      }
    } else {
      console.log('❌ Corrected product creation failed');
      console.log('Status:', response.status);
      try {
        const errorData = JSON.parse(text);
        console.log('Error details:', errorData);
        console.log('Error message:', errorData.error);
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

testCorrectedProductCreation().catch(console.error);
