export default function DashboardLoading() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-6 animate-pulse">
      {/* ウェルカム */}
      <div className="mb-6">
        <div className="h-7 bg-[#e4e7f5] rounded-lg w-48 mb-2" />
        <div className="h-4 bg-[#e4e7f5] rounded w-36" />
      </div>
      {/* URLカード */}
      <div className="h-32 bg-[#e4e7f5] rounded-2xl mb-5" />
      {/* スタッツ */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[1,2,3].map(i => (
          <div key={i} className="h-20 bg-[#e4e7f5] rounded-2xl" />
        ))}
      </div>
      {/* 次にやること */}
      <div className="h-5 bg-[#e4e7f5] rounded w-32 mb-3" />
      <div className="flex flex-col gap-2 mb-6">
        {[1,2].map(i => (
          <div key={i} className="h-12 bg-[#e4e7f5] rounded-xl" />
        ))}
      </div>
      {/* クイックアクション */}
      <div className="grid grid-cols-2 gap-3">
        {[1,2].map(i => (
          <div key={i} className="h-24 bg-[#e4e7f5] rounded-2xl" />
        ))}
      </div>
    </main>
  )
}
