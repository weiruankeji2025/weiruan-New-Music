import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/artists - List all artists
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '50')
    const sort = searchParams.get('sort') || 'name'
    const order = searchParams.get('order') || 'asc'
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}
    if (search) {
      where.name = { contains: search }
    }

    const [artists, total] = await Promise.all([
      prisma.artist.findMany({
        where,
        include: {
          _count: { select: { albums: true, tracks: true } },
        },
        orderBy: sort === 'name'
          ? { name: order as 'asc' | 'desc' }
          : { createdAt: order as 'asc' | 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.artist.count({ where }),
    ])

    const data = artists.map((a) => ({
      id: a.id,
      name: a.name,
      bio: a.bio,
      imageUrl: a.imageUrl,
      albumCount: a._count.albums,
      trackCount: a._count.tracks,
    }))

    return NextResponse.json({
      success: true,
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('Error fetching artists:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch artists' }, { status: 500 })
  }
}
