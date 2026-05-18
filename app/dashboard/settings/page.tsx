'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ViewMode } from '@/types/database'
import { CardOrderManager } from '@/components/dashboard/CardOrderManager'
import { ImageUpload } from '@/components/dashboard/ImageUpload'

const VIEW_OPTIONS: { value: ViewMode; label: string; icon: string }[] = [
  { value: 'grid',     label: 'グリッド',  icon: '⊞' },
  { value: 'category', label: 'カテゴリ',  icon: '📂' },
  { value: 'order',    label: '読む順番', icon: '📖' },
  { value: 'tree',     label: 'ツリー',   icon: '🌳' },
]

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [hubTitle, setHubTitle] = useState('')
  const [hubDesc, setHubDesc] = useState('')
  const [defaultView, setDefaultView] = useState<ViewMode>('grid')
  const [username, setUsername] = useState('')
  // SNSリンク
  const [twitterUrl, setTwitterUrl] = useState('')
  const [instagramUrl, setInstagramUrl] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [emailAddr, setEmailAddr] = useState('')
  // カード順番管理用
  const [hubId, setHubId] = useState('')
  const [cardOrder, setCardOrder] = useState<string[]>([])
  const [activeContentTypes, setActiveContentTypes] = useState<string[]>([])
  const [activeSnsKeys, setActiveSnsKeys] = useState<string[]>([])
  // 種別表示名
  const [typeLabels, setTypeLabels] = useState<Record<string, string>>({})

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      const { data: hub } = await supabase.from('hubs').select('*').eq('user_id', user.id).single()
      if (profile) {
        setDisplayName(profile.display_name || '')
        setBio(profile.bio || '')
        setUsername(profile.username)
        setAvatarUrl((profile as any).avatar_url || '')
        setCoverUrl((profile as any).cover_url || '')
        const sl = (profile as any).social_links || {}
        setTwitterUrl(sl.twitter || '')
        setInstagramUrl(sl.instagram || '')
        setYoutubeUrl(sl.youtube || '')
        setEmailAddr(sl.email || '')
      }
      if (hub) {
        setHubTitle(hub.title)
        setHubDesc(hub.description || '')
        setDefaultView(hub.default_view as ViewMode)
        setHubId(hub.id)
        setCardOrder((hub as any).card_order || [])
        setTypeLabels((hub as any).type_labels || {})

        // アクティブなコンテンツ種別を取得
        const { data: contents } = await supabase
          .from('contents')
          .select('content_type')
          .eq('hub_id', hub.id)
        const types = [...new Set((contents ?? []).map((c) => c.content_type))]
        setActiveContentTypes(types)
      }
      if (profile) {
        const sl = (profile as any).social_links || {}
        const snsKeys: string[] = []
        if (sl.twitter) snsKeys.push('twitter')
        if (sl.instagram) snsKeys.push('instagram')
        if (sl.youtube) snsKeys.push('youtube_sns')
        if (sl.email) snsKeys.push('email')
        setActiveSnsKeys(snsKeys)
      }
    }
    load()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const social_links: Record<string, string> = {}
    if (twitterUrl) social_links.twitter = twitterUrl
    if (instagramUrl) social_links.instagram = instagramUrl
    if (youtubeUrl) social_links.youtube = youtubeUrl
    if (emailAddr) social_links.email = emailAddr

    await supabase.from('profiles').update({
      display_name: displayName,
      bio,
      avatar_url: avatarUrl || null,
      cover_url: coverUrl || null,
      social_links,
    } as any).eq('id', user.id)
    await supabase.from('hubs').update({ title: hubTitle, description: hubDesc, default_view: defaultView, type_labels: typeLabels } as any).eq('user_id', user.id)

    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-[#1e2340] mb-6">ハブ設定</h1>
      <div>
        <form onSubmit={handleSave} className="flex flex-col gap-5">
          {/* プロフィール */}
          <section className="bg-white rounded-2xl p-6 border border-[#e4e7f5]"
            style={{ boxShadow: '0 1px 4px rgba(91,124,247,.06)' }}>
            <h2 className="font-bold text-[#1e2340] mb-4">プロフィール</h2>
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-semibold text-[#1e2340] mb-1">ユーザー名（変更不可）</p>
                <p className="text-sm text-[#6b7280] bg-[#f7f8ff] border border-[#e4e7f5] px-3.5 py-2.5 rounded-[10px]">
                  {username}
                </p>
              </div>
              <Input label="表示名" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="例：やじま たくみ" />
              <ImageUpload
                bucket="avatars"
                currentUrl={avatarUrl}
                onUploaded={setAvatarUrl}
                label="アイコン画像"
                aspectRatio="square"
              />
              <ImageUpload
                bucket="covers"
                currentUrl={coverUrl}
                onUploaded={setCoverUrl}
                label="カバー画像（背景）"
                aspectRatio="wide"
              />
            </div>
          </section>

          {/* SNSリンク */}
          <section className="bg-white rounded-2xl p-6 border border-[#e4e7f5]"
            style={{ boxShadow: '0 1px 4px rgba(91,124,247,.06)' }}>
            <h2 className="font-bold text-[#1e2340] mb-1">SNSリンク</h2>
            <p className="text-xs text-[#9ca3af] mb-4">公開ページのプロフィール欄に表示されます</p>
            <div className="flex flex-col gap-4">
              <Input
                label="X（Twitter）URL"
                value={twitterUrl}
                onChange={(e) => setTwitterUrl(e.target.value)}
                placeholder="https://twitter.com/yourhandle"
              />
              <Input
                label="Instagram URL"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/yourhandle"
              />
              <Input
                label="YouTube URL"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://youtube.com/@yourchannel"
              />
              <Input
                label="メールアドレス"
                value={emailAddr}
                onChange={(e) => setEmailAddr(e.target.value)}
                placeholder="hello@example.com"
              />
            </div>
          </section>

          {/* ハブ設定 */}
          <section className="bg-white rounded-2xl p-6 border border-[#e4e7f5]"
            style={{ boxShadow: '0 1px 4px rgba(91,124,247,.06)' }}>
            <h2 className="font-bold text-[#1e2340] mb-4">ハブ設定</h2>
            <div className="flex flex-col gap-4">
              <Input label="ハブタイトル" value={hubTitle} onChange={(e) => setHubTitle(e.target.value)} placeholder="例：AI副業の発信まとめ" />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-[#1e2340]">説明文</label>
                <textarea
                  value={hubDesc}
                  onChange={(e) => setHubDesc(e.target.value)}
                  placeholder="ハブの説明（省略可）"
                  rows={2}
                  className="px-3.5 py-2.5 border-[1.5px] border-[#e4e7f5] rounded-[10px] text-sm bg-white text-[#1e2340] outline-none focus:border-[#5b7cf7] resize-y"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1e2340] mb-2">デフォルト表示</p>
                <div className="grid grid-cols-4 gap-2">
                  {VIEW_OPTIONS.map((v) => (
                    <button
                      key={v.value}
                      type="button"
                      onClick={() => setDefaultView(v.value)}
                      className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border text-sm font-medium transition-all
                        ${defaultView === v.value
                          ? 'border-[#5b7cf7] bg-[#eef0fd] text-[#5b7cf7]'
                          : 'border-[#e4e7f5] text-[#6b7280] hover:border-[#c4b5fd]'}`}
                    >
                      <span className="text-xl">{v.icon}</span>
                      <span className="text-xs">{v.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 「その他」の表示名カスタマイズ */}
          {activeContentTypes.includes('other') && (
            <section className="bg-white rounded-2xl p-6 border border-[#e4e7f5]"
              style={{ boxShadow: '0 1px 4px rgba(91,124,247,.06)' }}>
              <h2 className="font-bold text-[#1e2340] mb-1">「その他」の表示名</h2>
              <p className="text-xs text-[#9ca3af] mb-4">「その他」コンテンツの表示名を自由に変更できます</p>
              <input
                type="text"
                value={typeLabels['other'] || ''}
                onChange={(e) => setTypeLabels({ ...typeLabels, other: e.target.value })}
                placeholder="例：無料テンプレート、PDF配布物、外部リンク"
                className="w-full px-3.5 py-2.5 border border-[#e4e7f5] rounded-[10px] text-sm outline-none focus:border-[#5b7cf7]"
              />
            </section>
          )}

          <div className="flex items-center justify-end gap-3">
            {saved && <span className="text-sm text-[#5b7cf7]">✓ 保存しました</span>}
            <Button type="submit" loading={loading}>設定を保存</Button>
          </div>
        </form>

        {/* カードの表示順 */}
        {hubId && (activeContentTypes.length > 0 || activeSnsKeys.length > 0) && (
          <section className="bg-white rounded-2xl p-6 border border-[#e4e7f5] mt-5"
            style={{ boxShadow: '0 1px 4px rgba(91,124,247,.06)' }}>
            <h2 className="font-bold text-[#1e2340] mb-1">公開ページのカード順番</h2>
            <p className="text-xs text-[#9ca3af] mb-4">公開ページに表示されるカードの順番を変更できます</p>
            <CardOrderManager
              key={`${hubId}-${activeContentTypes.join(',')}-${activeSnsKeys.join(',')}`}
              hubId={hubId}
              initialOrder={cardOrder}
              activeContentTypes={activeContentTypes}
              activeSnsKeys={activeSnsKeys}
            />
          </section>
        )}
      </div>
    </div>
  )
}
