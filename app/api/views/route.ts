import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// インメモリレート制限（IP単位・1分間に最大10リクエスト）
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 })
    return true
  }
  if (entry.count >= 10) return false
  entry.count++
  return true
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!checkRateLimit(ip)) return NextResponse.json({ ok: false }, { status: 429 })

  const body = await req.json().catch(() => ({}))
  const { hubId } = body
  if (!hubId || typeof hubId !== 'string' || hubId.length > 100) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const supabase = await createClient()

  // 公開ハブか確認してからインクリメント（水増し防止）
  const { data: hub } = await supabase
    .from('hubs')
    .select('view_count')
    .eq('id', hubId)
    .eq('is_public', true)
    .maybeSingle()

  if (!hub) return NextResponse.json({ ok: false }, { status: 404 })

  await supabase
    .from('hubs')
    .update({ view_count: ((hub as any).view_count || 0) + 1 } as any)
    .eq('id', hubId)

  return NextResponse.json({ ok: true })
}
