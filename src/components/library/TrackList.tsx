'use client'

import { usePlayerStore } from '@/store/playerStore'
import { useLibraryStore } from '@/store/libraryStore'
import { formatDuration } from '@/lib/utils'
import { PlayIcon, HeartIcon, MoreIcon, MusicIcon } from '@/components/icons'
import type { TrackInfo } from '@/types'

interface TrackListProps {
  tracks: TrackInfo[]
  showAlbum?: boolean
  showIndex?: boolean
}

export default function TrackList({ tracks, showAlbum = true, showIndex = false }: TrackListProps) {
  const { currentTrack, status, setQueue } = usePlayerStore()
  const { toggleFavorite } = useLibraryStore()

  const handlePlay = (index: number) => {
    setQueue(tracks, index)
  }

  const handleFavorite = async (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation()
    await toggleFavorite(trackId)
  }

  if (tracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-surface-500">
        <MusicIcon size={48} className="mb-4 opacity-50" />
        <p className="text-lg">没有找到歌曲</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-2 text-xs font-medium text-surface-400 uppercase tracking-wider border-b border-surface-800/50">
        <div className="w-8 text-center">#</div>
        <div className="flex-1">标题</div>
        {showAlbum && <div className="w-[200px] hidden lg:block">专辑</div>}
        <div className="w-[80px] hidden md:block">格式</div>
        <div className="w-[60px] text-right">时长</div>
        <div className="w-16" />
      </div>

      {/* Track Rows */}
      <div>
        {tracks.map((track, index) => {
          const isPlaying = currentTrack?.id === track.id
          return (
            <div
              key={track.id}
              className={`flex items-center gap-4 px-4 py-2.5 group cursor-pointer transition-colors ${
                isPlaying
                  ? 'bg-primary-500/10 text-primary-300'
                  : 'hover:bg-surface-800/50 text-surface-200'
              }`}
              onDoubleClick={() => handlePlay(index)}
            >
              {/* Index / Play */}
              <div className="w-8 text-center relative">
                <span className={`text-sm tabular-nums group-hover:hidden ${isPlaying ? 'text-primary-400' : 'text-surface-500'}`}>
                  {showIndex ? track.trackNumber : index + 1}
                </span>
                <button
                  className="hidden group-hover:block absolute inset-0 m-auto text-white"
                  onClick={() => handlePlay(index)}
                >
                  <PlayIcon size={14} />
                </button>
              </div>

              {/* Track Info */}
              <div className="flex-1 flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded bg-surface-800 overflow-hidden flex-shrink-0">
                  {track.coverUrl ? (
                    <img src={track.coverUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-700 to-surface-800">
                      <MusicIcon size={16} className="text-surface-500" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-medium truncate ${isPlaying ? 'text-primary-300' : ''}`}>
                    {track.title}
                  </p>
                  <p className="text-xs text-surface-400 truncate">{track.artistName}</p>
                </div>
              </div>

              {/* Album */}
              {showAlbum && (
                <div className="w-[200px] hidden lg:block">
                  <p className="text-sm text-surface-400 truncate">{track.albumTitle}</p>
                </div>
              )}

              {/* Format */}
              <div className="w-[80px] hidden md:block">
                <span className="text-xs text-surface-500 uppercase px-1.5 py-0.5 rounded bg-surface-800/50">
                  {track.format || '—'}
                </span>
              </div>

              {/* Duration */}
              <div className="w-[60px] text-right">
                <span className="text-sm text-surface-400 tabular-nums">
                  {formatDuration(track.duration)}
                </span>
              </div>

              {/* Actions */}
              <div className="w-16 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => handleFavorite(e, track.id)}
                  className="p-1 text-surface-400 hover:text-red-400 transition-colors"
                >
                  <HeartIcon size={14} filled={track.isFavorite} />
                </button>
                <button className="p-1 text-surface-400 hover:text-white transition-colors">
                  <MoreIcon size={14} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
