'use client'

import { useState, useEffect, memo } from 'react'
import Link from 'next/link'
import { 
  PhotoIcon,
  PlusIcon,
  TrashIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import Button from '@/components/ui/button'
import GalleryImagePreview from '@/components/admin/gallery-image-preview'

interface GalleryItem {
  id: string
  title: string
  description: string | null
  category: string
  imageUrl: string
  altText: string | null
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

const categories = [
  'All',
  'Factory',
  'Production',
  'Products',
  'Team',
  'Awards'
]

const AdminGalleryPage = memo(() => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchGalleryItems()
  }, [])

  const fetchGalleryItems = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/gallery')
      const result = await response.json()
      
      if (result.success) {
        setGalleryItems(result.data)
        console.log(`[AdminGallery] Loaded ${result.data.length} gallery items from database`)
      } else {
        throw new Error(result.error || 'Failed to fetch gallery items')
      }
    } catch (err) {
      console.error('Error fetching gallery items:', err)
      setError(
        err instanceof Error
          ? err.message || 'Failed to fetch gallery items'
          : 'Failed to fetch gallery items'
      )
      setGalleryItems([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this gallery item? This will also remove the image from cloud storage.')) {
      return
    }

    setDeleting(itemId)
    try {
      const response = await fetch(`/api/gallery/${itemId}`, {
        method: 'DELETE',
      })
      
      const result = await response.json()
      
      if (result.success) {
        setGalleryItems(prev => prev.filter(item => item.id !== itemId))
        console.log(`[AdminGallery] Successfully deleted gallery item: ${itemId}`)
      } else {
        throw new Error(result.error || 'Failed to delete gallery item')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete gallery item'
      setError(errorMessage)
      console.error('[AdminGallery] Error deleting gallery item:', err)
    } finally {
      setDeleting(null)
    }
  }

  const handleToggleStatus = async (item: GalleryItem) => {
    try {
      const response = await fetch(`/api/gallery/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !item.isActive,
        }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        setGalleryItems(prev => 
          prev.map(i => 
            i.id === item.id 
              ? { ...i, isActive: !i.isActive, updatedAt: new Date().toISOString() }
              : i
          )
        )
        console.log(`[AdminGallery] Toggled status for item: ${item.id}`)
      } else {
        throw new Error(result.error || 'Failed to update gallery item status')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update gallery item status'
      setError(errorMessage)
      console.error('[AdminGallery] Error updating gallery item status:', err)
    }
  }

  const filteredItems = selectedCategory === 'All' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === selectedCategory)

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-200 h-64 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gallery Management</h1>
          <p className="text-gray-600">Manage your factory and product gallery images</p>
        </div>
        <Link href="/admin/gallery/create">
          <Button className="flex items-center">
            <PlusIcon className="w-5 h-5 mr-2" />
            Add New Image
          </Button>
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
          <button
            onClick={fetchGalleryItems}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FunnelIcon className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filter by category:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-gray-900">{galleryItems.length}</div>
          <div className="text-sm text-gray-600">Total Images</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-green-600">
            {galleryItems.filter(item => item.isActive).length}
          </div>
          <div className="text-sm text-gray-600">Active Images</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-gray-600">
            {galleryItems.filter(item => !item.isActive).length}
          </div>
          <div className="text-sm text-gray-600">Inactive Images</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-indigo-600">
            {new Set(galleryItems.map(item => item.category)).size}
          </div>
          <div className="text-sm text-gray-600">Categories</div>
        </div>
      </div>

      {/* Gallery Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <PhotoIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {error ? 'Unable to load gallery items' : 'No gallery items found'}
          </h3>
          <p className="text-gray-600 mb-4">
            {error 
              ? 'There was an error connecting to the database. Please check your connection and try again.'
              : selectedCategory === 'All' 
                ? 'Get started by adding your first gallery image.'
                : `No images found in the "${selectedCategory}" category.`
            }
          </p>
          {!error && (
            <Link href="/admin/gallery/create">
              <Button>Add First Image</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl shadow border overflow-hidden flex flex-col">
              {/* Image */}
              <GalleryImagePreview
                imageUrl={item.imageUrl}
                title={item.title}
                category={item.category}
                isActive={item.isActive}
              />

              {/* Content */}
              <div className="p-5 flex flex-1 flex-col">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {item.description || 'No description provided'}
                </p>
                
                <div className="text-xs text-gray-500 mb-4 space-y-1">
                  Created: {new Date(item.createdAt).toLocaleDateString()}
                  {item.updatedAt !== item.createdAt && (
                    <span className="block">
                      Updated: {new Date(item.updatedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-auto flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deleting === item.id}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete Item"
                    >
                      {deleting === item.id ? (
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <TrashIcon className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  
                  <button
                    onClick={() => handleToggleStatus(item)}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                      item.isActive
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {item.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
})

AdminGalleryPage.displayName = 'AdminGalleryPage'

export default AdminGalleryPage