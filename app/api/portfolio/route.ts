import { NextResponse } from 'next/server'
import { getPortfolioWorksFromPrisma } from '@/lib/prismaPortfolioUtils'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'fr'

    const works = await getPortfolioWorksFromPrisma(locale as 'fr' | 'en')
    // Retourner seulement les 4 premiers
    return NextResponse.json(works.slice(0, 4))
  } catch (error) {
    console.error('Error fetching portfolio:', error)
    return NextResponse.json({ error: 'Failed to fetch portfolio' }, { status: 500 })
  }
}
