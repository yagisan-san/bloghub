export interface HatenaEntry {
  externalId: string
  title: string
  url: string
  publishedAt: string
  category: string | null
  tags: string[]
  description: string
}

export function parseAtomXML(xml: string): { entries: HatenaEntry[]; nextPage: string | null } {
  const NS = 'http://www.w3.org/2005/Atom'
  const APP = 'http://www.w3.org/2007/app'

  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  if (doc.querySelector('parseerror,parsererror')) return { entries: [], nextPage: null }

  const entries: HatenaEntry[] = []

  for (const entry of Array.from(doc.getElementsByTagNameNS(NS, 'entry'))) {
    if (entry.getElementsByTagNameNS(APP, 'draft')[0]?.textContent === 'yes') continue

    let url = ''
    for (const link of Array.from(entry.getElementsByTagNameNS(NS, 'link'))) {
      if (link.getAttribute('rel') === 'alternate') {
        url = link.getAttribute('href') || ''
        break
      }
    }
    if (!url) continue

    const categories = Array.from(entry.getElementsByTagNameNS(NS, 'category'))
      .map((c) => c.getAttribute('term'))
      .filter(Boolean) as string[]

    const content = entry.getElementsByTagNameNS(NS, 'content')[0]?.textContent || ''
    const description = htmlToText(content).slice(0, 160)

    const externalId =
      entry.getElementsByTagNameNS(NS, 'id')[0]?.textContent || url

    entries.push({
      externalId,
      title: entry.getElementsByTagNameNS(NS, 'title')[0]?.textContent || '（タイトルなし）',
      url,
      publishedAt: entry.getElementsByTagNameNS(NS, 'published')[0]?.textContent || '',
      category: categories[0] || null,
      tags: categories,
      description,
    })
  }

  let nextPage: string | null = null
  for (const link of Array.from(doc.getElementsByTagNameNS(NS, 'link'))) {
    if (link.getAttribute('rel') === 'next') {
      const m = (link.getAttribute('href') || '').match(/[?&]page=([^&]+)/)
      if (m) nextPage = m[1]
      break
    }
  }

  return { entries, nextPage }
}

function htmlToText(html: string): string {
  if (typeof document === 'undefined') return html.replace(/<[^>]+>/g, ' ').trim()
  const d = document.createElement('div')
  d.innerHTML = html
  return (d.textContent || '').trim().replace(/\s+/g, ' ')
}
