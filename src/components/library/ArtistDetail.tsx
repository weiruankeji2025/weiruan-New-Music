'use client'

import { useLibraryStore } from '@/store/libraryStore'
import { ChevronLeftIcon, ArtistIcon, PlayIcon } from '@/components/icons'
import AlbumGrid from './AlbumGrid'

export default function ArtistDetail() {
  const { selectedArtist, clearSelection } = useLibraryStore()

  if (!selectedArtist) return null

  return (
    <div className="flex flex-col h-full">
      {/* Back Button */}
      <button
        onClick={clearSelection}
        className="flex items-center gap-1 text-surface-400 hover:text-white px-4 py-2 transition-colors"
      >
        <ChevronLeftIcon size={18} />
        <span className="text-sm">返回</span>
      </button>

      {/* Artist Header */}
      <div className="flex items-end gap-6 px-6 pb-6">
        <div className="w-40 h-40 rounded-full overflow-hidden shadow-2xl flex-shrink-0 bg-surface-800">
          {selectedArtist.imageUrl ? (
            <img src={selectedArtist.imageUrl} alt={selectedArtist.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-700 to-surface-800">
              <ArtistIcon size={60} className="text-surface-500" />
            </div>
          )}
        </div>
        <div className="flex flex-col justify-end">
          <p className="text-xs text-surface-400 uppercase tracking-wider font-medium">艺术家</p>
          <h1 className="text-3xl font-bold text-white mt-1">{selectedArtist.name}</h1>
          <div className="flex items-center gap-2 mt-2 text-sm text-surface-300">
            <span>{selectedArtist.albumCount} 张专辑</span>
            <span>· {selectedArtist.trackCount} 首歌曲</span>
          </div>
          {selectedArtist.bio && (
            <p className="mt-3 text-sm text-surface-400 max-w-lg line-clamp-3">{selectedArtist.bio}</p>
          )}
        </div>
      </div>

      {/* Albums */}
      <div className="flex-1 overflow-y-auto">
        <h2 className="text-lg font-semibold text-white px-6 mb-2">专辑</h2>
        {selectedArtist.albums && <AlbumGrid albums={selectedArtist.albums} />}
      </div>
    </div>
  )
}
