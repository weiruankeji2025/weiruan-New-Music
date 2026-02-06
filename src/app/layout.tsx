import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'New Music - 音乐播放器',
  description: '功能丰富的现代音乐播放器，支持多种音频格式、歌词显示、均衡器、播放列表管理等',
  keywords: ['音乐播放器', 'music player', 'FLAC', '无损音乐', '歌词'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className="dark">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
