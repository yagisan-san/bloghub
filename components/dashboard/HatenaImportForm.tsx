'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { RefreshCw } from 'lucide-react'

export function HatenaImportForm({ hubId }: { hubId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [hatenaId, setHatenaId] = useState('')
  const [blogId, setBlogId] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setResult(null)
    setLoading(true)

    const res = await fetch('/api/hatena', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hatenaId: hatenaId.trim(), apiKey, blogId: blogId.trim() }),
    })

    if (!res.ok) {
      const { error: msg } = await res.json()
      setError(msg || '接続に失敗しました')
      setLoading(false)
      return
    }

    const { articles } = await res.json()
    const supabase = createClient()

    if (articles.length > 0) {
      const rows = articles.map((a: { externalId: string; title: string; url: string; publishedAt: string; category: string | null; tags: string[]; description: string }, i: number) => ({
        hub_id: hubId,
        title: a.title,
        url: a.url,
        content_type: 'hatena' as const,
        category: a.category,
        tags: a.tags,
        description: a.description,
        published_at: a.publishedAt || null,
        display_order: i,
        external_id: a.externalId,
        is_visible: true,
      }))
      await supabase.from('contents').upsert(rows, { onConflict: 'external_id,hub_id' })
    }

    setLoading(false)
    setResult(`${articles.length}件の記事を取り込みました`)
    setApiKey('')
    router.refresh()
  }

  if (!open) {
    return (
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <RefreshCw size={15} />
        はてな記事を再取得
      </Button>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-[#e4e7f5] p-6"
      style={{ boxShadow: '0 4px 12px rgba(91,124,247,.1)' }}>
      <h3 className="font-bold text-[#1e2340] mb-1">はてなブログ記事を再取得</h3>
      <p className="text-xs text-[#6b7280] mb-4">APIキーは使用後に破棄されます（保存されません）</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input label="はてなID" value={hatenaId} onChange={(e) => setHatenaId(e.target.value)} placeholder="your-hatena-id" required />
        <Input label="ブログID" value={blogId} onChange={(e) => setBlogId(e.target.value)} placeholder="yourname.hatenablog.com" required />
        <Input label="APIキー" type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="AtomPub APIキー" autoComplete="off" required />
        {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
        {result && <p className="text-sm text-[#5b7cf7] bg-[#eef0fd] px-3 py-2 rounded-lg">✓ {result}</p>}
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" type="button" onClick={() => setOpen(false)}>キャンセル</Button>
          <Button size="sm" type="submit" loading={loading}>取得する</Button>
        </div>
      </form>
    </div>
  )
}
