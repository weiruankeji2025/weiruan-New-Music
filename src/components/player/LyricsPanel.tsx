'use client'

import { useEffect, useState, useRef } from 'react'
import { usePlayerStore } from '@/store/playerStore'
import { useUIStore } from '@/store/uiStore'
import { XIcon, MusicIcon } from '@/components/icons'
import type { LyricLine } from '@/types'

export default function LyricsPanel() {
  const { currentTrack, currentTime } = usePlayerStore()
  const { showLyrics, toggleLyrics } = useUIStore()
  const [lyrics, setLyrics] = useState<LyricLine[]>([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!currentTrack) {
      setLyrics([])
      return
    }

    fetch(`/api/tracks/${currentTrack.id}/lyrics`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data.lines) {
          setLyrics(json.data.lines)
        } else {
          setLyrics([])
        }
      })
      .catch(() => setLyrics([]))
  }, [currentTrack])

  useEffect(() => {
    if (lyrics.length === 0) return

    let newIndex = -1
    for (let i = lyrics.length - 1; i >= 0; i--) {
      if (currentTime >= lyrics[i].time) {
        newIndex = i
        break
      }
    }

    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex)
      // Auto scroll
      const container = containerRef.current
      if (container && newIndex >= 0) {
        const lines = container.querySelectorAll('[data-lyric-line]')
        const activeLine = lines[newIndex] as HTMLElement
        if (activeLine) {
          activeLine.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }
    }
  }, [currentTime, lyrics, activeIndex])

  if (!showLyrics) return null

  return (
    <div className="fixed right-0 top-0 bottom-20 w-[400px] bg-surface-900/98 backdrop-blur-xl border-l border-surface-800/50 z-[90] flex flex-col animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-surface-800/50">
        <h3 className="text-white font-semibold">歌词</h3>
        <button onClick={toggleLyrics} className="text-surface-400 hover:text-white">
          <XIcon size={18} />
        </button>
      </div>

      {/* Lyrics Content */}
      <div ref={containerRef} className="flex-1 overflow-y-auto px-6 py-8">
        {!currentTrack ? (
          <div className="flex flex-col items-center justify-center h-full text-surface-500">
            <MusicIcon size={48} className="mb-4 opacity-50" />
            <p>没有正在播放的歌曲</p>
          </div>
        ) : lyrics.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-surface-500">
            <p className="text-lg">暂无歌词</p>
            <p className="text-sm mt-2">{currentTrack.title} - {currentTrack.artistName}</p>
          </div>
        ) : (
          <div className="space-y-4 py-[40%]">
            {lyrics.map((line, i) => (
              <p
                key={i}
                data-lyric-line
                className={`text-center text-lg transition-all duration-300 cursor-pointer hover:text-surface-300 ${
                  i === activeIndex
                    ? 'text-white font-bold scale-105'
                    : i < activeIndex
                      ? 'text-surface-600'
                      : 'text-surface-500'
                }`}
                onClick={() => {
                  const { seek } = usePlayerStore.getState()
                  seek(line.time)
                }}
              >
                {line.text}
                {line.translation && (
                  <span className="block text-sm mt-1 text-surface-400 font-normal">
                    {line.translation}
                  </span>
                )}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
