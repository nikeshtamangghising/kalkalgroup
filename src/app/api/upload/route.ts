import { NextRequest, NextResponse } from 'next/server'
import { createAdminHandler } from '@/lib/auth-middleware'
import { ImageService } from '@/lib/image-service'

// POST /api/upload - Production-grade image upload with Cloudinary
export const POST = createAdminHandler(async (request: NextRequest) => {
  try {
    // Check if Cloudinary is configured
    if (!ImageService.isConfigured()) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Cloudinary not configured. Please add CLOUDINARY_URL or individual CLOUDINARY_* environment variables.' 
        },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'No files provided' 
        },
        { status: 400 }
      )
    }

    console.log(`[Upload API] Processing ${files.length} files`)

    const uploadedUrls: string[] = []
    const uploadErrors: string[] = []

    for (const file of files) {
      if (!file || file.size === 0) {
        continue
      }

      try {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          uploadErrors.push(`${file.name}: Not a valid image file`)
          continue
        }

        // Check file size (max 10MB for production)
        const maxSize = 10 * 1024 * 1024 // 10MB
        if (file.size > maxSize) {
          uploadErrors.push(`${file.name}: File too large (max 10MB)`)
          continue
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Generate unique public ID
        const timestamp = Date.now()
        const randomSuffix = Math.random().toString(36).substring(2, 8)
        const publicId = `product-${timestamp}-${randomSuffix}`

        console.log(`[Upload API] Uploading ${file.name} as ${publicId}`)

        // Upload to Cloudinary using ImageService
        const uploadResult = await ImageService.uploadImage(buffer, {
          folder: 'ecommerce/products',
          public_id: publicId,
          transformation: {
            width: 1200,
            height: 1200,
            crop: 'limit',
            quality: 'auto:good',
            fetch_format: 'auto'
          }
        })

        if (uploadResult?.secure_url) {
          uploadedUrls.push(uploadResult.secure_url)
          console.log(`[Upload API] Successfully uploaded: ${uploadResult.secure_url}`)
        } else {
          uploadErrors.push(`${file.name}: Invalid response from Cloudinary`)
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error(`[Upload API] Error uploading ${file.name}:`, error)
        uploadErrors.push(`${file.name}: ${errorMessage}`)
      }
    }

    // Return results
    if (uploadedUrls.length === 0 && uploadErrors.length > 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'All uploads failed', 
          details: uploadErrors 
        },
        { status: 400 }
      )
    }

    const response: any = {
      success: true,
      message: `Successfully uploaded ${uploadedUrls.length} of ${files.length} file(s)`,
      urls: uploadedUrls,
      count: uploadedUrls.length
    }

    if (uploadErrors.length > 0) {
      response.partialSuccess = true
      response.warnings = uploadErrors
      response.message += ` (${uploadErrors.length} failed)`
    }

    console.log(`[Upload API] Upload complete: ${uploadedUrls.length} successful, ${uploadErrors.length} failed`)

    return NextResponse.json(response)

  } catch (error) {
    console.error('[Upload API] Unexpected error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json(
      { 
        success: false,
        error: 'Upload service error', 
        details: errorMessage
      },
      { status: 500 }
    )
  }
})

// GET /api/upload - Get upload service status
export const GET = createAdminHandler(async (_request: NextRequest) => {
  try {
    const isConfigured = ImageService.isConfigured()
    
    return NextResponse.json({
      success: true,
      cloudinary: {
        configured: isConfigured,
        message: isConfigured 
          ? 'Cloudinary is properly configured' 
          : 'Cloudinary configuration missing'
      }
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check upload service status'
      },
      { status: 500 }
    )
  }
})