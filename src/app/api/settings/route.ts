import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

const DEFAULT_USER_ID = 'default-user'

// GET /api/settings - Get user settings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || DEFAULT_USER_ID

    let settings = await prisma.userSettings.findUnique({
      where: { userId },
    })

    if (!settings) {
      // Ensure user exists
      let user = await prisma.user.findUnique({ where: { id: userId } })
      if (!user) {
        user = await prisma.user.create({
          data: {
            id: userId,
            username: 'default',
            displayName: '默认用户',
            password: '',
          },
        })
      }

      settings = await prisma.userSettings.create({
        data: { userId },
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        theme: settings.theme,
        language: settings.language,
        audioQuality: settings.audioQuality,
        crossfade: settings.crossfade,
        replayGain: settings.replayGain,
        equalizerPreset: settings.equalizerPreset,
        equalizerBands: JSON.parse(settings.equalizerBands),
        lyricsEnabled: settings.lyricsEnabled,
        gaplessPlayback: settings.gaplessPlayback,
        musicFolders: JSON.parse(settings.musicFolders),
      },
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 })
  }
}

// PATCH /api/settings - Update user settings
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, ...updates } = body
    const uid = userId || DEFAULT_USER_ID

    const data: Record<string, unknown> = {}
    if (updates.theme !== undefined) data.theme = updates.theme
    if (updates.language !== undefined) data.language = updates.language
    if (updates.audioQuality !== undefined) data.audioQuality = updates.audioQuality
    if (updates.crossfade !== undefined) data.crossfade = updates.crossfade
    if (updates.replayGain !== undefined) data.replayGain = updates.replayGain
    if (updates.equalizerPreset !== undefined) data.equalizerPreset = updates.equalizerPreset
    if (updates.equalizerBands !== undefined) data.equalizerBands = JSON.stringify(updates.equalizerBands)
    if (updates.lyricsEnabled !== undefined) data.lyricsEnabled = updates.lyricsEnabled
    if (updates.gaplessPlayback !== undefined) data.gaplessPlayback = updates.gaplessPlayback
    if (updates.musicFolders !== undefined) data.musicFolders = JSON.stringify(updates.musicFolders)

    const settings = await prisma.userSettings.upsert({
      where: { userId: uid },
      update: data,
      create: { userId: uid, ...data },
    })

    return NextResponse.json({ success: true, data: settings })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ success: false, error: 'Failed to update settings' }, { status: 500 })
  }
}
