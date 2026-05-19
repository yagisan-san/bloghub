'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ViewTabs } from '@/components/ui/ViewTabs'
import { GridView } from '@/components/hub/GridView'
import { CategoryView } from '@/components/hub/CategoryView'
import { OrderView } from '@/components/hub/OrderView'
import { TreeView } from '@/components/hub/TreeView'
import { PullToRefresh } from '@/components/ui/PullToRefresh'
import { Content, ContentType, Profile, Hub, ViewMode } from '@/types/database'
import { Mail } from 'lucide-react'

interface SocialLinks {
  twitter?: string
  note?: string
  youtube?: string
  email?: string
}

interface Props {
  profile: Pick<Profile, 'username' | 'display_name' | 'bio' | 'avatar_url'> & { social_links?: SocialLinks }
  hub: Pick<Hub, 'title' | 'description' | 'default_view'>
  contents: Content[]
  initialView: ViewMode
}

const MEDIA_FILTERS: { value: ContentType | 'all'; label: string }[] = [
  { value: 'all',         label: 'すべて' },
  { value: 'hatena',      label: 'はてなブログ' },
  { value: 'note',        label: 'note' },
  { value: 'pdf',         label: 'PDF' },
  { value: 'notion',      label: 'Notion' },
  { value: 'youtube',     label: 'YouTube' },
  { value: 'spreadsheet', label: 'スプレッドシート' },
  { value: 'booth',       label: 'BOOTH' },
  { value: 'other',       label: 'その他' },
]

const VIEW_ORDER: ViewMode[] = ['grid', 'category', 'order', 'tree']

