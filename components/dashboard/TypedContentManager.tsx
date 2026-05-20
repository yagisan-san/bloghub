'use client'

import { useState, useEffect } from 'react'
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
import { Content, ContentType } from '@/types/database'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { HatenaImportForm } from '@/components/dashboard/HatenaImportForm'
import { GripVertical, Eye, EyeOff, Trash2, ExternalLink, Plus, ChevronDown } from 'lucide-react'

// --------------- メタ情報 ---------------
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

const TYPE_COLORS: Record<string, string> = {
  hatena: 'bg-sky-100 text-sky-700',
  note: 'bg-emerald-100 text-emerald-700',
  notion: 'bg-violet-100 text-violet-700',
  pdf: 'bg-rose-100 text-rose-700',
  spreadsheet: 'bg-lime-100 text-lime-700',
  booth: 'bg-orange-100 text-orange-700',
  youtube: 'bg-red-100 text-red-700',
  other: 'bg-gray-100 text-gray-600',
}

// 「＋ 追加」パネルに表示する種別（hatena は別フローなので除外）
const ADD_TYPES: ContentType[] = ['note', 'notion', 'pdf', 'spreadsheet', 'booth', 'youtube', 'other']

// --------------- SortableItem ---------------
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
          {content.category && (
            <span className="text-xs text-[#6b7280] bg-[#f7f8ff] border border-[#e4e7f5] px-2 py-0.5 rounded-full">
              {content.category}
            </span>
          )}
        </div>
        <p className="text-sm font-medium text-[#1e2340] truncate">{content.title}</p>
        <p className="text-xs text-[#9ca3af] truncate">{content.url}</p>
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

