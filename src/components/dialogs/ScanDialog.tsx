'use client'

import { useState } from 'react'
import { useUIStore } from '@/store/uiStore'
import { useLibraryStore } from '@/store/libraryStore'
import { XIcon, FolderScanIcon, LoaderIcon } from '@/components/icons'

export default function ScanDialog() {
  const { showScanDialog, setShowScanDialog } = useUIStore()
  const { scanLibrary, scanning } = useLibraryStore()
  const [folders, setFolders] = useState('')

  if (!showScanDialog) return null

  const handleScan = async () => {
    const folderList = folders
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0)

    if (folderList.length === 0) return

    await scanLibrary(folderList)
    setShowScanDialog(false)
    setFolders('')
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-surface-900 rounded-2xl border border-surface-800 w-[480px] max-w-[90vw] shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between p-5 border-b border-surface-800">
          <div className="flex items-center gap-2">
            <FolderScanIcon size={20} className="text-primary-400" />
            <h2 className="text-lg font-semibold text-white">扫描音乐库</h2>
          </div>
          <button
            onClick={() => setShowScanDialog(false)}
            className="text-surface-400 hover:text-white"
          >
            <XIcon size={18} />
          </button>
        </div>

        <div className="p-5">
          <label className="block text-sm font-medium text-surface-300 mb-2">
            音乐文件夹路径（每行一个）
          </label>
          <textarea
            value={folders}
            onChange={(e) => setFolders(e.target.value)}
            placeholder={'/home/user/Music\n/mnt/nas/music'}
            className="w-full h-32 px-3 py-2 rounded-lg bg-surface-800 border border-surface-700 text-sm text-white placeholder-surface-500 focus:outline-none focus:border-primary-500/50 resize-none font-mono"
          />
          <p className="text-xs text-surface-500 mt-2">
            支持的格式: MP3, FLAC, WAV, OGG, M4A, AAC, WMA, OPUS, AIFF, APE
          </p>
        </div>

        <div className="flex justify-end gap-3 px-5 pb-5">
          <button
            onClick={() => setShowScanDialog(false)}
            className="px-4 py-2 rounded-lg text-sm text-surface-300 hover:bg-surface-800 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleScan}
            disabled={scanning || !folders.trim()}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium bg-primary-500 text-white hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {scanning ? (
              <>
                <LoaderIcon size={16} />
                扫描中...
              </>
            ) : (
              '开始扫描'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
