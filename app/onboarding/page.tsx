'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

type Step = 'username' | 'hatena'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('username')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [hatenaId, setHatenaId] = useState('')
  const [blogId, setBlogId] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [hatenaError, setHatenaError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleUsernameSubmit(e: React.FormEvent) {
    e.preventDefault()
    setUsernameError('')

    const cleaned = username.trim().toLowerCase()
    if (!/^[a-z0-9_-]{3,30}$/.test(cleaned)) {
      setUsernameError('3〜30文字の英数字・ハイフン・アンダースコアで入力してください')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    // username重複チェック
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', cleaned)
      .maybeSingle()

    if (existing) {
      setUsernameError('このユーザー名はすでに使われています')
      setLoading(false)
      return
    }

    // プロフィール作成
    const { error } = await supabase.from('profiles').insert({
      id: user.id,
      username: cleaned,
      display_name: displayName.trim() || cleaned,
    })

    if (error) {
      setUsernameError('エラーが発生しました: ' + error.message)
      setLoading(false)
      return
    }

    // ハブ作成
    await supabase.from('hubs').insert({
      user_id: user.id,
      title: (displayName.trim() || cleaned) + ' の発信ハブ',
      is_public: true,
      default_view: 'grid',
    })

    setLoading(false)
    setStep('hatena')
  }

  async function handleHatenaSubmit(e: React.FormEvent) {
    e.preventDefault()
    setHatenaError('')
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const res = await fetch('/api/hatena', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hatenaId: hatenaId.trim(), apiKey, blogId: blogId.trim() }),
    })

    if (!res.ok) {
      const { error } = await res.json()
      setHatenaError(error || '接続に失敗しました')
      setLoading(false)
      return
    }

    const { articles } = await res.json()

    // hubIDを取得してコンテンツ保存
    const { data: hub } = await supabase
      .from('hubs')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (hub && articles.length > 0) {
      const rows = articles.map((a: { externalId: string; title: string; url: string; publishedAt: string; category: string | null; tags: string[]; description: string }, i: number) => ({
        hub_id: hub.id,
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
    router.push('/dashboard')
  }

  function skipHatena() {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(140deg, #eef2ff 0%, #f7f8ff 50%, #f5f0ff 100%)' }}>
      <div className="w-full max-w-[480px]">

        {/* ステップインジケーター */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {(['username', 'hatena'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                ${step === s ? 'bg-[#5b7cf7] text-white' : i < (['username', 'hatena'] as Step[]).indexOf(step) ? 'bg-[#5b7cf7]/20 text-[#5b7cf7]' : 'bg-[#e4e7f5] text-[#9ca3af]'}`}>
                {i + 1}
              </div>
              {i < 1 && <div className="w-12 h-0.5 bg-[#e4e7f5]" />}
            </div>
          ))}
        </div>

        {step === 'username' && (
          <div className="bg-white rounded-2xl p-8 border border-[#e4e7f5]"
            style={{ boxShadow: '0 12px 32px rgba(91,124,247,.12)' }}>
            <h2 className="text-xl font-bold text-[#1e2340] mb-1">ハブの設定</h2>
            <p className="text-sm text-[#6b7280] mb-6">あなたの公開URLになります</p>
            <form onSubmit={handleUsernameSubmit} className="flex flex-col gap-4">
              <Input
                label="ユーザー名（公開URL）"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="例：yaaaaaj84"
                hint="bloghub.vercel.app/u/ユーザー名 として公開されます"
                error={usernameError}
                required
              />
              <Input
                label="表示名"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="例：やじま たくみ"
                hint="省略するとユーザー名が使われます"
              />
              <Button type="submit" loading={loading} className="w-full mt-2">
                次へ →
              </Button>
            </form>
          </div>
        )}

        {step === 'hatena' && (
          <div className="bg-white rounded-2xl p-8 border border-[#e4e7f5]"
            style={{ boxShadow: '0 12px 32px rgba(91,124,247,.12)' }}>
            <h2 className="text-xl font-bold text-[#1e2340] mb-1">はてなブログを連携</h2>
            <p className="text-sm text-[#6b7280] mb-6">記事を自動で取り込めます（スキップ可）</p>

            <div className="bg-[#eef0fd] rounded-xl px-4 py-3 mb-5 text-sm text-[#5b7cf7]">
              🔒 APIキーはサーバー側でのみ使用し、保存されません
            </div>

            <form onSubmit={handleHatenaSubmit} className="flex flex-col gap-4">
              <Input
                label="はてなID"
                value={hatenaId}
                onChange={(e) => setHatenaId(e.target.value)}
                placeholder="例：your-hatena-id"
                required
              />
              <Input
                label="ブログID（ドメイン）"
                value={blogId}
                onChange={(e) => setBlogId(e.target.value)}
                placeholder="例：yourname.hatenablog.com"
                required
              />
              <Input
                label="APIキー"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="はてなブログ → 設定 → 詳細設定 → AtomPub"
                hint="APIキーはブログ管理画面の「詳細設定」→「AtomPub」で確認できます"
                autoComplete="off"
                required
              />
              {hatenaError && (
                <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{hatenaError}</p>
              )}
              <Button type="submit" loading={loading} className="w-full mt-2">
                記事を取り込む
              </Button>
            </form>

            <button
              onClick={skipHatena}
              className="w-full mt-3 text-sm text-[#6b7280] hover:text-[#1e2340] transition-colors"
            >
              スキップして後で設定する →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
