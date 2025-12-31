import { v2 as cloudinary } from 'cloudinary'

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export interface CloudinaryUploadResult {
  public_id: string
  version: number
  signature: string
  width: number
  height: number
  format: string
  resource_type: string
  created_at: string
  tags: string[]
  bytes: number
  etag: string
  placeholder: boolean
  url: string
  secure_url: string
  access_mode: string
  original_filename: string
}

export interface CloudinaryDeleteResult {
  result: string
  public_id: string
}

export class CloudinaryService {
  /**
   * Upload an image to Cloudinary
   */
  static async uploadImage(
    file: File | Buffer,
    options: {
      folder?: string
      publicId?: string
      tags?: string[]
      transformation?: any
    } = {}
  ): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      const uploadOptions: any = {
        folder: options.folder || 'kalkal/gallery',
        resource_type: 'image',
        use_filename: true,
        unique_filename: true,
        overwrite: true,
      }

      if (options.publicId) {
        uploadOptions.public_id = options.publicId
      }

      if (options.tags && options.tags.length > 0) {
        uploadOptions.tags = options.tags.join(',')
      }

      if (options.transformation) {
        uploadOptions.transformation = options.transformation
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            reject(error)
          } else {
            resolve(result as CloudinaryUploadResult)
          }
        }
      )

      if (file instanceof File) {
        file.arrayBuffer().then(buffer => {
          uploadStream.end(Buffer.from(buffer))
        }).catch(reject)
      } else {
        uploadStream.end(file)
      }
    })
  }

  /**
   * Delete an image from Cloudinary
   */
  static async deleteImage(publicId: string): Promise<CloudinaryDeleteResult> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
                   reject(error)
        } else {
          resolve(result as CloudinaryDeleteResult)
        }
      })
    })
  }

  /**
   * Generate a signed URL for unsigned uploads
   */
  static generateUploadSignature(
    options: {
      folder?: string
      tags?: string[]
      timestamp?: number
    } = {}
  ): {
    signature: string
    timestamp: number
    api_key: string
    cloud_name: string
    folder?: string
    tags?: string[]
  } {
    const timestamp = options.timestamp || Math.floor(Date.now() / 1000)
    const params: any = {
      timestamp,
      folder: options.folder || 'kalkal/gallery',
    }

    if (options.tags && options.tags.length > 0) {
      params.tags = options.tags.join(',')
    }

    const signature = cloudinary.utils.api_sign_request(
      params,
      process.env.CLOUDINARY_API_SECRET!
    )

    return {
      signature,
      timestamp,
      api_key: process.env.CLOUDINARY_API_KEY!,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
      folder: params.folder,
      tags: options.tags,
    }
  }

  /**
   * Get optimized image URL
   */
  static getOptimizedUrl(
    publicId: string,
    options: {
      width?: number
      height?: number
      quality?: number
      format?: string
      crop?: string
    } = {}
  ): string {
    const transformation: any[] = []

    if (options.width || options.height) {
      transformation.push({
        width: options.width,
        height: options.height,
        crop: options.crop || 'fill',
      })
    }

    if (options.quality) {
      transformation.push({
        quality: options.quality,
      })
    }

    if (options.format) {
      transformation.push({
        format: options.format,
      })
    }

    return cloudinary.url(publicId, {
      transformation: transformation.length > 0 ? transformation : undefined,
      secure: true,
    })
  }

  /**
   * Get thumbnail URL
   */
  static getThumbnailUrl(publicId: string): string {
    return this.getOptimizedUrl(publicId, {
      width: 300,
      height: 200,
      quality: 80,
      crop: 'fill',
    })
  }

  /**
   * Get gallery image URL
   */
  static getGalleryImageUrl(publicId: string): string {
    return this.getOptimizedUrl(publicId, {
      width: 800,
      height: 600,
      quality: 85,
      crop: 'fill',
    })
  }
}

export default CloudinaryService
