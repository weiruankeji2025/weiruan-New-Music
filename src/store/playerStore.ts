import { create } from 'zustand'
import type { TrackInfo, RepeatMode, PlaybackStatus, QueueItem } from '@/types'
import { shuffleArray } from '@/lib/utils'

interface PlayerStore {
  // State
  currentTrack: TrackInfo | null
  queue: QueueItem[]
  originalQueue: QueueItem[]
  queueIndex: number
  status: PlaybackStatus
  currentTime: number
  duration: number
  volume: number
  muted: boolean
  shuffle: boolean
  repeat: RepeatMode

  // Audio element ref
  audioRef: HTMLAudioElement | null
  setAudioRef: (ref: HTMLAudioElement | null) => void

  // Playback actions
  play: (track?: TrackInfo) => void
  pause: () => void
  resume: () => void
  stop: () => void
  next: () => void
  previous: () => void
  seek: (time: number) => void

  // Queue management
  setQueue: (tracks: TrackInfo[], startIndex?: number) => void
  addToQueue: (tracks: TrackInfo[]) => void
  removeFromQueue: (index: number) => void
  clearQueue: () => void
  moveInQueue: (from: number, to: number) => void

  // Settings
  setVolume: (volume: number) => void
  toggleMute: () => void
  toggleShuffle: () => void
  cycleRepeat: () => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  setStatus: (status: PlaybackStatus) => void
}

