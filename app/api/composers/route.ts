 

import { NextResponse } from 'next/server'
import { getComposersFromPrisma } from '@/lib/prismaProjetsUtils'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') ?? 'fr'
    const limitStr = searchParams.get('limit')
    const limit = limitStr ? parseInt(limitStr, 10) : null

    const composers = await getComposersFromPrisma(locale as 'fr' | 'en')

    // Si un limit est spécifié, retourner seulement les N premiers
    if (limit && limit > 0) {
      return NextResponse.json(composers.slice(0, limit))
    }

    // Sinon retourner tous les compositeurs
    return NextResponse.json(composers)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch composers' }, { status: 500 })
  }
}
