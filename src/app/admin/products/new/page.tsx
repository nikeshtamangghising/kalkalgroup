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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [categories, setCategories] = useState<string[]>([])
  const [brands, setBrands] = useState<string[]>([])

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
        setCategories(Array.isArray(categories) ? categories.map((cat: any) => cat.name) : [])
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
        setBrands(Array.isArray(brands) ? brands.map((brand: any) => brand.name) : [])
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
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Validate required fields
      if (!formData.name || !formData.price || !formData.category) {
        throw new Error('Name, price, and category are required')
      }

      // Prepare product data
      const productData = {
        name: formData.name,
        slug: formData.slug || generateSlug(formData.name),
        description: formData.description || null,
        sku: formData.sku || null,
        barcode: formData.barcode || null,
        price: parseFloat(formData.price),
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
        trackInventory: formData.trackInventory
      }

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
      setLoading(false)
    }
  }

  if (loading && !error && !success) {
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
                      <option key={category} value={category}>
                        {category}
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
                      <option key={brand} value={brand}>
                        {brand}
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
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Product'}
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
