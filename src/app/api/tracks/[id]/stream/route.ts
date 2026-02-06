import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createReadStream, statSync } from 'fs'
import { getAudioMimeType } from '@/lib/utils'

// GET /api/tracks/:id/stream - Stream audio file with range support
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const track = await prisma.track.findUnique({
      where: { id: params.id },
    })

    if (!track) {
      return NextResponse.json({ success: false, error: 'Track not found' }, { status: 404 })
    }

    let stat
    try {
      stat = statSync(track.filePath)
    } catch {
      return NextResponse.json({ success: false, error: 'Audio file not found on disk' }, { status: 404 })
    }

    const fileSize = stat.size
    const mimeType = getAudioMimeType(track.format || 'mp3')
    const range = request.headers.get('range')

    // Increment play count asynchronously
    prisma.track.update({
      where: { id: params.id },
      data: { playCount: { increment: 1 } },
    }).catch(() => {})

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-')
      const start = parseInt(parts[0], 10)
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
      const chunkSize = end - start + 1

      const stream = createReadStream(track.filePath, { start, end })
      const readableStream = new ReadableStream({
        start(controller) {
          stream.on('data', (chunk: Buffer | string) => controller.enqueue(new Uint8Array(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)))
          stream.on('end', () => controller.close())
          stream.on('error', (err) => controller.error(err))
        },
      })

      return new NextResponse(readableStream, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': String(chunkSize),
          'Content-Type': mimeType,
          'Cache-Control': 'public, max-age=86400',
        },
      })
    }

    const stream = createReadStream(track.filePath)
    const readableStream = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk: Buffer | string) => controller.enqueue(new Uint8Array(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)))
        stream.on('end', () => controller.close())
        stream.on('error', (err) => controller.error(err))
      },
    })

    return new NextResponse(readableStream, {
      headers: {
        'Content-Length': String(fileSize),
        'Content-Type': mimeType,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch (error) {
    console.error('Error streaming track:', error)
    return NextResponse.json({ success: false, error: 'Failed to stream track' }, { status: 500 })
  }
}
