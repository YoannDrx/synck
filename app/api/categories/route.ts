import { NextRequest, NextResponse } from 'next/server'
import { getPortfolioCategoriesFromPrisma } from '@/lib/prismaPortfolioUtils'
import type { Locale } from '@/lib/i18n-config'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const locale = (searchParams.get('locale') || 'fr') as Locale

    const categories = await getPortfolioCategoriesFromPrisma(locale)

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error in categories API route:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}
