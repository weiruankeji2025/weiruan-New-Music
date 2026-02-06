import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/albums - List all albums
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '50')
    const sort = searchParams.get('sort') || 'title'
    const order = searchParams.get('order') || 'asc'
    const search = searchParams.get('search')
    const genre = searchParams.get('genre')
    const artistId = searchParams.get('artistId')
    const year = searchParams.get('year')

    const where: Record<string, unknown> = {}
    if (genre) where.genre = genre
    if (artistId) where.artistId = artistId
    if (year) where.year = parseInt(year)
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { artist: { name: { contains: search } } },
      ]
    }

    const o = order as 'asc' | 'desc'
    const orderByMap: Record<string, object> = {
      title: { title: o },
      artist: { artist: { name: o } },
      year: { year: o },
      trackCount: { trackCount: o },
      dateAdded: { createdAt: o },
    }

    const [albums, total] = await Promise.all([
      prisma.album.findMany({
        where,
        include: {
          artist: { select: { id: true, name: true } },
          _count: { select: { tracks: true } },
        },
        orderBy: orderByMap[sort] || { title: o },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.album.count({ where }),
    ])

    const data = albums.map((a) => ({
      id: a.id,
      title: a.title,
      artistId: a.artist.id,
      artistName: a.artist.name,
      year: a.year,
      genre: a.genre,
      coverUrl: a.coverUrl,
      discCount: a.discCount,
      trackCount: a._count.tracks,
      duration: a.duration,
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
    console.error('Error fetching albums:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch albums' }, { status: 500 })
  }
}
