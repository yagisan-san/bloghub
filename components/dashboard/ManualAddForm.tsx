'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ContentType } from '@/types/database'
import { Plus, X } from 'lucide-react'

const TYPES: { value: ContentType; label: string }[] = [
  { value: 'note', label: 'note' },
  { value: 'notion', label: 'Notion' },
  { value: 'pdf', label: 'PDF' },
  { value: 'spreadsheet', label: 'スプレッドシート' },
  { value: 'booth', label: 'BOOTH' },
  { value: 'other', label: 'その他' },
]

export function ManualAddForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [added, setAdded] = useState(0)
  const [form, setForm] = useState({
    title: '', url: '', content_type: 'note' as ContentType, category: '', description: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/contents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setLoading(false)
    if (res.ok) {
      // フォームをリセットして開いたままにする（連続追加できるよう）
      setForm({ title: '', url: '', content_type: form.content_type, category: form.category, description: '' })
      setAdded((n) => n + 1)
      router.refresh()
    }
  }

  if (!open) {
    return (
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <Plus size={15} />
        記事を手動追加
      </Button>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-[#e4e7f5] p-6"
      style={{ boxShadow: '0 4px 12px rgba(91,124,247,.1)' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-[#1e2340]">記事を手動追加</h3>
          {added > 0 && (
            <span className="text-xs text-[#5b7cf7] bg-[#eef0fd] px-2 py-0.5 rounded-full font-medium">
              ✓ {added}件追加済み
            </span>
          )}
        </div>
        <button onClick={() => { setOpen(false); setAdded(0) }} className="text-[#9ca3af] hover:text-[#6b7280]">
          <X size={18} />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="タイトル *"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="記事のタイトル"
          required
        />
        <Input
          label="URL *"
          type="url"
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
          placeholder="https://note.com/..."
          required
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-[#1e2340]">種別</label>
          <select
            value={form.content_type}
            onChange={(e) => setForm({ ...form, content_type: e.target.value as ContentType })}
            className="px-3.5 py-2.5 border-[1.5px] border-[#e4e7f5] rounded-[10px] text-sm bg-white text-[#1e2340] outline-none focus:border-[#5b7cf7]"
          >
            {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <Input
          label="カテゴリ"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          placeholder="例：AI活用、副業"
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-[#1e2340]">概要</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="記事の概要（省略可）"
            rows={3}
            className="px-3.5 py-2.5 border-[1.5px] border-[#e4e7f5] rounded-[10px] text-sm bg-white text-[#1e2340] outline-none focus:border-[#5b7cf7] resize-y"
          />
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" type="button" onClick={() => { setOpen(false); setAdded(0) }}>閉じる</Button>
          <Button size="sm" type="submit" loading={loading}>追加する</Button>
        </div>
      </form>
    </div>
  )
}
