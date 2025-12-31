'use client'

import { useState, useEffect, memo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  PhotoIcon,
  ArrowLeftIcon,
  TrashIcon,
  EyeIcon,
  CalendarIcon,
  TagIcon
} from '@heroicons/react/24/outline'
import Button from '@/components/ui/button'

interface GalleryItem {
  id: string
  title: string
  description: string | null
  category: string
  imageUrl: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface GalleryApiItem {
  id: string
  title: string
  description: string | null
  category: string
  image_url: string | null
  alt_text: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

const mapGalleryItem = (item: GalleryApiItem): GalleryItem => ({
  id: item.id,
  title: item.title,
  description: item.description,
  category: item.category,
  imageUrl: item.image_url,
  isActive: item.is_active,
  createdAt: item.created_at,
  updatedAt: item.updated_at
})

const ViewGalleryPage = memo(() => {
  const params = useParams()
  const galleryId = params.id as string

  const [galleryItem, setGalleryItem] = useState<GalleryItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let isMounted = true

    const fetchGalleryItem = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const response = await fetch(`/api/gallery/${galleryId}`)
        const result = await response.json()
        
        if (!result.success || !result.data) {
          throw new Error(result.error || 'Failed to fetch gallery item')
        }

        if (isMounted) {
          setGalleryItem(mapGalleryItem(result.data as GalleryApiItem))
        }
      } catch (err) {
        if (isMounted) {
          setGalleryItem(null)
          setError(err instanceof Error ? err.message : 'Failed to fetch gallery item')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchGalleryItem()

    return () => {
      isMounted = false
    }
  }, [galleryId])

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this gallery item? This action cannot be undone.')) {
      return
    }

    setDeleting(true)
    try {
      const response = await fetch(`/api/gallery/${galleryId}`, {
        method: 'DELETE',
      })
      
      const result = await response.json()
      
      if (result.success) {
        window.location.href = '/admin/gallery'
      } else {
        throw new Error(result.error || 'Failed to delete gallery item')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete gallery item')
      console.error('Error deleting gallery item:', err)
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleStatus = async () => {
    if (!galleryItem) return

    try {
      const response = await fetch(`/api/gallery/${galleryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !galleryItem.isActive,
        }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        setGalleryItem(prev => prev ? {
          ...prev,
          isActive: !prev.isActive,
          updatedAt: new Date().toISOString()
        } : null)
      } else {
        throw new Error(result.error || 'Failed to update gallery item status')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update gallery item status')
      console.error('Error updating gallery item status:', err)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
          <div className="bg-gray-200 h-96 rounded-lg mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !galleryItem) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <PhotoIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {error || 'Gallery item not found'}
          </h3>
          <p className="text-gray-600 mb-4">
            {error ? 'There was an error loading the gallery item.' : 'The gallery item you\'re looking for doesn\'t exist.'}
          </p>
          <Link href="/admin/gallery">
            <Button>Back to Gallery</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/gallery">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
            </button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{galleryItem.title}</h1>
            <div className="flex items-center gap-4 mt-2">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                galleryItem.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {galleryItem.isActive ? 'Active' : 'Inactive'}
              </span>
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-indigo-100 text-indigo-800">
                {galleryItem.category}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleToggleStatus}
            className="flex items-center"
          >
            <EyeIcon className="w-4 h-4 mr-2" />
            {galleryItem.isActive ? 'Deactivate' : 'Activate'}
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center"
          >
            {deleting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <TrashIcon className="w-4 h-4 mr-2" />
            )}
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow border overflow-hidden">
            <div className="aspect-[4/3] bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center relative">
              {galleryItem.imageUrl ? (
                <img
                  src={galleryItem.imageUrl}
                  alt={galleryItem.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
              ) : (
                <div className="text-center text-gray-400">
                  <PhotoIcon className="w-24 h-24 mx-auto mb-4" />
                  <p className="text-lg font-medium">No Image Available</p>
                  <p className="text-sm">This gallery item has no image</p>
                </div>
              )}
              
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  galleryItem.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {galleryItem.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <p className="text-gray-900">{galleryItem.title}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <p className="text-gray-600 leading-relaxed">{galleryItem.description}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <div className="flex items-center">
                  <TagIcon className="w-4 h-4 text-indigo-500 mr-2" />
                  <span className="text-gray-900">{galleryItem.category}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  galleryItem.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {galleryItem.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                <div className="flex items-center text-gray-600">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  <span>{new Date(galleryItem.createdAt).toLocaleString()}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                <div className="flex items-center text-gray-600">
                  <CalendarIcon className="w-4 h-4 mr=2" />
                  <span>{new Date(galleryItem.updatedAt).toLocaleString()}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
                <code className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                  {galleryItem.id}
                </code>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            
            <div className="space-y-3">
              <button
                onClick={handleToggleStatus}
                className="w-full flex items-center px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <EyeIcon className="w-4 h-4 mr=3" />
                {galleryItem.isActive ? 'Deactivate' : 'Activate'}
              </button>
              
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="w-full flex items-center px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              >
                {deleting ? (
                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr=3" />
                ) : (
                  <TrashIcon className="w-4 h-4 mr=3" />
                )}
                {deleting ? 'Deleting...' : 'Delete Item'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

ViewGalleryPage.displayName = 'ViewGalleryPage'

export default ViewGalleryPage