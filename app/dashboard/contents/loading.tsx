export default function ContentsLoading() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-6 animate-pulse">
      <div className="h-7 bg-[#e4e7f5] rounded-lg w-36 mb-5" />
      {/* タブ */}
      <div className="flex gap-2 mb-5">
        {[1,2,3].map(i => (
          <div key={i} className="h-9 bg-[#e4e7f5] rounded-xl w-24" />
        ))}
        <div className="h-9 bg-[#e4e7f5] rounded-xl w-16 ml-auto" />
      </div>
      {/* リスト */}
      <div className="flex flex-col gap-2">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="h-16 bg-[#e4e7f5] rounded-xl" />
        ))}
      </div>
    </main>
  )
}
