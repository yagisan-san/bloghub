'use client'

import { ViewMode } from '@/types/database'

const TABS: { value: ViewMode; label: string; icon: string }[] = [
  { value: 'grid',     label: 'グリッド',   icon: '⊞' },
  { value: 'category', label: 'カテゴリ',   icon: '📂' },
  { value: 'order',    label: '読む順（ロードマップ）', icon: '📖' },
  { value: 'tree',     label: 'ツリー',     icon: '🌳' },
]

interface ViewTabsProps {
  current: ViewMode
  onChange: (mode: ViewMode) => void
}

export function ViewTabs({ current, onChange }: ViewTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="表示モード"
      className="flex gap-0.5 bg-[#f7f8ff] border border-[#e4e7f5] rounded-xl p-1 overflow-x-auto scrollbar-none"
    >
      {TABS.map((tab) => (
        <button
          key={tab.value}
          role="tab"
          aria-selected={current === tab.value}
          onClick={() => onChange(tab.value)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[9px] text-sm font-medium whitespace-nowrap
            transition-all duration-150
            ${current === tab.value
              ? 'bg-white text-[#5b7cf7] font-semibold shadow-sm'
              : 'text-[#6b7280] hover:bg-white/60 hover:text-[#1e2340]'
            }`}
        >
          <span>{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  )
}
