 

import type { NextRequest} from "next/server";
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      path: string;
      alt?: string;
      width: number;
      height: number;
      aspectRatio: number;
      blurDataUrl: string;
    }

    const asset = await prisma.asset.create({
      data: {
        path: body.path,
        alt: body.alt ?? null,
        width: body.width,
        height: body.height,
        aspectRatio: body.aspectRatio,
        blurDataUrl: body.blurDataUrl,
      },
    })

    return NextResponse.json(asset, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la création de l'asset" },
      { status: 500 }
    )
  }
}
