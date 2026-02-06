'use client'

import { useLibraryStore } from '@/store/libraryStore'
import { AlbumIcon, PlayIcon } from '@/components/icons'
import { usePlayerStore } from '@/store/playerStore'
import type { AlbumInfo } from '@/types'

interface AlbumGridProps {
  albums: AlbumInfo[]
}

export default function AlbumGrid({ albums }: AlbumGridProps) {
  const { fetchAlbumDetail } = useLibraryStore()

  if (albums.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-surface-500">
        <AlbumIcon size={48} className="mb-4 opacity-50" />
        <p className="text-lg">没有找到专辑</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
      {albums.map((album) => (
        <AlbumCard key={album.id} album={album} onClick={() => fetchAlbumDetail(album.id)} />
      ))}
    </div>
  )
}

function AlbumCard({ album, onClick }: { album: AlbumInfo; onClick: () => void }) {
  return (
    <div
      className="group cursor-pointer rounded-lg overflow-hidden bg-surface-800/30 hover:bg-surface-800/60 transition-all duration-200 p-3"
      onClick={onClick}
    >
      <div className="relative aspect-square rounded-md overflow-hidden mb-3 bg-surface-800">
        {album.coverUrl ? (
          <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-800/50 to-primary-900/50">
            <AlbumIcon size={40} className="text-surface-500" />
          </div>
        )}
        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            className="w-12 h-12 rounded-full bg-primary-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
            onClick={(e) => {
              e.stopPropagation()
              // Play album tracks
            }}
          >
            <PlayIcon size={20} />
          </button>
        </div>
      </div>
      <h3 className="text-sm font-medium text-white truncate">{album.title}</h3>
      <p className="text-xs text-surface-400 truncate mt-0.5">
        {album.artistName} {album.year ? `· ${album.year}` : ''}
      </p>
      <p className="text-xs text-surface-500 mt-0.5">
        {album.trackCount} 首歌曲
      </p>
    </div>
  )
}
