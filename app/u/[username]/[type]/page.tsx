import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Content, ContentType, ViewMode } from '@/types/database'
import { TypePageClient } from './TypePageClient'

const VALID_TYPES: (ContentType | 'all')[] = [
  'all',
  'hatena',
  'note',
  'pdf',
  'notion',
  'youtube',
  'spreadsheet',
  'booth',
  'other',
]

const TYPE_LABEL: Record<ContentType | 'all', string> = {
  all:         'すべて',
  hatena:      'はてなブログ',
  note:        'note',
  pdf:         'PDF',
  notion:      'Notion',
  youtube:     'YouTube',
  spreadsheet: 'スプレッドシート',
  booth:       'BOOTH',
  other:       'その他',
}

interface Props {
  params: Promise<{ username: string; type: string }>
  searchParams: Promise<{ view?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username, type } = await params
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('username', username)
    .maybeSingle()

  if (!profile) return { title: 'Not Found' }

  const typeLabel = VALID_TYPES.includes(type as ContentType | 'all')
    ? TYPE_LABEL[type as ContentType | 'all']
    : type

  return {
    title: `${typeLabel} | ${profile.display_name || username} の発信ハブ | BlogHub`,
  }
}

export default async function TypePage({ params, searchParams }: Props) {
  const { username, type } = await params
  const { view } = await searchParams

  // typeのバリデーション
  if (!VALID_TYPES.includes(type as ContentType | 'all')) {
    notFound()
  }

  const validType = type as ContentType | 'all'

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, display_name, bio, avatar_url')
    .eq('username', username)
    .maybeSingle()

  if (!profile) notFound()

  const { data: hub } = await supabase
    .from('hubs')
    .select('id, title, description, default_view, is_public, theme')
    .eq('user_id', profile.id)
    .single()

  if (!hub || !hub.is_public) notFound()

  const query = supabase
    .from('contents')
    .select('*')
    .eq('hub_id', hub.id)
    .eq('is_visible', true)
    .order('display_order', { ascending: true })

  const { data: rawContents } = await query
  const allContents = (rawContents ?? []) as Content[]

  // typeフィルタリング
  const contents =
    validType === 'all'
      ? allContents
      : allContents.filter((c) => c.content_type === validType)

  // 存在しない種別の場合は404
  if (validType !== 'all' && contents.length === 0 && allContents.length > 0) {
    notFound()
  }

  const defaultView = (hub.default_view as ViewMode) || 'grid'
  const initialView: ViewMode =
    view === 'order' ? 'order'
    : view === 'category' ? 'category'
    : view === 'tree' ? 'tree'
    : view === 'grid' ? 'grid'
    : defaultView

  const DEFAULT_THEME = {
    bg: '#fafafa',
    accent: '#5b7cf7',
    cardBg: '#ffffff',
    cardBorder: '#f0f2f5',
    text: '#1e2340',
    textMuted: '#6b7280',
    profileNameColor: '#ffffff',
    profileIdColor: 'rgba(255,255,255,0.8)',
  }
  const theme = { ...DEFAULT_THEME, ...((hub as any).theme || {}) }

  return (
    <TypePageClient
      key={initialView}
      username={username}
      hubTitle={hub.title}
      hubDefaultView={hub.default_view}
      type={validType}
      contents={contents}
      initialView={initialView}
      theme={theme}
      isOwner={user?.id === profile.id}
    />
  )
}
