import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// POST /api/playlists/:id/tracks - Add tracks to playlist
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { trackIds } = body as { trackIds: string[] }

    if (!trackIds || trackIds.length === 0) {
      return NextResponse.json({ success: false, error: 'trackIds required' }, { status: 400 })
    }

    const playlist = await prisma.playlist.findUnique({
      where: { id: params.id },
      include: { tracks: { orderBy: { position: 'desc' }, take: 1 } },
    })

    if (!playlist) {
      return NextResponse.json({ success: false, error: 'Playlist not found' }, { status: 404 })
    }

    const lastPosition = playlist.tracks[0]?.position ?? -1

    const data = trackIds.map((trackId, index) => ({
      playlistId: params.id,
      trackId,
      position: lastPosition + index + 1,
    }))

    // Insert tracks one by one to handle duplicates gracefully
    for (const item of data) {
      try {
        await prisma.playlistTrack.create({ data: item })
      } catch {
        // Skip duplicates
      }
    }

    // Update playlist duration and track count
    const agg = await prisma.playlistTrack.findMany({
      where: { playlistId: params.id },
      include: { track: { select: { duration: true } } },
    })

    await prisma.playlist.update({
      where: { id: params.id },
      data: {
        trackCount: agg.length,
        duration: agg.reduce((sum, pt) => sum + pt.track.duration, 0),
      },
    })

    return NextResponse.json({ success: true, message: `Added ${trackIds.length} tracks` })
  } catch (error) {
    console.error('Error adding tracks:', error)
    return NextResponse.json({ success: false, error: 'Failed to add tracks' }, { status: 500 })
  }
}

// DELETE /api/playlists/:id/tracks - Remove tracks from playlist
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { trackIds } = body as { trackIds: string[] }

    await prisma.playlistTrack.deleteMany({
      where: {
        playlistId: params.id,
        trackId: { in: trackIds },
      },
    })

    // Update playlist stats
    const agg = await prisma.playlistTrack.findMany({
      where: { playlistId: params.id },
      include: { track: { select: { duration: true } } },
    })

    await prisma.playlist.update({
      where: { id: params.id },
      data: {
        trackCount: agg.length,
        duration: agg.reduce((sum, pt) => sum + pt.track.duration, 0),
      },
    })

    return NextResponse.json({ success: true, message: 'Tracks removed' })
  } catch (error) {
    console.error('Error removing tracks:', error)
    return NextResponse.json({ success: false, error: 'Failed to remove tracks' }, { status: 500 })
  }
}

// PATCH /api/playlists/:id/tracks - Reorder tracks
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { trackOrder } = body as { trackOrder: { trackId: string; position: number }[] }

    const updates = trackOrder.map((item) =>
      prisma.playlistTrack.updateMany({
        where: { playlistId: params.id, trackId: item.trackId },
        data: { position: item.position },
      })
    )

    await prisma.$transaction(updates)
    return NextResponse.json({ success: true, message: 'Track order updated' })
  } catch (error) {
    console.error('Error reordering tracks:', error)
    return NextResponse.json({ success: false, error: 'Failed to reorder tracks' }, { status: 500 })
  }
}
