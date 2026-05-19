export default function SettingsLoading() {
  return (
    <div className="max-w-xl mx-auto px-4 py-6 animate-pulse">
      <div className="h-7 bg-[#e4e7f5] rounded-lg w-24 mb-6" />
      <div className="flex flex-col gap-5">
        {[1,2,3,4].map(i => (
          <div key={i} className="h-48 bg-[#e4e7f5] rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
