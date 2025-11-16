import { NextResponse } from 'next/server'
import { getAllExpertises } from '@/lib/expertiseUtils'

export async function GET() {
  try {
    const expertises = getAllExpertises('fr')
    // Retourner seulement les 3 premières
    return NextResponse.json(expertises.slice(0, 3))
  } catch (error) {
    console.error('Error fetching expertises:', error)
    return NextResponse.json({ error: 'Failed to fetch expertises' }, { status: 500 })
  }
}
