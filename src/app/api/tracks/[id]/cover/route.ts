import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/tracks/:id/cover - Get track/album cover art
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const track = await prisma.track.findUnique({
      where: { id: params.id },
      include: { album: { select: { coverUrl: true } } },
    })

    if (!track) {
      return NextResponse.json({ success: false, error: 'Track not found' }, { status: 404 })
    }

    // Try to extract embedded cover art
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { parseFile } = require('music-metadata') as { parseFile: (path: string) => Promise<{ common: { picture?: { data: Buffer; format: string }[] } }> }
      const metadata = await parseFile(track.filePath)
      const picture = metadata.common.picture?.[0]

      if (picture) {
        return new NextResponse(Buffer.from(picture.data), {
          headers: {
            'Content-Type': picture.format,
            'Cache-Control': 'public, max-age=604800',
          },
        })
      }
    } catch {
      // No embedded art or music-metadata not available
    }

    // Return placeholder SVG
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
      <rect width="200" height="200" fill="#1a1a2e"/>
      <circle cx="100" cy="90" r="40" fill="none" stroke="#4a4a6a" stroke-width="3"/>
      <circle cx="100" cy="90" r="15" fill="#4a4a6a"/>
      <path d="M130 90 L130 50 L150 55 L150 70" fill="none" stroke="#4a4a6a" stroke-width="3" stroke-linecap="round"/>
      <text x="100" y="160" text-anchor="middle" fill="#6a6a8a" font-family="sans-serif" font-size="12">No Cover</text>
    </svg>`

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Error fetching cover:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch cover' }, { status: 500 })
  }
}
