import { Content } from '@/types/database'
import { ExternalLink } from 'lucide-react'

function fmt(iso: string | null) {
  if (!iso) return ''
  const d = new Date(iso)
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit' })
}

export function OrderView({ contents }: { contents: Content[] }) {
  if (!contents.length) {
    return (
      <div className="text-center py-20 text-[#9ca3af]">
        <p className="text-4xl mb-3">📭</p>
        <p>記事がまだありません</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <p className="text-sm text-[#6b7280] mb-5 text-center">おすすめの読む順番です</p>
      <ol className="flex flex-col gap-3">
        {contents.map((c, i) => (
          <li key={c.id}>
            <a
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-white rounded-2xl border border-[#e4e7f5] px-5 py-4
                hover:border-[#c4b5fd] hover:shadow-md transition-all group"
              style={{ boxShadow: '0 1px 4px rgba(91,124,247,.06)' }}
            >
              <span className="flex-shrink-0 w-9 h-9 rounded-full bg-[#eef0fd] text-[#5b7cf7] text-sm font-bold
                flex items-center justify-center">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1e2340] truncate group-hover:text-[#5b7cf7] transition-colors">
                  {c.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  {c.category && (
                    <span className="text-xs text-[#6b7280] bg-[#f7f8ff] border border-[#e4e7f5] px-1.5 py-0.5 rounded-full">
                      {c.category}
                    </span>
                  )}
                  {c.published_at && (
                    <span className="text-xs text-[#9ca3af]">{fmt(c.published_at)}</span>
                  )}
                </div>
              </div>
              <ExternalLink size={15} className="text-[#9ca3af] group-hover:text-[#5b7cf7] transition-colors flex-shrink-0" />
            </a>
          </li>
        ))}
      </ol>
    </div>
  )
}
