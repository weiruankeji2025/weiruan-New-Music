import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/artists/:id - Get artist with albums
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const artist = await prisma.artist.findUnique({
      where: { id: params.id },
      include: {
        albums: {
          include: {
            _count: { select: { tracks: true } },
          },
          orderBy: { year: 'desc' },
        },
        _count: { select: { tracks: true, albums: true } },
      },
    })

    if (!artist) {
      return NextResponse.json({ success: false, error: 'Artist not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: artist.id,
        name: artist.name,
        bio: artist.bio,
        imageUrl: artist.imageUrl,
        albumCount: artist._count.albums,
        trackCount: artist._count.tracks,
        albums: artist.albums.map((a) => ({
          id: a.id,
          title: a.title,
          artistId: artist.id,
          artistName: artist.name,
          year: a.year,
          genre: a.genre,
          coverUrl: a.coverUrl,
          discCount: a.discCount,
          trackCount: a._count.tracks,
          duration: a.duration,
        })),
      },
    })
  } catch (error) {
    console.error('Error fetching artist:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch artist' }, { status: 500 })
  }
}
