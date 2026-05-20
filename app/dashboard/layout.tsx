import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  LayoutDashboard,
  FileText,
  Navigation,
  Settings,
  Palette,
  LogOut,
  ExternalLink,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard',               label: 'ホーム',   icon: LayoutDashboard },
  { href: '/dashboard/contents',      label: '記事',     icon: FileText },
  { href: '/dashboard/reader-flow',   label: '読者導線', icon: Navigation },
  { href: '/dashboard/design',        label: 'デザイン', icon: Palette },
  { href: '/dashboard/settings',      label: '設定',     icon: Settings },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, display_name')
    .eq('id', user.id)
    .maybeSingle()

  const publicUrl = profile ? `/u/${profile.username}` : '#'
  const displayName = profile?.display_name || profile?.username || ''

  return (
    <div className="min-h-screen bg-[#f7f8ff] flex">
      {/* ===== Left sidebar (hidden on mobile) ===== */}
      <aside className="hidden md:flex flex-col fixed top-0 left-0 h-full w-60 bg-white border-r border-[#e4e7f5] z-20"
        style={{ boxShadow: '1px 0 8px rgba(91,124,247,.06)' }}>

        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 h-14 border-b border-[#e4e7f5] flex-shrink-0">
          <img src="/logo.png" alt="BlogHub" className="w-7 h-7 object-contain flex-shrink-0" />
          <span className="font-bold text-[#1e2340] text-base tracking-tight">BlogHub</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#6b7280] hover:bg-[#f7f8ff] hover:text-[#5b7cf7] transition-colors group"
            >
              <Icon size={17} className="flex-shrink-0 group-hover:text-[#5b7cf7] transition-colors" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="flex-shrink-0 border-t border-[#e4e7f5] px-3 py-4 flex flex-col gap-1">
          {/* Public page link */}
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#6b7280] hover:bg-[#f7f8ff] hover:text-[#5b7cf7] transition-colors group"
          >
            <ExternalLink size={17} className="flex-shrink-0 group-hover:text-[#5b7cf7] transition-colors" />
            公開ページを見る
          </a>

          {/* Logout */}
          <form action="/api/auth/signout" method="post">
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#6b7280] hover:bg-red-50 hover:text-red-500 transition-colors group"
            >
              <LogOut size={17} className="flex-shrink-0" />
              ログアウト
            </button>
          </form>

          {/* User info */}
          <div className="mt-2 px-3 py-2.5 rounded-xl bg-[#f7f8ff] border border-[#e4e7f5]">
            <p className="text-xs font-semibold text-[#1e2340] truncate">{displayName}</p>
            <p className="text-xs text-[#9ca3af] truncate">@{profile?.username}</p>
          </div>
        </div>
      </aside>

      {/* ===== Mobile top bar ===== */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-[#e4e7f5] z-20 h-12 flex items-center px-4 gap-3"
        style={{ boxShadow: '0 1px 4px rgba(91,124,247,.06)' }}>
        <div className="w-6 h-6 rounded-md bg-[#5b7cf7] flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">B</span>
        </div>
        <span className="font-bold text-[#1e2340] text-sm tracking-tight flex-1">BlogHub</span>
        <a href={publicUrl} target="_blank" rel="noopener noreferrer"
          className="text-[#6b7280] hover:text-[#5b7cf7] transition-colors p-2">
          <ExternalLink size={16} />
        </a>
        <form action="/api/auth/signout" method="post">
          <button type="submit" className="text-[#6b7280] hover:text-red-500 transition-colors p-2">
            <LogOut size={16} />
          </button>
        </form>
      </header>

      {/* ===== Mobile bottom nav ===== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#e4e7f5] z-20 flex"
        style={{ boxShadow: '0 -2px 8px rgba(91,124,247,.08)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-3 min-h-[60px]
              text-[#9ca3af] hover:text-[#5b7cf7]
              active:bg-[#eef0fd] active:text-[#5b7cf7]
              transition-all duration-100"
          >
            <Icon size={22} />
            <span className="text-[10px] font-semibold leading-tight">{label}</span>
          </Link>
        ))}
      </nav>

      {/* ===== Main content area ===== */}
      <div className="flex-1 md:ml-60 min-w-0">
        {/* Mobile top spacer */}
        <div className="h-12 md:hidden" />
        {/* Content */}
        <div className="pb-20 md:pb-0">
          {children}
        </div>
      </div>
    </div>
  )
}
