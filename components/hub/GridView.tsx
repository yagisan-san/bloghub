import { Content } from '@/types/database'
import { ExternalLink } from 'lucide-react'

const PLATFORM_ICON: Record<string, string> = {
  hatena: '✏️', note: '📝', pdf: '📄', notion: '📋',
  youtube: '▶️', spreadsheet: '📊', booth: '🛍️', other: '🔗',
}

function fmt(iso: string | null) {
  if (!iso) return ''
  const d = new Date(iso)
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit' })
}

function SmallCard({ content: c }: { content: Content }) {
  const icon = PLATFORM_ICON[c.content_type] || '🔗'

  return (
    <a
      href={c.url}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-white rounded-2xl border border-[#374151] flex flex-col overflow-hidden
        hover:-translate-y-0.5 transition-all duration-200 group"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}
    >
      {/* サムネ */}
      <div className="h-24 flex items-center justify-center flex-shrink-0 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f0f4ff 100%)' }}>
        {c.thumbnail_url ? (
          <img src={c.thumbnail_url} alt={c.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <span className="text-2xl opacity-30">{icon}</span>
        )}
      </div>
      {/* テキスト */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="text-xs font-semibold text-[#1e2340] leading-snug line-clamp-2 group-hover:text-[#5b7cf7] transition-colors">
          {c.title}
        </p>
        {c.category && (
          <span className="text-[10px] text-[#9ca3af] bg-[#f3f4f6] px-1.5 py-0.5 rounded-full w-fit truncate max-w-full">
            {c.category}
          </span>
        )}
        <div className="flex items-center justify-between mt-auto pt-1">
          <span className="text-[10px] text-[#9ca3af]">{fmt(c.published_at)}</span>
          <ExternalLink size={10} className="text-[#9ca3af] group-hover:text-[#5b7cf7] transition-colors" />
        </div>
      </div>
    </a>
  )
}

export function GridView({ contents }: { contents: Content[] }) {
  if (!contents.length) {
    return (
      <div className="text-center py-20 text-[#9ca3af]">
        <p className="text-4xl mb-3">📭</p>
        <p>記事がまだありません</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {contents.map((c) => (
        <SmallCard key={c.id} content={c} />
      ))}
    </div>
  )
}
