import { create } from 'zustand'
import type {
  TrackInfo,
  AlbumInfo,
  ArtistInfo,
  PlaylistInfo,
  LibraryStats,
  SearchResults,
  SortOption,
} from '@/types'

type ViewMode = 'grid' | 'list'
type LibraryTab = 'tracks' | 'albums' | 'artists' | 'playlists' | 'genres' | 'favorites' | 'history'

interface LibraryStore {
  // View state
  activeTab: LibraryTab
  viewMode: ViewMode
  sort: SortOption
  searchQuery: string

  // Data
  tracks: TrackInfo[]
  albums: AlbumInfo[]
  artists: ArtistInfo[]
  playlists: PlaylistInfo[]
  genres: { name: string; count: number }[]
  favorites: TrackInfo[]
  history: TrackInfo[]
  stats: LibraryStats | null
  searchResults: SearchResults | null

  // Loading states
  loading: boolean
  scanning: boolean

  // Selected items
  selectedAlbum: AlbumInfo | null
  selectedArtist: ArtistInfo | null
  selectedPlaylist: PlaylistInfo | null

  // Actions
  setActiveTab: (tab: LibraryTab) => void
  setViewMode: (mode: ViewMode) => void
  setSort: (sort: SortOption) => void
  setSearchQuery: (query: string) => void

  fetchTracks: (params?: Record<string, string>) => Promise<void>
  fetchAlbums: (params?: Record<string, string>) => Promise<void>
  fetchArtists: (params?: Record<string, string>) => Promise<void>
  fetchPlaylists: () => Promise<void>
  fetchGenres: () => Promise<void>
  fetchFavorites: () => Promise<void>
  fetchHistory: () => Promise<void>
  fetchStats: () => Promise<void>
  search: (query: string) => Promise<void>

  fetchAlbumDetail: (id: string) => Promise<void>
  fetchArtistDetail: (id: string) => Promise<void>
  fetchPlaylistDetail: (id: string) => Promise<void>

  createPlaylist: (name: string, description?: string) => Promise<PlaylistInfo | null>
  deletePlaylist: (id: string) => Promise<void>
  toggleFavorite: (trackId: string) => Promise<boolean>
  scanLibrary: (folders: string[]) => Promise<void>

  clearSelection: () => void
}

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options)
  const json = await res.json()
  if (!json.success) throw new Error(json.error || 'API error')
  return json.data
}

