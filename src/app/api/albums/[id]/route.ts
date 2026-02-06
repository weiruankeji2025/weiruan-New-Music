import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/albums/:id - Get album with tracks
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const album = await prisma.album.findUnique({
      where: { id: params.id },
      include: {
        artist: { select: { id: true, name: true } },
        tracks: {
          include: {
            artist: { select: { id: true, name: true } },
          },
          orderBy: [{ discNumber: 'asc' }, { trackNumber: 'asc' }],
        },
      },
    })

    if (!album) {
      return NextResponse.json({ success: false, error: 'Album not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: album.id,
        title: album.title,
        artistId: album.artist.id,
        artistName: album.artist.name,
        year: album.year,
        genre: album.genre,
        coverUrl: album.coverUrl,
        discCount: album.discCount,
        trackCount: album.tracks.length,
        duration: album.duration,
        tracks: album.tracks.map((t) => ({
          id: t.id,
          title: t.title,
          artistId: t.artist.id,
          artistName: t.artist.name,
          albumId: album.id,
          albumTitle: album.title,
          trackNumber: t.trackNumber,
          discNumber: t.discNumber,
          duration: t.duration,
          bitrate: t.bitrate,
          sampleRate: t.sampleRate,
          format: t.format,
          size: t.size,
          filePath: t.filePath,
          genre: t.genre,
          year: t.year,
          playCount: t.playCount,
          rating: t.rating,
          coverUrl: album.coverUrl,
        })),
      },
    })
  } catch (error) {
    console.error('Error fetching album:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch album' }, { status: 500 })
  }
}
