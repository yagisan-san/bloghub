import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { HatenaEntry } from '@/lib/hatena'

const HATENA_API_BASE = 'https://blog.hatena.ne.jp'

async function fetchPage(
  hatenaId: string,
  apiKey: string,
  blogId: string,
  pageToken?: string
): Promise<{ xml: string; status: number }> {
  const params = pageToken ? `?page=${encodeURIComponent(pageToken)}` : ''
  const url = `${HATENA_API_BASE}/${hatenaId}/${blogId}/atom/entry${params}`

  const res = await fetch(url, {
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${hatenaId}:${apiKey}`).toString('base64'),
    },
    signal: AbortSignal.timeout(15000),
  })

  return { xml: res.ok ? await res.text() : '', status: res.status }
}

function parseAtomServerSide(xml: string): { entries: HatenaEntry[]; nextPage: string | null } {
  const NS_ATOM = 'http://www.w3.org/2005/Atom'
  const NS_APP  = 'http://www.w3.org/2007/app'

  // Node.jsにはDOMParserがないのでRegexで簡易パース
  const entries: HatenaEntry[] = []
  const entryMatches = xml.match(/<entry[\s>][\s\S]*?<\/entry>/g) || []

  for (const entryXml of entryMatches) {
    // 下書きをスキップ
    if (/<app:draft>yes<\/app:draft>/.test(entryXml)) continue

    const url = (entryXml.match(/rel="alternate"[^>]*href="([^"]+)"/) ||
                 entryXml.match(/href="([^"]+)"[^>]*rel="alternate"/))?.[1] || ''
    if (!url) continue

    const id = entryXml.match(/<id>([^<]+)<\/id>/)?.[1] || url
    const title = decodeEntities(entryXml.match(/<title[^>]*>([^<]*)<\/title>/)?.[1] || '（タイトルなし）')
    const published = entryXml.match(/<published>([^<]+)<\/published>/)?.[1] || ''

    const catMatches = [...entryXml.matchAll(/term="([^"]+)"/g)]
    const tags = catMatches.map((m) => m[1]).filter(Boolean)

    const contentRaw = entryXml.match(/<content[^>]*>([\s\S]*?)<\/content>/)?.[1] || ''
    const description = stripTags(decodeEntities(contentRaw)).slice(0, 160)

    entries.push({
      externalId: id,
      title,
      url,
      publishedAt: published,
      category: tags[0] || null,
      tags,
      description,
    })
  }

  const nextPage = xml.match(/rel="next"[^>]*href="[^"]+[?&]page=([^"&]+)"/)?.[1] ||
                   xml.match(/href="[^"]+[?&]page=([^"&]+)"[^>]*rel="next"/)?.[1] || null

  return { entries, nextPage }
}

function decodeEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

export async function POST(req: NextRequest) {
  // 認証チェック
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '認証が必要です' }, { status: 401 })

  const { hatenaId, apiKey, blogId } = await req.json()
  if (!hatenaId || !apiKey || !blogId) {
    return NextResponse.json({ error: '必須パラメータが不足しています' }, { status: 400 })
  }

  // 1ページ目を取得（接続確認）
  const { xml, status } = await fetchPage(hatenaId, apiKey, blogId)
  if (status === 401) return NextResponse.json({ error: '認証エラー：はてなIDまたはAPIキーが正しくありません' }, { status: 400 })
  if (status === 404) return NextResponse.json({ error: 'ブログが見つかりません：ブログIDを確認してください' }, { status: 400 })
  if (!xml) return NextResponse.json({ error: `接続に失敗しました（${status}）` }, { status: 400 })

  const { entries: allEntries, nextPage: firstNext } = parseAtomServerSide(xml)

  // ページネーション（最大50ページ上限で無限ループ防止）
  let nextPage = firstNext
  let pageCount = 0
  const MAX_PAGES = 50
  while (nextPage && pageCount < MAX_PAGES) {
    pageCount++
    const { xml: pageXml, status: pageStatus } = await fetchPage(hatenaId, apiKey, blogId, nextPage)
    if (pageStatus !== 200 || !pageXml) break
    const { entries, nextPage: np } = parseAtomServerSide(pageXml)
    allEntries.push(...entries)
    nextPage = np
  }

  // APIキーはここで破棄（保存しない）
  return NextResponse.json({ articles: allEntries, count: allEntries.length })
}
