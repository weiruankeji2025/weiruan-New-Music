import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

const DEFAULT_USER_ID = 'default-user'

// GET /api/history - Get play history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || DEFAULT_USER_ID
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '50')

    const [history, total] = await Promise.all([
      prisma.playHistory.findMany({
        where: { userId },
        include: {
          track: {
            include: {
              artist: { select: { id: true, name: true } },
              album: { select: { id: true, title: true, coverUrl: true } },
            },
          },
        },
        orderBy: { playedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.playHistory.count({ where: { userId } }),
    ])

    const data = history.map((h) => ({
      id: h.track.id,
      title: h.track.title,
      artistId: h.track.artist.id,
      artistName: h.track.artist.name,
      albumId: h.track.album.id,
      albumTitle: h.track.album.title,
      duration: h.track.duration,
      format: h.track.format,
      coverUrl: h.track.album.coverUrl,
      playedAt: h.playedAt.toISOString(),
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
    console.error('Error fetching history:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch history' }, { status: 500 })
  }
}

// POST /api/history - Record play
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { trackId, userId } = body
    const uid = userId || DEFAULT_USER_ID

    await prisma.playHistory.create({
      data: { userId: uid, trackId },
    })

    return NextResponse.json({ success: true, message: 'Play recorded' })
  } catch (error) {
    console.error('Error recording play:', error)
    return NextResponse.json({ success: false, error: 'Failed to record play' }, { status: 500 })
  }
}

// DELETE /api/history - Clear history
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || DEFAULT_USER_ID

    await prisma.playHistory.deleteMany({ where: { userId } })
    return NextResponse.json({ success: true, message: 'History cleared' })
  } catch (error) {
    console.error('Error clearing history:', error)
    return NextResponse.json({ success: false, error: 'Failed to clear history' }, { status: 500 })
  }
}
