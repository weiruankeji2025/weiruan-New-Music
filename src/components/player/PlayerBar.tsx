'use client'

import { usePlayerStore } from '@/store/playerStore'
import { useUIStore } from '@/store/uiStore'
import { formatDuration } from '@/lib/utils'
import {
  PlayIcon, PauseIcon, SkipForwardIcon, SkipBackIcon,
  ShuffleIcon, RepeatIcon, Repeat1Icon,
  VolumeIcon, VolumeHighIcon, VolumeMuteIcon,
  HeartIcon, QueueIcon, LyricsIcon, LoaderIcon,
} from '@/components/icons'

export default function PlayerBar() {
  const {
    currentTrack, status, currentTime, duration,
    volume, muted, shuffle, repeat,
    play, pause, resume, next, previous, seek,
    setVolume, toggleMute, toggleShuffle, cycleRepeat,
  } = usePlayerStore()

  const { toggleQueue, toggleLyrics, toggleNowPlaying } = useUIStore()

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    seek(pct * duration)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value))
  }

  const VolumeIconComponent = muted || volume === 0
    ? VolumeMuteIcon
    : volume > 0.5
      ? VolumeHighIcon
      : VolumeIcon

  if (!currentTrack) {
    return (
      <div className="h-20 bg-surface-900/95 dark:bg-surface-950/95 backdrop-blur-xl border-t border-surface-800/50 flex items-center justify-center px-4">
        <p className="text-surface-500 text-sm">没有正在播放的歌曲</p>
      </div>
    )
  }

  return (
    <div className="h-20 bg-surface-900/95 dark:bg-surface-950/95 backdrop-blur-xl border-t border-surface-800/50 flex items-center px-4 gap-4 relative z-50">
      {/* Track Info */}
      <div
        className="flex items-center gap-3 w-[280px] min-w-[200px] cursor-pointer"
        onClick={toggleNowPlaying}
      >
        <div className="w-12 h-12 rounded-lg bg-surface-800 overflow-hidden flex-shrink-0">
          {currentTrack.coverUrl ? (
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
              </svg>
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-white text-sm font-medium truncate">{currentTrack.title}</p>
          <p className="text-surface-400 text-xs truncate">{currentTrack.artistName}</p>
        </div>
        <button
          className="ml-1 text-surface-400 hover:text-red-400 transition-colors flex-shrink-0"
          onClick={(e) => { e.stopPropagation() }}
        >
          <HeartIcon size={18} filled={currentTrack.isFavorite} />
        </button>
      </div>

      {/* Center Controls */}
      <div className="flex-1 flex flex-col items-center gap-1 max-w-[600px]">
        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleShuffle}
            className={`p-1.5 rounded-full transition-colors ${
              shuffle ? 'text-primary-400' : 'text-surface-400 hover:text-white'
            }`}
          >
            <ShuffleIcon size={16} />
          </button>
          <button
            onClick={previous}
            className="p-1.5 text-surface-300 hover:text-white transition-colors"
          >
            <SkipBackIcon size={20} />
          </button>
          <button
            onClick={() => {
              if (status === 'playing') pause()
              else if (status === 'paused') resume()
              else play()
            }}
            className="w-10 h-10 rounded-full bg-white text-surface-900 flex items-center justify-center hover:scale-105 transition-transform"
          >
            {status === 'loading' ? (
              <LoaderIcon size={20} />
            ) : status === 'playing' ? (
              <PauseIcon size={20} />
            ) : (
              <PlayIcon size={20} />
            )}
          </button>
          <button
            onClick={next}
            className="p-1.5 text-surface-300 hover:text-white transition-colors"
          >
            <SkipForwardIcon size={20} />
          </button>
          <button
            onClick={cycleRepeat}
            className={`p-1.5 rounded-full transition-colors ${
              repeat !== 'off' ? 'text-primary-400' : 'text-surface-400 hover:text-white'
            }`}
          >
            {repeat === 'one' ? <Repeat1Icon size={16} /> : <RepeatIcon size={16} />}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2 w-full">
          <span className="text-[11px] text-surface-400 w-10 text-right tabular-nums">
            {formatDuration(currentTime)}
          </span>
          <div
            className="flex-1 h-1 bg-surface-700 rounded-full cursor-pointer group relative"
            onClick={handleProgressClick}
          >
            <div
              className="h-full bg-white rounded-full relative group-hover:bg-primary-400 transition-colors"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" />
            </div>
          </div>
          <span className="text-[11px] text-surface-400 w-10 tabular-nums">
            {formatDuration(duration)}
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 w-[280px] min-w-[180px] justify-end">
        <button
          onClick={toggleLyrics}
          className="p-2 text-surface-400 hover:text-white transition-colors"
        >
          <LyricsIcon size={18} />
        </button>
        <button
          onClick={toggleQueue}
          className="p-2 text-surface-400 hover:text-white transition-colors"
        >
          <QueueIcon size={18} />
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleMute}
            className="p-2 text-surface-400 hover:text-white transition-colors"
          >
            <VolumeIconComponent size={18} />
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={muted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-20 h-1 accent-white appearance-none bg-surface-700 rounded-full cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer"
          />
        </div>
      </div>
    </div>
  )
}
