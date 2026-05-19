import { Content } from '@/types/database'
import { ExternalLink } from 'lucide-react'

function SmallCard({ content: c }: { content: Content }) {
  const PLATFORM_ICON: Record<string, string> = {
    hatena: '✏️', note: '📝', pdf: '📄', notion: '📋',
    youtube: '▶️', spreadsheet: '📊', booth: '🛍️', other: '🔗',
  }
  const icon = PLATFORM_ICON[c.content_type] || '🔗'

  function fmt(iso: string | null) {
    if (!iso) return ''
    const d = new Date(iso)
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit' })
  }

  return (
    <a
      href={c.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex-shrink-0 w-40 sm:w-48 bg-white rounded-2xl border border-[#374151] flex flex-col overflow-hidden
        hover:-translate-y-0.5 transition-all duration-200 group"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}
    >
      {/* サムネ */}
      <div className="h-24 bg-[#f8fafc] flex items-center justify-center flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f0f4ff 100%)' }}>
        {c.thumbnail_url ? (
          <img src={c.thumbnail_url} alt={c.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-2xl opacity-30">{icon}</span>
        )}
      </div>
      {/* テキスト */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="text-xs font-semibold text-[#1e2340] leading-snug line-clamp-2 group-hover:text-[#5b7cf7] transition-colors">
          {c.title}
        </p>
        <div className="flex items-center justify-between mt-auto pt-1">
          <span className="text-[10px] text-[#9ca3af]">{fmt(c.published_at)}</span>
          <ExternalLink size={10} className="text-[#9ca3af] group-hover:text-[#5b7cf7] transition-colors" />
        </div>
      </div>
    </a>
  )
}

export function CategoryView({ contents }: { contents: Content[] }) {
  const groups: Record<string, Content[]> = {}
  for (const c of contents) {
    const key = c.category || '未分類'
    if (!groups[key]) groups[key] = []
    groups[key].push(c)
  }
  const sorted = Object.entries(groups).sort((a, b) => b[1].length - a[1].length)

  if (!sorted.length) {
    return (
      <div className="text-center py-20 text-[#9ca3af]">
        <p className="text-4xl mb-3">📭</p>
        <p>記事がまだありません</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {sorted.map(([cat, arts]) => (
        <section key={cat}>
          {/* カテゴリヘッダー */}
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-3 bg-[#f3f4f6] border border-[#374151]">
            <h2 className="font-bold text-[#1e2340] flex-1 truncate">{cat}</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white bg-[#374151]">
              {arts.length}件
            </span>
          </div>
          {/* 横スクロールカード */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
            {arts.map((a) => (
              <SmallCard key={a.id} content={a} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
