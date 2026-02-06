import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/tracks/:id/lyrics - Get track lyrics
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const track = await prisma.track.findUnique({
      where: { id: params.id },
      select: { lyrics: true, lyricsType: true, title: true },
    })

    if (!track) {
      return NextResponse.json({ success: false, error: 'Track not found' }, { status: 404 })
    }

    if (!track.lyrics) {
      return NextResponse.json({
        success: true,
        data: { lyrics: null, type: null, lines: [] },
      })
    }

    // Parse LRC format if applicable
    let lines: { time: number; text: string }[] = []

    if (track.lyricsType === 'lrc') {
      const lrcLines = track.lyrics.split('\n')
      for (const line of lrcLines) {
        const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/)
        if (match) {
          const minutes = parseInt(match[1])
          const seconds = parseInt(match[2])
          const ms = parseInt(match[3].padEnd(3, '0'))
          const time = minutes * 60 + seconds + ms / 1000
          const text = match[4].trim()
          if (text) {
            lines.push({ time, text })
          }
        }
      }
      lines.sort((a, b) => a.time - b.time)
    } else {
      lines = track.lyrics.split('\n').map((text, i) => ({
        time: i,
        text: text.trim(),
      })).filter((l) => l.text)
    }

    return NextResponse.json({
      success: true,
      data: {
        lyrics: track.lyrics,
        type: track.lyricsType,
        lines,
      },
    })
  } catch (error) {
    console.error('Error fetching lyrics:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch lyrics' }, { status: 500 })
  }
}

// PUT /api/tracks/:id/lyrics - Update track lyrics
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { lyrics, lyricsType } = body

    await prisma.track.update({
      where: { id: params.id },
      data: {
        lyrics: lyrics || null,
        lyricsType: lyricsType || null,
      },
    })

    return NextResponse.json({ success: true, message: 'Lyrics updated' })
  } catch (error) {
    console.error('Error updating lyrics:', error)
    return NextResponse.json({ success: false, error: 'Failed to update lyrics' }, { status: 500 })
  }
}