export const useLibraryStore = create<LibraryStore>((set, get) => ({
  activeTab: 'tracks',
  viewMode: 'list',
  sort: { field: 'title', order: 'asc' },
  searchQuery: '',

  tracks: [],
  albums: [],
  artists: [],
  playlists: [],
  genres: [],
  favorites: [],
  history: [],
  stats: null,
  searchResults: null,

  loading: false,
  scanning: false,

  selectedAlbum: null,
  selectedArtist: null,
  selectedPlaylist: null,

  setActiveTab: (tab) => {
    set({ activeTab: tab, searchResults: null })
    // Auto-fetch data for the tab
    const store = get()
    switch (tab) {
      case 'tracks': store.fetchTracks(); break
      case 'albums': store.fetchAlbums(); break
      case 'artists': store.fetchArtists(); break
      case 'playlists': store.fetchPlaylists(); break
      case 'genres': store.fetchGenres(); break
      case 'favorites': store.fetchFavorites(); break
      case 'history': store.fetchHistory(); break
    }
  },
  setViewMode: (mode) => set({ viewMode: mode }),
  setSort: (sort) => set({ sort }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  fetchTracks: async (params) => {
    set({ loading: true })
    try {
      const { sort } = get()
      const searchParams = new URLSearchParams({
        sort: sort.field,
        order: sort.order,
        pageSize: '200',
        ...params,
      })
      const res = await fetch(`/api/tracks?${searchParams}`)
      const json = await res.json()
      if (json.success) set({ tracks: json.data })
    } catch (err) {
      console.error('Failed to fetch tracks:', err)
    } finally {
      set({ loading: false })
    }
  },

  fetchAlbums: async (params) => {
    set({ loading: true })
    try {
      const searchParams = new URLSearchParams({ pageSize: '200', ...params })
      const res = await fetch(`/api/albums?${searchParams}`)
      const json = await res.json()
      if (json.success) set({ albums: json.data })
    } catch (err) {
      console.error('Failed to fetch albums:', err)
    } finally {
      set({ loading: false })
    }
  },

  fetchArtists: async (params) => {
    set({ loading: true })
    try {
      const searchParams = new URLSearchParams({ pageSize: '200', ...params })
      const res = await fetch(`/api/artists?${searchParams}`)
      const json = await res.json()
      if (json.success) set({ artists: json.data })
    } catch (err) {
      console.error('Failed to fetch artists:', err)
    } finally {
      set({ loading: false })
    }
  },

  fetchPlaylists: async () => {
    set({ loading: true })
    try {
      const res = await fetch('/api/playlists')
      const json = await res.json()
      if (json.success) set({ playlists: json.data })
    } catch (err) {
      console.error('Failed to fetch playlists:', err)
    } finally {
      set({ loading: false })
    }
  },

  fetchGenres: async () => {
    set({ loading: true })
    try {
      const res = await fetch('/api/library/genres')
      const json = await res.json()
      if (json.success) set({ genres: json.data })
    } catch (err) {
      console.error('Failed to fetch genres:', err)
    } finally {
      set({ loading: false })
    }
  },

  fetchFavorites: async () => {
    set({ loading: true })
    try {
      const res = await fetch('/api/favorites')
      const json = await res.json()
      if (json.success) set({ favorites: json.data })
    } catch (err) {
      console.error('Failed to fetch favorites:', err)
    } finally {
      set({ loading: false })
    }
  },

  fetchHistory: async () => {
    set({ loading: true })
    try {
      const res = await fetch('/api/history')
      const json = await res.json()
      if (json.success) set({ history: json.data })
    } catch (err) {
      console.error('Failed to fetch history:', err)
    } finally {
      set({ loading: false })
    }
  },

  fetchStats: async () => {
    try {
      const data = await apiFetch<LibraryStats>('/api/library/stats')
      set({ stats: data })
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  },

  search: async (query) => {
    if (!query.trim()) {
      set({ searchResults: null })
      return
    }
    set({ loading: true })
    try {
      const data = await apiFetch<SearchResults>(`/api/search?q=${encodeURIComponent(query)}`)
      set({ searchResults: data })
    } catch (err) {
      console.error('Search failed:', err)
    } finally {
      set({ loading: false })
    }
  },

  fetchAlbumDetail: async (id) => {
    set({ loading: true })
    try {
      const data = await apiFetch<AlbumInfo>(`/api/albums/${id}`)
      set({ selectedAlbum: data })
    } catch (err) {
      console.error('Failed to fetch album:', err)
    } finally {
      set({ loading: false })
    }
  },

  fetchArtistDetail: async (id) => {
    set({ loading: true })
    try {
      const data = await apiFetch<ArtistInfo>(`/api/artists/${id}`)
      set({ selectedArtist: data })
    } catch (err) {
      console.error('Failed to fetch artist:', err)
    } finally {
      set({ loading: false })
    }
  },

  fetchPlaylistDetail: async (id) => {
    set({ loading: true })
    try {
      const data = await apiFetch<PlaylistInfo>(`/api/playlists/${id}`)
      set({ selectedPlaylist: data })
    } catch (err) {
      console.error('Failed to fetch playlist:', err)
    } finally {
      set({ loading: false })
    }
  },

  createPlaylist: async (name, description) => {
    try {
      const data = await apiFetch<PlaylistInfo>('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, userId: 'default-user' }),
      })
      get().fetchPlaylists()
      return data
    } catch (err) {
      console.error('Failed to create playlist:', err)
      return null
    }
  },

  deletePlaylist: async (id) => {
    try {
      await fetch(`/api/playlists/${id}`, { method: 'DELETE' })
      get().fetchPlaylists()
    } catch (err) {
      console.error('Failed to delete playlist:', err)
    }
  },

  toggleFavorite: async (trackId) => {
    try {
      const data = await apiFetch<{ isFavorite: boolean }>('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId }),
      })
      return data.isFavorite
    } catch (err) {
      console.error('Failed to toggle favorite:', err)
      return false
    }
  },

  scanLibrary: async (folders) => {
    set({ scanning: true })
    try {
      await apiFetch('/api/library/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folders }),
      })
      // Refresh data after scan
      get().fetchTracks()
      get().fetchAlbums()
      get().fetchArtists()
      get().fetchStats()
    } catch (err) {
      console.error('Scan failed:', err)
    } finally {
      set({ scanning: false })
    }
  },

  clearSelection: () => set({
    selectedAlbum: null,
    selectedArtist: null,
    selectedPlaylist: null,
  }),
}))
