import { NextRequest, NextResponse } from 'next/server'

// 内部IPへのアクセスをブロック（SSRF対策）
function isSafeUrl(urlStr: string): boolean {
  try {
    const url = new URL(urlStr)
    if (!['http:', 'https:'].includes(url.protocol)) return false
    const host = url.hostname
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '0.0.0.0' ||
      host.startsWith('192.168.') ||
      host.startsWith('10.') ||
      host.startsWith('172.16.') ||
      host.endsWith('.local')
    ) return false
    return true
  } catch {
    return false
  }
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url || !isSafeUrl(url)) return NextResponse.json({})

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BlogHub/1.0)' },
    })
    clearTimeout(timeoutId)

    const html = await res.text()

    const getOg = (property: string): string => {
      const match =
        html.match(new RegExp(`<meta[^>]+property=["']og:${property}["'][^>]+content=["']([^"']+)["']`, 'i')) ||
        html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:${property}["']`, 'i'))
      return match?.[1] ?? ''
    }

    const title = getOg('title') ||
      html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() || ''
    const description = getOg('description') ||
      html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1] || ''
    const image = getOg('image') || ''

    return NextResponse.json({ title, description, image })
  } catch {
    return NextResponse.json({})
  }
}
