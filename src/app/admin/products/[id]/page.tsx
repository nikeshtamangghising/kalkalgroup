'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftIcon, PencilIcon } from '@heroicons/react/24/outline'
import AdminLayout from '@/components/admin/admin-layout'
import AdminProtectedRoute from '@/components/admin/admin-protected-route'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Button from '@/components/ui/button'
import Loading from '@/components/ui/loading'
import { Product } from '@/types'

function ViewProductPageContent() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [product, setProduct] = useState<Product | null>(null)

  useEffect(() => {
    if (productId) {
      fetchProduct()
    }
  }, [productId])

  const fetchProduct = async () => {
    try {
      setFetchLoading(true)
      const response = await fetch(`/api/products/${productId}`)
      
      if (!response.ok) {
        throw new Error('Product not found')
      }
      
      const data = await response.json()
      const productData = data.data || data
      
      setProduct(productData)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch product')
    } finally {
      setFetchLoading(false)
    }
  }

  const handleEdit = () => {
    router.push(`/admin/products/${productId}/edit`)
  }

  if (fetchLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loading />
        </div>
      </AdminLayout>
    )
  }

  if (error && !product) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Link href="/admin/products">
              <Button variant="outline" className="flex items-center space-x-2">
                <ArrowLeftIcon className="h-4 w-4" />
                <span>Back to Products</span>
              </Button>
            </Link>
          </div>
          
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{product?.name}</h1>
            <p className="text-gray-600">View product details</p>
          </div>
          <div className="flex space-x-3">
            <Link href="/admin/products">
              <Button variant="outline" className="flex items-center space-x-2">
                <ArrowLeftIcon className="h-4 w-4" />
                <span>Back to Products</span>
              </Button>
            </Link>
            <Button 
              onClick={handleEdit}
              className="flex items-center space-x-2"
            >
              <PencilIcon className="h-4 w-4" />
              <span>Edit Product</span>
            </Button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Product Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Basic info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Name</h3>
                  <p className="text-gray-900">{product?.name}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Slug</h3>
                  <p className="text-gray-900">{product?.slug}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Description</h3>
                  <p className="text-gray-900">{product?.description || 'No description'}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">SKU</h3>
                    <p className="text-gray-900">{product?.sku || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">SKU</h3>
                    <p className="text-gray-900">{product?.sku || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pricing Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Base Price</h3>
                    <p className="text-gray-900">${Number(product?.basePrice || 0).toFixed(2)}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Purchase Price</h3>
                    <p className="text-gray-900">${product?.purchasePrice ? Number(product.purchasePrice).toFixed(2) : 'N/A'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Discount Price</h3>
                    <p className="text-gray-900">${product?.discountPrice ? Number(product.discountPrice).toFixed(2) : 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category & Brand</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Category</h3>
                    <p className="text-gray-900">{(product as any)?.category?.name || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Brand</h3>
                    <p className="text-gray-900">{(product as any)?.brand?.name || 'N/A'}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Tags</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {product?.tags && product.tags.length > 0 ? (
                      product.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500">No tags</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column - Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Physical Properties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Weight (kg)</h3>
                  <p className="text-gray-900">{product?.weight || 'N/A'}</p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500">Dimensions (cm)</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Weight</p>
                      <p className="text-gray-900">{product?.weight || 'N/A'}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">L</p>
                      <p className="text-gray-900">{product?.dimensions ? (product.dimensions as any).length || 'N/A' : 'N/A'}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">W</p>
                      <p className="text-gray-900">{product?.dimensions ? (product.dimensions as any).width || 'N/A' : 'N/A'}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">H</p>
                      <p className="text-gray-900">{product?.dimensions ? (product.dimensions as any).height || 'N/A' : 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inventory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Inventory</h3>
                    <p className="text-gray-900">{product?.inventory}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Low Stock Threshold</h3>
                    <p className="text-gray-900">{product?.lowStockThreshold}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Order Count</h3>
                  <p className="text-gray-900">{product?.orderCount}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Active</h3>
                  <p className="text-gray-900">{product?.isActive ? 'Yes' : 'No'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Created</h3>
                  <p className="text-gray-900">{product?.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Updated</h3>
                  <p className="text-gray-900">{product?.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : 'N/A'}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default function ViewProductPage() {
  return (
    <AdminProtectedRoute>
      <ViewProductPageContent />
    </AdminProtectedRoute>
  )
}
