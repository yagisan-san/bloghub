'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ViewTabs } from '@/components/ui/ViewTabs'
import { GridView } from '@/components/hub/GridView'
import { CategoryView } from '@/components/hub/CategoryView'
import { OrderView } from '@/components/hub/OrderView'
import { TreeView } from '@/components/hub/TreeView'
import { PublicNav } from '@/components/hub/PublicNav'
import { Content, ContentType, ViewMode } from '@/types/database'

const TYPE_LABEL: Record<ContentType | 'all', string> = {
  all:         'すべて',
  hatena:      'はてなブログ',
  note:        'note',
  pdf:         'PDF',
  notion:      'Notion',
  youtube:     'YouTube',
  spreadsheet: 'スプレッドシート',
  booth:       'BOOTH',
  other:       'その他',
}

const TYPE_ICON: Record<ContentType | 'all', string> = {
  all:         '📚',
  hatena:      '✏️',
  note:        '📝',
  pdf:         '📄',
  notion:      '📋',
  youtube:     '▶️',
  spreadsheet: '📊',
  booth:       '🛍️',
  other:       '🔗',
}

interface HubTheme {
  bg: string
  accent: string
  cardBg: string
  cardBorder: string
  text: string
  textMuted: string
  profileNameColor: string
  profileIdColor: string
}

interface Props {
  username: string
  hubTitle: string
  hubDefaultView: string
  type: ContentType | 'all'
  contents: Content[]
  initialView: ViewMode
  theme?: HubTheme
  isOwner?: boolean
}

const DEFAULT_THEME: HubTheme = {
  bg: '#fafafa',
  accent: '#5b7cf7',
  cardBg: '#ffffff',
  cardBorder: '#f0f2f5',
  text: '#1e2340',
  textMuted: '#6b7280',
  profileNameColor: '#ffffff',
  profileIdColor: 'rgba(255,255,255,0.8)',
}

export function TypePageClient({
  username,
  hubTitle,
  hubDefaultView,
  type,
  contents,
  initialView,
  theme: themeProp,
  isOwner = false,
}: Props) {
  const theme = { ...DEFAULT_THEME, ...(themeProp || {}) }
  const router = useRouter()
  const [view, setView] = useState<ViewMode>(initialView)
  const [search, setSearch] = useState('')

  function handleViewChange(mode: ViewMode) {
    setView(mode)
    router.replace(`?view=${mode}`, { scroll: false })
  }

  const filtered = search
    ? contents.filter(
        (c) =>
          c.title.toLowerCase().includes(search.toLowerCase()) ||
          (c.category || '').toLowerCase().includes(search.toLowerCase())
      )
    : contents

  const typeLabel = TYPE_LABEL[type]
  const typeIcon = TYPE_ICON[type]

  return (
    <div className="min-h-screen" style={{ background: theme.bg }}>
      <PublicNav username={username} hubTitle={hubTitle} isOwner={isOwner} />

      {/* ページヘッダー */}
      <div className="bg-white border-b" style={{ borderColor: theme.cardBorder }}>
        <div className="max-w-5xl mx-auto px-6 py-6">
          {/* 戻るリンク */}
          <Link
            href={`/u/${username}`}
            className="inline-flex items-center gap-1 text-xs transition-colors mb-4"
            style={{ color: theme.textMuted }}
          >
            ← ホームに戻る
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">{typeIcon}</span>
            <div>
              <h1 className="text-xl font-bold" style={{ color: theme.text }}>{typeLabel}</h1>
              <p className="text-sm" style={{ color: theme.textMuted }}>{contents.length}件</p>
            </div>
          </div>

          {/* ビュー切り替え + 検索 */}
          <div className="flex flex-col sm:flex-row gap-3">
            <ViewTabs current={view} onChange={handleViewChange} />
            <div className="relative flex-1 max-w-sm">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af] text-sm">🔍</span>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="タイトル・カテゴリで検索..."
                className="w-full pl-9 pr-4 py-2 border border-[#e4e7f5] rounded-xl text-sm bg-white text-[#1e2340]
                  placeholder:text-[#9ca3af] outline-none focus:border-[#5b7cf7] focus:ring-2 focus:ring-[#5b7cf7]/10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* コンテンツ */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        {search && (
          <p className="text-sm mb-4" style={{ color: theme.textMuted }}>
            {filtered.length}件が見つかりました
          </p>
        )}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-sm" style={{ color: theme.textMuted }}>
            コンテンツが見つかりません
          </div>
        ) : (
          <>
            {view === 'grid'     && <GridView contents={filtered} />}
            {view === 'category' && <CategoryView contents={filtered} />}
            {view === 'order'    && <OrderView contents={filtered} />}
            {view === 'tree'     && <TreeView contents={filtered} hubTitle={hubTitle} />}
          </>
        )}
      </main>

      {/* フッター */}
      <footer className="text-center py-8 text-xs border-t" style={{ color: theme.textMuted, borderColor: theme.cardBorder }}>
        <a href="/" className="transition-colors hover:opacity-80">
          Powered by BlogHub ✦
        </a>
      </footer>
    </div>
  )
}
