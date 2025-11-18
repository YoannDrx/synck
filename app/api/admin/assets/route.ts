import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const asset = await prisma.asset.create({
      data: {
        path: body.path,
        alt: body.alt || null,
        width: body.width,
        height: body.height,
        aspectRatio: body.aspectRatio,
        blurDataUrl: body.blurDataUrl,
      },
    })

    return NextResponse.json(asset, { status: 201 })
  } catch (error) {
    console.error("Create asset error:", error)
    return NextResponse.json(
      { error: "Erreur lors de la création de l'asset" },
      { status: 500 }
    )
  }
}
