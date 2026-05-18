import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ContentList } from '@/components/dashboard/ContentList'
import { Content, ContentType } from '@/types/database'

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

interface Props {
  searchParams: Promise<{ type?: string }>
}

export default async function OrderPage({ searchParams }: Props) {
  const { type } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).maybeSingle()
  if (!profile) redirect('/onboarding')

  const { data: hub } = await supabase.from('hubs').select('id').eq('user_id', user.id).single()
  if (!hub) redirect('/onboarding')

  const { data: allContents } = await supabase
    .from('contents')
    .select('*')
    .eq('hub_id', hub.id)
    .eq('is_visible', true)
    .order('display_order', { ascending: true })

  const existingTypes = [...new Set((allContents ?? []).map((c) => c.content_type as ContentType))]
    .filter((t) => Object.keys(TYPE_META).includes(t))

  const activeType = (type && existingTypes.includes(type as ContentType)) ? type : existingTypes[0] || 'hatena'
  const contents = (allContents ?? []).filter((c) => c.content_type === activeType)

  return (
    <main className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-[#1e2340] mb-2">読む順番</h1>
      <p className="text-sm text-[#6b7280] mb-5">
        コンテンツを選んで、そのコンテンツ内の読む順番を設定してください。
      </p>

      {/* 種別タブ */}
      <div className="flex gap-2 flex-wrap mb-6">
        {existingTypes.map((t) => {
          const meta = TYPE_META[t] || { label: t, icon: '🔗' }
          const count = (allContents ?? []).filter((c) => c.content_type === t).length
          return (
            <Link
              key={t}
              href={`/dashboard/order?type=${t}`}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all
                ${activeType === t
                  ? 'bg-[#5b7cf7] text-white shadow-sm'
                  : 'bg-white text-[#6b7280] border border-[#e4e7f5] hover:border-[#c4b5fd]'}`}
            >
              <span>{meta.icon}</span>
              <span>{meta.label}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold
                ${activeType === t ? 'bg-white/25 text-white' : 'bg-[#f0f2f5] text-[#6b7280]'}`}>
                {count}
              </span>
            </Link>
          )
        })}
      </div>

      {contents.length === 0 ? (
        <div className="text-center py-16 text-[#9ca3af]">
          <p className="text-4xl mb-3">📖</p>
          <p className="text-sm">このコンテンツに公開中のアイテムがありません</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#e4e7f5] p-4"
          style={{ boxShadow: '0 1px 4px rgba(91,124,247,.06)' }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5b7cf7] bg-[#eef0fd] px-3 py-1.5 rounded-full">
              <span>📖</span>
              {TYPE_META[activeType]?.label || activeType} の読む順番を管理（{contents.length}件）
            </span>
          </div>
          <ContentList key={activeType} initialContents={contents as Content[]} />
        </div>
      )}
    </main>
  )
}
