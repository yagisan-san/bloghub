import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://bloghub-sigma.vercel.app'

  // 公開中のハブ（ユーザーの公開ページ）を取得
  const supabase = await createClient()
  const { data: hubs } = await supabase
    .from('hubs')
    .select('updated_at, profiles(username)')
    .eq('is_public', true)

  const hubUrls: MetadataRoute.Sitemap = (hubs ?? []).flatMap((hub) => {
    const profile = hub.profiles as unknown as { username: string } | null
    if (!profile?.username) return []
    const url = `${base}/u/${profile.username}`
    const lastModified = hub.updated_at ? new Date(hub.updated_at) : new Date()
    return [
      { url, lastModified, changeFrequency: 'weekly' as const, priority: 0.8 },
      { url: `${url}/all`, lastModified, changeFrequency: 'weekly' as const, priority: 0.6 },
    ]
  })

  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    ...hubUrls,
  ]
}
