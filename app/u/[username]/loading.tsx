export default function HubLoading() {
  return (
    <div className="min-h-screen bg-[#fafafa] animate-pulse">
      {/* ナビ */}
      <div className="h-14 bg-white border-b border-[#f0f2f5]" />
      {/* カバー */}
      <div className="w-full h-64 bg-[#e4e7f5]" />
      {/* プロフィール */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="flex gap-4 mb-4">
          <div className="h-5 bg-[#e4e7f5] rounded w-48" />
          <div className="h-5 bg-[#e4e7f5] rounded w-24 ml-auto" />
        </div>
        <div className="flex gap-3 mb-6">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-[#e4e7f5] rounded-2xl flex-1" />)}
        </div>
        {/* カードグリッド */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-40 bg-[#e4e7f5] rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
