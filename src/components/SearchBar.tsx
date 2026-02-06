'use client'

import { useState, useCallback } from 'react'
import { useLibraryStore } from '@/store/libraryStore'
import { SearchIcon, XIcon } from '@/components/icons'
import { debounce } from '@/lib/utils'

export default function SearchBar() {
  const [value, setValue] = useState('')
  const { search, setSearchQuery } = useLibraryStore()

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      search(query)
    }, 300),
    [search]
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value
    setValue(q)
    setSearchQuery(q)
    debouncedSearch(q)
  }

  const handleClear = () => {
    setValue('')
    setSearchQuery('')
    search('')
  }

  return (
    <div className="relative">
      <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="搜索歌曲、专辑、艺术家..."
        className="w-full h-9 pl-9 pr-8 rounded-lg bg-surface-800/60 border border-surface-700/50 text-sm text-white placeholder-surface-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30 transition-colors"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-surface-400 hover:text-white"
        >
          <XIcon size={14} />
        </button>
      )}
    </div>
  )
}
