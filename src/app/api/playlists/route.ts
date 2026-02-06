import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/playlists - List all playlists
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '50')
    const userId = searchParams.get('userId')

    const where: Record<string, unknown> = {}
    if (userId) where.userId = userId

    const [playlists, total] = await Promise.all([
      prisma.playlist.findMany({
        where,
        include: {
          _count: { select: { tracks: true } },
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.playlist.count({ where }),
    ])

    const data = playlists.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      coverUrl: p.coverUrl,
      userId: p.userId,
      isPublic: p.isPublic,
      isSmart: p.isSmart,
      trackCount: p._count.tracks,
      duration: p.duration,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
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
    console.error('Error fetching playlists:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch playlists' }, { status: 500 })
  }
}

// POST /api/playlists - Create a new playlist
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, isPublic, isSmart, smartRules, userId } = body

    if (!name || !userId) {
      return NextResponse.json({ success: false, error: 'Name and userId are required' }, { status: 400 })
    }

    const playlist = await prisma.playlist.create({
      data: {
        name,
        description: description || null,
        isPublic: isPublic || false,
        isSmart: isSmart || false,
        smartRules: smartRules ? JSON.stringify(smartRules) : null,
        userId,
      },
    })

    return NextResponse.json({ success: true, data: playlist }, { status: 201 })
  } catch (error) {
    console.error('Error creating playlist:', error)
    return NextResponse.json({ success: false, error: 'Failed to create playlist' }, { status: 500 })
  }
}
