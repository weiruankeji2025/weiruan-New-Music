'use client'

import { useLibraryStore } from '@/store/libraryStore'
import { ArtistIcon } from '@/components/icons'
import type { ArtistInfo } from '@/types'

interface ArtistGridProps {
  artists: ArtistInfo[]
}

export default function ArtistGrid({ artists }: ArtistGridProps) {
  const { fetchArtistDetail } = useLibraryStore()

  if (artists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-surface-500">
        <ArtistIcon size={48} className="mb-4 opacity-50" />
        <p className="text-lg">没有找到艺术家</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
      {artists.map((artist) => (
        <div
          key={artist.id}
          className="group cursor-pointer rounded-lg overflow-hidden bg-surface-800/30 hover:bg-surface-800/60 transition-all duration-200 p-3 text-center"
          onClick={() => fetchArtistDetail(artist.id)}
        >
          <div className="aspect-square rounded-full overflow-hidden mb-3 mx-auto bg-surface-800 w-[80%]">
            {artist.imageUrl ? (
              <img src={artist.imageUrl} alt={artist.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-700 to-surface-800">
                <ArtistIcon size={40} className="text-surface-500" />
              </div>
            )}
          </div>
          <h3 className="text-sm font-medium text-white truncate">{artist.name}</h3>
          <p className="text-xs text-surface-400 mt-0.5">
            {artist.albumCount} 张专辑 · {artist.trackCount} 首歌曲
          </p>
        </div>
      ))}
    </div>
  )
}