export function HubPageClient({ profile, hub, contents, initialView }: Props) {
  const router = useRouter()
  const [view, setView] = useState<ViewMode>(initialView)
  const [search, setSearch] = useState('')
  const [mediaFilter, setMediaFilter] = useState<ContentType | 'all'>('all')
  const touchStartXRef = useRef<number | null>(null)

  function handleViewChange(mode: ViewMode) {
    setView(mode)
    router.replace(`?view=${mode}`, { scroll: false })
  }

  function handleContentTouchStart(e: React.TouchEvent) {
    touchStartXRef.current = e.touches[0].clientX
  }

  function handleContentTouchEnd(e: React.TouchEvent) {
    if (touchStartXRef.current === null) return
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current
    touchStartXRef.current = null
    if (Math.abs(deltaX) < 50) return
    const currentIndex = VIEW_ORDER.indexOf(view)
    if (deltaX < 0) {
      // 左スワイプ → 次のタブ
      const nextIndex = Math.min(currentIndex + 1, VIEW_ORDER.length - 1)
      if (nextIndex !== currentIndex) handleViewChange(VIEW_ORDER[nextIndex])
    } else {
      // 右スワイプ → 前のタブ
      const prevIndex = Math.max(currentIndex - 1, 0)
      if (prevIndex !== currentIndex) handleViewChange(VIEW_ORDER[prevIndex])
    }
  }

  // Compute which media types actually exist in contents
  const existingTypes = new Set(contents.map((c) => c.content_type as ContentType))
  const availableFilters = MEDIA_FILTERS.filter(
    (f) => f.value === 'all' || existingTypes.has(f.value as ContentType)
  )

  let filtered = mediaFilter !== 'all'
    ? contents.filter((c) => c.content_type === mediaFilter)
    : contents

  if (search) {
    filtered = filtered.filter(
      (c) =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        (c.category || '').toLowerCase().includes(search.toLowerCase())
    )
  }

  const cats = new Set(contents.map((c) => c.category).filter(Boolean))
  const social = (profile as any).social_links as SocialLinks | undefined

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* ヘッダー */}
      <div className="bg-white border-b border-[#f0f2f5]">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* プロフィール */}
          <div className="flex items-start gap-4 mb-5">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 text-white font-bold"
              style={{ background: 'linear-gradient(135deg, #5b7cf7, #a78bfa)' }}>
              {profile.display_name?.[0] || profile.username[0]}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-[#1e2340]">{hub.title}</h1>
              <p className="text-sm text-[#6b7280]">@{profile.username}</p>
              {profile.bio && (
                <p className="text-sm text-[#6b7280] mt-1 leading-relaxed">{profile.bio}</p>
              )}
              {/* SNSリンク */}
              {social && (
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {social.twitter && (
                    <a
                      href={social.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-[#6b7280] hover:text-[#1DA1F2] transition-colors px-2 py-1 rounded-lg border border-[#e4e7f5] hover:border-[#1DA1F2]/40 bg-white"
                    >
                      <span className="font-bold text-xs">𝕏</span>
                      <span>X</span>
                    </a>
                  )}
                  {social.note && (
                    <a
                      href={social.note}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-[#6b7280] hover:text-[#41C9B4] transition-colors px-2 py-1 rounded-lg border border-[#e4e7f5] hover:border-[#41C9B4]/40 bg-white"
                    >
                      <span className="font-bold text-[10px]">n</span>
                      <span>note</span>
                    </a>
                  )}
                  {social.youtube && (
                    <a
                      href={social.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-[#6b7280] hover:text-[#FF0000] transition-colors px-2 py-1 rounded-lg border border-[#e4e7f5] hover:border-[#FF0000]/40 bg-white"
                    >
                      <span className="font-bold text-xs">▶</span>
                      <span>YouTube</span>
                    </a>
                  )}
                  {social.email && (
                    <a
                      href={`mailto:${social.email}`}
                      className="flex items-center gap-1 text-xs text-[#6b7280] hover:text-[#5b7cf7] transition-colors px-2 py-1 rounded-lg border border-[#e4e7f5] hover:border-[#5b7cf7]/40 bg-white"
                    >
                      <Mail size={12} />
                      <span>メール</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* スタッツ */}
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <span className="text-sm text-[#6b7280]">
              <strong className="text-[#5b7cf7]">{contents.length}</strong>件の記事
            </span>
            <span className="text-[#e4e7f5]">·</span>
            <span className="text-sm text-[#6b7280]">
              <strong className="text-[#5b7cf7]">{cats.size}</strong>カテゴリ
            </span>
          </div>

          {/* メディアタイプフィルター */}
          {availableFilters.length > 1 && (
            <div className="flex items-center gap-2 flex-wrap mb-4">
              {availableFilters.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setMediaFilter(f.value)}
                  className={`text-xs px-3 py-2 rounded-full border font-medium transition-all
                    ${mediaFilter === f.value
                      ? 'bg-[#5b7cf7] text-white border-[#5b7cf7]'
                      : 'bg-white text-[#6b7280] border-[#e4e7f5] hover:border-[#c4b5fd] hover:text-[#5b7cf7]'
                    }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}

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
      <PullToRefresh onRefresh={async () => { router.refresh() }}>
        <main
          className="max-w-5xl mx-auto px-6 py-10"
          onTouchStart={handleContentTouchStart}
          onTouchEnd={handleContentTouchEnd}
        >
          {(search || mediaFilter !== 'all') && (
            <p className="text-sm text-[#6b7280] mb-4">
              {filtered.length}件が見つかりました
            </p>
          )}
          {view === 'grid'     && <GridView contents={filtered} />}
          {view === 'category' && <CategoryView contents={filtered} />}
          {view === 'order'    && <OrderView contents={filtered} />}
          {view === 'tree'     && <TreeView contents={filtered} hubTitle={hub.title} />}
        </main>
      </PullToRefresh>

      {/* フッター */}
      <footer className="text-center py-8 text-xs text-[#9ca3af] border-t border-[#e4e7f5]">
        <a href="/" className="hover:text-[#5b7cf7] transition-colors">
          Powered by BlogHub ✦
        </a>
      </footer>
    </div>
  )
}
