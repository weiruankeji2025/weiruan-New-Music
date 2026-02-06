import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/library/genres - Get all genres with counts
export async function GET() {
  try {
    const genres = await prisma.track.groupBy({
      by: ['genre'],
      _count: { genre: true },
      where: { genre: { not: null } },
      orderBy: { _count: { genre: 'desc' } },
    })

    const data = genres.map((g) => ({
      name: g.genre,
      count: g._count.genre,
    }))

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching genres:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch genres' }, { status: 500 })
  }
}
