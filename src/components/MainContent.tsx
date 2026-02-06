'use client'

import { useEffect } from 'react'
import { useLibraryStore } from '@/store/libraryStore'
import { useUIStore } from '@/store/uiStore'
import SearchBar from './SearchBar'
import SearchResults from './SearchResults'
import TrackList from './library/TrackList'
import AlbumGrid from './library/AlbumGrid'
import ArtistGrid from './library/ArtistGrid'
import PlaylistGrid from './library/PlaylistGrid'
import GenreView from './library/GenreView'
import AlbumDetail from './library/AlbumDetail'
import ArtistDetail from './library/ArtistDetail'
import PlaylistDetail from './library/PlaylistDetail'
import { GridIcon, ListIcon, MenuIcon, LoaderIcon } from './icons'

const tabLabels: Record<string, string> = {
  tracks: '歌曲',
  albums: '专辑',
  artists: '艺术家',
  playlists: '歌单',
  genres: '流派',
  favorites: '收藏',
  history: '最近播放',
}

export default function MainContent() {
  const {
    activeTab, viewMode, setViewMode,
    tracks, albums, artists, playlists, genres,
    favorites, history, loading, searchResults,
    selectedAlbum, selectedArtist, selectedPlaylist,
    fetchTracks,
  } = useLibraryStore()

  const { toggleSidebar } = useUIStore()

  useEffect(() => {
    fetchTracks()
  }, [fetchTracks])

  // Show detail views
  if (selectedAlbum) return <AlbumDetail />
  if (selectedArtist) return <ArtistDetail />
  if (selectedPlaylist) return <PlaylistDetail />

  // Show search results
  if (searchResults) return (
    <div className="flex flex-col h-full">
      <Header />
      <div className="flex-1 overflow-y-auto">
        <SearchResults />
      </div>
    </div>
  )

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <LoaderIcon size={32} className="text-primary-400 animate-spin" />
        </div>
      )
    }

    switch (activeTab) {
      case 'tracks':
        return <TrackList tracks={tracks} />
      case 'albums':
        return <AlbumGrid albums={albums} />
      case 'artists':
        return <ArtistGrid artists={artists} />
      case 'playlists':
        return <PlaylistGrid playlists={playlists} />
      case 'genres':
        return <GenreView />
      case 'favorites':
        return <TrackList tracks={favorites} />
      case 'history':
        return <TrackList tracks={history} />
      default:
        return <TrackList tracks={tracks} />
    }
  }

  return (
    <div className="flex flex-col h-full">
      <Header />
      <div className="flex-1 overflow-y-auto">{renderContent()}</div>
    </div>
  )
}

function Header() {
  const { activeTab, viewMode, setViewMode } = useLibraryStore()
  const { toggleSidebar } = useUIStore()

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-surface-800/50 bg-surface-950/50 backdrop-blur-lg sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="lg:hidden text-surface-400 hover:text-white"
        >
          <MenuIcon size={20} />
        </button>
        <h1 className="text-lg font-semibold text-white">{tabLabels[activeTab] || '音乐库'}</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-[260px]">
          <SearchBar />
        </div>
        <div className="flex items-center bg-surface-800/50 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-surface-700 text-white' : 'text-surface-400'}`}
          >
            <ListIcon size={16} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-surface-700 text-white' : 'text-surface-400'}`}
          >
            <GridIcon size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
