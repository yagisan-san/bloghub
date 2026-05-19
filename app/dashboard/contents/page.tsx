import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TypedContentManager } from '@/components/dashboard/TypedContentManager'
import { ManualAddBottomSheet } from '@/components/dashboard/ManualAddBottomSheet'
import { Content } from '@/types/database'

export default async function ContentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).maybeSingle()
  if (!profile) redirect('/onboarding')

  const { data: hub } = await supabase.from('hubs').select('id').eq('user_id', user.id).single()
  if (!hub) redirect('/onboarding')

  const { data: contents } = await supabase
    .from('contents')
    .select('*')
    .eq('hub_id', hub.id)
    .order('display_order', { ascending: true })

  return (
    <main className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-5">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-bold text-[#1e2340]">コンテンツ管理</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#6b7280]">{contents?.length ?? 0}件</span>
          <ManualAddBottomSheet />
        </div>
      </div>

      <TypedContentManager
        hubId={hub.id}
        initialContents={(contents ?? []) as Content[]}
      />
    </main>
  )
}
