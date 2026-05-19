import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { hubId } = await req.json()
  if (!hubId) return NextResponse.json({ ok: false })

  const supabase = await createClient()

  // view_countを1増やす（RPCなしでインクリメント）
  const { data: hub } = await supabase
    .from('hubs')
    .select('*')
    .eq('id', hubId)
    .single()

  if (hub) {
    await supabase
      .from('hubs')
      .update({ view_count: ((hub as any).view_count || 0) + 1 } as any)
      .eq('id', hubId)
  }

  return NextResponse.json({ ok: true })
}
