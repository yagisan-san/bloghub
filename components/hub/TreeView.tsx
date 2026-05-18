'use client'

import { useState } from 'react'
import { Content } from '@/types/database'
import { ExternalLink, ChevronDown, ChevronRight, FolderOpen } from 'lucide-react'

const NEUTRAL_COLOR = '#374151'
const NEUTRAL_BG = '#f3f4f6'

function buildTree(items: Content[]): {
  roots: Content[]
  childrenOf: Record<string, Content[]>
} {
  const childrenOf: Record<string, Content[]> = {}
  const roots: Content[] = []

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
  childrenOf,
}: {
  item: Content
  depth: number
  childrenOf: Record<string, Content[]>
}) {
  const children = childrenOf[item.id] || []
  const [expanded, setExpanded] = useState(true)
  const hasChildren = children.length > 0

  return (
    <div className={depth > 0 ? 'ml-6 border-l-2 border-[#d1d5db] pl-4' : ''}>
      <div className="flex items-center gap-2 py-2 group">
        {hasChildren ? (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-5 h-5 flex items-center justify-center rounded text-[#9ca3af] hover:text-[#5b7cf7] flex-shrink-0"
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <span className="w-5 h-5 flex items-center justify-center flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d1d5db]" />
          </span>
        )}

        {hasChildren ? (
          <FolderOpen size={15} className="flex-shrink-0 text-[#374151]" />
        ) : (
          <span className="w-3.5 h-3.5 rounded flex-shrink-0 border-2 border-[#374151] bg-[#f3f4f6]" />
        )}

        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 min-w-0 text-sm text-[#1e2340] hover:text-[#5b7cf7] transition-colors truncate"
        >
          {item.title}
        </a>

        {item.category && (
          <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0 hidden sm:inline bg-[#f3f4f6] text-[#6b7280]">
            {item.category}
          </span>
        )}

        <ExternalLink size={11} className="flex-shrink-0 text-[#9ca3af] opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {expanded && hasChildren && (
        <div className="mt-1 mb-1">
          {children.map((child) => (
            <TreeNode
              key={child.id}
              item={child}
              depth={depth + 1}
              childrenOf={childrenOf}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function TreeView({ contents, hubTitle }: { contents: Content[]; hubTitle: string }) {
  if (!contents.length) {
    return (
      <div className="text-center py-20 text-[#9ca3af]">
        <p className="text-4xl mb-3">📭</p>
        <p>記事がまだありません</p>
      </div>
    )
  }

  const { roots, childrenOf } = buildTree(contents)
  const hasHierarchy = contents.some((c) => c.parent_id !== null)

  if (!hasHierarchy) {
    const groups: Record<string, Content[]> = {}
    for (const c of contents) {
      const key = c.category || '未分類'
      if (!groups[key]) groups[key] = []
      groups[key].push(c)
    }
    const sorted = Object.entries(groups).sort((a, b) => b[1].length - a[1].length)

    return (
      <div className="bg-white rounded-2xl border border-[#e4e7f5] overflow-hidden"
        style={{ boxShadow: '0 1px 4px rgba(91,124,247,.06)' }}>
        <div className="px-5 py-3 bg-[#f7f8ff] border-b border-[#e4e7f5] text-sm text-[#6b7280]">
          <span className="font-semibold text-[#1e2340]">{hubTitle}</span>
          <span className="ml-2">· {contents.length}件</span>
          <span className="ml-2 text-xs text-[#9ca3af]">（管理画面でツリー構造を設定すると階層表示になります）</span>
        </div>
        <div className="p-4 flex flex-col gap-2">
          {sorted.map(([cat, arts]) => (
            <div key={cat}>
              <p className="text-xs font-semibold text-[#6b7280] mb-1.5 mt-2">{cat}</p>
              {arts.map((a) => (
                <div key={a.id} className="ml-3 border-l-2 border-[#e4e7f5] pl-3">
                  <a href={a.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 py-1.5 text-sm text-[#1e2340] hover:text-[#5b7cf7] transition-colors group">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d1d5db] flex-shrink-0" />
                    <span className="truncate">{a.title}</span>
                    <ExternalLink size={11} className="opacity-0 group-hover:opacity-100 flex-shrink-0" />
                  </a>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-[#e4e7f5] overflow-hidden"
      style={{ boxShadow: '0 1px 4px rgba(91,124,247,.06)' }}>
      <div className="flex items-center gap-2 px-5 py-3.5 bg-gradient-to-r from-[#eef0fd] to-[#f7f8ff] border-b border-[#e4e7f5]">
        <span className="text-lg">🏠</span>
        <span className="font-bold text-[#1e2340] text-sm">{hubTitle}</span>
        <span className="ml-auto text-xs text-[#6b7280]">{contents.length}件</span>
      </div>
      <div className="p-4">
        {roots.map((root) => (
          <TreeNode key={root.id} item={root} depth={0} childrenOf={childrenOf} />
        ))}
      </div>
    </div>
  )
}
