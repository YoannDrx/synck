import { NextResponse } from 'next/server'
import { getPortfolioWorksFromPrisma } from '@/lib/prismaPortfolioUtils'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'fr'
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : null

    const works = await getPortfolioWorksFromPrisma(locale as 'fr' | 'en')

    // Si un limit est spécifié, retourner seulement les N premiers
    if (limit && limit > 0) {
      return NextResponse.json(works.slice(0, limit))
    }

    // Sinon retourner tous les projets
    return NextResponse.json(works)
  } catch (error) {
    console.error('Error fetching portfolio:', error)
    return NextResponse.json({ error: 'Failed to fetch portfolio' }, { status: 500 })
  }
}
