'use client'

import { useState, useEffect, memo, type ChangeEvent, type FormEvent } from 'react'

import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  PhotoIcon,
  ArrowLeftIcon
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

interface GalleryFormData {
  title: string
  description: string
  category: string
  images: string[]
  isActive: boolean
}

const categories = [
  'Factory',
  'Production',
  'Products',
  'Team',
  'Awards'
]

const EditGalleryPage = memo(() => {
  const router = useRouter()
  const params = useParams()
  const galleryId = params.id as string

  const [galleryItem, setGalleryItem] = useState<GalleryItem | null>(null)
  const [formData, setFormData] = useState<GalleryFormData>({
    title: '',
    description: '',
    category: 'Factory',
    images: [],
    isActive: true
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
          const mappedItem = mapGalleryItem(result.data as GalleryApiItem)
          setGalleryItem(mappedItem)
          setFormData({
            title: mappedItem.title,
            description: mappedItem.description ?? '',
            category: mappedItem.category,
            images: mappedItem.imageUrl ? [mappedItem.imageUrl] : [],
            isActive: mappedItem.isActive
          })
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

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      // Validate form
      if (!formData.title.trim()) {
        throw new Error('Title is required')
      }
      if (!formData.description.trim()) {
        throw new Error('Description is required')
      }

      // Update gallery item via API
      const payload: Record<string, unknown> = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        isActive: formData.isActive
      }

      if (formData.images.length > 0 && formData.images[0]) {
        payload.imageUrl = formData.images[0]
        payload.altText = formData.title.trim()
      }

      const response = await fetch(`/api/gallery/${galleryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      
      const result = await response.json()
      
      if (result.success) {
        router.push('/admin/gallery')
      } else {
        if (result.needsDatabase) {
          throw new Error('Database setup required for editing gallery items. Please set up the database first.')
        } else {
          throw new Error(result.error || 'Failed to update gallery item')
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update gallery item')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-200 h-96 rounded-lg"></div>
            <div className="bg-gray-200 h-96 rounded-lg"></div>
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
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/gallery">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Gallery Image</h1>
          <p className="text-gray-600">Update gallery image details</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="bg-white rounded-lg shadow border p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter image title"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                placeholder="Enter image description"
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Image Upload */}
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                Gallery Image
              </label>
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onloadend = () => {
                      setFormData(prev => ({ ...prev, images: [reader.result as string] }))
                    }
                    reader.readAsDataURL(file)
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="mt-2 text-sm text-gray-500">
                Upload a new image to replace the current one, or keep the existing image.
              </p>
            </div>

            {/* Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                Active (visible in gallery)
              </label>
            </div>

            {/* Metadata */}
            <div className="pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500 space-y-1">
                <p>Created: {new Date(galleryItem.createdAt).toLocaleString()}</p>
                <p>Last updated: {new Date(galleryItem.updatedAt).toLocaleString()}</p>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center gap-4 pt-6">
              <Button
                type="submit"
                disabled={saving}
                className="flex-1"
              >
                {saving ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </div>
                ) : (
                  'Save Changes'
                )}
              </Button>
              <Link href="/admin/gallery">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-lg shadow border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
          
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Image Preview */}
            <div className="aspect-[4/3] bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center relative">
              {formData.images.length > 0 ? (
                <img
                  src={formData.images[0]}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-gray-400">
                  <PhotoIcon className="w-16 h-16 mx-auto mb-2" />
                  <p className="text-sm">No image available</p>
                </div>
              )}
              
              {/* Status Badge */}
              <div className="absolute top-2 left-2 flex gap-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  formData.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {formData.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
                  {formData.category}
                </span>
              </div>
            </div>

            {/* Content Preview */}
            <div className="p-4">
              <h4 className="font-semibold text-gray-900 mb-2">
                {formData.title}
              </h4>
              <p className="text-gray-600 text-sm">
                {formData.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

EditGalleryPage.displayName = 'EditGalleryPage'

export default EditGalleryPage