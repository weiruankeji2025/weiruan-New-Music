'use client'

import { useLibraryStore } from '@/store/libraryStore'

export default function GenreView() {
  const { genres, setActiveTab, fetchTracks } = useLibraryStore()

  const handleGenreClick = (genre: string) => {
    setActiveTab('tracks')
    fetchTracks({ genre })
  }

  const colors = [
    'from-rose-600 to-rose-800',
    'from-violet-600 to-violet-800',
    'from-blue-600 to-blue-800',
    'from-emerald-600 to-emerald-800',
    'from-amber-600 to-amber-800',
    'from-pink-600 to-pink-800',
    'from-cyan-600 to-cyan-800',
    'from-indigo-600 to-indigo-800',
    'from-teal-600 to-teal-800',
    'from-orange-600 to-orange-800',
  ]

  if (genres.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-surface-500">
        <p className="text-lg">没有找到流派信息</p>
        <p className="text-sm mt-1">扫描音乐库后将显示流派</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
      {genres.map((genre, i) => (
        <button
          key={genre.name}
          onClick={() => handleGenreClick(genre.name!)}
          className={`relative overflow-hidden rounded-xl p-5 text-left bg-gradient-to-br ${
            colors[i % colors.length]
          } hover:scale-[1.02] transition-transform shadow-lg`}
        >
          <h3 className="text-white font-bold text-lg">{genre.name}</h3>
          <p className="text-white/70 text-sm mt-1">{genre.count} 首歌曲</p>
        </button>
      ))}
    </div>
  )
}
