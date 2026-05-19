'use client'

import { ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  // スクロールロック
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* オーバーレイ */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* シート */}
      <div
        className={`relative bg-white rounded-t-2xl w-full max-h-[90dvh] flex flex-col
          transition-transform duration-300 ease-out
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {/* ドラッグハンドル */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-[#e4e7f5]" />
        </div>

        {/* タイトルバー */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#f0f2f5] flex-shrink-0">
          <h2 className="text-base font-bold text-[#1e2340]">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#9ca3af] hover:text-[#6b7280] hover:bg-[#f7f8ff] transition-colors"
            aria-label="閉じる"
          >
            <X size={18} />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="overflow-y-auto flex-1 px-5 py-4">
          {children}
        </div>
      </div>
    </div>
  )
}
