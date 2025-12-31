'use client'

import { useState, memo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  PhotoIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import Button from '@/components/ui/button'

interface GalleryFormData {
  title: string
  description: string
  category: string
  imageFile: File | null
  isActive: boolean
}

const categories = [
  'Factory',
  'Production',
  'Products',
  'Team',
  'Awards'
]

const CreateGalleryPage = memo(() => {
  const router = useRouter()
  const [formData, setFormData] = useState<GalleryFormData>({
    title: '',
    description: '',
    category: 'Factory',
    imageFile: null,
    isActive: true
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleFileChange = (file: File | null) => {
    setFormData(prev => ({ ...prev, imageFile: file }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validate form
      if (!formData.title.trim()) {
        throw new Error('Title is required')
      }
      if (!formData.description.trim()) {
        throw new Error('Description is required')
      }
      if (!formData.imageFile) {
        throw new Error('Please select an image file')
      }

      // Create FormData for file upload
      const formDataToSend = new FormData()
      formDataToSend.append('title', formData.title.trim())
      formDataToSend.append('description', formData.description.trim())
      formDataToSend.append('category', formData.category)
      formDataToSend.append('altText', formData.title.trim())
      formDataToSend.append('tags', JSON.stringify([]))
      formDataToSend.append('metadata', JSON.stringify({}))
      
      formDataToSend.append('image', formData.imageFile)
      
      // Create gallery item via API
      const response = await fetch('/api/gallery', {
        method: 'POST',
        body: formDataToSend,
      })
      
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result?.error || 'Failed to create gallery item')
      }
      
      if (result.success) {
        router.push('/admin/gallery')
      } else {
        if (result.needsDatabase) {
          throw new Error('Database setup required for creating gallery items. Please set up the database first.')
        } else {
          throw new Error(result.error || 'Failed to create gallery item')
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create gallery item')
    } finally {
      setLoading(false)
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Add New Gallery Image</h1>
          <p className="text-gray-600">Upload and configure a new gallery image</p>
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
                Gallery Image *
              </label>
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="mt-2 text-sm text-gray-500">
                Upload one high-quality image for the gallery (PNG, JPG, GIF up to 10MB).
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

            {/* Submit Buttons */}
            <div className="flex items-center gap-4 pt-6">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating...
                  </div>
                ) : (
                  'Create Gallery Item'
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
              {formData.imageFile ? (
                <img
                  src={URL.createObjectURL(formData.imageFile)}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-gray-400">
                  <PhotoIcon className="w-16 h-16 mx-auto mb-2" />
                  <p className="text-sm">Image preview will appear here</p>
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
                {formData.category && (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
                    {formData.category}
                  </span>
                )}
              </div>
            </div>

            {/* Content Preview */}
            <div className="p-4">
              <h4 className="font-semibold text-gray-900 mb-2">
                {formData.title || 'Gallery Item Title'}
              </h4>
              <p className="text-gray-600 text-sm">
                {formData.description || 'Gallery item description will appear here...'}
              </p>
            </div>
          </div>

          {/* Tips */}
          <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
            <h4 className="text-sm font-medium text-indigo-900 mb-2">Tips for great gallery images:</h4>
            <ul className="text-sm text-indigo-700 space-y-1">
              <li>• Use high-quality images (at least 800x600px)</li>
              <li>• Keep file sizes under 5MB for faster loading</li>
              <li>• Write descriptive titles and descriptions</li>
              <li>• Choose the appropriate category</li>
              <li>• Ensure images are well-lit and clear</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
})

CreateGalleryPage.displayName = 'CreateGalleryPage'

export default CreateGalleryPage