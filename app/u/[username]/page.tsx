import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Content, ContentType } from '@/types/database'
import { PublicNav } from '@/components/hub/PublicNav'

interface Props {
  params: Promise<{ username: string }>
}

const TYPE_META: Record<ContentType, { label: string; icon: string }> = {
  hatena:      { label: 'はてなブログ', icon: '✏️' },
  note:        { label: 'note',         icon: '📝' },
  pdf:         { label: 'PDF',          icon: '📄' },
  notion:      { label: 'Notion',       icon: '📋' },
  youtube:     { label: 'YouTube',      icon: '▶️' },
  spreadsheet: { label: 'スプレッドシート', icon: '📊' },
  booth:       { label: 'BOOTH',        icon: '🛍️' },
  other:       { label: 'その他',       icon: '🔗' },
}

interface SocialLinks {
  twitter?: string
  instagram?: string
  youtube?: string
  email?: string
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, bio')
    .eq('username', username)
    .maybeSingle()

  if (!profile) return { title: 'Not Found' }
  return {
    title: `${profile.display_name || username} の発信ハブ | BlogHub`,
    description: profile.bio || `${profile.display_name || username} の発信コンテンツをまとめたページです。`,
  }
}

export default async function PublicHubPage({ params }: Props) {
  const { username } = await params

  const supabase = await createClient()

  // ログイン中のユーザーがオーナーか確認
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, display_name, bio, avatar_url, cover_url, social_links')
    .eq('username', username)
    .maybeSingle()

  if (!profile) notFound()

  const { data: hub } = await supabase
    .from('hubs')
    .select('id, title, description, default_view, is_public, card_order, type_labels, theme')
    .eq('user_id', profile.id)
    .single()

  if (!hub || !hub.is_public) notFound()

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

  const { data: rawContents } = await supabase
    .from('contents')
    .select('*')
    .eq('hub_id', hub.id)
    .eq('is_visible', true)
    .order('display_order', { ascending: true })

  const contents = (rawContents ?? []) as Content[]

  // 種別ごとにグループ化
  const typeGroups = new Map<ContentType, Content[]>()
  // 「その他」はカテゴリ別に分割してグループ化
  const otherGroups = new Map<string, Content[]>() // key: 'other:カテゴリ名'
  for (const c of contents) {
    const t = c.content_type as ContentType
    if (t === 'other') {
      const key = `other:${c.category || 'その他'}`
      if (!otherGroups.has(key)) otherGroups.set(key, [])
      otherGroups.get(key)!.push(c)
    } else {
      if (!typeGroups.has(t)) typeGroups.set(t, [])
      typeGroups.get(t)!.push(c)
    }
  }

  const cats = new Set(contents.map((c) => c.category).filter(Boolean))
  const social = (profile as any).social_links as SocialLinks | undefined

  // 最終更新日
  const latestDate = contents
    .map((c) => c.published_at || c.created_at)
    .filter(Boolean)
    .sort()
    .at(-1) ?? null
  const fmtLatest = latestDate
    ? new Date(latestDate).toLocaleDateString('ja-JP', {
        timeZone: 'Asia/Tokyo', year: 'numeric', month: 'long', day: 'numeric',
      })
    : null

  // カード表示順を決定
  const cardOrder = ((hub as any).card_order as string[] | null) || []
  const typeLabels = ((hub as any).type_labels as Record<string, string> | null) || {}
  const allCardKeys = [
    ...(Object.keys(TYPE_META) as ContentType[]).filter((t) => t !== 'other' && typeGroups.has(t)),
    ...[...otherGroups.keys()], // 'other:カテゴリ名' のキー
    ...(social?.twitter ? ['twitter'] : []),
    ...(social?.instagram ? ['instagram'] : []),
    ...(social?.youtube ? ['youtube_sns'] : []),
    ...(social?.email ? ['email'] : []),
  ]
  const orderedCardKeys = cardOrder.length > 0
    ? [
        ...cardOrder.filter((k) => allCardKeys.includes(k)),
        ...allCardKeys.filter((k) => !cardOrder.includes(k)),
      ]
    : allCardKeys

  return (
    <div className="min-h-screen" style={{ background: theme.bg }}>
      <PublicNav username={username} hubTitle={hub.title} isOwner={user?.id === profile.id} />

      {/* ヒーローセクション */}
      <div className="border-b" style={{ background: theme.bg, borderColor: theme.cardBorder }}>
        {/* カバー画像（アバター・タイトル・IDを内包） */}
        <div className="relative w-full h-64 sm:h-80"
          style={profile.cover_url
            ? undefined
            : { background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accent}99 50%, ${theme.accent}55 100%)` }
          }>
          {profile.cover_url && (
            <img src={profile.cover_url} alt="カバー画像"
              className="w-full h-full object-cover" />
          )}
          {/* max-w-5xlに合わせた横位置で縦並び */}
          <div className="absolute bottom-5 left-0 right-0">
          <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col gap-2">
            {/* アバター */}
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.display_name || profile.username}
                className="w-40 h-40 rounded-3xl border-4 border-white/80 object-cover"
                style={{ boxShadow: '0 4px 16px rgba(0,0,0,.25)' }} />
            ) : (
              <div className="w-40 h-40 rounded-3xl flex items-center justify-center text-5xl font-bold"
                style={{ background: theme.accent, color: theme.profileNameColor, boxShadow: '0 4px 16px rgba(0,0,0,.2)' }}>
                {profile.display_name?.[0] || profile.username[0]}
              </div>
            )}
            {/* タイトル・ID（アバターの下） */}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold drop-shadow-md" style={{ color: theme.profileNameColor }}>{hub.title}</h1>
              <p className="text-sm" style={{ color: theme.profileIdColor }}>@{profile.username}</p>
            </div>
          </div>
          </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6">

          {/* 説明文 ＋ スタッツ横並び */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-5 mt-5 mb-4">
            {/* 説明文（左） */}
            {hub.description && (
              <p className="text-sm text-[#374151] leading-relaxed flex-1 max-w-xl whitespace-pre-wrap">{hub.description}</p>
            )}

            {/* スタッツカード（右） */}
            <div className="flex gap-3 flex-wrap sm:flex-shrink-0">
              <div className="flex-1 min-w-[90px] rounded-2xl px-5 py-3 border" style={{ background: theme.cardBg, borderColor: theme.cardBorder }}>
                <p className="text-2xl font-bold" style={{ color: theme.accent }}>{contents.length}<span className="text-sm font-normal ml-1" style={{ color: theme.textMuted }}>件</span></p>
                <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>コンテンツ</p>
              </div>
              <div className="flex-1 min-w-[90px] rounded-2xl px-5 py-3 border" style={{ background: theme.cardBg, borderColor: theme.cardBorder }}>
                <p className="text-2xl font-bold" style={{ color: theme.accent }}>{cats.size}<span className="text-sm font-normal ml-1" style={{ color: theme.textMuted }}>個</span></p>
                <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>カテゴリ</p>
              </div>
              {fmtLatest && (
                <div className="flex-1 min-w-[140px] rounded-2xl px-5 py-3 border" style={{ background: theme.cardBg, borderColor: theme.cardBorder }}>
                  <p className="text-2xl font-bold" style={{ color: theme.accent }}>{fmtLatest}</p>
                  <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>最終更新</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* STEPガイド（おすすめの読む順番） */}
      {(() => {
        const orderedContents = contents.filter((c) => c.is_visible).slice(0, 5)
        if (orderedContents.length < 2) return null
        return (
          <div className="border-b" style={{ borderColor: theme.cardBorder }}>
            <div className="max-w-5xl mx-auto px-6 py-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold" style={{ color: theme.text }}>
                  📖 おすすめの読む順番
                </h2>
                <a href={`/u/${username}/all?view=order`}
                  className="text-xs font-medium hover:underline"
                  style={{ color: theme.accent }}>
                  すべて見る →
                </a>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
                {orderedContents.map((c, i) => (
                  <a key={c.id} href={c.url} target="_blank" rel="noopener noreferrer"
                    className="flex-shrink-0 w-52 rounded-2xl border p-4 hover:-translate-y-0.5 transition-all group"
                    style={{ background: theme.cardBg, borderColor: theme.cardBorder, boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
                    <div className="flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-bold mb-3 flex-shrink-0"
                      style={{ background: theme.accent }}>
                      {i + 1}
                    </div>
                    <p className="text-xs font-semibold leading-snug line-clamp-3"
                      style={{ color: theme.text }}>
                      {c.title}
                    </p>
                    {c.category && (
                      <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full"
                        style={{ background: theme.accent + '20', color: theme.textMuted }}>
                        {c.category}
                      </span>
                    )}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )
      })()}

      {/* 種別カードグリッド */}
      <main className="max-w-5xl mx-auto px-6 py-5">
        {typeGroups.size === 0 ? (
          <div className="text-center py-20 text-sm" style={{ color: theme.textMuted }}>
            まだコンテンツがありません
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {(() => {
              const SNS_CARD: Record<string, { label: string; icon: string; color: string; desc: string; btn: string; href: string }> = {
                twitter:     { label: 'X (Twitter)', icon: '𝕏',  color: '#1DA1F2', desc: 'Xでの発信をチェック',        btn: 'プロフィールを見る →', href: social?.twitter || '' },
                instagram:   { label: 'Instagram',  icon: '📸', color: '#E1306C', desc: 'Instagramをチェック',        btn: 'プロフィールを見る →', href: social?.instagram || '' },
                youtube_sns: { label: 'YouTube',    icon: '▶️', color: '#FF0000', desc: 'YouTubeチャンネルをチェック', btn: 'チャンネルを見る →',   href: social?.youtube || '' },
                email:       { label: 'お問い合わせ', icon: '✉️', color: theme.accent, desc: 'メールでお気軽にどうぞ',    btn: 'メールを送る →',       href: social?.email ? `mailto:${social.email}` : '' },
              }
              return orderedCardKeys.map((k) => {
                // 「その他:カテゴリ名」カード
                if (k.startsWith('other:') && otherGroups.has(k)) {
                  const catName = k.slice(6) // 'other:' を除いた部分
                  const items = otherGroups.get(k)!
                  const meta = { icon: '🔗', label: catName }
                  const preview = items.slice(0, 2)
                  return (
                    <div key={k} className="rounded-2xl flex flex-col overflow-hidden"
                      style={{ background: theme.cardBg, boxShadow: '0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04)', border: `1px solid ${theme.cardBorder}` }}>
                      <div className="p-5 flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{meta.icon}</span>
                            <span className="font-semibold text-sm" style={{ color: theme.text }}>{meta.label}</span>
                          </div>
                          <span className="text-xs font-semibold text-white px-2 py-0.5 rounded-full" style={{ background: theme.accent }}>{items.length}</span>
                        </div>
                        <ul className="space-y-2 mb-4">
                          {preview.map((c) => (
                            <li key={c.id}>
                              <a href={c.url} target="_blank" rel="noopener noreferrer"
                                className="text-xs truncate block transition-colors" style={{ color: theme.text }}>
                                {c.title}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="px-5 pb-4">
                        <Link href={`/u/${username}/other`}
                          className="block text-center text-xs font-medium rounded-lg px-3 py-2 transition-all border"
                          style={{ color: theme.accent, borderColor: theme.accent + '55' }}>
                          すべて見る →
                        </Link>
                      </div>
                    </div>
                  )
                }

                // コンテンツ種別カード
                if ((Object.keys(TYPE_META) as string[]).includes(k) && typeGroups.has(k as ContentType)) {
                  const t = k as ContentType
                  const items = typeGroups.get(t)!
                  const meta = { ...TYPE_META[t], label: typeLabels[t] || TYPE_META[t].label }
                  const preview = items.slice(0, 2)
                  return (
                    <div key={t} className="rounded-2xl flex flex-col overflow-hidden"
                      style={{ background: theme.cardBg, boxShadow: '0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04)', border: `1px solid ${theme.cardBorder}` }}>
                      <div className="p-5 flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{meta.icon}</span>
                            <span className="font-semibold text-sm" style={{ color: theme.text }}>{meta.label}</span>
                          </div>
                          <span className="text-xs font-semibold text-white px-2 py-0.5 rounded-full" style={{ background: theme.accent }}>
                            {items.length}
                          </span>
                        </div>
                        <ul className="space-y-2 mb-4">
                          {preview.map((c) => (
                            <li key={c.id}>
                              <a href={c.url} target="_blank" rel="noopener noreferrer"
                                className="text-xs truncate block transition-colors" style={{ color: theme.text }}>
                                {c.title}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="px-5 pb-4">
                        <Link href={`/u/${username}/${t}`}
                          className="block text-center text-xs font-medium rounded-lg px-3 py-2 transition-all border"
                          style={{ color: theme.accent, borderColor: theme.accent + '55' }}>
                          すべて見る →
                        </Link>
                      </div>
                    </div>
                  )
                }
                // SNSカード
                const card = SNS_CARD[k]
                if (!card || !card.href) return null
                return (
                  <a key={k} href={card.href} target={k === 'email' ? undefined : '_blank'} rel="noopener noreferrer"
                    className="rounded-2xl flex flex-col overflow-hidden hover:-translate-y-0.5 transition-all"
                    style={{ background: theme.cardBg, boxShadow: '0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04)', border: `1px solid ${theme.cardBorder}` }}>
                    <div className="p-5 flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{card.icon}</span>
                          <span className="font-semibold text-sm" style={{ color: theme.text }}>{card.label}</span>
                        </div>
                        <span className="text-xs font-semibold text-white px-2 py-0.5 rounded-full" style={{ background: card.color }}>SNS</span>
                      </div>
                      <p className="text-xs" style={{ color: theme.textMuted }}>{card.desc}</p>
                    </div>
                    <div className="px-5 pb-4">
                      <span className="block text-center text-xs font-medium border rounded-lg px-3 py-2"
                        style={{ color: card.color, borderColor: card.color }}>
                        {card.btn}
                      </span>
                    </div>
                  </a>
                )
              })
            })()}
          </div>
        )}
      </main>

      {/* フッター */}
      <footer className="text-center py-8 text-xs border-t" style={{ color: theme.textMuted, borderColor: theme.cardBorder }}>
        <a href="/" className="transition-colors hover:opacity-80">
          Powered by BlogHub ✦
        </a>
      </footer>
    </div>
  )
}
