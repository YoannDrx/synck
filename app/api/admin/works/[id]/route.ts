import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const workSchema = z.object({
  slug: z.string().min(1),
  categoryId: z.string(),
  labelId: z.string().optional().nullable(),
  coverImageId: z.string().optional().nullable(),
  year: z.number().int().optional().nullable(),
  duration: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("PUBLISHED"),
  spotifyUrl: z.string().url().optional().nullable().or(z.literal("")),
  releaseDate: z.string().optional().nullable(),
  genre: z.string().optional().nullable(),
  isrcCode: z.string().optional().nullable(),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  translations: z.object({
    fr: z.object({
      title: z.string().min(1),
      description: z.string().optional().nullable(),
      role: z.string().optional().nullable(),
    }),
    en: z.object({
      title: z.string().min(1),
      description: z.string().optional().nullable(),
      role: z.string().optional().nullable(),
    }),
  }),
  composers: z.array(z.object({
    composerId: z.string(),
    role: z.string().optional().nullable(),
    order: z.number().int().default(0),
  })).optional(),
  imageIds: z.array(z.string()).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const work = await prisma.work.findUnique({
      where: { id },
      include: {
        category: {
          include: {
            translations: true,
          },
        },
        label: {
          include: {
            translations: true,
          },
        },
        coverImage: true,
        translations: true,
        contributions: {
          include: {
            composer: {
              include: {
                translations: true,
              },
            },
          },
          orderBy: { order: "asc" },
        },
        images: {
          include: {
            image: true,
          },
          orderBy: { order: "asc" },
        },
      },
    })

    if (!work) {
      return NextResponse.json(
        { error: "Œuvre non trouvée" },
        { status: 404 }
      )
    }

    return NextResponse.json(work)
  } catch (error) {
    console.error("Get work error:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'œuvre" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const data = workSchema.parse(body)

    // Delete existing contributions and images, then recreate
    await prisma.contribution.deleteMany({
      where: { workId: id },
    })

    await prisma.workImage.deleteMany({
      where: { workId: id },
    })

    // Update work with new data
    const work = await prisma.work.update({
      where: { id },
      data: {
        slug: data.slug,
        categoryId: data.categoryId,
        labelId: data.labelId,
        coverImageId: data.coverImageId,
        year: data.year,
        duration: data.duration,
        status: data.status,
        spotifyUrl: data.spotifyUrl || null,
        releaseDate: data.releaseDate,
        genre: data.genre,
        isrcCode: data.isrcCode,
        order: data.order,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        translations: {
          deleteMany: {},
          create: [
            {
              locale: "fr",
              title: data.translations.fr.title,
              description: data.translations.fr.description,
              role: data.translations.fr.role,
            },
            {
              locale: "en",
              title: data.translations.en.title,
              description: data.translations.en.description,
              role: data.translations.en.role,
            },
          ],
        },
        ...(data.composers && data.composers.length > 0 && {
          contributions: {
            create: data.composers.map((composer) => ({
              composerId: composer.composerId,
              role: composer.role,
              order: composer.order,
            })),
          },
        }),
        ...(data.imageIds && data.imageIds.length > 0 && {
          images: {
            create: data.imageIds.map((imageId, index) => ({
              imageId,
              order: index,
            })),
          },
        }),
      },
      include: {
        translations: true,
        contributions: {
          include: {
            composer: {
              include: {
                translations: true,
              },
            },
          },
        },
        images: {
          include: {
            image: true,
          },
        },
      },
    })

    return NextResponse.json(work)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Update work error:", error)
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'œuvre" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if work exists
    const existing = await prisma.work.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Œuvre non trouvée" },
        { status: 404 }
      )
    }

    // Delete work (cascades will handle related data)
    await prisma.work.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete work error:", error)
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'œuvre" },
      { status: 500 }
    )
  }
}
