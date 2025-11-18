import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const composerSchema = z.object({
  slug: z.string().min(1),
  imageId: z.string().optional().nullable(),
  externalUrl: z.string().url().optional().nullable().or(z.literal("")),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
  translations: z.object({
    fr: z.object({
      name: z.string().min(1),
      bio: z.string().optional().nullable(),
    }),
    en: z.object({
      name: z.string().min(1),
      bio: z.string().optional().nullable(),
    }),
  }),
})

// GET all composers
export async function GET() {
  try {
    const composers = await prisma.composer.findMany({
      include: {
        translations: true,
        image: true,
        _count: {
          select: { contributions: true },
        },
      },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    })

    return NextResponse.json(composers)
  } catch (error) {
    console.error("GET composers error:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des compositeurs" },
      { status: 500 }
    )
  }
}

// POST create new composer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = composerSchema.parse(body)

    const composer = await prisma.composer.create({
      data: {
        slug: data.slug,
        imageId: data.imageId,
        externalUrl: data.externalUrl || null,
        order: data.order,
        isActive: data.isActive,
        translations: {
          create: [
            {
              locale: "fr",
              name: data.translations.fr.name,
              bio: data.translations.fr.bio || null,
            },
            {
              locale: "en",
              name: data.translations.en.name,
              bio: data.translations.en.bio || null,
            },
          ],
        },
      },
      include: {
        translations: true,
        image: true,
      },
    })

    return NextResponse.json(composer, { status: 201 })
  } catch (error) {
    console.error("POST composer error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Erreur lors de la création du compositeur" },
      { status: 500 }
    )
  }
}
