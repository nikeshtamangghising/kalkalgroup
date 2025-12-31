import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
if (process.env.CLOUDINARY_URL) {
  const url = new URL(process.env.CLOUDINARY_URL)
  cloudinary.config({
    cloud_name: url.hostname,
    api_key: url.username,
    api_secret: url.password,
  })
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

export interface ImageUploadResult {
  secure_url: string
  public_id: string
  width: number
  height: number
  format: string
  bytes: number
}

export interface ImageDeleteResult {
  result: string
  public_id: string
}

export class ImageService {
  /**
   * Check if Cloudinary is properly configured
   */
  static isConfigured(): boolean {
    const config = cloudinary.config()
    return !!(config.cloud_name && config.api_key && config.api_secret)
  }

  /**
   * Upload image to Cloudinary
   */
  static async uploadImage(
    file: Buffer | string,
    options: {
      folder?: string
      public_id?: string
      transformation?: any
      resource_type?: 'image' | 'video' | 'raw' | 'auto'
    } = {}
  ): Promise<ImageUploadResult> {
    if (!this.isConfigured()) {
      throw new Error('Cloudinary not configured. Please add CLOUDINARY_URL or individual CLOUDINARY_* environment variables.')
    }

    try {
      const uploadOptions = {
        folder: options.folder || 'uploads',
        public_id: options.public_id,
        resource_type: options.resource_type || 'image',
        transformation: options.transformation,
        overwrite: false,
        unique_filename: true,
        use_filename: false,
      }

      const result = await cloudinary.uploader.upload(
        typeof file === 'string' ? file : `data:image/jpeg;base64,${file.toString('base64')}`,
        uploadOptions
      )

      return {
        secure_url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      }
    } catch (error) {
      console.error('[ImageService] Upload failed:', error)
      throw new Error(`Image upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Delete image from Cloudinary
   */
  static async deleteImage(publicIdOrUrl: string): Promise<ImageDeleteResult | null> {
    if (!this.isConfigured()) {
      console.warn('[ImageService] Cloudinary not configured, skipping image deletion')
      return null
    }

    try {
      let publicId = publicIdOrUrl

      // If it's a URL, extract the public_id
      if (publicIdOrUrl.includes('cloudinary.com')) {
        const urlParts = publicIdOrUrl.split('/')
        const filename = urlParts[urlParts.length - 1]
        publicId = filename.split('.')[0]
        
        // Handle nested folders in public_id
        const uploadIndex = urlParts.findIndex(part => part === 'upload')
        if (uploadIndex !== -1 && uploadIndex + 2 < urlParts.length) {
          const pathParts = urlParts.slice(uploadIndex + 2, -1)
          if (pathParts.length > 0) {
            publicId = pathParts.join('/') + '/' + publicId
          }
        }
      }

      if (!publicId) {
        console.warn('[ImageService] Invalid public_id or URL provided')
        return null
      }

      const result = await cloudinary.uploader.destroy(publicId)
      
      console.log(`[ImageService] Deleted image: ${publicId}, result: ${result.result}`)
      
      return {
        result: result.result,
        public_id: publicId,
      }
    } catch (error) {
      console.error('[ImageService] Delete failed:', error)
      // Don't throw - image cleanup failure shouldn't break the operation
      return null
    }
  }

  /**
   * Delete multiple images from Cloudinary
   */
  static async deleteImages(publicIdsOrUrls: string[]): Promise<(ImageDeleteResult | null)[]> {
    if (!this.isConfigured()) {
      console.warn('[ImageService] Cloudinary not configured, skipping image deletion')
      return []
    }

    const results = await Promise.allSettled(
      publicIdsOrUrls.map(id => this.deleteImage(id))
    )

    return results.map(result => 
      result.status === 'fulfilled' ? result.value : null
    )
  }

  /**
   * Get image info from Cloudinary
   */
  static async getImageInfo(publicIdOrUrl: string): Promise<any> {
    if (!this.isConfigured()) {
      throw new Error('Cloudinary not configured')
    }

    try {
      let publicId = publicIdOrUrl

      // If it's a URL, extract the public_id
      if (publicIdOrUrl.includes('cloudinary.com')) {
        const urlParts = publicIdOrUrl.split('/')
        const filename = urlParts[urlParts.length - 1]
        publicId = filename.split('.')[0]
      }

      const result = await cloudinary.api.resource(publicId)
      return result
    } catch (error) {
      console.error('[ImageService] Get info failed:', error)
      throw new Error(`Failed to get image info: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Generate transformation URL for existing image
   */
  static generateTransformationUrl(
    publicIdOrUrl: string,
    transformations: any
  ): string {
    if (!this.isConfigured()) {
      return publicIdOrUrl // Return original if not configured
    }

    try {
      let publicId = publicIdOrUrl

      // If it's a URL, extract the public_id
      if (publicIdOrUrl.includes('cloudinary.com')) {
        const urlParts = publicIdOrUrl.split('/')
        const filename = urlParts[urlParts.length - 1]
        publicId = filename.split('.')[0]
      }

      return cloudinary.url(publicId, transformations)
    } catch (error) {
      console.error('[ImageService] Transformation URL generation failed:', error)
      return publicIdOrUrl // Return original on error
    }
  }

  /**
   * Validate image URL is from Cloudinary
   */
  static isCloudinaryUrl(url: string): boolean {
    return url.includes('cloudinary.com') || url.includes('res.cloudinary.com')
  }

  /**
   * Extract public_id from Cloudinary URL
   */
  static extractPublicId(url: string): string | null {
    if (!this.isCloudinaryUrl(url)) {
      return null
    }

    try {
      const urlParts = url.split('/')
      const filename = urlParts[urlParts.length - 1]
      const publicId = filename.split('.')[0]
      
      // Handle nested folders in public_id
      const uploadIndex = urlParts.findIndex(part => part === 'upload')
      if (uploadIndex !== -1 && uploadIndex + 2 < urlParts.length) {
        const pathParts = urlParts.slice(uploadIndex + 2, -1)
        if (pathParts.length > 0) {
          return pathParts.join('/') + '/' + publicId
        }
      }
      
      return publicId
    } catch (error) {
      console.error('[ImageService] Failed to extract public_id:', error)
      return null
    }
  }

  /**
   * Cleanup orphaned images (images not referenced in database)
   * This should be run periodically as a maintenance task
   */
  static async cleanupOrphanedImages(
    referencedUrls: string[],
    folder: string = 'uploads'
  ): Promise<{ deleted: string[], errors: string[] }> {
    if (!this.isConfigured()) {
      throw new Error('Cloudinary not configured')
    }

    try {
      // Get all images in the folder
      const { resources } = await cloudinary.api.resources({
        type: 'upload',
        prefix: folder,
        max_results: 500, // Adjust as needed
      })

      const cloudinaryUrls = resources.map((resource: any) => resource.secure_url)
      const referencedCloudinaryUrls = referencedUrls.filter(url => this.isCloudinaryUrl(url))
      
      // Find orphaned images
      const orphanedUrls = cloudinaryUrls.filter((url: string) => !referencedCloudinaryUrls.includes(url))
      
      if (orphanedUrls.length === 0) {
        return { deleted: [], errors: [] }
      }

      console.log(`[ImageService] Found ${orphanedUrls.length} orphaned images`)
      
      // Delete orphaned images
      const results = await this.deleteImages(orphanedUrls)
      
      const deleted: string[] = []
      const errors: string[] = []
      
      results.forEach((result: any, index: number) => {
        if (result && result.result === 'ok') {
          deleted.push(orphanedUrls[index])
        } else {
          errors.push(orphanedUrls[index])
        }
      })

      console.log(`[ImageService] Cleanup complete: ${deleted.length} deleted, ${errors.length} errors`)
      
      return { deleted, errors }
    } catch (error) {
      console.error('[ImageService] Cleanup failed:', error)
      throw new Error(`Cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

export default ImageService