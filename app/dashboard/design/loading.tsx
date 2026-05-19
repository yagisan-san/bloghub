export default function DesignLoading() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-6 animate-pulse">
      <div className="h-7 bg-[#e4e7f5] rounded-lg w-32 mb-6" />
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 h-[600px] bg-[#e4e7f5] rounded-2xl" />
        <div className="lg:w-80 h-[600px] bg-[#e4e7f5] rounded-2xl" />
      </div>
    </main>
  )
}
