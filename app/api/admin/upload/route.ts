/* eslint-disable no-console */

import { put } from "@vercel/blob"
import type { NextRequest} from "next/server";
import { NextResponse } from "next/server"
import sharp from "sharp"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Le fichier doit être une image" },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "L'image ne doit pas dépasser 5MB" },
        { status: 400 }
      )
    }

    // Convert to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Get image metadata and generate blur placeholder
    const image = sharp(buffer)
    const metadata = await image.metadata()

    // Generate low-quality blur placeholder (20px width)
    const blurBuffer = await image
      .resize(20)
      .blur(5)
      .toBuffer()

    const blurDataUrl = `data:image/jpeg;base64,${blurBuffer.toString("base64")}`

    // Upload to Vercel Blob
    const blob = await put(file.name, buffer, {
      access: "public",
      contentType: file.type,
    })

    return NextResponse.json({
      url: blob.url,
      pathname: blob.pathname,
      size: file.size,
      width: metadata.width,
      height: metadata.height,
      aspectRatio: metadata.width && metadata.height
        ? metadata.width / metadata.height
        : null,
      blurDataUrl,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Erreur lors de l'upload" },
      { status: 500 }
    )
  }
}
