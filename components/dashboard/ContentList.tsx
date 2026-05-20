'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Content } from '@/types/database'
import { Button } from '@/components/ui/Button'
import { GripVertical, Eye, EyeOff, Trash2, ExternalLink } from 'lucide-react'

const TYPE_LABELS: Record<string, string> = {
  hatena: 'はてな', note: 'note', notion: 'Notion',
  pdf: 'PDF', spreadsheet: 'スプレッドシート', booth: 'BOOTH', other: 'その他',
}
const TYPE_COLORS: Record<string, string> = {
  hatena: 'bg-sky-100 text-sky-700',
  note: 'bg-emerald-100 text-emerald-700',
  notion: 'bg-violet-100 text-violet-700',
  pdf: 'bg-rose-100 text-rose-700',
  spreadsheet: 'bg-lime-100 text-lime-700',
  booth: 'bg-orange-100 text-orange-700',
  other: 'bg-gray-100 text-gray-600',
}

function SortableItem({
  content,
  index,
  onToggleVisible,
  onDelete,
}: {
  content: Content
  index: number
  onToggleVisible: (id: string, visible: boolean) => void
  onDelete: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: content.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 px-4 py-3 bg-white rounded-xl border transition-all
        ${!content.is_visible ? 'opacity-50' : ''}
        ${isDragging ? 'border-[#5b7cf7] shadow-md' : 'border-[#e4e7f5] hover:border-[#c4b5fd]'}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="p-2.5 text-[#9ca3af] hover:text-[#6b7280] cursor-grab active:cursor-grabbing flex-shrink-0"
        aria-label="並び替え"
      >
        <GripVertical size={18} />
      </button>

      <span className="text-sm font-semibold text-[#9ca3af] w-6 flex-shrink-0">{index + 1}</span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[content.content_type] || TYPE_COLORS.other}`}>
            {TYPE_LABELS[content.content_type] || content.content_type}
          </span>
          {content.category && (
            <span className="text-xs text-[#6b7280] bg-[#f7f8ff] border border-[#e4e7f5] px-2 py-0.5 rounded-full">
              {content.category}
            </span>
          )}
        </div>
        <p className="text-sm font-medium text-[#1e2340] truncate">{content.title}</p>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <a
          href={content.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2.5 rounded-lg text-[#9ca3af] hover:text-[#5b7cf7] hover:bg-[#eef0fd] transition-colors"
          title="記事を開く"
        >
          <ExternalLink size={15} />
        </a>
        <button
          onClick={() => onToggleVisible(content.id, !content.is_visible)}
          className="p-2.5 rounded-lg text-[#9ca3af] hover:text-[#5b7cf7] hover:bg-[#eef0fd] transition-colors"
          title={content.is_visible ? '非表示にする' : '表示する'}
        >
          {content.is_visible ? <Eye size={15} /> : <EyeOff size={15} />}
        </button>
        <button
          onClick={() => onDelete(content.id)}
          className="p-2.5 rounded-lg text-[#9ca3af] hover:text-red-500 hover:bg-red-50 transition-colors"
          title="削除"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  )
}

export function ContentList({
  initialContents,
}: {
  initialContents: Content[]
}) {
  const router = useRouter()
  const [contents, setContents] = useState(initialContents)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = contents.findIndex((c) => c.id === active.id)
    const newIndex = contents.findIndex((c) => c.id === over.id)
    const reordered = arrayMove(contents, oldIndex, newIndex).map((c, i) => ({ ...c, display_order: i }))
    setContents(reordered)

    setSaving(true)
    await fetch('/api/contents', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates: reordered.map((c) => ({ id: c.id, display_order: c.display_order })) }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleToggleVisible(id: string, visible: boolean) {
    setContents((prev) => prev.map((c) => c.id === id ? { ...c, is_visible: visible } : c))
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    await supabase.from('contents').update({ is_visible: visible }).eq('id', id)
  }

  async function handleDelete(id: string) {
    if (!confirm('この記事を削除しますか？')) return
    setContents((prev) => prev.filter((c) => c.id !== id))
    await fetch('/api/contents', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    router.refresh()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-[#6b7280]">
          ドラッグ＆ドロップで「読む順番」を設定できます
        </p>
        {saving && <span className="text-xs text-[#6b7280]">保存中...</span>}
        {saved && <span className="text-xs text-[#5b7cf7]">✓ 保存しました</span>}
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={contents.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {contents.map((content, i) => (
              <SortableItem
                key={content.id}
                content={content}
                index={i}
                onToggleVisible={handleToggleVisible}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {contents.length === 0 && (
        <div className="text-center py-12 text-[#9ca3af]">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-sm">コンテンツがまだありません</p>
        </div>
      )}
    </div>
  )
}
