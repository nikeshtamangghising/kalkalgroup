'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import AdminLayout from '@/components/admin/admin-layout'
import AdminProtectedRoute from '@/components/admin/admin-protected-route'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Loading from '@/components/ui/loading'

function NewProductPageContent() {
  const router = useRouter()
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  
  const removeImage = (index: number) => {
    const newImageFiles = [...imageFiles]
    const newImagePreviews = [...imagePreviews]
    
    newImageFiles.splice(index, 1)
    newImagePreviews.splice(index, 1)
    
    setImageFiles(newImageFiles)
    setImagePreviews(newImagePreviews)
  }

  const handleImageUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return
    
    const newFiles = Array.from(files)
    
    // Check if adding these files would exceed the limit of 5
    if (imageFiles.length + newFiles.length > 5) {
      setError(`Maximum 5 images allowed. You already have ${imageFiles.length} image(s).`)
      return
    }
    
    // Validate file types and sizes
    const validFiles = newFiles.filter(file => {
      if (!file.type.startsWith('image/')) {
        setError(`${file.name} is not a valid image file`)
        return false
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB
        setError(`${file.name} is too large (max 10MB)`)
        return false
      }
      
      return true
    })
    
    if (validFiles.length === 0) return
    
    setImageFiles(prev => [...prev, ...validFiles])
    
    // Create previews for valid files
    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
    
    // Clear any previous error
    if (error && error.includes('image')) {
      setError('')
    }
  }
  
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [categories, setCategories] = useState<{id: string, name: string}[]>([])
  const [brands, setBrands] = useState<{id: string, name: string}[]>([])

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    sku: '',
    barcode: '',
    price: '',
    purchasePrice: '',
    discountPrice: '',
    weight: '',
    dimensions: {
      length: '',
      width: '',
      height: ''
    },
    category: '',
    brand: '',
    tags: '',
    isActive: true,
    stockQuantity: '0',
    minStockLevel: '5',
    trackInventory: true,
    images: [] as string[]
  })

  useEffect(() => {
    fetchCategories()
    fetchBrands()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        // Handle simplified response format: { categories: [...], total: N }
        const categories = data.categories || data.data || data
        setCategories(Array.isArray(categories) ? categories.map((cat: any) => ({ id: cat.id, name: cat.name })) : [])
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const fetchBrands = async () => {
    try {
      const response = await fetch('/api/brands')
      if (response.ok) {
        const data = await response.json()
        // Handle wrapped response format: { brands: [...], total: N }
        const brands = data.brands || data.data || data
        setBrands(Array.isArray(brands) ? brands.map((brand: any) => ({ id: brand.id, name: brand.name })) : [])
      }
    } catch (error) {
      console.error('Failed to fetch brands:', error)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else if (name.startsWith('dimensions.')) {
      const dimension = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        dimensions: { ...prev.dimensions, [dimension]: value }
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }

    // Auto-generate slug when name changes
    if (name === 'name' && value) {
      setFormData(prev => ({ ...prev, slug: generateSlug(value) }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      // Validate required fields
      if (!formData.name || !formData.price || !formData.category) {
        throw new Error('Name, price, and category are required')
      }

      // Upload images if provided
      let images: string[] = []
      
      if (imageFiles.length > 0) {
        try {
          console.log(`[Product Creation] Uploading ${imageFiles.length} images to Cloudinary`)
          
          // Upload images to Cloudinary
          const uploadFormData = new FormData()
          imageFiles.forEach((file) => {
            uploadFormData.append('files', file)
          })
          
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: uploadFormData,
          })
          
          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json()
            console.log('[Product Creation] Upload response:', uploadResult)
            
            if (uploadResult.success && uploadResult.urls) {
              images = uploadResult.urls
              console.log(`[Product Creation] Successfully uploaded ${images.length} images`)
              
              if (uploadResult.partialSuccess && uploadResult.warnings) {
                console.warn('[Product Creation] Some uploads failed:', uploadResult.warnings)
                setError(`Some images failed to upload: ${uploadResult.warnings.join(', ')}. Product will be created with ${images.length} image(s).`)
              }
            } else {
              throw new Error('Invalid upload response format')
            }
          } else {
            const uploadError = await uploadResponse.json()
            throw new Error(uploadError.error || 'Image upload failed')
          }
        } catch (uploadError) {
          console.error('[Product Creation] Image upload failed:', uploadError)
          setError(`Failed to upload images: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}. Product will be created without images.`)
          // Continue without images - don't throw the error
        }
      } else {
        console.log('[Product Creation] No images to upload')
      }

      // Prepare product data
      const productData = {
        name: formData.name,
        slug: formData.slug || generateSlug(formData.name),
        description: formData.description || null,
        shortDescription: formData.description?.substring(0, 160) || null,
        sku: formData.sku || null,
        barcode: formData.barcode || null,
        price: parseFloat(formData.price) || 0,
        basePrice: parseFloat(formData.price) || 0,
        purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : null,
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        dimensions: {
          length: formData.dimensions.length ? parseFloat(formData.dimensions.length) : null,
          width: formData.dimensions.width ? parseFloat(formData.dimensions.width) : null,
          height: formData.dimensions.height ? parseFloat(formData.dimensions.height) : null,
        },
        categoryId: formData.category,
        brandId: formData.brand || null,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        isActive: formData.isActive,
        isFeatured: false,
        isNewArrival: false,
        inventory: parseInt(formData.stockQuantity) || 0,
        lowStockThreshold: parseInt(formData.minStockLevel) || 5,
        thumbnailUrl: images[0] || null,
        images: images,
        currency: 'NPR',
        status: 'PUBLISHED'
      }

      // Debug logging
      console.log('🔍 Product Creation Debug:');
      console.log('Raw formData:', formData);
      console.log('Converted productData:', productData);
      console.log('Price type:', typeof productData.price, 'value:', productData.price);
      console.log('Inventory type:', typeof productData.inventory, 'value:', productData.inventory);
      console.log('Tags type:', typeof productData.tags, 'value:', productData.tags);

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to create product')
      }

      await response.json() // Consume the response
      setSuccess('Product created successfully!')
      
      // Redirect to products page with success message
      setTimeout(() => {
        router.push('/admin/products?created=true')
      }, 1500)

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create product')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitting && !error && !success) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loading />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href="/admin/products">
            <Button variant="outline" className="flex items-center space-x-2">
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Back to Products</span>
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
            <p className="text-gray-600">Create a new product for your inventory</p>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        {/* Form */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Product Information</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter product name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug
                  </label>
                  <Input
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    placeholder="product-slug"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter product description"
                />
              </div>

              {/* SKU and Barcode */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SKU
                  </label>
                  <Input
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    placeholder="SKU-001"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Barcode
                  </label>
                  <Input
                    name="barcode"
                    value={formData.barcode}
                    onChange={handleInputChange}
                    placeholder="1234567890123"
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <Input
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purchase Price
                  </label>
                  <Input
                    name="purchasePrice"
                    value={formData.purchasePrice}
                    onChange={handleInputChange}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Price
                  </label>
                  <Input
                    name="discountPrice"
                    value={formData.discountPrice}
                    onChange={handleInputChange}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Category and Brand */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand
                  </label>
                  <select
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a brand</option>
                    {brands.map(brand => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Physical Properties */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (kg)
                  </label>
                  <Input
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Length (cm)
                  </label>
                  <Input
                    name="dimensions.length"
                    value={formData.dimensions.length}
                    onChange={handleInputChange}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Width (cm)
                  </label>
                  <Input
                    name="dimensions.width"
                    value={formData.dimensions.width}
                    onChange={handleInputChange}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Height (cm)
                  </label>
                  <Input
                    name="dimensions.height"
                    value={formData.dimensions.height}
                    onChange={handleInputChange}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Product Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Images
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400">
                  <div className="space-y-1 text-center">
                    <div className="flex justify-center">
                      {imagePreviews.length > 0 ? (
                        <div className="flex flex-wrap gap-2 max-w-md">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={preview}
                                alt={`Product preview ${index + 1}`}
                                className="h-24 w-24 object-cover rounded-lg border-2 border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Remove image"
                              >
                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg">
                                {imageFiles[index]?.name || `Image ${index + 1}`}
                              </div>
                            </div>
                          ))}
                          {imagePreviews.length < 5 && (
                            <div className="h-24 w-24 flex items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                              <div className="text-center">
                                <svg className="h-8 w-8 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <p className="text-xs text-gray-500 mt-1">Add more</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="h-32 w-32 flex items-center justify-center bg-gray-100 rounded">
                          <svg
                            className="h-12 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="image-upload"
                        className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>{imagePreviews.length > 0 ? 'Add more images' : 'Upload images'}</span>
                        <input
                          id="image-upload"
                          name="image-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          multiple
                          onChange={(e) => handleImageUpload(e.target.files)}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB each. Max 5 images.
                    </p>
                    {imagePreviews.length > 0 && (
                      <p className="text-xs text-green-600 font-medium">
                        {imagePreviews.length} image(s) selected
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <Input
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="tag1, tag2, tag3"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Separate tags with commas
                </p>
              </div>

              {/* Inventory */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity
                  </label>
                  <Input
                    name="stockQuantity"
                    value={formData.stockQuantity}
                    onChange={handleInputChange}
                    type="number"
                    min="0"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Stock Level
                  </label>
                  <Input
                    name="minStockLevel"
                    value={formData.minStockLevel}
                    onChange={handleInputChange}
                    type="number"
                    min="0"
                    placeholder="5"
                  />
                </div>
                
                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    name="trackInventory"
                    checked={formData.trackInventory}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Track Inventory
                  </label>
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="text-sm font-medium text-gray-700">
                  Product is active and visible to customers
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Link href="/admin/products">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Product'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

export default function NewProductPage() {
  return (
    <AdminProtectedRoute>
      <NewProductPageContent />
    </AdminProtectedRoute>
  )
}
