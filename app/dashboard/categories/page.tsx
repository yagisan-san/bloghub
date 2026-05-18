import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { FolderOpen, FileText } from 'lucide-react'
import { ContentType } from '@/types/database'

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

export default async function CategoriesPage({ searchParams }: Props) {
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
    .select('id, title, url, category, is_visible, content_type, display_order')
    .eq('hub_id', hub.id)
    .order('display_order', { ascending: true })

  // 存在する種別を取得
  const existingTypes = [...new Set((allContents ?? []).map((c) => c.content_type as ContentType))]
    .filter((t) => Object.keys(TYPE_META).includes(t))

  // アクティブな種別（未指定の場合は最初の種別）
  const activeType = (type && existingTypes.includes(type as ContentType)) ? type : existingTypes[0] || 'hatena'

  // 選択された種別でフィルタリング
  const contents = (allContents ?? []).filter((c) => c.content_type === activeType)

  // カテゴリ別に集計
  const categoryMap = new Map<string, typeof contents>()
  const uncategorized: typeof contents = []
  for (const item of contents) {
    if (!item.category) { uncategorized.push(item) }
    else {
      if (!categoryMap.has(item.category)) categoryMap.set(item.category, [])
      categoryMap.get(item.category)!.push(item)
    }
  }
  const categories = Array.from(categoryMap.entries()).sort((a, b) => a[0].localeCompare(b[0], 'ja'))
  if (uncategorized.length > 0) categories.push(['未分類', uncategorized])

  return (
    <main className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-[#1e2340] mb-5">カテゴリ</h1>

      {/* 種別タブ */}
      <div className="flex gap-2 flex-wrap mb-6">
        {existingTypes.map((t) => {
          const meta = TYPE_META[t] || { label: t, icon: '🔗' }
          const count = (allContents ?? []).filter((c) => c.content_type === t).length
          return (
            <Link
              key={t}
              href={`/dashboard/categories?type=${t}`}
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

      {categories.length === 0 ? (
        <div className="text-center py-16 text-[#9ca3af]">
          <p className="text-4xl mb-3">📁</p>
          <p className="text-sm">このコンテンツにはカテゴリがまだありません</p>
          <p className="text-xs mt-1">コンテンツ管理でカテゴリを設定してください</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-[#6b7280]">{categories.length}カテゴリ · {contents.length}件</p>
          {categories.map(([catName, items]) => (
            <div key={catName} className="bg-white rounded-2xl border border-[#e4e7f5] overflow-hidden"
              style={{ boxShadow: '0 1px 4px rgba(91,124,247,.06)' }}>
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[#e4e7f5] bg-[#f7f8ff]">
                <FolderOpen size={16} className="text-[#5b7cf7] flex-shrink-0" />
                <span className="font-semibold text-[#1e2340] text-sm">{catName}</span>
                <span className="ml-auto text-xs text-[#6b7280] bg-white border border-[#e4e7f5] px-2 py-0.5 rounded-full">
                  {items?.length ?? 0}件
                </span>
              </div>
              <ul className="divide-y divide-[#f0f2fa]">
                {(items ?? []).map((item) => (
                  <li key={item.id} className="flex items-center gap-3 px-5 py-3">
                    <FileText size={14} className="text-[#9ca3af] flex-shrink-0" />
                    <a href={item.url} target="_blank" rel="noopener noreferrer"
                      className="flex-1 min-w-0 text-sm text-[#1e2340] hover:text-[#5b7cf7] transition-colors truncate">
                      {item.title}
                    </a>
                    {!item.is_visible && (
                      <span className="flex-shrink-0 text-xs text-[#9ca3af] bg-[#f7f8ff] border border-[#e4e7f5] px-2 py-0.5 rounded-full">
                        非表示
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
