import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/search?q=query - Global search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query) {
      return NextResponse.json({ success: false, error: 'Query parameter "q" is required' }, { status: 400 })
    }

    const [tracks, albums, artists, playlists] = await Promise.all([
      prisma.track.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { artist: { name: { contains: query } } },
            { album: { title: { contains: query } } },
          ],
        },
        include: {
          artist: { select: { id: true, name: true } },
          album: { select: { id: true, title: true, coverUrl: true } },
        },
        take: limit,
        orderBy: { playCount: 'desc' },
      }),
      prisma.album.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { artist: { name: { contains: query } } },
          ],
        },
        include: {
          artist: { select: { id: true, name: true } },
          _count: { select: { tracks: true } },
        },
        take: limit,
      }),
      prisma.artist.findMany({
        where: { name: { contains: query } },
        include: { _count: { select: { albums: true, tracks: true } } },
        take: limit,
      }),
      prisma.playlist.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { description: { contains: query } },
          ],
          isPublic: true,
        },
        include: { _count: { select: { tracks: true } } },
        take: limit,
      }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        tracks: tracks.map((t) => ({
          id: t.id,
          title: t.title,
          artistId: t.artist.id,
          artistName: t.artist.name,
          albumId: t.album.id,
          albumTitle: t.album.title,
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
          coverUrl: t.album.coverUrl,
        })),
        albums: albums.map((a) => ({
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
        })),
        artists: artists.map((a) => ({
          id: a.id,
          name: a.name,
          bio: a.bio,
          imageUrl: a.imageUrl,
          albumCount: a._count.albums,
          trackCount: a._count.tracks,
        })),
        playlists: playlists.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          coverUrl: p.coverUrl,
          userId: p.userId,
          isPublic: p.isPublic,
          isSmart: p.isSmart,
          trackCount: p._count.tracks,
          duration: p.duration,
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        })),
      },
    })
  } catch (error) {
    console.error('Error searching:', error)
    return NextResponse.json({ success: false, error: 'Search failed' }, { status: 500 })
  }
}
