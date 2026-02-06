'use client'

import { usePlayerStore } from '@/store/playerStore'
import { useUIStore } from '@/store/uiStore'
import { formatDuration } from '@/lib/utils'
import { XIcon, PlayIcon, TrashIcon, MusicIcon } from '@/components/icons'

export default function QueuePanel() {
  const { queue, queueIndex, currentTrack, play, removeFromQueue, clearQueue } = usePlayerStore()
  const { showQueue, toggleQueue } = useUIStore()

  if (!showQueue) return null

  return (
    <div className="fixed right-0 top-0 bottom-20 w-[360px] bg-surface-900/98 backdrop-blur-xl border-l border-surface-800/50 z-[90] flex flex-col animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-surface-800/50">
        <h3 className="text-white font-semibold">播放队列</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-surface-400">{queue.length} 首歌曲</span>
          {queue.length > 0 && (
            <button
              onClick={clearQueue}
              className="text-xs text-surface-400 hover:text-red-400 transition-colors"
            >
              清空
            </button>
          )}
          <button onClick={toggleQueue} className="ml-2 text-surface-400 hover:text-white">
            <XIcon size={18} />
          </button>
        </div>
      </div>

      {/* Queue List */}
      <div className="flex-1 overflow-y-auto">
        {queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-surface-500">
            <MusicIcon size={48} className="mb-4 opacity-50" />
            <p>队列为空</p>
            <p className="text-sm mt-1">从音乐库中添加歌曲</p>
          </div>
        ) : (
          <div className="py-2">
            {/* Now Playing Section */}
            {currentTrack && queueIndex >= 0 && (
              <div className="px-4 pb-2">
                <p className="text-xs text-surface-400 font-medium uppercase tracking-wider mb-2">正在播放</p>
                <div className="flex items-center gap-3 p-2 rounded-lg bg-primary-500/10 border border-primary-500/20">
                  <div className="w-10 h-10 rounded bg-surface-800 overflow-hidden flex-shrink-0">
                    {currentTrack.coverUrl ? (
                      <img src={currentTrack.coverUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800">
                        <MusicIcon size={16} className="text-white/60" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white font-medium truncate">{currentTrack.title}</p>
                    <p className="text-xs text-surface-400 truncate">{currentTrack.artistName}</p>
                  </div>
                  <span className="text-xs text-surface-400 tabular-nums">
                    {formatDuration(currentTrack.duration)}
                  </span>
                </div>
              </div>
            )}

            {/* Next Up */}
            {queueIndex < queue.length - 1 && (
              <div className="px-4 pt-2">
                <p className="text-xs text-surface-400 font-medium uppercase tracking-wider mb-2">接下来播放</p>
                {queue.slice(queueIndex + 1).map((item, i) => {
                  const actualIndex = queueIndex + 1 + i
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-800/50 group cursor-pointer"
                      onClick={() => play(item.track)}
                    >
                      <div className="w-8 h-8 rounded bg-surface-800 overflow-hidden flex-shrink-0 relative">
                        {item.track.coverUrl ? (
                          <img src={item.track.coverUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-surface-700">
                            <MusicIcon size={14} className="text-surface-400" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <PlayIcon size={14} className="text-white" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-surface-200 truncate">{item.track.title}</p>
                        <p className="text-xs text-surface-500 truncate">{item.track.artistName}</p>
                      </div>
                      <span className="text-xs text-surface-500 tabular-nums mr-1">
                        {formatDuration(item.track.duration)}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeFromQueue(actualIndex) }}
                        className="opacity-0 group-hover:opacity-100 text-surface-400 hover:text-red-400 transition-all"
                      >
                        <TrashIcon size={14} />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
