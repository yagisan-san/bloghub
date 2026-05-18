import { Content } from '@/types/database'
import { ContentCard } from './ContentCard'

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
    <div className="flex flex-col gap-10">
      {sorted.map(([cat, arts]) => (
          <section key={cat}>
            {/* カテゴリヘッダー */}
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4 bg-[#f3f4f6] border border-[#374151]">
              <h2 className="font-bold text-[#1e2340] flex-1 truncate">{cat}</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white bg-[#374151]">
                {arts.length}件
              </span>
            </div>
            {/* カード グリッド */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {arts.map((a) => (
                <ContentCard key={a.id} content={a} />
              ))}
            </div>
          </section>
      ))}
    </div>
  )
}
