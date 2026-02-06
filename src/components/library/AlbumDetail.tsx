'use client'

import { useLibraryStore } from '@/store/libraryStore'
import { usePlayerStore } from '@/store/playerStore'
import { formatDuration } from '@/lib/utils'
import { ChevronLeftIcon, PlayIcon, ShuffleIcon, AlbumIcon } from '@/components/icons'
import TrackList from './TrackList'

export default function AlbumDetail() {
  const { selectedAlbum, clearSelection } = useLibraryStore()
  const { setQueue } = usePlayerStore()

  if (!selectedAlbum) return null

  const handlePlayAll = () => {
    if (selectedAlbum.tracks) {
      setQueue(selectedAlbum.tracks, 0)
    }
  }

  const handleShuffleAll = () => {
    if (selectedAlbum.tracks) {
      const randomIndex = Math.floor(Math.random() * selectedAlbum.tracks.length)
      setQueue(selectedAlbum.tracks, randomIndex)
    }
  }

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

      {/* Album Header */}
      <div className="flex gap-6 px-6 pb-6">
        <div className="w-48 h-48 rounded-xl overflow-hidden shadow-2xl flex-shrink-0 bg-surface-800">
          {selectedAlbum.coverUrl ? (
            <img src={selectedAlbum.coverUrl} alt={selectedAlbum.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-700 to-primary-900">
              <AlbumIcon size={64} className="text-white/40" />
            </div>
          )}
        </div>
        <div className="flex flex-col justify-end">
          <p className="text-xs text-surface-400 uppercase tracking-wider font-medium">专辑</p>
          <h1 className="text-3xl font-bold text-white mt-1">{selectedAlbum.title}</h1>
          <div className="flex items-center gap-2 mt-2 text-sm text-surface-300">
            <span className="font-medium">{selectedAlbum.artistName}</span>
            {selectedAlbum.year && <span>· {selectedAlbum.year}</span>}
            <span>· {selectedAlbum.trackCount} 首歌曲</span>
            <span>· {formatDuration(selectedAlbum.duration)}</span>
          </div>
          {selectedAlbum.genre && (
            <span className="mt-2 text-xs px-2 py-0.5 rounded-full bg-surface-800 text-surface-300 inline-block w-fit">
              {selectedAlbum.genre}
            </span>
          )}
          <div className="flex gap-3 mt-4">
            <button
              onClick={handlePlayAll}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary-500 text-white font-medium hover:bg-primary-400 transition-colors"
            >
              <PlayIcon size={18} />
              播放全部
            </button>
            <button
              onClick={handleShuffleAll}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-surface-800 text-white font-medium hover:bg-surface-700 transition-colors"
            >
              <ShuffleIcon size={18} />
              随机播放
            </button>
          </div>
        </div>
      </div>

      {/* Track List */}
      <div className="flex-1 overflow-y-auto">
        {selectedAlbum.tracks && (
          <TrackList tracks={selectedAlbum.tracks} showAlbum={false} showIndex={true} />
        )}
      </div>
    </div>
  )
}