let queueIdCounter = 0
function createQueueItem(track: TrackInfo, source = 'manual'): QueueItem {
  return { id: `q-${++queueIdCounter}`, track, source }
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentTrack: null,
  queue: [],
  originalQueue: [],
  queueIndex: -1,
  status: 'stopped',
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  muted: false,
  shuffle: false,
  repeat: 'off',
  audioRef: null,

  setAudioRef: (ref) => set({ audioRef: ref }),

  play: (track) => {
    const { audioRef, queue, queueIndex } = get()
    if (track) {
      const existingIndex = queue.findIndex((q) => q.track.id === track.id)
      if (existingIndex >= 0) {
        set({ currentTrack: track, queueIndex: existingIndex, status: 'loading' })
      } else {
        set({ currentTrack: track, status: 'loading' })
      }
      if (audioRef) {
        audioRef.src = `/api/tracks/${track.id}/stream`
        audioRef.play().catch(console.error)
      }
    } else if (queue.length > 0 && queueIndex >= 0) {
      const t = queue[queueIndex].track
      set({ currentTrack: t, status: 'loading' })
      if (audioRef) {
        audioRef.src = `/api/tracks/${t.id}/stream`
        audioRef.play().catch(console.error)
      }
    }
  },

  pause: () => {
    const { audioRef } = get()
    audioRef?.pause()
    set({ status: 'paused' })
  },

  resume: () => {
    const { audioRef } = get()
    audioRef?.play().catch(console.error)
    set({ status: 'playing' })
  },

  stop: () => {
    const { audioRef } = get()
    if (audioRef) {
      audioRef.pause()
      audioRef.currentTime = 0
    }
    set({ status: 'stopped', currentTime: 0 })
  },

  next: () => {
    const { queue, queueIndex, repeat, shuffle } = get()
    if (queue.length === 0) return

    let nextIndex: number
    if (repeat === 'one') {
      nextIndex = queueIndex
    } else if (queueIndex < queue.length - 1) {
      nextIndex = queueIndex + 1
    } else if (repeat === 'all') {
      nextIndex = 0
    } else {
      set({ status: 'stopped' })
      return
    }

    const track = queue[nextIndex].track
    set({ queueIndex: nextIndex, currentTrack: track, status: 'loading' })
    const { audioRef } = get()
    if (audioRef) {
      audioRef.src = `/api/tracks/${track.id}/stream`
      audioRef.play().catch(console.error)
    }
  },

  previous: () => {
    const { queue, queueIndex, currentTime, repeat } = get()
    if (queue.length === 0) return

    // If more than 3 seconds in, restart current track
    if (currentTime > 3) {
      const { audioRef } = get()
      if (audioRef) audioRef.currentTime = 0
      set({ currentTime: 0 })
      return
    }

    let prevIndex: number
    if (queueIndex > 0) {
      prevIndex = queueIndex - 1
    } else if (repeat === 'all') {
      prevIndex = queue.length - 1
    } else {
      prevIndex = 0
    }

    const track = queue[prevIndex].track
    set({ queueIndex: prevIndex, currentTrack: track, status: 'loading' })
    const { audioRef } = get()
    if (audioRef) {
      audioRef.src = `/api/tracks/${track.id}/stream`
      audioRef.play().catch(console.error)
    }
  },

  seek: (time) => {
    const { audioRef } = get()
    if (audioRef) {
      audioRef.currentTime = time
    }
    set({ currentTime: time })
  },

  setQueue: (tracks, startIndex = 0) => {
    const items = tracks.map((t) => createQueueItem(t, 'library'))
    const { shuffle } = get()

    if (shuffle) {
      const startItem = items[startIndex]
      const rest = items.filter((_, i) => i !== startIndex)
      const shuffled = [startItem, ...shuffleArray(rest)]
      set({
        queue: shuffled,
        originalQueue: items,
        queueIndex: 0,
      })
      get().play(shuffled[0].track)
    } else {
      set({
        queue: items,
        originalQueue: items,
        queueIndex: startIndex,
      })
      get().play(items[startIndex].track)
    }
  },

  addToQueue: (tracks) => {
    const items = tracks.map((t) => createQueueItem(t, 'manual'))
    set((state) => ({
      queue: [...state.queue, ...items],
      originalQueue: [...state.originalQueue, ...items],
    }))
  },

  removeFromQueue: (index) => {
    set((state) => {
      const newQueue = [...state.queue]
      newQueue.splice(index, 1)
      let newIndex = state.queueIndex
      if (index < state.queueIndex) newIndex--
      if (index === state.queueIndex && newIndex >= newQueue.length) {
        newIndex = Math.max(0, newQueue.length - 1)
      }
      return { queue: newQueue, queueIndex: newIndex }
    })
  },

  clearQueue: () => {
    get().stop()
    set({ queue: [], originalQueue: [], queueIndex: -1, currentTrack: null })
  },

  moveInQueue: (from, to) => {
    set((state) => {
      const newQueue = [...state.queue]
      const [item] = newQueue.splice(from, 1)
      newQueue.splice(to, 0, item)
      let newIndex = state.queueIndex
      if (from === state.queueIndex) newIndex = to
      else if (from < state.queueIndex && to >= state.queueIndex) newIndex--
      else if (from > state.queueIndex && to <= state.queueIndex) newIndex++
      return { queue: newQueue, queueIndex: newIndex }
    })
  },

  setVolume: (volume) => {
    const { audioRef } = get()
    if (audioRef) audioRef.volume = volume
    set({ volume, muted: volume === 0 })
  },

  toggleMute: () => {
    const { audioRef, muted, volume } = get()
    if (audioRef) {
      audioRef.volume = muted ? volume : 0
    }
    set({ muted: !muted })
  },

  toggleShuffle: () => {
    const { shuffle, queue, originalQueue, queueIndex, currentTrack } = get()
    if (!shuffle) {
      // Enable shuffle: keep current track first, shuffle rest
      const current = queue[queueIndex]
      const rest = queue.filter((_, i) => i !== queueIndex)
      const shuffled = [current, ...shuffleArray(rest)]
      set({ shuffle: true, queue: shuffled, queueIndex: 0 })
    } else {
      // Disable shuffle: restore original order
      if (currentTrack) {
        const originalIndex = originalQueue.findIndex((q) => q.track.id === currentTrack.id)
        set({ shuffle: false, queue: [...originalQueue], queueIndex: Math.max(0, originalIndex) })
      } else {
        set({ shuffle: false, queue: [...originalQueue] })
      }
    }
  },

  cycleRepeat: () => {
    const modes: RepeatMode[] = ['off', 'all', 'one']
    const { repeat } = get()
    const currentIndex = modes.indexOf(repeat)
    set({ repeat: modes[(currentIndex + 1) % modes.length] })
  },

  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setStatus: (status) => set({ status }),
}))
