import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const labels = await prisma.label.findMany({
      include: {
        translations: true,
      },
      orderBy: { order: "asc" },
    })

    return NextResponse.json(labels)
  } catch (error) {
    console.error("Error fetching labels:", error)
    return NextResponse.json(
      { error: "Failed to fetch labels" },
      { status: 500 }
    )
  }
}
