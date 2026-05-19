import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { FileText, Navigation, ExternalLink, ArrowRight, Copy } from 'lucide-react'
import { ContentCard } from '@/components/hub/ContentCard'
import { Content } from '@/types/database'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile) redirect('/onboarding')

  const { data: hub } = await supabase
    .from('hubs')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const { count } = await supabase
    .from('contents')
    .select('*', { count: 'exact', head: true })
    .eq('hub_id', hub?.id || '')
    .eq('is_visible', true)

  const { data: categories } = await supabase
    .from('contents')
    .select('category')
    .eq('hub_id', hub?.id || '')
    .eq('is_visible', true)
    .not('category', 'is', null)

  const { data: latestContent } = await supabase
    .from('contents')
    .select('published_at, created_at')
    .eq('hub_id', hub?.id || '')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const latestDate = latestContent?.published_at || latestContent?.created_at || null
  const fmtDate = (iso: string | null) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('ja-JP', {
      timeZone: 'Asia/Tokyo', year: 'numeric', month: 'long', day: 'numeric',
    })
  }

  const { data: recentContents } = await supabase
    .from('contents')
    .select('*')
    .eq('hub_id', hub?.id || '')
    .eq('is_visible', true)
    .order('display_order', { ascending: true })
    .limit(4)

  const uniqueCats = new Set(categories?.map((c) => c.category).filter(Boolean))
  const publicUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bloghub-sigma.vercel.app'}/u/${profile.username}`

  // 次にやることチェック
  const todos = [
    !profile.display_name && { href: '/dashboard/settings', icon: '👤', text: 'プロフィールの表示名を設定する' },
    !((profile as any).avatar_url) && { href: '/dashboard/settings', icon: '🖼️', text: 'アイコン画像を設定する' },
    (count ?? 0) === 0 && { href: '/dashboard/contents', icon: '📝', text: '最初の記事を追加する' },
    (count ?? 0) > 0 && !hub?.description && { href: '/dashboard/settings', icon: '✍️', text: 'ハブの説明文を書く' },
    (count ?? 0) >= 3 && { href: '/dashboard/reader-flow', icon: '🗺️', text: 'おすすめの読む順番を設定する' },
  ].filter(Boolean) as { href: string; icon: string; text: string }[]

  return (
    <main className="max-w-3xl mx-auto px-4 py-6">
      {/* ウェルカム */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#1e2340]">
          こんにちは、{profile.display_name || profile.username} さん 👋
        </h1>
        <p className="text-[#6b7280] text-sm mt-0.5">あなたの発信ハブを整えましょう</p>
      </div>

      {/* 公開URLカード */}
      <div className="bg-gradient-to-r from-[#5b7cf7] to-[#a78bfa] rounded-2xl p-5 text-white mb-5"
        style={{ boxShadow: '0 8px 24px rgba(91,124,247,.3)' }}>
        <p className="text-xs font-medium opacity-80 mb-2">あなたの公開ページ</p>
        <code className="block bg-white/20 rounded-xl px-3 py-2 text-sm font-mono truncate mb-3">
          /u/{profile.username}
        </code>
        <div className="flex gap-2 flex-wrap">
          <a href={`/u/${profile.username}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-white text-[#5b7cf7] px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-white/90 transition-colors">
            <ExternalLink size={13} />
            開く
          </a>
          <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(publicUrl)}&text=${encodeURIComponent('私の発信まとめページです！ #BlogHub')}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-white/30 transition-colors">
            𝕏 でシェア
          </a>
          <a href={`https://note.com/intent/post?url=${encodeURIComponent(publicUrl)}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-white/30 transition-colors">
            note に貼る
          </a>
        </div>
      </div>

      {/* スタッツ */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: '公開中の記事', value: count ?? 0, unit: '件', icon: '📄' },
          { label: 'カテゴリ数', value: uniqueCats.size, unit: '', icon: '📁' },
          { label: '最終更新', value: fmtDate(latestDate), unit: '', icon: '🕐' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-4 border border-[#e4e7f5]"
            style={{ boxShadow: '0 1px 4px rgba(91,124,247,.06)' }}>
            <span className="text-xl">{stat.icon}</span>
            <p className="text-lg font-bold text-[#1e2340] mt-1 leading-tight">
              {stat.value}<span className="text-xs font-normal text-[#6b7280]">{stat.unit}</span>
            </p>
            <p className="text-[10px] text-[#9ca3af] mt-0.5 leading-tight">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* 次にやること */}
      {todos.length > 0 && (
        <section className="mb-5">
          <h2 className="text-sm font-bold text-[#1e2340] mb-3">✅ 次にやること</h2>
          <div className="flex flex-col gap-2">
            {todos.slice(0, 3).map((todo) => (
              <Link key={todo.text} href={todo.href}
                className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-[#e4e7f5] hover:border-[#5b7cf7] transition-all group"
                style={{ boxShadow: '0 1px 4px rgba(91,124,247,.04)' }}>
                <span className="text-lg flex-shrink-0">{todo.icon}</span>
                <span className="text-sm text-[#374151] group-hover:text-[#5b7cf7] transition-colors flex-1">{todo.text}</span>
                <ArrowRight size={14} className="text-[#9ca3af] group-hover:text-[#5b7cf7] transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* クイックアクション */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Link href="/dashboard/contents"
          className="bg-white rounded-2xl p-4 border border-[#e4e7f5] hover:border-[#c4b5fd] transition-all group"
          style={{ boxShadow: '0 1px 4px rgba(91,124,247,.06)' }}>
          <FileText className="text-[#5b7cf7] mb-2" size={20} />
          <h3 className="font-bold text-[#1e2340] text-sm group-hover:text-[#5b7cf7] transition-colors">記事を管理</h3>
          <p className="text-xs text-[#9ca3af] mt-0.5">追加・並び替え・表示設定</p>
        </Link>
        <Link href="/dashboard/reader-flow"
          className="bg-white rounded-2xl p-4 border border-[#e4e7f5] hover:border-[#c4b5fd] transition-all group"
          style={{ boxShadow: '0 1px 4px rgba(91,124,247,.06)' }}>
          <Navigation className="text-[#5b7cf7] mb-2" size={20} />
          <h3 className="font-bold text-[#1e2340] text-sm group-hover:text-[#5b7cf7] transition-colors">読者導線を設定</h3>
          <p className="text-xs text-[#9ca3af] mt-0.5">おすすめ順・記事マップ</p>
        </Link>
      </div>

      {/* 最新コンテンツ */}
      {recentContents && recentContents.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-[#1e2340]">最近の記事</h2>
            <Link href="/dashboard/contents"
              className="flex items-center gap-1 text-xs text-[#5b7cf7] hover:underline">
              すべて見る
              <ArrowRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {recentContents.map((c) => (
              <ContentCard key={c.id} content={c as Content} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
