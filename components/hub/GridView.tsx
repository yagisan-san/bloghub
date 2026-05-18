import { Content } from '@/types/database'
import { ContentCard } from './ContentCard'

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {contents.map((c) => (
        <ContentCard key={c.id} content={c} />
      ))}
    </div>
  )
}
