import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

const DEFAULT_USER_ID = 'default-user'

// GET /api/favorites - Get user's favorites
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || DEFAULT_USER_ID
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '50')

    const [favorites, total] = await Promise.all([
      prisma.favorite.findMany({
        where: { userId },
        include: {
          track: {
            include: {
              artist: { select: { id: true, name: true } },
              album: { select: { id: true, title: true, coverUrl: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.favorite.count({ where: { userId } }),
    ])

    const data = favorites.map((f) => ({
      id: f.track.id,
      title: f.track.title,
      artistId: f.track.artist.id,
      artistName: f.track.artist.name,
      albumId: f.track.album.id,
      albumTitle: f.track.album.title,
      trackNumber: f.track.trackNumber,
      discNumber: f.track.discNumber,
      duration: f.track.duration,
      bitrate: f.track.bitrate,
      sampleRate: f.track.sampleRate,
      format: f.track.format,
      size: f.track.size,
      filePath: f.track.filePath,
      genre: f.track.genre,
      year: f.track.year,
      playCount: f.track.playCount,
      rating: f.track.rating,
      coverUrl: f.track.album.coverUrl,
      isFavorite: true,
      favoritedAt: f.createdAt.toISOString(),
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
    console.error('Error fetching favorites:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch favorites' }, { status: 500 })
  }
}

// POST /api/favorites - Toggle favorite
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { trackId, userId } = body
    const uid = userId || DEFAULT_USER_ID

    const existing = await prisma.favorite.findUnique({
      where: { userId_trackId: { userId: uid, trackId } },
    })

    if (existing) {
      await prisma.favorite.delete({
        where: { id: existing.id },
      })
      return NextResponse.json({ success: true, data: { isFavorite: false } })
    } else {
      await prisma.favorite.create({
        data: { userId: uid, trackId },
      })
      return NextResponse.json({ success: true, data: { isFavorite: true } })
    }
  } catch (error) {
    console.error('Error toggling favorite:', error)
    return NextResponse.json({ success: false, error: 'Failed to toggle favorite' }, { status: 500 })
  }
}
