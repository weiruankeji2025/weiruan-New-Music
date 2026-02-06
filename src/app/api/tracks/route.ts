import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/tracks - List all tracks with pagination, filtering, sorting
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '50')
    const sort = searchParams.get('sort') || 'title'
    const order = searchParams.get('order') || 'asc'
    const genre = searchParams.get('genre')
    const year = searchParams.get('year')
    const search = searchParams.get('search')
    const artistId = searchParams.get('artistId')
    const albumId = searchParams.get('albumId')
    const format = searchParams.get('format')

    const where: Record<string, unknown> = {}
    if (genre) where.genre = genre
    if (year) where.year = parseInt(year)
    if (artistId) where.artistId = artistId
    if (albumId) where.albumId = albumId
    if (format) where.format = format
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { artist: { name: { contains: search } } },
        { album: { title: { contains: search } } },
      ]
    }

    const o = order as 'asc' | 'desc'
    const orderByMap: Record<string, object> = {
      title: { title: o },
      artist: { artist: { name: o } },
      album: { album: { title: o } },
      year: { year: o },
      duration: { duration: o },
      dateAdded: { createdAt: o },
      playCount: { playCount: o },
      rating: { rating: o },
    }

    const [tracks, total] = await Promise.all([
      prisma.track.findMany({
        where,
        include: {
          artist: { select: { id: true, name: true } },
          album: { select: { id: true, title: true, coverUrl: true } },
        },
        orderBy: orderByMap[sort] || { title: o },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.track.count({ where }),
    ])

    const data = tracks.map((t) => ({
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
      lyrics: t.lyrics,
      lyricsType: t.lyricsType,
      playCount: t.playCount,
      rating: t.rating,
      coverUrl: t.album.coverUrl,
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
    console.error('Error fetching tracks:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch tracks' }, { status: 500 })
  }
}
