import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/queue - Get current queue
export async function GET() {
  try {
    const items = await prisma.queueItem.findMany({
      include: {
        track: {
          include: {
            artist: { select: { id: true, name: true } },
            album: { select: { id: true, title: true, coverUrl: true } },
          },
        },
      },
      orderBy: { position: 'asc' },
    })

    const data = items.map((item) => ({
      id: item.id,
      position: item.position,
      source: item.source,
      track: {
        id: item.track.id,
        title: item.track.title,
        artistId: item.track.artist.id,
        artistName: item.track.artist.name,
        albumId: item.track.album.id,
        albumTitle: item.track.album.title,
        trackNumber: item.track.trackNumber,
        discNumber: item.track.discNumber,
        duration: item.track.duration,
        bitrate: item.track.bitrate,
        sampleRate: item.track.sampleRate,
        format: item.track.format,
        size: item.track.size,
        filePath: item.track.filePath,
        genre: item.track.genre,
        year: item.track.year,
        playCount: item.track.playCount,
        rating: item.track.rating,
        coverUrl: item.track.album.coverUrl,
      },
    }))

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching queue:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch queue' }, { status: 500 })
  }
}

// POST /api/queue - Set queue
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { trackIds, source } = body as { trackIds: string[]; source?: string }

    // Clear existing queue
    await prisma.queueItem.deleteMany()

    // Add new items
    if (trackIds && trackIds.length > 0) {
      await prisma.queueItem.createMany({
        data: trackIds.map((trackId, index) => ({
          trackId,
          position: index,
          source: source || 'manual',
        })),
      })
    }

    return NextResponse.json({ success: true, message: 'Queue updated' })
  } catch (error) {
    console.error('Error setting queue:', error)
    return NextResponse.json({ success: false, error: 'Failed to set queue' }, { status: 500 })
  }
}

// DELETE /api/queue - Clear queue
export async function DELETE() {
  try {
    await prisma.queueItem.deleteMany()
    return NextResponse.json({ success: true, message: 'Queue cleared' })
  } catch (error) {
    console.error('Error clearing queue:', error)
    return NextResponse.json({ success: false, error: 'Failed to clear queue' }, { status: 500 })
  }
}
