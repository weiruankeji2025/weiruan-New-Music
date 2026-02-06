'use client'

import { useLibraryStore } from '@/store/libraryStore'
import TrackList from '@/components/library/TrackList'
import AlbumGrid from '@/components/library/AlbumGrid'
import ArtistGrid from '@/components/library/ArtistGrid'
import { SearchIcon } from '@/components/icons'

export default function SearchResults() {
  const { searchResults, searchQuery } = useLibraryStore()

  if (!searchResults) return null

  const hasResults =
    searchResults.tracks.length > 0 ||
    searchResults.albums.length > 0 ||
    searchResults.artists.length > 0 ||
    searchResults.playlists.length > 0

  if (!hasResults) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-surface-500">
        <SearchIcon size={48} className="mb-4 opacity-50" />
        <p className="text-lg">没有找到 &ldquo;{searchQuery}&rdquo; 的相关结果</p>
        <p className="text-sm mt-1">尝试使用其他关键词搜索</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-8">
      {searchResults.tracks.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-white px-4 mb-2">
            歌曲 <span className="text-sm text-surface-400 font-normal">({searchResults.tracks.length})</span>
          </h2>
          <TrackList tracks={searchResults.tracks} />
        </section>
      )}

      {searchResults.albums.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-white px-4 mb-2">
            专辑 <span className="text-sm text-surface-400 font-normal">({searchResults.albums.length})</span>
          </h2>
          <AlbumGrid albums={searchResults.albums} />
        </section>
      )}

      {searchResults.artists.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-white px-4 mb-2">
            艺术家 <span className="text-sm text-surface-400 font-normal">({searchResults.artists.length})</span>
          </h2>
          <ArtistGrid artists={searchResults.artists} />
        </section>
      )}
    </div>
  )
}
