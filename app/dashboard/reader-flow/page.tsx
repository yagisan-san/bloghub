import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Content, ContentType } from '@/types/database'
import { ReaderFlowClient } from '@/components/dashboard/ReaderFlowClient'

export default async function ReaderFlowPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).maybeSingle()
  if (!profile) redirect('/onboarding')

  const { data: hub } = await supabase.from('hubs').select('id').eq('user_id', user.id).single()
  if (!hub) redirect('/onboarding')

  const { data: allContents } = await supabase
    .from('contents')
    .select('*')
    .eq('hub_id', hub.id)
    .eq('is_visible', true)
    .order('display_order', { ascending: true })

  const { data: treeContents } = await supabase
    .from('contents')
    .select('id, title, url, category, parent_id, is_visible, content_type, display_order')
    .eq('hub_id', hub.id)
    .order('display_order', { ascending: true })

  const existingTypes = [...new Set((allContents ?? []).map((c) => c.content_type as ContentType))]

  return (
    <main className="max-w-3xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#1e2340]">読者導線</h1>
        <p className="text-sm text-[#6b7280] mt-1">読者が迷わず回遊できる導線を設計しましょう</p>
      </div>
      <ReaderFlowClient
        allContents={(allContents ?? []) as Content[]}
        treeContents={treeContents ?? []}
        existingTypes={existingTypes}
        username={profile.username}
      />
    </main>
  )
}
