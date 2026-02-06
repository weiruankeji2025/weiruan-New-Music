import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { readdirSync, statSync } from 'fs'
import { join, extname, basename } from 'path'

const AUDIO_EXTENSIONS = new Set([
  '.mp3', '.flac', '.wav', '.ogg', '.m4a', '.aac',
  '.wma', '.opus', '.aiff', '.ape', '.alac',
])

function scanDirectory(dirPath: string): string[] {
  const files: string[] = []
  try {
    const entries = readdirSync(dirPath, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name)
      if (entry.isDirectory()) {
        files.push(...scanDirectory(fullPath))
      } else if (entry.isFile()) {
        const ext = extname(entry.name).toLowerCase()
        if (AUDIO_EXTENSIONS.has(ext)) {
          files.push(fullPath)
        }
      }
    }
  } catch (err) {
    console.error(`Error scanning ${dirPath}:`, err)
  }
  return files
}

// POST /api/library/scan - Scan music folders
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { folders } = body as { folders: string[] }

    if (!folders || folders.length === 0) {
      return NextResponse.json({ success: false, error: 'No folders specified' }, { status: 400 })
    }

    const scanLog = await prisma.scanLog.create({
      data: {
        folderPath: folders.join(';'),
        status: 'scanning',
      },
    })

    let filesFound = 0
    let filesAdded = 0
    const errors: string[] = []

    for (const folder of folders) {
      const audioFiles = scanDirectory(folder)
      filesFound += audioFiles.length

      for (const filePath of audioFiles) {
        try {
          const existing = await prisma.track.findUnique({ where: { filePath } })
          if (existing) continue

          const stat = statSync(filePath)
          const ext = extname(filePath).slice(1).toLowerCase()
          const name = basename(filePath, extname(filePath))

          // Parse basic metadata from filename
          // Format: "Artist - Title" or just "Title"
          let artistName = 'Unknown Artist'
          let trackTitle = name

          const dashIndex = name.indexOf(' - ')
          if (dashIndex > 0) {
            artistName = name.substring(0, dashIndex).trim()
            trackTitle = name.substring(dashIndex + 3).trim()
          }

          // Try to parse metadata with music-metadata if available
          let metadata: {
            title?: string
            artist?: string
            album?: string
            year?: number
            trackNumber?: number
            discNumber?: number
            duration?: number
            bitrate?: number
            sampleRate?: number
            genre?: string
          } = {}

          try {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const mm = require('music-metadata') as { parseFile: (path: string) => Promise<{ common: { title?: string; artist?: string; album?: string; year?: number; track?: { no: number | null }; disk?: { no: number | null }; genre?: string[] }; format: { duration?: number; bitrate?: number; sampleRate?: number } }> }
            const parsed = await mm.parseFile(filePath)
            metadata = {
              title: parsed.common.title,
              artist: parsed.common.artist,
              album: parsed.common.album,
              year: parsed.common.year,
              trackNumber: parsed.common.track?.no || undefined,
              discNumber: parsed.common.disk?.no || undefined,
              duration: parsed.format.duration ? Math.round(parsed.format.duration) : undefined,
              bitrate: parsed.format.bitrate ? Math.round(parsed.format.bitrate / 1000) : undefined,
              sampleRate: parsed.format.sampleRate,
              genre: parsed.common.genre?.[0],
            }
          } catch {
            // music-metadata not available or parse failed, use filename-based metadata
          }

          const finalTitle = metadata.title || trackTitle
          const finalArtistName = metadata.artist || artistName
          const finalAlbumName = metadata.album || 'Unknown Album'

          // Find or create artist
          let artist = await prisma.artist.findFirst({ where: { name: finalArtistName } })
          if (!artist) {
            artist = await prisma.artist.create({
              data: { name: finalArtistName },
            })
          }

          // Find or create album
          let album = await prisma.album.findFirst({
            where: { title: finalAlbumName, artistId: artist.id },
          })
          if (!album) {
            album = await prisma.album.create({
              data: {
                title: finalAlbumName,
                artistId: artist.id,
                year: metadata.year,
                genre: metadata.genre,
              },
            })
          }

          // Create track
          await prisma.track.create({
            data: {
              title: finalTitle,
              artistId: artist.id,
              albumId: album.id,
              trackNumber: metadata.trackNumber || 1,
              discNumber: metadata.discNumber || 1,
              duration: metadata.duration || 0,
              bitrate: metadata.bitrate || null,
              sampleRate: metadata.sampleRate || null,
              format: ext,
              size: stat.size,
              filePath,
              genre: metadata.genre || null,
              year: metadata.year || null,
            },
          })

          filesAdded++
        } catch (err) {
          const msg = `Error processing ${filePath}: ${err instanceof Error ? err.message : String(err)}`
          errors.push(msg)
          console.error(msg)
        }
      }
    }

    // Update album track counts and durations
    const albums = await prisma.album.findMany({
      include: { tracks: { select: { duration: true } } },
    })
    for (const album of albums) {
      await prisma.album.update({
        where: { id: album.id },
        data: {
          trackCount: album.tracks.length,
          duration: album.tracks.reduce((s, t) => s + t.duration, 0),
        },
      })
    }

    await prisma.scanLog.update({
      where: { id: scanLog.id },
      data: {
        status: 'completed',
        filesFound,
        filesAdded,
        errors: errors.length > 0 ? JSON.stringify(errors) : null,
        finishedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      data: { filesFound, filesAdded, errors: errors.length },
    })
  } catch (error) {
    console.error('Error scanning library:', error)
    return NextResponse.json({ success: false, error: 'Scan failed' }, { status: 500 })
  }
}
