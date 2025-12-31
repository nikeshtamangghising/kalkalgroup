'use client'

import { useState, useEffect, memo } from 'react'
import { 
  PhotoIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import Button from '@/components/ui/button'
import GalleryImagePreview from '@/components/admin/gallery-image-preview'

interface GalleryItem {
  id: string
  title: string
  description: string
  category: string
  imageUrl: string
  isActive: boolean
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

const AdminGalleryTab = memo(() => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [dataSource, setDataSource] = useState<'database' | 'sample' | null>(null)

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
        setDataSource(result.source || 'database')
      } else {
        throw new Error(result.error || 'Failed to fetch gallery items')
      }
    } catch (err) {
      setError('Failed to fetch gallery items')
      console.error('Error fetching gallery items:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this gallery item?')) {
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
      } else {
        if (result.needsDatabase) {
          setError('Database required for admin operations. Using read-only mode.')
        } else {
          throw new Error(result.error || 'Failed to delete gallery item')
        }
      }
    } catch (err) {
      setError('Failed to delete gallery item')
      console.error('Error deleting gallery item:', err)
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
      } else {
        if (result.needsDatabase) {
          setError('Database required for admin operations. Using read-only mode.')
        } else {
          throw new Error(result.error || 'Failed to update gallery item status')
        }
      }
    } catch (err) {
      setError('Failed to update gallery item status')
      console.error('Error updating gallery item status:', err)
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
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gallery Management</h1>
          <p className="text-gray-600">Manage your factory and product gallery images</p>
        </div>
        <button
          onClick={() => {
            if (dataSource === 'sample') {
              alert('Database connection required for creating gallery items. Please set up the database first.')
              return
            }
            // Navigate to the gallery creation page
            window.location.href = '/admin/gallery/create'
          }}
          disabled={dataSource === 'sample'}
          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
            dataSource === 'sample'
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add New Image
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Sample Data Notice */}
      {dataSource === 'sample' && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Demo Mode:</strong> Showing sample data. Database connection required for CRUD operations. Create/Edit/Delete functions are disabled.
              </p>
            </div>
          </div>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No gallery items found</h3>
          <p className="text-gray-600 mb-4">
            {selectedCategory === 'All' 
              ? 'Get started by adding your first gallery image.'
              : `No images found in the "${selectedCategory}" category.`
            }
          </p>
          <Button>Add First Image</Button>
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
                  {item.description}
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
                      onClick={() => {
                        if (dataSource === 'sample') {
                          alert('Database connection required for viewing gallery details.')
                          return
                        }
                        window.location.href = `/admin/gallery/${item.id}`
                      }}
                      disabled={dataSource === 'sample'}
                      className={`p-2 rounded-lg transition-colors ${
                        dataSource === 'sample'
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                      }`}
                      title={dataSource === 'sample' ? 'Database required' : 'View Details'}
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        if (dataSource === 'sample') {
                          alert('Database connection required for editing gallery items.')
                          return
                        }
                        window.location.href = `/admin/gallery/${item.id}/edit`
                      }}
                      disabled={dataSource === 'sample'}
                      className={`p-2 rounded-lg transition-colors ${
                        dataSource === 'sample'
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                      }`}
                      title={dataSource === 'sample' ? 'Database required' : 'Edit Item'}
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (dataSource === 'sample') {
                          alert('Database connection required for deleting gallery items.')
                          return
                        }
                        handleDelete(item.id)
                      }}
                      disabled={deleting === item.id || dataSource === 'sample'}
                      className={`p-2 rounded-lg transition-colors ${
                        dataSource === 'sample'
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-600 hover:text-red-600 hover:bg-red-50 disabled:opacity-50'
                      }`}
                      title={dataSource === 'sample' ? 'Database required' : 'Delete Item'}
                    >
                      {deleting === item.id ? (
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <TrashIcon className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  
                  <button
                    onClick={() => {
                      if (dataSource === 'sample') {
                        alert('Database connection required for status changes.')
                        return
                      }
                      handleToggleStatus(item)
                    }}
                    disabled={dataSource === 'sample'}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                      dataSource === 'sample'
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : item.isActive
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

AdminGalleryTab.displayName = 'AdminGalleryTab'

export default AdminGalleryTab