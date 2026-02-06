'use client'

import { useEffect } from 'react'
import { useLibraryStore } from '@/store/libraryStore'
import { useUIStore } from '@/store/uiStore'
import {
  HomeIcon, MusicIcon, AlbumIcon, ArtistIcon,
  PlaylistIcon, HeartIcon, HistoryIcon,
  SettingsIcon, FolderScanIcon, SunIcon, MoonIcon,
} from '@/components/icons'

type Tab = 'tracks' | 'albums' | 'artists' | 'playlists' | 'genres' | 'favorites' | 'history'

const navItems: { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; tab: Tab }[] = [
  { icon: MusicIcon, label: '歌曲', tab: 'tracks' },
  { icon: AlbumIcon, label: '专辑', tab: 'albums' },
  { icon: ArtistIcon, label: '艺术家', tab: 'artists' },
  { icon: PlaylistIcon, label: '歌单', tab: 'playlists' },
  { icon: HeartIcon, label: '收藏', tab: 'favorites' },
  { icon: HistoryIcon, label: '最近播放', tab: 'history' },
]

export default function Sidebar() {
  const { activeTab, setActiveTab, stats, fetchStats, playlists, fetchPlaylists } = useLibraryStore()
  const { sidebarCollapsed, theme, setTheme, setShowScanDialog } = useUIStore()

  useEffect(() => {
    fetchStats()
    fetchPlaylists()
  }, [fetchStats, fetchPlaylists])

  return (
    <aside
      className={`h-full bg-surface-900/80 backdrop-blur-xl border-r border-surface-800/50 flex flex-col transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-surface-800/50">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <MusicIcon size={18} className="text-white" />
            </div>
            <span className="text-white font-bold text-lg">New Music</span>
          </div>
        )}
        {sidebarCollapsed && (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mx-auto">
            <MusicIcon size={18} className="text-white" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <div className="space-y-1">
          {!sidebarCollapsed && (
            <p className="text-[10px] uppercase tracking-wider text-surface-500 font-semibold px-3 mb-2">音乐库</p>
          )}
          {navItems.map(({ icon: IconComp, label, tab }) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                activeTab === tab
                  ? 'bg-primary-500/15 text-primary-300 font-medium'
                  : 'text-surface-300 hover:bg-surface-800/50 hover:text-white'
              } ${sidebarCollapsed ? 'justify-center' : ''}`}
              title={sidebarCollapsed ? label : undefined}
            >
              <IconComp size={18} className={activeTab === tab ? 'text-primary-400' : ''} />
              {!sidebarCollapsed && <span>{label}</span>}
            </button>
          ))}
        </div>

        {/* Playlists Section */}
        {!sidebarCollapsed && playlists.length > 0 && (
          <div className="mt-6">
            <p className="text-[10px] uppercase tracking-wider text-surface-500 font-semibold px-3 mb-2">歌单</p>
            <div className="space-y-0.5">
              {playlists.slice(0, 10).map((pl) => (
                <button
                  key={pl.id}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-surface-400 hover:text-white hover:bg-surface-800/50 transition-colors truncate"
                >
                  <PlaylistIcon size={14} />
                  <span className="truncate">{pl.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        {!sidebarCollapsed && stats && (
          <div className="mt-6 px-3">
            <p className="text-[10px] uppercase tracking-wider text-surface-500 font-semibold mb-2">统计</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-2 rounded-lg bg-surface-800/30">
                <p className="text-lg font-bold text-white">{stats.totalTracks}</p>
                <p className="text-[10px] text-surface-400">歌曲</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-surface-800/30">
                <p className="text-lg font-bold text-white">{stats.totalAlbums}</p>
                <p className="text-[10px] text-surface-400">专辑</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-surface-800/30">
                <p className="text-lg font-bold text-white">{stats.totalArtists}</p>
                <p className="text-[10px] text-surface-400">艺术家</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-surface-800/30">
                <p className="text-lg font-bold text-white">{stats.totalPlaylists}</p>
                <p className="text-[10px] text-surface-400">歌单</p>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-surface-800/50 p-2 space-y-1">
        <button
          onClick={() => setShowScanDialog(true)}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-surface-400 hover:text-white hover:bg-surface-800/50 transition-colors ${
            sidebarCollapsed ? 'justify-center' : ''
          }`}
          title="扫描音乐库"
        >
          <FolderScanIcon size={18} />
          {!sidebarCollapsed && <span>扫描音乐库</span>}
        </button>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-surface-400 hover:text-white hover:bg-surface-800/50 transition-colors ${
            sidebarCollapsed ? 'justify-center' : ''
          }`}
          title="切换主题"
        >
          {theme === 'dark' ? <SunIcon size={18} /> : <MoonIcon size={18} />}
          {!sidebarCollapsed && <span>{theme === 'dark' ? '浅色模式' : '深色模式'}</span>}
        </button>
        <button
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-surface-400 hover:text-white hover:bg-surface-800/50 transition-colors ${
            sidebarCollapsed ? 'justify-center' : ''
          }`}
          title="设置"
        >
          <SettingsIcon size={18} />
          {!sidebarCollapsed && <span>设置</span>}
        </button>
      </div>
    </aside>
  )
}
