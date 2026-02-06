'use client'

import { usePlayerStore } from '@/store/playerStore'
import { useUIStore } from '@/store/uiStore'
import { formatDuration } from '@/lib/utils'
import {
  PlayIcon, PauseIcon, SkipForwardIcon, SkipBackIcon,
  ShuffleIcon, RepeatIcon, Repeat1Icon,
  HeartIcon, XIcon, ChevronLeftIcon, LoaderIcon,
} from '@/components/icons'

export default function NowPlaying() {
  const {
    currentTrack, status, currentTime, duration,
    shuffle, repeat,
    pause, resume, play, next, previous, seek,
    toggleShuffle, cycleRepeat,
  } = usePlayerStore()

  const { showNowPlaying, toggleNowPlaying } = useUIStore()

  if (!showNowPlaying || !currentTrack) return null

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    seek(pct * duration)
  }

  return (
    <div className="fixed inset-0 z-[100] bg-surface-950 animate-slide-up flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <button onClick={toggleNowPlaying} className="text-surface-400 hover:text-white">
          <ChevronLeftIcon size={24} />
        </button>
        <div className="text-center">
          <p className="text-xs text-surface-400 uppercase tracking-wider">正在播放</p>
          <p className="text-sm text-surface-300">{currentTrack.albumTitle}</p>
        </div>
        <button onClick={toggleNowPlaying} className="text-surface-400 hover:text-white">
          <XIcon size={24} />
        </button>
      </div>

      {/* Cover Art */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-[400px] aspect-square rounded-2xl overflow-hidden shadow-2xl">
          {currentTrack.coverUrl ? (
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" opacity="0.6">
                <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Track Info & Controls */}
      <div className="px-8 pb-8 max-w-[500px] mx-auto w-full">
        {/* Track Title */}
        <div className="flex items-center justify-between mb-6">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-white truncate">{currentTrack.title}</h2>
            <p className="text-surface-400 truncate">{currentTrack.artistName}</p>
          </div>
          <button className="ml-3 text-surface-400 hover:text-red-400 transition-colors">
            <HeartIcon size={24} filled={currentTrack.isFavorite} />
          </button>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div
            className="h-1.5 bg-surface-700 rounded-full cursor-pointer group"
            onClick={handleProgressClick}
          >
            <div
              className="h-full bg-white rounded-full relative group-hover:bg-primary-400 transition-colors"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-lg" />
            </div>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-surface-400 tabular-nums">{formatDuration(currentTime)}</span>
            <span className="text-xs text-surface-400 tabular-nums">{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-between">
          <button
            onClick={toggleShuffle}
            className={`p-2 ${shuffle ? 'text-primary-400' : 'text-surface-400 hover:text-white'}`}
          >
            <ShuffleIcon size={20} />
          </button>
          <button onClick={previous} className="p-2 text-white hover:text-primary-300">
            <SkipBackIcon size={28} />
          </button>
          <button
            onClick={() => {
              if (status === 'playing') pause()
              else if (status === 'paused') resume()
              else play()
            }}
            className="w-16 h-16 rounded-full bg-white text-surface-900 flex items-center justify-center hover:scale-105 transition-transform"
          >
            {status === 'loading' ? (
              <LoaderIcon size={28} />
            ) : status === 'playing' ? (
              <PauseIcon size={28} />
            ) : (
              <PlayIcon size={28} />
            )}
          </button>
          <button onClick={next} className="p-2 text-white hover:text-primary-300">
            <SkipForwardIcon size={28} />
          </button>
          <button
            onClick={cycleRepeat}
            className={`p-2 ${repeat !== 'off' ? 'text-primary-400' : 'text-surface-400 hover:text-white'}`}
          >
            {repeat === 'one' ? <Repeat1Icon size={20} /> : <RepeatIcon size={20} />}
          </button>
        </div>
      </div>
    </div>
  )
}
