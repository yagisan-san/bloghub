import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { LayoutGrid, Settings, ExternalLink, ArrowRight } from 'lucide-react'
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

  // 最終更新日（最新のpublished_atまたはcreated_at）
  const { data: latestContent } = await supabase
    .from('contents')
    .select('published_at, created_at')
    .eq('hub_id', hub?.id || '')
    .order('published_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const latestDate = latestContent?.published_at || latestContent?.created_at || null
  const fmtDate = (iso: string | null) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('ja-JP', {
      timeZone: 'Asia/Tokyo',
      year: 'numeric', month: 'long', day: 'numeric',
    })
  }

  // 最新コンテンツ8件を取得
  const { data: recentContents } = await supabase
    .from('contents')
    .select('*')
    .eq('hub_id', hub?.id || '')
    .eq('is_visible', true)
    .order('display_order', { ascending: true })
    .limit(8)

  const uniqueCats = new Set(categories?.map((c) => c.category).filter(Boolean))

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
        {/* ウェルカム */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#1e2340] mb-1">
            こんにちは、{profile.display_name || profile.username} さん
          </h1>
          <p className="text-[#6b7280] text-sm">あなたの発信ハブを管理しましょう</p>
        </div>

        {/* 公開URLカード */}
        <div className="bg-gradient-to-r from-[#5b7cf7] to-[#a78bfa] rounded-2xl p-6 text-white mb-6"
          style={{ boxShadow: '0 8px 24px rgba(91,124,247,.3)' }}>
          <p className="text-sm font-medium opacity-80 mb-2">あなたの公開ページURL</p>
          <div className="flex items-center gap-3">
            <code className="flex-1 bg-white/20 rounded-xl px-4 py-2 text-sm font-mono truncate">
              /u/{profile.username}
            </code>
            <a
              href={`/u/${profile.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-white text-[#5b7cf7] px-4 py-2 rounded-xl text-sm font-semibold hover:bg-white/90 transition-colors flex-shrink-0"
            >
              <ExternalLink size={14} />
              開く
            </a>
          </div>
          <p className="text-xs opacity-70 mt-3">このURLをXプロフィールやnoteに貼り付けましょう</p>
        </div>

        {/* スタッツ */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: '公開中の記事', value: count ?? 0, unit: '件', icon: '📄' },
            { label: 'カテゴリ数', value: uniqueCats.size, unit: '', icon: '📁' },
            { label: '最終更新日', value: fmtDate(latestDate), unit: '', icon: '🕐' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-5 border border-[#e4e7f5]"
              style={{ boxShadow: '0 1px 4px rgba(91,124,247,.06)' }}>
              <span className="text-2xl">{stat.icon}</span>
              <p className="text-2xl font-bold text-[#1e2340] mt-2">
                {stat.value}<span className="text-base font-normal text-[#6b7280]">{stat.unit}</span>
              </p>
              <p className="text-sm text-[#6b7280] mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* クイックアクション */}
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          <Link href="/dashboard/contents"
            className="bg-white rounded-2xl p-6 border border-[#e4e7f5] hover:border-[#c4b5fd] hover:shadow-md transition-all group"
            style={{ boxShadow: '0 1px 4px rgba(91,124,247,.06)' }}>
            <LayoutGrid className="text-[#5b7cf7] mb-3" size={24} />
            <h3 className="font-bold text-[#1e2340] mb-1 group-hover:text-[#5b7cf7] transition-colors">
              コンテンツ管理
            </h3>
            <p className="text-sm text-[#6b7280]">記事の追加・並び替え・表示設定</p>
          </Link>
          <Link href="/dashboard/settings"
            className="bg-white rounded-2xl p-6 border border-[#e4e7f5] hover:border-[#c4b5fd] hover:shadow-md transition-all group"
            style={{ boxShadow: '0 1px 4px rgba(91,124,247,.06)' }}>
            <Settings className="text-[#5b7cf7] mb-3" size={24} />
            <h3 className="font-bold text-[#1e2340] mb-1 group-hover:text-[#5b7cf7] transition-colors">
              ハブ設定
            </h3>
            <p className="text-sm text-[#6b7280]">プロフィール・タイトル・デフォルトビュー</p>
          </Link>
        </div>

        {/* コンテンツマップ */}
        {recentContents && recentContents.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#1e2340]">最新コンテンツ</h2>
              <Link
                href="/dashboard/contents"
                className="flex items-center gap-1 text-sm text-[#5b7cf7] hover:underline"
              >
                すべて見る
                <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentContents.map((c) => (
                <ContentCard key={c.id} content={c as Content} />
              ))}
            </div>
          </section>
        )}
    </main>
  )
}
