export default function ReaderFlowLoading() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-6 animate-pulse">
      <div className="mb-6">
        <div className="h-7 bg-[#e4e7f5] rounded-lg w-28 mb-2" />
        <div className="h-4 bg-[#e4e7f5] rounded w-56" />
      </div>
      {/* メインタブ */}
      <div className="flex gap-2 mb-6">
        {[1,2,3].map(i => (
          <div key={i} className="h-10 bg-[#e4e7f5] rounded-xl w-28" />
        ))}
      </div>
      {/* 種別タブ */}
      <div className="flex gap-2 mb-6">
        {[1,2,3].map(i => (
          <div key={i} className="h-7 bg-[#e4e7f5] rounded-lg w-20" />
        ))}
      </div>
      {/* コンテンツ */}
      <div className="flex flex-col gap-2">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="h-16 bg-[#e4e7f5] rounded-xl" />
        ))}
      </div>
    </main>
  )
}
