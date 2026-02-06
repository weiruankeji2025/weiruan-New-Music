import { create } from 'zustand'

type Theme = 'light' | 'dark' | 'system'
type SidebarView = 'library' | 'search' | 'settings' | 'queue' | 'lyrics'

interface UIStore {
  theme: Theme
  sidebarCollapsed: boolean
  sidebarView: SidebarView
  showNowPlaying: boolean
  showLyrics: boolean
  showEqualizer: boolean
  showQueue: boolean
  showMobileMenu: boolean
  showScanDialog: boolean
  showCreatePlaylist: boolean

  setTheme: (theme: Theme) => void
  toggleSidebar: () => void
  setSidebarView: (view: SidebarView) => void
  toggleNowPlaying: () => void
  toggleLyrics: () => void
  toggleEqualizer: () => void
  toggleQueue: () => void
  toggleMobileMenu: () => void
  setShowScanDialog: (show: boolean) => void
  setShowCreatePlaylist: (show: boolean) => void
}

export const useUIStore = create<UIStore>((set) => ({
  theme: 'dark',
  sidebarCollapsed: false,
  sidebarView: 'library',
  showNowPlaying: false,
  showLyrics: false,
  showEqualizer: false,
  showQueue: false,
  showMobileMenu: false,
  showScanDialog: false,
  showCreatePlaylist: false,

  setTheme: (theme) => {
    set({ theme })
    if (typeof document !== 'undefined') {
      const root = document.documentElement
      root.classList.remove('light', 'dark')
      if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        root.classList.add(prefersDark ? 'dark' : 'light')
      } else {
        root.classList.add(theme)
      }
    }
  },

  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarView: (view) => set({ sidebarView: view }),
  toggleNowPlaying: () => set((s) => ({ showNowPlaying: !s.showNowPlaying })),
  toggleLyrics: () => set((s) => ({ showLyrics: !s.showLyrics })),
  toggleEqualizer: () => set((s) => ({ showEqualizer: !s.showEqualizer })),
  toggleQueue: () => set((s) => ({ showQueue: !s.showQueue })),
  toggleMobileMenu: () => set((s) => ({ showMobileMenu: !s.showMobileMenu })),
  setShowScanDialog: (show) => set({ showScanDialog: show }),
  setShowCreatePlaylist: (show) => set({ showCreatePlaylist: show }),
}))
