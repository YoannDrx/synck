import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { toNextJsHandler } from 'better-auth/next-js'

import { createAuditLog } from '@/lib/audit-log'
import { auth } from '@/lib/auth'
import { logger } from '@/lib/logger'

const baseHandler = toNextJsHandler(auth)

async function handleAuthRequest(request: NextRequest) {
  const method = request.method.toUpperCase()
  const handler =
    baseHandler[method as keyof typeof baseHandler] ??
    baseHandler[method.toLowerCase() as keyof typeof baseHandler]

  if (!handler) {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
  }

  const path = request.nextUrl.pathname.replace(/^\/api\/auth/, '') || '/'

  // Capture session before logout clears it
  let sessionUserId: string | undefined
  let sessionUserEmail: string | undefined
  if (path === '/sign-out') {
    try {
      const session = await auth.api.getSession({ headers: request.headers })
      if (session?.user) {
        sessionUserId = session.user.id
        sessionUserEmail = session.user.email
      }
    } catch (error) {
      logger.warn('Failed to fetch session before sign-out', error)
    }
  }

  const response = await handler(request)

  // Audit login success (email/password flow)
  if (response.ok && path === '/sign-in/email') {
    try {
      const data = (await response.clone().json()) as {
        user?: { id: string; email?: string | null }
      }

      if (data?.user?.id) {
        await createAuditLog({
          userId: data.user.id,
          action: 'LOGIN',
          metadata: data.user.email ? { email: data.user.email } : undefined,
          ipAddress: request.headers.get('x-forwarded-for') ?? undefined,
          userAgent: request.headers.get('user-agent') ?? undefined,
        })
      }
    } catch (error) {
      logger.error('Failed to record login audit log', error)
    }
  }

  // Audit logout success
  if (response.ok && path === '/sign-out' && sessionUserId) {
    try {
      await createAuditLog({
        userId: sessionUserId,
        action: 'LOGOUT',
        metadata: sessionUserEmail ? { email: sessionUserEmail } : undefined,
        ipAddress: request.headers.get('x-forwarded-for') ?? undefined,
        userAgent: request.headers.get('user-agent') ?? undefined,
      })
    } catch (error) {
      logger.error('Failed to record logout audit log', error)
    }
  }

  return response
}

export function GET(request: NextRequest) {
  return handleAuthRequest(request)
}

export function POST(request: NextRequest) {
  return handleAuthRequest(request)
}

export function PUT(request: NextRequest) {
  return handleAuthRequest(request)
}

export function PATCH(request: NextRequest) {
  return handleAuthRequest(request)
}

export function DELETE(request: NextRequest) {
  return handleAuthRequest(request)
}
