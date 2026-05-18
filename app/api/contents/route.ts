import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// 読む順番の一括更新
export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '認証が必要です' }, { status: 401 })

  const { updates } = await req.json() as { updates: { id: string; display_order: number }[] }
  if (!Array.isArray(updates)) return NextResponse.json({ error: '不正なリクエストです' }, { status: 400 })

  const { data: hub } = await supabase
    .from('hubs')
    .select('id')
    .eq('user_id', user.id)
    .single()
  if (!hub) return NextResponse.json({ error: 'ハブが見つかりません' }, { status: 404 })

  for (const { id, display_order } of updates) {
    await supabase
      .from('contents')
      .update({ display_order })
      .eq('id', id)
      .eq('hub_id', hub.id)
  }

  return NextResponse.json({ ok: true })
}

// コンテンツ追加（手動）
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '認証が必要です' }, { status: 401 })

  const body = await req.json()
  const { data: hub } = await supabase
    .from('hubs')
    .select('id')
    .eq('user_id', user.id)
    .single()
  if (!hub) return NextResponse.json({ error: 'ハブが見つかりません' }, { status: 404 })

  const { data, error } = await supabase.from('contents').insert({
    hub_id: hub.id,
    title: body.title,
    url: body.url,
    content_type: body.content_type || 'other',
    category: body.category || null,
    tags: body.tags || [],
    description: body.description || null,
    display_order: body.display_order ?? 9999,
    is_visible: true,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ content: data })
}

// コンテンツ削除 or 表示切替
export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '認証が必要です' }, { status: 401 })

  const { id } = await req.json()
  const { data: hub } = await supabase
    .from('hubs')
    .select('id')
    .eq('user_id', user.id)
    .single()
  if (!hub) return NextResponse.json({ error: 'ハブが見つかりません' }, { status: 404 })

  await supabase.from('contents').delete().eq('id', id).eq('hub_id', hub.id)
  return NextResponse.json({ ok: true })
}
