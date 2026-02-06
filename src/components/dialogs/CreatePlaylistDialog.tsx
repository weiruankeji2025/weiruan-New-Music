'use client'

import { useState } from 'react'
import { useUIStore } from '@/store/uiStore'
import { useLibraryStore } from '@/store/libraryStore'
import { XIcon, PlaylistIcon } from '@/components/icons'

export default function CreatePlaylistDialog() {
  const { showCreatePlaylist, setShowCreatePlaylist } = useUIStore()
  const { createPlaylist } = useLibraryStore()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  if (!showCreatePlaylist) return null

  const handleCreate = async () => {
    if (!name.trim()) return
    await createPlaylist(name.trim(), description.trim() || undefined)
    setShowCreatePlaylist(false)
    setName('')
    setDescription('')
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-surface-900 rounded-2xl border border-surface-800 w-[420px] max-w-[90vw] shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between p-5 border-b border-surface-800">
          <div className="flex items-center gap-2">
            <PlaylistIcon size={20} className="text-primary-400" />
            <h2 className="text-lg font-semibold text-white">新建歌单</h2>
          </div>
          <button
            onClick={() => setShowCreatePlaylist(false)}
            className="text-surface-400 hover:text-white"
          >
            <XIcon size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">歌单名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入歌单名称"
              className="w-full h-10 px-3 rounded-lg bg-surface-800 border border-surface-700 text-sm text-white placeholder-surface-500 focus:outline-none focus:border-primary-500/50"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">描述（可选）</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="添加描述"
              className="w-full h-20 px-3 py-2 rounded-lg bg-surface-800 border border-surface-700 text-sm text-white placeholder-surface-500 focus:outline-none focus:border-primary-500/50 resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 px-5 pb-5">
          <button
            onClick={() => setShowCreatePlaylist(false)}
            className="px-4 py-2 rounded-lg text-sm text-surface-300 hover:bg-surface-800 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="px-5 py-2 rounded-lg text-sm font-medium bg-primary-500 text-white hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            创建
          </button>
        </div>
      </div>
    </div>
  )
}
