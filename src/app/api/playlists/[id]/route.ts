import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/playlists/:id - Get playlist with tracks
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const playlist = await prisma.playlist.findUnique({
      where: { id: params.id },
      include: {
        tracks: {
          include: {
            track: {
              include: {
                artist: { select: { id: true, name: true } },
                album: { select: { id: true, title: true, coverUrl: true } },
              },
            },
          },
          orderBy: { position: 'asc' },
        },
      },
    })

    if (!playlist) {
      return NextResponse.json({ success: false, error: 'Playlist not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: playlist.id,
        name: playlist.name,
        description: playlist.description,
        coverUrl: playlist.coverUrl,
        userId: playlist.userId,
        isPublic: playlist.isPublic,
        isSmart: playlist.isSmart,
        trackCount: playlist.tracks.length,
        duration: playlist.duration,
        createdAt: playlist.createdAt.toISOString(),
        updatedAt: playlist.updatedAt.toISOString(),
        tracks: playlist.tracks.map((pt) => ({
          id: pt.track.id,
          title: pt.track.title,
          artistId: pt.track.artist.id,
          artistName: pt.track.artist.name,
          albumId: pt.track.album.id,
          albumTitle: pt.track.album.title,
          trackNumber: pt.track.trackNumber,
          discNumber: pt.track.discNumber,
          duration: pt.track.duration,
          bitrate: pt.track.bitrate,
          sampleRate: pt.track.sampleRate,
          format: pt.track.format,
          size: pt.track.size,
          filePath: pt.track.filePath,
          genre: pt.track.genre,
          year: pt.track.year,
          playCount: pt.track.playCount,
          rating: pt.track.rating,
          coverUrl: pt.track.album.coverUrl,
        })),
      },
    })
  } catch (error) {
    console.error('Error fetching playlist:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch playlist' }, { status: 500 })
  }
}

// PATCH /api/playlists/:id - Update playlist
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, description, isPublic, coverUrl } = body

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (isPublic !== undefined) updateData.isPublic = isPublic
    if (coverUrl !== undefined) updateData.coverUrl = coverUrl

    const playlist = await prisma.playlist.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json({ success: true, data: playlist })
  } catch (error) {
    console.error('Error updating playlist:', error)
    return NextResponse.json({ success: false, error: 'Failed to update playlist' }, { status: 500 })
  }
}

// DELETE /api/playlists/:id - Delete playlist
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.playlist.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true, message: 'Playlist deleted' })
  } catch (error) {
    console.error('Error deleting playlist:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete playlist' }, { status: 500 })
  }
}
