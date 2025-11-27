import { headers } from 'next/headers'
import type { NextRequest, NextResponse } from 'next/server'

import type { z } from 'zod'

import { auth } from '@/lib/auth'

import { ApiError, handleApiError } from './error-handler'

/**
 * Type pour l'utilisateur authentifié avec le rôle
 */
export type AuthenticatedUser = {
  id: string
  email: string
  name: string | null
  role: 'ADMIN' | 'VIEWER'
  isActive: boolean
}

/**
 * Vérifie l'authentification et retourne l'utilisateur
 * Lance une ApiError si non autorisé
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
  const headersList = await headers()

  const session = await auth.api.getSession({
    headers: headersList,
  })

  if (!session?.user) {
    throw new ApiError(401, 'Non authentifié', 'UNAUTHORIZED')
  }

  // Vérifier le rôle admin
  if (session.user.role !== 'ADMIN') {
    throw new ApiError(403, 'Accès refusé - Rôle administrateur requis', 'FORBIDDEN')
  }

  // Vérifier si le compte est actif
  if (!session.user.isActive) {
    throw new ApiError(403, 'Compte désactivé', 'ACCOUNT_DISABLED')
  }

  return session.user as AuthenticatedUser
}

/**
 * Type pour les route handlers avec authentification
 */
type AuthenticatedHandler = (
  req: NextRequest,
  context: { params?: Promise<Record<string, string>> },
  user: AuthenticatedUser
) => Promise<NextResponse>

/**
 * Wrapper pour protéger une route API avec authentification
 *
 * @example
 * export const GET = withAuth(async (req, context, user) => {
 *   // user est garantit authentifié et admin
 *   return NextResponse.json({ message: "Hello " + user.name });
 * });
 */
export function withAuth(handler: AuthenticatedHandler) {
  return async (req: NextRequest, context: { params?: Promise<Record<string, string>> }) => {
    try {
      const user = await requireAuth()
      return await handler(req, context, user)
    } catch (error) {
      return handleApiError(error)
    }
  }
}

/**
 * Type pour les route handlers avec authentification et validation
 */
type ValidatedHandler<T> = (
  req: NextRequest,
  context: { params?: Promise<Record<string, string>> },
  user: AuthenticatedUser,
  validatedData: T
) => Promise<NextResponse>

/**
 * Wrapper pour protéger une route API avec authentification ET validation Zod
 *
 * @example
 * const createWorkSchema = z.object({
 *   title: z.string().min(1),
 *   slug: z.string().min(1),
 * });
 *
 * export const POST = withAuthAndValidation(
 *   createWorkSchema,
 *   async (req, context, user, data) => {
 *     // user est authentifié et data est validé
 *     const work = await prisma.work.create({ data });
 *     return NextResponse.json(work);
 *   }
 * );
 */
export function withAuthAndValidation<T extends z.ZodType>(
  schema: T,
  handler: ValidatedHandler<z.infer<T>>
) {
  return withAuth(async (req, context, user) => {
    // Parser le body JSON
    const body = (await req.json()) as unknown

    // Valider avec Zod (lance une ZodError si invalide)
    const validatedData = schema.parse(body)

    // Appeler le handler avec les données validées
    return handler(req, context, user, validatedData)
  })
}

/**
 * Wrapper pour les méthodes sans body (GET, DELETE)
 * Permet de valider les query params ou params d'URL
 */
export function withAuthAndParams<T extends z.ZodType>(
  schema: T,
  handler: ValidatedHandler<z.infer<T>>
) {
  return withAuth(async (req, context, user) => {
    // Extraire les query params de l'URL
    const { searchParams } = new URL(req.url)
    const params = Object.fromEntries(searchParams.entries())

    // Résoudre context.params si c'est une Promise
    const resolvedParams = context.params ? await context.params : {}

    // Merger les params
    const allParams = { ...params, ...resolvedParams }

    // Valider avec Zod
    const validatedData = schema.parse(allParams)

    // Appeler le handler avec les données validées
    return handler(req, context, user, validatedData)
  })
}
