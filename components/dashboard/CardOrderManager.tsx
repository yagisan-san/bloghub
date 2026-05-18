'use client'

import { useState } from 'react'
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor,
  useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { createClient } from '@/lib/supabase/client'
import { GripVertical } from 'lucide-react'

const TYPE_META: Record<string, { label: string; icon: string }> = {
  hatena:      { label: 'はてなブログ', icon: '✏️' },
  note:        { label: 'note',         icon: '📝' },
  pdf:         { label: 'PDF',          icon: '📄' },
  notion:      { label: 'Notion',       icon: '📋' },
  youtube:     { label: 'YouTube',      icon: '▶️' },
  spreadsheet: { label: 'スプレッドシート', icon: '📊' },
  booth:       { label: 'BOOTH',        icon: '🛍️' },
  other:       { label: 'その他',       icon: '🔗' },
  twitter:     { label: 'X (Twitter)', icon: '𝕏' },
  instagram:   { label: 'Instagram',   icon: '📸' },
  youtube_sns: { label: 'YouTube SNS', icon: '▶️' },
  email:       { label: 'メール',       icon: '✉️' },
}

function SortableCard({ id }: { id: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const meta = TYPE_META[id] || { label: id, icon: '🔗' }
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }

  return (
    <div ref={setNodeRef} style={style}
      className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-[#e4e7f5] cursor-default">
      <button {...attributes} {...listeners}
        className="text-[#9ca3af] hover:text-[#6b7280] cursor-grab active:cursor-grabbing flex-shrink-0">
        <GripVertical size={16} />
      </button>
      <span className="text-lg">{meta.icon}</span>
      <span className="text-sm font-medium text-[#1e2340]">{meta.label}</span>
    </div>
  )
}

interface Props {
  hubId: string
  initialOrder: string[]
  activeContentTypes: string[]
  activeSnsKeys: string[]
}

export function CardOrderManager({ hubId, initialOrder, activeContentTypes, activeSnsKeys }: Props) {
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // 初期順番を構築：保存済み順 + 未登録のものを末尾に追加
  const allKeys = [...activeContentTypes, ...activeSnsKeys]
  const orderedKeys = [
    ...initialOrder.filter((k) => allKeys.includes(k)),
    ...allKeys.filter((k) => !initialOrder.includes(k)),
  ]
  const [items, setItems] = useState(orderedKeys)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = items.indexOf(active.id as string)
    const newIdx = items.indexOf(over.id as string)
    const newItems = arrayMove(items, oldIdx, newIdx)
    setItems(newItems)

    setSaving(true)
    await supabase.from('hubs').update({ card_order: newItems } as any).eq('id', hubId)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-[#9ca3af]">表示中のコンテンツがありません</p>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-[#6b7280]">ドラッグ＆ドロップで順番を変更できます</p>
        {saving && <span className="text-xs text-[#9ca3af]">保存中...</span>}
        {saved && <span className="text-xs text-[#5b7cf7]">✓ 保存しました</span>}
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {items.map((id) => <SortableCard key={id} id={id} />)}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
