import { NextResponse } from 'next/server'
import { getSortedPostsData } from '@/lib/blogUtils'

export async function GET() {
  try {
    const posts = await getSortedPostsData()
    // Retourner seulement les 3 derniers (reverse pour avoir les plus récents)
    return NextResponse.json(posts.reverse().slice(0, 3))
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 })
  }
}
