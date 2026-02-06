'use client'

import { useLibraryStore } from '@/store/libraryStore'
import { usePlayerStore } from '@/store/playerStore'
import { formatDuration, formatDate } from '@/lib/utils'
import { ChevronLeftIcon, PlayIcon, ShuffleIcon, PlaylistIcon, TrashIcon } from '@/components/icons'
import TrackList from './TrackList'

export default function PlaylistDetail() {
  const { selectedPlaylist, clearSelection, deletePlaylist } = useLibraryStore()
  const { setQueue } = usePlayerStore()

  if (!selectedPlaylist) return null

  const handlePlayAll = () => {
    if (selectedPlaylist.tracks) {
      setQueue(selectedPlaylist.tracks, 0)
    }
  }

  const handleShuffleAll = () => {
    if (selectedPlaylist.tracks) {
      const randomIndex = Math.floor(Math.random() * selectedPlaylist.tracks.length)
      setQueue(selectedPlaylist.tracks, randomIndex)
    }
  }

  const handleDelete = async () => {
    if (confirm('确定要删除这个歌单吗？')) {
      await deletePlaylist(selectedPlaylist.id)
      clearSelection()
    }
  }

  return (
    <div className="flex flex-col h-full">
      <button
        onClick={clearSelection}
        className="flex items-center gap-1 text-surface-400 hover:text-white px-4 py-2 transition-colors"
      >
        <ChevronLeftIcon size={18} />
        <span className="text-sm">返回</span>
      </button>

      {/* Playlist Header */}
      <div className="flex gap-6 px-6 pb-6">
        <div className="w-48 h-48 rounded-xl overflow-hidden shadow-2xl flex-shrink-0 bg-surface-800">
          {selectedPlaylist.coverUrl ? (
            <img src={selectedPlaylist.coverUrl} alt={selectedPlaylist.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-800/30 to-primary-900/50">
              <PlaylistIcon size={64} className="text-surface-500" />
            </div>
          )}
        </div>
        <div className="flex flex-col justify-end">
          <p className="text-xs text-surface-400 uppercase tracking-wider font-medium">歌单</p>
          <h1 className="text-3xl font-bold text-white mt-1">{selectedPlaylist.name}</h1>
          {selectedPlaylist.description && (
            <p className="text-sm text-surface-400 mt-1">{selectedPlaylist.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2 text-sm text-surface-300">
            <span>{selectedPlaylist.trackCount} 首歌曲</span>
            <span>· {formatDuration(selectedPlaylist.duration)}</span>
            <span>· 创建于 {formatDate(selectedPlaylist.createdAt)}</span>
          </div>
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
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-surface-800 text-red-400 font-medium hover:bg-surface-700 transition-colors"
            >
              <TrashIcon size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {selectedPlaylist.tracks && <TrackList tracks={selectedPlaylist.tracks} />}
      </div>
    </div>
  )
}
