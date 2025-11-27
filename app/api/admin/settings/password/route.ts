import { NextResponse } from 'next/server'

import bcrypt from 'bcryptjs'
import { z } from 'zod'

import { ApiError, handleApiError } from '@/lib/api/error-handler'
import { withAuth } from '@/lib/api/with-auth'
import { prisma } from '@/lib/prisma'

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
})

export const POST = withAuth(async (req, _ctx, user) => {
  try {
    const body = (await req.json()) as unknown
    const { currentPassword, newPassword } = passwordSchema.parse(body)

    // Find account with password
    const account = await prisma.account.findFirst({
      where: {
        userId: user.id,
        password: { not: null },
      },
    })

    const password = account?.password
    if (!account || !password) {
      throw new ApiError(400, "Aucun mot de passe n'est configuré pour ce compte", 'NO_PASSWORD')
    }

    const valid = await bcrypt.compare(currentPassword, password)
    if (!valid) {
      throw new ApiError(400, 'Mot de passe actuel incorrect', 'INVALID_PASSWORD')
    }

    const hashed = await bcrypt.hash(newPassword, 10)
    await prisma.account.update({
      where: { id: account.id },
      data: { password: hashed },
    })

    // Invalidate sessions
    await prisma.session.deleteMany({ where: { userId: user.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
})
