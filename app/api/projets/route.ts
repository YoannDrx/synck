/* eslint-disable no-console */
import { NextResponse } from 'next/server'

import { getProjetsFromPrisma } from '@/lib/prismaProjetsUtils'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') ?? 'fr'
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam) : null

    const works = await getProjetsFromPrisma(locale as 'fr' | 'en')

    // Si un limit est spécifié, retourner seulement les N premiers
    if (limit && limit > 0) {
      return NextResponse.json(works.slice(0, limit))
    }

    // Sinon retourner tous les projets
    return NextResponse.json(works)
  } catch (error) {
    console.error('Error fetching projets:', error)
    return NextResponse.json({ error: 'Failed to fetch projets' }, { status: 500 })
  }
}