// --------------- インラインURL追加フォーム ---------------
function InlineAddForm({
  hubId,
  contentType,
  onSuccess,
  onCancel,
}: {
  hubId: string
  contentType: ContentType
  onSuccess: () => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [ogpLoading, setOgpLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleUrlBlur() {
    if (!url.trim()) return
    setOgpLoading(true)
    try {
      const res = await fetch(`/api/ogp?url=${encodeURIComponent(url.trim())}`)
      if (res.ok) {
        const data = await res.json()
        if (data.title && !title.trim()) setTitle(data.title)
        if (data.description && !description.trim()) setDescription(data.description)
        if (data.image && !thumbnailUrl) setThumbnailUrl(data.image)
      }
    } catch {
      // サイレントに失敗
    } finally {
      setOgpLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    // その他タイプはコンテンツ名（category）が必須
    if (contentType === 'other' && !category.trim()) {
      setError('コンテンツ名を入力してください')
      return
    }

    setLoading(true)

    const res = await fetch('/api/contents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hub_id: hubId,
        title: title.trim(),
        url: url.trim(),
        content_type: contentType,
        category: category.trim() || null,
        description: description.trim() || null,
        thumbnail_url: thumbnailUrl || null,
      }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error || '追加に失敗しました')
      setLoading(false)
      return
    }

    setLoading(false)
    onSuccess()
  }

  const meta = TYPE_META[contentType] ?? TYPE_META.other

  return (
    <div className="mt-3 bg-[#f7f8ff] border border-[#e4e7f5] rounded-xl p-4">
      <p className="text-sm font-semibold text-[#1e2340] mb-3">
        {meta.icon} {meta.label} を追加
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="relative">
          <Input
            label="タイトル"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="記事・コンテンツのタイトル"
            required
          />
          {ogpLoading && (
            <span className="absolute right-3 top-8 text-xs text-[#9ca3af]">取得中...</span>
          )}
        </div>
        <Input
          label="URL"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onBlur={handleUrlBlur}
          placeholder="https://"
          required
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-[#1e2340]">概要（任意）</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="記事の概要"
            rows={2}
            className="px-3.5 py-2.5 border-[1.5px] border-[#e4e7f5] rounded-[10px] text-sm bg-white text-[#1e2340] outline-none focus:border-[#5b7cf7] resize-y"
          />
        </div>
        {contentType === 'other' ? (
          <Input
            label="コンテンツ名（必須）"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="例：無料テンプレート、PDF資料、外部リンク集"
            hint="公開ページのカードタイトルになります"
            required
          />
        ) : (
          <Input
            label="カテゴリ（任意）"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="例：技術、デザイン"
          />
        )}
        {error && (
          <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" type="button" onClick={onCancel}>
            キャンセル
          </Button>
          <Button size="sm" type="submit" loading={loading}>
            追加する
          </Button>
        </div>
      </form>
    </div>
  )
}

// --------------- タブコンテンツ（はてな以外） ---------------
function GenericTabContent({
  hubId,
  contentType,
  contents,
  onContentsChange,
}: {
  hubId: string
  contentType: ContentType
  contents: Content[]
  onContentsChange: (updated: Content[]) => void
}) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()

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
    onContentsChange(reordered)

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
    onContentsChange(contents.map((c) => c.id === id ? { ...c, is_visible: visible } : c))
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    await supabase.from('contents').update({ is_visible: visible }).eq('id', id)
  }

  async function handleDelete(id: string) {
    if (!confirm('このコンテンツを削除しますか？')) return
    const prev = [...contents]
    onContentsChange(contents.filter((c) => c.id !== id))
    const res = await fetch('/api/contents', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (!res.ok) {
      onContentsChange(prev)
      alert('削除に失敗しました。もう一度お試しください。')
      return
    }
    router.refresh()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-[#6b7280]">ドラッグ＆ドロップで順番を変更できます</p>
        <div className="flex gap-2 items-center">
          {saving && <span className="text-xs text-[#6b7280]">保存中...</span>}
          {saved && <span className="text-xs text-[#5b7cf7]">✓ 保存しました</span>}
        </div>
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

      {contents.length === 0 && !showAddForm && (
        <div className="text-center py-8 text-[#9ca3af]">
          <p className="text-3xl mb-2">{TYPE_META[contentType]?.icon ?? '🔗'}</p>
          <p className="text-sm">まだコンテンツがありません</p>
        </div>
      )}

      {showAddForm ? (
        <InlineAddForm
          hubId={hubId}
          contentType={contentType}
          onSuccess={() => {
            setShowAddForm(false)
            router.refresh()
          }}
          onCancel={() => setShowAddForm(false)}
        />
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-[#c4b5fd] text-[#5b7cf7] text-sm font-medium hover:bg-[#eef0fd] transition-colors"
        >
          <Plus size={16} />
          URLを追加
        </button>
      )}
    </div>
  )
}

// --------------- はてなタブ ---------------
function HatenaTabContent({
  hubId,
  contents,
  onContentsChange,
}: {
  hubId: string
  contents: Content[]
  onContentsChange: (updated: Content[]) => void
}) {
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
    onContentsChange(reordered)

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
    onContentsChange(contents.map((c) => c.id === id ? { ...c, is_visible: visible } : c))
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    await supabase.from('contents').update({ is_visible: visible }).eq('id', id)
  }

  async function handleDelete(id: string) {
    if (!confirm('この記事を削除しますか？')) return
    onContentsChange(contents.filter((c) => c.id !== id))
    await fetch('/api/contents', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-[#6b7280]">ドラッグ＆ドロップで「読む順番」を設定できます</p>
        <div className="flex gap-2 items-center">
          {saving && <span className="text-xs text-[#6b7280]">保存中...</span>}
          {saved && <span className="text-xs text-[#5b7cf7]">✓ 保存しました</span>}
          <HatenaImportForm hubId={hubId} />
        </div>
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
          <p className="text-4xl mb-3">✏️</p>
          <p className="text-sm">はてなブログの記事がありません</p>
          <p className="text-xs mt-1">「↻ はてな記事を再取得」から取り込んでください</p>
        </div>
      )}
    </div>
  )
}

// --------------- 「＋ 追加」パネル ---------------
function AddTypePanel({
  onSelectType,
}: {
  onSelectType: (type: ContentType) => void
}) {
  return (
    <div className="py-4">
      <p className="text-sm text-[#6b7280] mb-4 text-center">追加する種別を選んでください</p>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {ADD_TYPES.map((type) => {
          const meta = TYPE_META[type]
          return (
            <button
              key={type}
              onClick={() => onSelectType(type)}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[#e4e7f5] bg-white hover:border-[#5b7cf7] hover:bg-[#eef0fd] transition-all"
            >
              <span className="text-2xl">{meta.icon}</span>
              <span className="text-xs font-medium text-[#1e2340] text-center leading-tight">{meta.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// --------------- メインコンポーネント ---------------
export function TypedContentManager({
  hubId,
  initialContents,
}: {
  hubId: string
  initialContents: Content[]
}) {
  const [allContents, setAllContents] = useState(initialContents)
  const [activeTab, setActiveTab] = useState<ContentType | 'add'>(() => {
    // 最初に存在する種別のタブをデフォルトに
    const types = [...new Set(initialContents.map((c) => c.content_type as ContentType))]
    return types[0] ?? 'add'
  })
  const [pendingAddType, setPendingAddType] = useState<ContentType | null>(null)

  // サーバーから新しいデータが来たら即座に反映
  useEffect(() => {
    setAllContents(initialContents)
  }, [initialContents])

  // 種別ごとにコンテンツを分類
  const typeGroups = allContents.reduce<Record<string, Content[]>>((acc, c) => {
    const key = c.content_type
    if (!acc[key]) acc[key] = []
    acc[key].push(c)
    return acc
  }, {})

  // 表示するタブ一覧（存在する種別 + 「＋ 追加」）
  const existingTypes = Object.keys(TYPE_META).filter(
    (t) => typeGroups[t] && typeGroups[t].length > 0
  ) as ContentType[]

  function handleSelectAddType(type: ContentType) {
    // そのタブが既存なら切り替えてフォームを開く、なければタブを新規作成して切り替え
    setActiveTab(type)
    setPendingAddType(type)
  }

  function handleContentsChange(type: ContentType, updated: Content[]) {
    setAllContents((prev) => [
      ...prev.filter((c) => c.content_type !== type),
      ...updated,
    ])
  }

  const tabTypes = existingTypes

  return (
    <div>
      {/* タブバー */}
      <div className="flex gap-1 flex-wrap border-b border-[#e4e7f5] mb-5 pb-0">
        {tabTypes.map((type) => {
          const meta = TYPE_META[type]
          const count = typeGroups[type]?.length ?? 0
          const isActive = activeTab === type
          return (
            <button
              key={type}
              onClick={() => {
                setActiveTab(type)
                setPendingAddType(null)
              }}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-all -mb-px
                ${isActive
                  ? 'border-[#5b7cf7] text-[#5b7cf7] bg-[#eef0fd]'
                  : 'border-transparent text-[#6b7280] hover:text-[#1e2340] hover:bg-[#f7f8ff]'
                }`}
            >
              {meta.icon} {meta.label}
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full font-semibold
                ${isActive ? 'bg-[#5b7cf7] text-white' : 'bg-[#e4e7f5] text-[#6b7280]'}`}>
                {count}
              </span>
            </button>
          )
        })}

        {/* ＋ 追加タブ */}
        <button
          onClick={() => {
            setActiveTab('add')
            setPendingAddType(null)
          }}
          className={`px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-all -mb-px flex items-center gap-1
            ${activeTab === 'add'
              ? 'border-[#5b7cf7] text-[#5b7cf7] bg-[#eef0fd]'
              : 'border-transparent text-[#6b7280] hover:text-[#1e2340] hover:bg-[#f7f8ff]'
            }`}
        >
          <Plus size={14} />
          追加
        </button>
      </div>

      {/* タブコンテンツ */}
      {activeTab === 'add' ? (
        <AddTypePanel onSelectType={handleSelectAddType} />
      ) : activeTab === 'hatena' ? (
        <HatenaTabContent
          hubId={hubId}
          contents={typeGroups['hatena'] ?? []}
          onContentsChange={(updated) => handleContentsChange('hatena', updated)}
        />
      ) : (
        <GenericTabContentWithPendingForm
          hubId={hubId}
          contentType={activeTab}
          contents={typeGroups[activeTab] ?? []}
          openFormOnMount={pendingAddType === activeTab}
          onContentsChange={(updated) => handleContentsChange(activeTab as ContentType, updated)}
          onFormMounted={() => setPendingAddType(null)}
        />
      )}
    </div>
  )
}

// pendingAddType を受け取り、マウント時にフォームを開くラッパー
function GenericTabContentWithPendingForm({
  hubId,
  contentType,
  contents,
  openFormOnMount,
  onContentsChange,
  onFormMounted,
}: {
  hubId: string
  contentType: ContentType
  contents: Content[]
  openFormOnMount: boolean
  onContentsChange: (updated: Content[]) => void
  onFormMounted: () => void
}) {
  const [showAddForm, setShowAddForm] = useState(openFormOnMount)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()

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
    onContentsChange(reordered)

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
    onContentsChange(contents.map((c) => c.id === id ? { ...c, is_visible: visible } : c))
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    await supabase.from('contents').update({ is_visible: visible }).eq('id', id)
  }

  async function handleDelete(id: string) {
    if (!confirm('このコンテンツを削除しますか？')) return
    const prev = [...contents]
    onContentsChange(contents.filter((c) => c.id !== id))
    const res = await fetch('/api/contents', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (!res.ok) {
      onContentsChange(prev)
      alert('削除に失敗しました。もう一度お試しください。')
      return
    }
    router.refresh()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-[#6b7280]">ドラッグ＆ドロップで順番を変更できます</p>
        <div className="flex gap-2 items-center">
          {saving && <span className="text-xs text-[#6b7280]">保存中...</span>}
          {saved && <span className="text-xs text-[#5b7cf7]">✓ 保存しました</span>}
        </div>
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

      {contents.length === 0 && !showAddForm && (
        <div className="text-center py-8 text-[#9ca3af]">
          <p className="text-3xl mb-2">{TYPE_META[contentType]?.icon ?? '🔗'}</p>
          <p className="text-sm">まだコンテンツがありません</p>
        </div>
      )}

      {showAddForm ? (
        <InlineAddForm
          hubId={hubId}
          contentType={contentType}
          onSuccess={() => {
            setShowAddForm(false)
            onFormMounted()
            router.refresh()
          }}
          onCancel={() => {
            setShowAddForm(false)
            onFormMounted()
          }}
        />
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-[#c4b5fd] text-[#5b7cf7] text-sm font-medium hover:bg-[#eef0fd] transition-colors"
        >
          <Plus size={16} />
          URLを追加
        </button>
      )}
    </div>
  )
}
