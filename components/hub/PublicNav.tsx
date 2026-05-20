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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
        {/* 左: ロゴ + ハブタイトル */}
        <Link href={base} className="flex items-center gap-2 shrink-0 min-w-0">
          <img src="/logo.png" alt="BlogHub" className="w-7 h-7 object-contain flex-shrink-0" />
          <span className="text-sm font-semibold text-[#1e2340] truncate max-w-[120px] sm:max-w-[160px]">
            {hubTitle}
          </span>
        </Link>

        {/* 中央: ナビリンク（横スクロール対応） */}
        <div className="flex items-center gap-1 mx-auto overflow-x-auto scrollbar-none">
          <Link
            href={base}
            className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-100 whitespace-nowrap flex-shrink-0 active:scale-95 active:bg-[#eef0fd]
              ${isActive(base)
                ? 'bg-[#f0f4ff] text-[#5b7cf7]'
                : 'text-[#6b7280] hover:text-[#5b7cf7] hover:bg-[#f5f7ff]'
              }`}
          >
            ホーム
          </Link>
          <Link
            href={`${base}/all`}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0
              ${isActive(`${base}/all`)
                ? 'bg-[#f0f4ff] text-[#5b7cf7]'
                : 'text-[#6b7280] hover:text-[#5b7cf7] hover:bg-[#f5f7ff]'
              }`}
          >
            すべて
          </Link>
          <Link
            href={`${base}/all?view=order`}
            className="px-3 py-2 rounded-lg text-sm font-medium text-[#6b7280] hover:text-[#5b7cf7] hover:bg-[#f5f7ff] transition-colors whitespace-nowrap flex-shrink-0"
          >
            読む順（ロードマップ）
          </Link>
        </div>

        {/* 右: オーナー→管理画面 / 訪問者→ログイン */}
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
    </nav>
  )
}
