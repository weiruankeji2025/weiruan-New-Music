'use client'

import AudioEngine from '@/components/player/AudioEngine'
import PlayerBar from '@/components/player/PlayerBar'
import NowPlaying from '@/components/player/NowPlaying'
import QueuePanel from '@/components/player/QueuePanel'
import LyricsPanel from '@/components/player/LyricsPanel'
import Sidebar from '@/components/Sidebar'
import MainContent from '@/components/MainContent'
import ScanDialog from '@/components/dialogs/ScanDialog'
import CreatePlaylistDialog from '@/components/dialogs/CreatePlaylistDialog'

export default function Home() {
  return (
    <div className="h-screen flex flex-col bg-surface-950">
      {/* Audio Engine (invisible) */}
      <AudioEngine />

      {/* Main Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <MainContent />
        </main>
      </div>

      {/* Player Bar */}
      <PlayerBar />

      {/* Overlay Panels */}
      <NowPlaying />
      <QueuePanel />
      <LyricsPanel />

      {/* Dialogs */}
      <ScanDialog />
      <CreatePlaylistDialog />
    </div>
  )
}
