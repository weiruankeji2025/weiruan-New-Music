'use client'

import { useLibraryStore } from '@/store/libraryStore'
import { useUIStore } from '@/store/uiStore'
import { PlaylistIcon, PlusIcon, PlayIcon } from '@/components/icons'
import { formatDuration } from '@/lib/utils'
import type { PlaylistInfo } from '@/types'

interface PlaylistGridProps {
  playlists: PlaylistInfo[]
}

export default function PlaylistGrid({ playlists }: PlaylistGridProps) {
  const { fetchPlaylistDetail } = useLibraryStore()
  const { setShowCreatePlaylist } = useUIStore()

  return (
    <div className="p-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {/* Create New Playlist Card */}
        <div
          className="cursor-pointer rounded-lg overflow-hidden bg-surface-800/30 hover:bg-surface-800/60 transition-all duration-200 p-3 border-2 border-dashed border-surface-700 hover:border-primary-500"
          onClick={() => setShowCreatePlaylist(true)}
        >
          <div className="aspect-square rounded-md flex items-center justify-center mb-3 bg-surface-800/50">
            <PlusIcon size={48} className="text-surface-500" />
          </div>
          <h3 className="text-sm font-medium text-surface-400 truncate text-center">新建歌单</h3>
        </div>

        {playlists.map((playlist) => (
          <div
            key={playlist.id}
            className="group cursor-pointer rounded-lg overflow-hidden bg-surface-800/30 hover:bg-surface-800/60 transition-all duration-200 p-3"
            onClick={() => fetchPlaylistDetail(playlist.id)}
          >
            <div className="relative aspect-square rounded-md overflow-hidden mb-3 bg-surface-800">
              {playlist.coverUrl ? (
                <img src={playlist.coverUrl} alt={playlist.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-800/30 to-primary-900/30">
                  <PlaylistIcon size={40} className="text-surface-500" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button className="w-12 h-12 rounded-full bg-primary-500 text-white flex items-center justify-center shadow-lg">
                  <PlayIcon size={20} />
                </button>
              </div>
            </div>
            <h3 className="text-sm font-medium text-white truncate">{playlist.name}</h3>
            <p className="text-xs text-surface-400 truncate mt-0.5">
              {playlist.trackCount} 首歌曲 · {formatDuration(playlist.duration)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
