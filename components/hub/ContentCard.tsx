import { Content, ContentType } from '@/types/database'
import { MediaBadge } from '@/components/ui/MediaBadge'
import { ExternalLink } from 'lucide-react'

const PLATFORM_ICON: Record<string, string> = {
  hatena:      '✏️',
  note:        '📝',
  pdf:         '📄',
  notion:      '📋',
  youtube:     '▶️',
  spreadsheet: '📊',
  booth:       '🛍️',
  other:       '🔗',
}

function fmt(iso: string | null) {
  if (!iso) return ''
  const d = new Date(iso)
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit' })
}

export function ContentCard({ content: c }: { content: Content }) {
  const icon = PLATFORM_ICON[c.content_type] || '🔗'

  return (
    <a
      href={c.url}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-white rounded-2xl flex flex-col overflow-hidden group
        hover:-translate-y-0.5 transition-all duration-200"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04)', border: '1.5px solid #374151' }}
    >
      {/* サムネイルエリア */}
      <div className="relative h-40 flex-shrink-0 overflow-hidden bg-[#f8fafc]">
        {c.thumbnail_url ? (
          <img
            src={c.thumbnail_url}
            alt={c.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f0f4ff 100%)' }}>
            <span className="text-3xl opacity-40">{icon}</span>
            <span className="text-xs text-[#c4cadb] font-medium tracking-wide uppercase">
              {c.content_type}
            </span>
          </div>
        )}
        {/* メディアバッジ */}
        <div className="absolute top-2.5 left-2.5">
          <MediaBadge type={c.content_type as ContentType} size="xs" />
        </div>
      </div>

      {/* コンテンツエリア */}
      <div className="flex flex-col gap-3 p-4 flex-1">
        <h3 className="text-sm font-semibold text-[#111827] leading-snug line-clamp-2
          group-hover:text-[#5b7cf7] transition-colors">
          {c.title}
        </h3>

        <div className="flex items-center justify-between mt-auto">
          {c.category ? (
            <span className="text-xs text-[#6b7280] bg-[#f3f4f6] px-2 py-0.5 rounded-full truncate max-w-[60%]">
              {c.category}
            </span>
          ) : <span />}
          <span className="text-xs text-[#9ca3af]">{fmt(c.published_at)}</span>
        </div>

        <div className="flex items-center gap-1 text-xs text-[#9ca3af] group-hover:text-[#5b7cf7] transition-colors pt-1 border-t border-[#f3f4f6]">
          <ExternalLink size={11} />
          <span>読む</span>
        </div>
      </div>
    </a>
  )
}
