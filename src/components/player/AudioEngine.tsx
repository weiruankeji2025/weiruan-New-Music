'use client'

import { useEffect, useRef } from 'react'
import { usePlayerStore } from '@/store/playerStore'

export default function AudioEngine() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const setAudioRef = usePlayerStore((s) => s.setAudioRef)
  const setCurrentTime = usePlayerStore((s) => s.setCurrentTime)
  const setDuration = usePlayerStore((s) => s.setDuration)
  const setStatus = usePlayerStore((s) => s.setStatus)
  const next = usePlayerStore((s) => s.next)
  const volume = usePlayerStore((s) => s.volume)
  const muted = usePlayerStore((s) => s.muted)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    setAudioRef(audio)
    audio.volume = volume

    const onTimeUpdate = () => setCurrentTime(audio.currentTime)
    const onDurationChange = () => setDuration(audio.duration || 0)
    const onPlaying = () => setStatus('playing')
    const onPause = () => {
      // Only set paused if not at end
      if (audio.currentTime < audio.duration) {
        setStatus('paused')
      }
    }
    const onEnded = () => next()
    const onWaiting = () => setStatus('loading')
    const onCanPlay = () => {
      if (!audio.paused) setStatus('playing')
    }

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('durationchange', onDurationChange)
    audio.addEventListener('playing', onPlaying)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('waiting', onWaiting)
    audio.addEventListener('canplay', onCanPlay)

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('durationchange', onDurationChange)
      audio.removeEventListener('playing', onPlaying)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('waiting', onWaiting)
      audio.removeEventListener('canplay', onCanPlay)
    }
  }, [setAudioRef, setCurrentTime, setDuration, setStatus, next, volume])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume
    }
  }, [volume, muted])

  return <audio ref={audioRef} preload="auto" />
}
