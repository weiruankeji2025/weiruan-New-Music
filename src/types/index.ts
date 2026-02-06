// ============ Core Data Types ============

export interface TrackInfo {
  id: string
  title: string
  artistId: string
  artistName: string
  albumId: string
  albumTitle: string
  trackNumber: number
  discNumber: number
  duration: number
  bitrate: number | null
  sampleRate: number | null
  format: string | null
  size: number
  filePath: string
  genre: string | null
  year: number | null
  lyrics: string | null
  lyricsType: string | null
  playCount: number
  rating: number
  coverUrl: string | null
  isFavorite?: boolean
}

export interface AlbumInfo {
  id: string
  title: string
  artistId: string
  artistName: string
  year: number | null
  genre: string | null
  coverUrl: string | null
  discCount: number
  trackCount: number
  duration: number
  tracks?: TrackInfo[]
}

export interface ArtistInfo {
  id: string
  name: string
  bio: string | null
  imageUrl: string | null
  albumCount: number
  trackCount: number
  albums?: AlbumInfo[]
}

export interface PlaylistInfo {
  id: string
  name: string
  description: string | null
  coverUrl: string | null
  userId: string
  isPublic: boolean
  isSmart: boolean
  trackCount: number
  duration: number
  createdAt: string
  updatedAt: string
  tracks?: TrackInfo[]
}

// ============ Player Types ============

export type RepeatMode = 'off' | 'all' | 'one'
export type PlaybackStatus = 'playing' | 'paused' | 'stopped' | 'loading'

export interface QueueItem {
  id: string
  track: TrackInfo
  source: string
}

export interface PlayerState {
  currentTrack: TrackInfo | null
  queue: QueueItem[]
  queueIndex: number
  status: PlaybackStatus
  currentTime: number
  duration: number
  volume: number
  muted: boolean
  shuffle: boolean
  repeat: RepeatMode
}

// ============ Equalizer Types ============

export interface EqualizerBand {
  frequency: number
  gain: number
}

export interface EqualizerPreset {
  name: string
  label: string
  bands: EqualizerBand[]
}

// ============ Lyrics Types ============

export interface LyricLine {
  time: number
  text: string
  translation?: string
}

// ============ API Types ============

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface SearchResults {
  tracks: TrackInfo[]
  albums: AlbumInfo[]
  artists: ArtistInfo[]
  playlists: PlaylistInfo[]
}

export interface LibraryStats {
  totalTracks: number
  totalAlbums: number
  totalArtists: number
  totalPlaylists: number
  totalDuration: number
  totalSize: number
}

export interface ScanStatus {
  scanning: boolean
  progress: number
  currentFile?: string
  filesFound: number
  filesAdded: number
  errors: string[]
}

// ============ Settings Types ============

export interface UserSettingsData {
  theme: 'light' | 'dark' | 'system'
  language: string
  audioQuality: 'low' | 'medium' | 'high' | 'lossless'
  crossfade: number
  replayGain: boolean
  equalizerPreset: string
  equalizerBands: EqualizerBand[]
  lyricsEnabled: boolean
  gaplessPlayback: boolean
  musicFolders: string[]
}

// ============ Sort / Filter Types ============

export type SortField = 'title' | 'artist' | 'album' | 'year' | 'duration' | 'dateAdded' | 'playCount' | 'rating'
export type SortOrder = 'asc' | 'desc'

export interface SortOption {
  field: SortField
  order: SortOrder
}

export interface FilterOptions {
  genre?: string
  year?: number
  artist?: string
  album?: string
  rating?: number
  format?: string
}
