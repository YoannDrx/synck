import { NextResponse } from 'next/server'

import { put } from '@vercel/blob'
import { randomUUID } from 'crypto'
import { promises as fs } from 'fs'
import path from 'path'
import sharp from 'sharp'

import { ApiError } from '@/lib/api/error-handler'
import { withAuth } from '@/lib/api/with-auth'

export const POST = withAuth(async (req) => {
  const formData = await req.formData()
  const file = formData.get('file') as File

  if (!file) {
    throw new ApiError(400, 'Aucun fichier fourni', 'NO_FILE')
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new ApiError(400, 'Le fichier doit être une image', 'INVALID_FILE_TYPE')
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new ApiError(400, "L'image ne doit pas dépasser 5MB", 'FILE_TOO_LARGE')
  }

  // Convert to buffer
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Get image metadata and generate blur placeholder
  const image = sharp(buffer)
  const metadata = await image.metadata()

  // Generate low-quality blur placeholder (20px width)
  const blurBuffer = await image.resize(20).blur(5).toBuffer()

  const blurDataUrl = `data:image/jpeg;base64,${blurBuffer.toString('base64')}`

  // If Vercel Blob is configured, try it first
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN?.trim()
  if (blobToken) {
    try {
      const blob = await put(file.name, buffer, {
        access: 'public',
        contentType: file.type,
        token: blobToken,
      })

      return NextResponse.json({
        url: blob.url,
        pathname: blob.pathname,
        size: file.size,
        width: metadata.width,
        height: metadata.height,
        aspectRatio: metadata.width && metadata.height ? metadata.width / metadata.height : null,
        blurDataUrl,
      })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Vercel Blob upload failed, falling back to local disk:', error)
    }
  }

  // Local disk fallback (public/uploads)
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
  await fs.mkdir(uploadsDir, { recursive: true })
  const fileName = `${String(Date.now())}-${randomUUID()}-${file.name}`
  const filePath = path.join(uploadsDir, fileName)
  await fs.writeFile(filePath, buffer)

  const publicPath = `/uploads/${fileName}`

  return NextResponse.json({
    url: publicPath,
    pathname: publicPath,
    size: file.size,
    width: metadata.width,
    height: metadata.height,
    aspectRatio: metadata.width && metadata.height ? metadata.width / metadata.height : null,
    blurDataUrl,
  })
})
