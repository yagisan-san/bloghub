'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Props {
  username: string
  hubTitle: string
  isOwner?: boolean
}

export function PublicNav({ username, hubTitle, isOwner = false }: Props) {
  const pathname = usePathname()
  const base = `/u/${username}`

  const isActive = (href: string) => pathname === href

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-[#f0f2f5]"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>

      {/* 1行目: ロゴ + タイトル + 管理画面/始める */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
        <Link href={base} className="flex items-center gap-2 min-w-0">
          <img src="/logo.png" alt="BlogHub" className="w-6 h-6 object-contain flex-shrink-0" />
          <span className="text-sm font-semibold text-[#1e2340] truncate max-w-[200px] sm:max-w-xs">
            {hubTitle}
          </span>
        </Link>

        {isOwner ? (
          <Link
            href="/dashboard"
            className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg border border-[#e4e7f5]
              text-[#6b7280] hover:text-[#5b7cf7] hover:border-[#c4b5fd] bg-white transition-colors"
          >
            管理画面
          </Link>
        ) : (
          <Link
            href="/signup"
            className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#5b7cf7] text-white
              hover:bg-[#4a6bf5] transition-colors"
          >
            始める
          </Link>
        )}
      </div>

      {/* 2行目: ナビリンク */}
      <div className="border-t border-[#f0f2f5]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center gap-1 h-10">
          <Link
            href={base}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-100 whitespace-nowrap active:scale-95
              ${isActive(base)
                ? 'bg-[#f0f4ff] text-[#5b7cf7]'
                : 'text-[#6b7280] hover:text-[#5b7cf7] hover:bg-[#f5f7ff]'
              }`}
          >
            ホーム
          </Link>
          <Link
            href={`${base}/all`}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
              ${isActive(`${base}/all`)
                ? 'bg-[#f0f4ff] text-[#5b7cf7]'
                : 'text-[#6b7280] hover:text-[#5b7cf7] hover:bg-[#f5f7ff]'
              }`}
          >
            すべて
          </Link>
          <Link
            href={`${base}/all?view=order`}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-[#6b7280] hover:text-[#5b7cf7] hover:bg-[#f5f7ff] transition-colors whitespace-nowrap"
          >
            読む順（ロードマップ）
          </Link>
        </div>
      </div>

    </nav>
  )
}
