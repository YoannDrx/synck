import { NextResponse } from 'next/server'

import { z } from 'zod'

import { ApiError } from '@/lib/api/error-handler'
import { withAuth, withAuthAndValidation } from '@/lib/api/with-auth'
import { createAuditLog } from '@/lib/audit-log'
import { prisma } from '@/lib/prisma'

const workSchema = z.object({
  slug: z.string().min(1),
  categoryId: z.string(),
  labelId: z.string().optional().nullable(),
  coverImageId: z.string().optional().nullable(),
  year: z.number().int().optional().nullable(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('PUBLISHED'),
  spotifyUrl: z
    .union([
      z.string().refine(
        (val) => {
          if (!val) return true
          try {
            new URL(val)
            return true
          } catch {
            return false
          }
        },
        { message: 'URL invalide' }
      ),
      z.literal(''),
      z.null(),
    ])
    .optional(),
  releaseDate: z.string().optional().nullable(),
  genre: z.string().optional().nullable(),
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
  artists: z
    .array(
      z.object({
        artistId: z.string(),
        role: z.string().optional().nullable(),
        order: z.number().int().default(0),
      })
    )
    .optional(),
  imageIds: z.array(z.string()).optional(),
})

export const GET = withAuth(async (_req, context) => {
  if (!context.params) {
    throw new ApiError(400, 'Paramètres manquants', 'BAD_REQUEST')
  }
  const { id } = await context.params

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
          artist: {
            include: {
              translations: true,
            },
          },
        },
        orderBy: { order: 'asc' },
      },
      images: true,
    },
  })

  if (!work) {
    throw new ApiError(404, 'Projet non trouvé', 'NOT_FOUND')
  }

  return NextResponse.json(work)
})

export const PUT = withAuthAndValidation(workSchema, async (req, context, user, data) => {
  if (!context.params) {
    throw new ApiError(400, 'Paramètres manquants', 'BAD_REQUEST')
  }
  const { id } = await context.params

  // Get old values for audit log
  const oldWork = await prisma.work.findUnique({
    where: { id },
    include: { translations: true },
  })

  const work = await prisma.$transaction(async (tx) => {
    await tx.contribution.deleteMany({
      where: { workId: id },
    })

    return tx.work.update({
      where: { id },
      data: {
        slug: data.slug,
        categoryId: data.categoryId,
        labelId: data.labelId,
        coverImageId: data.coverImageId,
        year: data.year ?? null,
        status: data.status,
        spotifyUrl: data.spotifyUrl ?? null,
        releaseDate: data.releaseDate,
        genre: data.genre,
        order: data.order,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        translations: {
          deleteMany: {},
          create: [
            {
              locale: 'fr',
              title: data.translations.fr.title,
              description: data.translations.fr.description,
              role: data.translations.fr.role,
            },
            {
              locale: 'en',
              title: data.translations.en.title,
              description: data.translations.en.description,
              role: data.translations.en.role,
            },
          ],
        },
        ...(data.artists &&
          data.artists.length > 0 && {
            contributions: {
              create: data.artists.map((artist) => ({
                artistId: artist.artistId,
                role: artist.role,
                order: artist.order,
              })),
            },
          }),
      },
      include: {
        translations: true,
        contributions: {
          include: {
            artist: {
              include: {
                translations: true,
              },
            },
          },
        },
        images: true,
      },
    })
  })

  // Audit log
  await createAuditLog({
    userId: user.id,
    action: 'UPDATE',
    entityType: 'Work',
    entityId: work.id,
    metadata: {
      slug: work.slug,
      before: {
        titleFr: oldWork?.translations.find((t) => t.locale === 'fr')?.title,
        titleEn: oldWork?.translations.find((t) => t.locale === 'en')?.title,
        status: oldWork?.status,
      },
      after: {
        titleFr: data.translations.fr.title,
        titleEn: data.translations.en.title,
        status: work.status,
      },
    },
    ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
    userAgent: req.headers.get('user-agent') ?? undefined,
  })

  return NextResponse.json(work)
})

export const DELETE = withAuth(async (req, context, user) => {
  if (!context.params) {
    throw new ApiError(400, 'Paramètres manquants', 'BAD_REQUEST')
  }
  const { id } = await context.params

  // Check if work exists and get metadata for audit log
  const existing = await prisma.work.findUnique({
    where: { id },
    include: { translations: true },
  })

  if (!existing) {
    throw new ApiError(404, 'Projet non trouvé', 'NOT_FOUND')
  }

  // Delete work (cascades will handle related data)
  await prisma.work.delete({
    where: { id },
  })

  // Audit log
  await createAuditLog({
    userId: user.id,
    action: 'DELETE',
    entityType: 'Work',
    entityId: id,
    metadata: {
      slug: existing.slug,
      titleFr: existing.translations.find((t) => t.locale === 'fr')?.title,
      titleEn: existing.translations.find((t) => t.locale === 'en')?.title,
    },
    ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
    userAgent: req.headers.get('user-agent') ?? undefined,
  })

  return NextResponse.json({ success: true })
})
