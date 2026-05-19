'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Content, ContentType } from '@/types/database'
import { ContentList } from './ContentList'
import { TreeEditor } from './TreeEditor'
import { FolderOpen, FileText } from 'lucide-react'

const TYPE_META: Record<string, { label: string; icon: string }> = {
  hatena:      { label: 'はてなブログ', icon: '✏️' },
  note:        { label: 'note',         icon: '📝' },
  pdf:         { label: 'PDF',          icon: '📄' },
  notion:      { label: 'Notion',       icon: '📋' },
  youtube:     { label: 'YouTube',      icon: '▶️' },
  spreadsheet: { label: 'スプレッドシート', icon: '📊' },
  booth:       { label: 'BOOTH',        icon: '🛍️' },
  other:       { label: 'その他',       icon: '🔗' },
}

type Tab = 'order' | 'map' | 'category'

interface ContentItem {
  id: string
  title: string
  url: string
  category: string | null
  parent_id: string | null
  is_visible: boolean
  content_type: string
  display_order: number
}

interface Props {
  allContents: Content[]
  treeContents: ContentItem[]
  existingTypes: ContentType[]
  username: string
}

export function ReaderFlowClient({ allContents, treeContents, existingTypes, username }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('order')
  const [activeType, setActiveType] = useState<ContentType>(existingTypes[0] || 'hatena')

  const TABS: { key: Tab; label: string; icon: string; desc: string }[] = [
    { key: 'order',    label: 'おすすめ順',    icon: '📖', desc: '読者に読んでほしい順番を設定' },
    { key: 'map',      label: '記事マップ',    icon: '🌳', desc: '記事の親子関係・階層構造を設定' },
    { key: 'category', label: 'カテゴリ整理', icon: '📁', desc: 'カテゴリ別に記事を確認' },
  ]

  const filteredContents = allContents.filter((c) => c.content_type === activeType)
  const filteredTreeContents = treeContents.filter((c) => c.content_type === activeType)

  // カテゴリビュー用
  const categoryMap: Record<string, ContentItem[]> = {}
  for (const c of filteredTreeContents) {
    const key = c.category || '未分類'
    if (!categoryMap[key]) categoryMap[key] = []
    categoryMap[key].push(c)
  }
  const sortedCategories = Object.entries(categoryMap).sort((a, b) => b[1].length - a[1].length)

  return (
    <div>
      {/* メインタブ */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
              ${activeTab === tab.key
                ? 'bg-[#5b7cf7] text-white shadow-sm'
                : 'bg-white text-[#6b7280] border border-[#e4e7f5] hover:border-[#c4b5fd]'}`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* タブの説明 */}
      <p className="text-sm text-[#6b7280] mb-5">
        {TABS.find((t) => t.key === activeTab)?.desc}
      </p>

      {/* コンテンツ種別タブ */}
      {existingTypes.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-6">
          {existingTypes.map((t) => {
            const meta = TYPE_META[t] || { label: t, icon: '🔗' }
            const count = allContents.filter((c) => c.content_type === t).length
            return (
              <button
                key={t}
                onClick={() => setActiveType(t)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border
                  ${activeType === t
                    ? 'bg-[#1e2340] text-white border-[#1e2340]'
                    : 'bg-white text-[#6b7280] border-[#e4e7f5] hover:border-[#9ca3af]'}`}
              >
                <span>{meta.icon}</span>
                <span>{meta.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold
                  ${activeType === t ? 'bg-white/20' : 'bg-[#f0f2f5] text-[#9ca3af]'}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* タブコンテンツ */}
      {activeTab === 'order' && (
        <div className="bg-white rounded-2xl border border-[#e4e7f5] p-4"
          style={{ boxShadow: '0 1px 4px rgba(91,124,247,.06)' }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-semibold text-[#5b7cf7] bg-[#eef0fd] px-3 py-1.5 rounded-full">
              📖 {TYPE_META[activeType]?.label || activeType} のおすすめ順を管理
            </span>
          </div>
          {filteredContents.length === 0 ? (
            <div className="text-center py-10 text-[#9ca3af] text-sm">
              <p className="text-3xl mb-2">📭</p>
              <p>このコンテンツに記事がありません</p>
            </div>
          ) : (
            <ContentList key={`order-${activeType}`} initialContents={filteredContents} />
          )}
        </div>
      )}

      {activeTab === 'map' && (
        <div>
          {filteredTreeContents.length === 0 ? (
            <div className="text-center py-10 text-[#9ca3af] text-sm">
              <p className="text-3xl mb-2">🌳</p>
              <p>このコンテンツに記事がありません</p>
            </div>
          ) : (
            <TreeEditor key={`map-${activeType}`} contents={filteredTreeContents} />
          )}
        </div>
      )}

      {activeTab === 'category' && (
        <div>
          {sortedCategories.length === 0 ? (
            <div className="text-center py-10 text-[#9ca3af] text-sm">
              <p className="text-3xl mb-2">📁</p>
              <p>このコンテンツにカテゴリがありません</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-[#6b7280]">{sortedCategories.length}カテゴリ · {filteredTreeContents.length}件</p>
              {sortedCategories.map(([catName, items]) => (
                <div key={catName} className="bg-white rounded-2xl border border-[#374151] overflow-hidden"
                  style={{ boxShadow: '0 1px 4px rgba(91,124,247,.06)' }}>
                  <div className="flex items-center gap-3 px-5 py-3 bg-[#f3f4f6] border-b border-[#374151]">
                    <FolderOpen size={15} className="text-[#374151] flex-shrink-0" />
                    <span className="font-bold text-[#1e2340] text-sm flex-1 truncate">{catName}</span>
                    <span className="text-xs font-semibold text-white bg-[#374151] px-2 py-0.5 rounded-full">
                      {items.length}件
                    </span>
                  </div>
                  <ul className="divide-y divide-[#f0f2fa]">
                    {items.map((item) => (
                      <li key={item.id} className="flex items-center gap-3 px-5 py-3">
                        <FileText size={13} className="text-[#9ca3af] flex-shrink-0" />
                        <a href={item.url} target="_blank" rel="noopener noreferrer"
                          className="flex-1 min-w-0 text-sm text-[#1e2340] hover:text-[#5b7cf7] transition-colors truncate">
                          {item.title}
                        </a>
                        {!item.is_visible && (
                          <span className="text-xs text-[#9ca3af] bg-[#f7f8ff] border border-[#e4e7f5] px-1.5 py-0.5 rounded-full flex-shrink-0">非表示</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
