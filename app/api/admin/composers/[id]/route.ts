import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const composerUpdateSchema = z.object({
  slug: z.string().min(1).optional(),
  imageId: z.string().optional().nullable(),
  externalUrl: z.string().url().optional().nullable().or(z.literal("")),
  order: z.number().int().optional(),
  isActive: z.boolean().optional(),
  translations: z
    .object({
      fr: z.object({
        name: z.string().min(1),
        bio: z.string().optional().nullable(),
      }),
      en: z.object({
        name: z.string().min(1),
        bio: z.string().optional().nullable(),
      }),
    })
    .optional(),
})

// GET single composer
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const composer = await prisma.composer.findUnique({
      where: { id },
      include: {
        translations: true,
        image: true,
        contributions: {
          include: {
            work: {
              include: {
                translations: true,
                category: {
                  include: { translations: true },
                },
              },
            },
          },
        },
      },
    })

    if (!composer) {
      return NextResponse.json(
        { error: "Compositeur non trouvé" },
        { status: 404 }
      )
    }

    return NextResponse.json(composer)
  } catch (error) {
    console.error("GET composer error:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération du compositeur" },
      { status: 500 }
    )
  }
}

// PUT update composer
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const data = composerUpdateSchema.parse(body)

    // Check if composer exists
    const existing = await prisma.composer.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: "Compositeur non trouvé" },
        { status: 404 }
      )
    }

    // Update composer
    const composer = await prisma.composer.update({
      where: { id },
      data: {
        slug: data.slug,
        imageId: data.imageId,
        externalUrl: data.externalUrl || null,
        order: data.order,
        isActive: data.isActive,
      },
      include: {
        translations: true,
        image: true,
      },
    })

    // Update translations if provided
    if (data.translations) {
      await Promise.all([
        prisma.composerTranslation.upsert({
          where: {
            composerId_locale: {
              composerId: id,
              locale: "fr",
            },
          },
          create: {
            composerId: id,
            locale: "fr",
            name: data.translations.fr.name,
            bio: data.translations.fr.bio || null,
          },
          update: {
            name: data.translations.fr.name,
            bio: data.translations.fr.bio || null,
          },
        }),
        prisma.composerTranslation.upsert({
          where: {
            composerId_locale: {
              composerId: id,
              locale: "en",
            },
          },
          create: {
            composerId: id,
            locale: "en",
            name: data.translations.en.name,
            bio: data.translations.en.bio || null,
          },
          update: {
            name: data.translations.en.name,
            bio: data.translations.en.bio || null,
          },
        }),
      ])
    }

    // Fetch updated composer with translations
    const updated = await prisma.composer.findUnique({
      where: { id },
      include: {
        translations: true,
        image: true,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("PUT composer error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du compositeur" },
      { status: 500 }
    )
  }
}

// DELETE composer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if composer exists
    const existing = await prisma.composer.findUnique({
      where: { id },
      include: {
        _count: {
          select: { contributions: true },
        },
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Compositeur non trouvé" },
        { status: 404 }
      )
    }

    // Check if composer has contributions
    if (existing._count.contributions > 0) {
      return NextResponse.json(
        {
          error: `Ce compositeur est lié à ${existing._count.contributions} œuvre(s). Supprimez d'abord les contributions.`,
        },
        { status: 400 }
      )
    }

    // Delete composer (translations will be cascade deleted)
    await prisma.composer.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE composer error:", error)
    return NextResponse.json(
      { error: "Erreur lors de la suppression du compositeur" },
      { status: 500 }
    )
  }
}
