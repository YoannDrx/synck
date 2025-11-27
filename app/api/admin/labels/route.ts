import { NextResponse } from 'next/server'

import { z } from 'zod'

import { withAuth, withAuthAndValidation } from '@/lib/api/with-auth'
import { createAuditLog } from '@/lib/audit-log'
import { prisma } from '@/lib/prisma'

const labelSchema = z.object({
  website: z
    .string()
    .refine(
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
    )
    .optional()
    .nullable(),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
  translations: z.object({
    fr: z.object({
      name: z.string().min(1),
    }),
    en: z.object({
      name: z.string().min(1),
    }),
  }),
})

export const GET = withAuth(async (req) => {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search')

  // If search param exists, return simplified results for search
  if (search) {
    const labels = await prisma.label.findMany({
      where: {
        translations: {
          some: {
            name: {
              contains: search,
              mode: 'insensitive' as const,
            },
          },
        },
      },
      include: {
        translations: {
          select: {
            locale: true,
            name: true,
          },
        },
      },
      take: 10,
      orderBy: { order: 'asc' },
    })

    // Transform to flat structure for search results
    const searchResults = labels.map((label) => ({
      id: label.id,
      name:
        label.translations.find((t) => t.locale === 'fr')?.name ??
        label.translations.find((t) => t.locale === 'en')?.name ??
        '',
    }))

    return NextResponse.json(searchResults)
  }

  // Default: return full labels data
  const labels = await prisma.label.findMany({
    include: {
      translations: true,
      _count: {
        select: {
          works: true,
        },
      },
    },
    orderBy: { order: 'asc' },
  })

  return NextResponse.json(labels)
})

export const POST = withAuthAndValidation(labelSchema, async (req, _context, user, data) => {
  // Generate slug from French name
  const slug = data.translations.fr.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  const label = await prisma.label.create({
    data: {
      slug,
      website: data.website ?? null,
      order: data.order,
      isActive: data.isActive,
      translations: {
        createMany: {
          data: [
            {
              locale: 'fr',
              name: data.translations.fr.name,
            },
            {
              locale: 'en',
              name: data.translations.en.name,
            },
          ],
        },
      },
    },
    include: {
      translations: true,
    },
  })

  // Audit log
  await createAuditLog({
    userId: user.id,
    action: 'CREATE',
    entityType: 'Label',
    entityId: label.id,
    metadata: {
      slug: label.slug,
      nameFr: data.translations.fr.name,
      nameEn: data.translations.en.name,
      website: label.website,
    },
    ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
    userAgent: req.headers.get('user-agent') ?? undefined,
  })

  return NextResponse.json(label, { status: 201 })
})
