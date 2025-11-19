 

import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server'
import { getProjetsCategoriesFromPrisma } from '@/lib/prismaProjetsUtils'
import type { Locale } from '@/lib/i18n-config'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const locale = (searchParams.get('locale') ?? 'fr') as Locale

    const categories = await getProjetsCategoriesFromPrisma(locale)

    return NextResponse.json(categories)
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}
