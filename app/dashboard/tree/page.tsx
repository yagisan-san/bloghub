import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ContentType } from '@/types/database'
import { TreeEditor } from '@/components/dashboard/TreeEditor'

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

export default async function TreePage({ searchParams }: Props) {
  const { type } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).maybeSingle()
  if (!profile) redirect('/onboarding')

  const { data: hub } = await supabase.from('hubs').select('id, title').eq('user_id', user.id).single()
  if (!hub) redirect('/onboarding')

  const { data: allContents } = await supabase
    .from('contents')
    .select('id, title, url, category, is_visible, content_type, display_order, parent_id')
    .eq('hub_id', hub.id)
    .order('display_order', { ascending: true })

  const existingTypes = [...new Set((allContents ?? []).map((c) => c.content_type as ContentType))]
    .filter((t) => Object.keys(TYPE_META).includes(t))

  const activeType = (type && existingTypes.includes(type as ContentType)) ? type : existingTypes[0] || 'hatena'
  const contents = (allContents ?? []).filter((c) => c.content_type === activeType)
  const activeLabel = TYPE_META[activeType]?.label || activeType

  return (
    <main className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-[#1e2340] mb-2">ツリー構造</h1>
      <p className="text-sm text-[#6b7280] mb-5">
        コンテンツを選んで親子関係を設定できます。
      </p>

      {/* 種別タブ */}
      <div className="flex gap-2 flex-wrap mb-6">
        {existingTypes.map((t) => {
          const meta = TYPE_META[t] || { label: t, icon: '🔗' }
          const count = (allContents ?? []).filter((c) => c.content_type === t).length
          return (
            <Link
              key={t}
              href={`/dashboard/tree?type=${t}`}
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
          <p className="text-4xl mb-3">🌳</p>
          <p className="text-sm">このコンテンツにアイテムがありません</p>
        </div>
      ) : (
        <TreeEditor key={activeType} contents={contents} />
      )}
    </main>
  )
}
