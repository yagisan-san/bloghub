'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ExternalLink, ChevronRight } from 'lucide-react'

interface ContentItem {
  id: string
  title: string
  url: string
  category: string | null
  parent_id: string | null
  is_visible: boolean
}

interface Props {
  contents: ContentItem[]
}

function buildTree(items: ContentItem[]): { roots: ContentItem[]; childrenOf: Record<string, ContentItem[]> } {
  const childrenOf: Record<string, ContentItem[]> = {}
  const roots: ContentItem[] = []

  for (const item of items) {
    const pid = item.parent_id || '__root__'
    if (!childrenOf[pid]) childrenOf[pid] = []
    childrenOf[pid].push(item)
  }

  roots.push(...(childrenOf['__root__'] || []))
  return { roots, childrenOf }
}

function TreeNode({
  item,
  depth,
  allItems,
  childrenOf,
  onParentChange,
}: {
  item: ContentItem
  depth: number
  allItems: ContentItem[]
  childrenOf: Record<string, ContentItem[]>
  onParentChange: (id: string, newParentId: string | null) => void
}) {
  const children = childrenOf[item.id] || []

  // 自分自身と自分の子孫は選択不可にする
  function isDescendant(targetId: string, ancestorId: string): boolean {
    const kids = childrenOf[ancestorId] || []
    return kids.some((k) => k.id === targetId || isDescendant(targetId, k.id))
  }

  return (
    <div>
      <div
        className="flex items-center gap-2 py-2.5 px-4 hover:bg-[#f7f8ff] rounded-xl transition-colors group"
        style={{ paddingLeft: `${16 + depth * 24}px` }}
      >
        {/* ツリーライン */}
        {depth > 0 && (
          <ChevronRight size={13} className="text-[#d1d5db] flex-shrink-0 -ml-4" />
        )}

        {/* タイトル */}
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 min-w-0 text-sm text-[#1e2340] hover:text-[#5b7cf7] truncate transition-colors"
        >
          {item.title}
        </a>
        {!item.is_visible && (
          <span className="text-xs text-[#9ca3af] bg-[#f7f8ff] border border-[#e4e7f5] px-1.5 py-0.5 rounded-full flex-shrink-0">
            非表示
          </span>
        )}

        {/* 親を設定ドロップダウン */}
        <select
          value={item.parent_id || ''}
          onChange={(e) => onParentChange(item.id, e.target.value || null)}
          className="text-xs border border-[#e4e7f5] rounded-lg px-2 py-1.5 bg-white text-[#6b7280]
            outline-none focus:border-[#5b7cf7] cursor-pointer flex-shrink-0 max-w-[160px]"
          title="親コンテンツを設定"
        >
          <option value="">（トップレベル）</option>
          {allItems
            .filter((a) => a.id !== item.id && !isDescendant(a.id, item.id))
            .map((a) => (
              <option key={a.id} value={a.id}>
                {a.title.length > 20 ? a.title.slice(0, 20) + '…' : a.title}
              </option>
            ))}
        </select>
      </div>

      {/* 子ノードを再帰的に表示 */}
      {children.map((child) => (
        <TreeNode
          key={child.id}
          item={child}
          depth={depth + 1}
          allItems={allItems}
          childrenOf={childrenOf}
          onParentChange={onParentChange}
        />
      ))}
    </div>
  )
}

export function TreeEditor({ contents }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [items, setItems] = useState(contents)
  const [saving, setSaving] = useState<string | null>(null)
  const [savedId, setSavedId] = useState<string | null>(null)

  async function handleParentChange(id: string, newParentId: string | null) {
    setItems((prev) => prev.map((c) => c.id === id ? { ...c, parent_id: newParentId } : c))
    setSaving(id)
    await supabase.from('contents').update({ parent_id: newParentId }).eq('id', id)
    setSaving(null)
    setSavedId(id)
    setTimeout(() => setSavedId(null), 2000)
    router.refresh()
  }

  const { roots, childrenOf } = buildTree(items)

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-[#9ca3af] text-sm">
        コンテンツがありません
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 text-xs text-[#6b7280] bg-[#f7f8ff] border border-[#e4e7f5] rounded-xl px-4 py-3">
        <span>💡</span>
        <span>「親コンテンツ」ドロップダウンで階層を設定できます。「トップレベル」を選ぶと最上位に移動します。</span>
      </div>

      <div className="bg-white rounded-2xl border border-[#e4e7f5] overflow-hidden"
        style={{ boxShadow: '0 1px 4px rgba(91,124,247,.06)' }}>
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#f7f8ff] border-b border-[#e4e7f5] text-xs font-semibold text-[#6b7280]">
          <span>コンテンツ</span>
          <span>親コンテンツを設定</span>
        </div>

        {/* ツリー */}
        <div className="py-2">
          {roots.map((root) => (
            <div key={root.id} className="relative">
              {saving === root.id && (
                <span className="absolute right-2 top-3 text-xs text-[#9ca3af]">保存中...</span>
              )}
              {savedId === root.id && (
                <span className="absolute right-2 top-3 text-xs text-[#5b7cf7]">✓</span>
              )}
              <TreeNode
                item={root}
                depth={0}
                allItems={items}
                childrenOf={childrenOf}
                onParentChange={handleParentChange}
              />
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-[#9ca3af] mt-3 text-center">
        設定はリアルタイムで保存されます
      </p>
    </div>
  )
}
