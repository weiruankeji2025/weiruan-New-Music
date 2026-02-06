import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/tracks/:id - Get track details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const track = await prisma.track.findUnique({
      where: { id: params.id },
      include: {
        artist: { select: { id: true, name: true } },
        album: { select: { id: true, title: true, coverUrl: true } },
      },
    })

    if (!track) {
      return NextResponse.json({ success: false, error: 'Track not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: track.id,
        title: track.title,
        artistId: track.artist.id,
        artistName: track.artist.name,
        albumId: track.album.id,
        albumTitle: track.album.title,
        trackNumber: track.trackNumber,
        discNumber: track.discNumber,
        duration: track.duration,
        bitrate: track.bitrate,
        sampleRate: track.sampleRate,
        format: track.format,
        size: track.size,
        filePath: track.filePath,
        genre: track.genre,
        year: track.year,
        lyrics: track.lyrics,
        lyricsType: track.lyricsType,
        playCount: track.playCount,
        rating: track.rating,
        coverUrl: track.album.coverUrl,
        bpm: track.bpm,
        comment: track.comment,
      },
    })
  } catch (error) {
    console.error('Error fetching track:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch track' }, { status: 500 })
  }
}

// PATCH /api/tracks/:id - Update track metadata
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { rating, lyrics, lyricsType } = body

    const updateData: Record<string, unknown> = {}
    if (rating !== undefined) updateData.rating = rating
    if (lyrics !== undefined) updateData.lyrics = lyrics
    if (lyricsType !== undefined) updateData.lyricsType = lyricsType

    const track = await prisma.track.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json({ success: true, data: track })
  } catch (error) {
    console.error('Error updating track:', error)
    return NextResponse.json({ success: false, error: 'Failed to update track' }, { status: 500 })
  }
}
