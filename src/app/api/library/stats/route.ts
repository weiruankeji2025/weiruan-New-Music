import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/library/stats - Get library statistics
export async function GET() {
  try {
    const [
      totalTracks,
      totalAlbums,
      totalArtists,
      totalPlaylists,
      durationAgg,
      sizeAgg,
    ] = await Promise.all([
      prisma.track.count(),
      prisma.album.count(),
      prisma.artist.count(),
      prisma.playlist.count(),
      prisma.track.aggregate({ _sum: { duration: true } }),
      prisma.track.aggregate({ _sum: { size: true } }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        totalTracks,
        totalAlbums,
        totalArtists,
        totalPlaylists,
        totalDuration: durationAgg._sum.duration || 0,
        totalSize: sizeAgg._sum.size || 0,
      },
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 })
  }
}
