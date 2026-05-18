import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ThemeEditor, DEFAULT_THEME, HubTheme } from '@/components/dashboard/ThemeEditor'

export default async function DesignPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: hub } = await supabase
    .from('hubs')
    .select('id, title')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!hub) redirect('/dashboard/settings')

  const savedTheme = ((hub as any).theme as Partial<HubTheme>) || {}
  const theme: HubTheme = { ...DEFAULT_THEME, ...savedTheme }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-[#1e2340] mb-1">デザイン設定</h1>
      <p className="text-sm text-[#6b7280] mb-6">公開ページの色をカスタマイズできます</p>
      <ThemeEditor hubId={hub.id} initialTheme={theme} />
    </div>
  )
}
