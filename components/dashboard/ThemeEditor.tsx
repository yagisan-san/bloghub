'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface HubTheme {
  bg: string
  accent: string
  cardBg: string
  cardBorder: string
  text: string
  textMuted: string
  profileNameColor: string
  profileIdColor: string
}

export const DEFAULT_THEME: HubTheme = {
  bg: '#fafafa',
  accent: '#5b7cf7',
  cardBg: '#ffffff',
  cardBorder: '#374151',
  text: '#1e2340',
  textMuted: '#6b7280',
  profileNameColor: '#ffffff',
  profileIdColor: 'rgba(255,255,255,0.8)',
}

const PRESETS: { name: string; emoji: string; theme: HubTheme }[] = [
  {
    name: 'デフォルト',
    emoji: '🔵',
    theme: DEFAULT_THEME,
  },
  {
    name: 'ダーク',
    emoji: '🌙',
    theme: {
      bg: '#0f1117',
      accent: '#a78bfa',
      cardBg: '#1e2130',
      cardBorder: '#2d3148',
      text: '#e2e8f0',
      textMuted: '#94a3b8',
      profileNameColor: '#ffffff',
      profileIdColor: 'rgba(255,255,255,0.7)',
    },
  },
  {
    name: 'ナチュラル',
    emoji: '🌿',
    theme: {
      bg: '#f5f0e8',
      accent: '#4a7c59',
      cardBg: '#fffdf7',
      cardBorder: '#e8e0d0',
      text: '#2d2a24',
      textMuted: '#7a7060',
      profileNameColor: '#ffffff',
      profileIdColor: 'rgba(255,255,255,0.85)',
    },
  },
  {
    name: 'サクラ',
    emoji: '🌸',
    theme: {
      bg: '#fff5f7',
      accent: '#e75480',
      cardBg: '#ffffff',
      cardBorder: '#ffd6e0',
      text: '#3d1a26',
      textMuted: '#9b6070',
      profileNameColor: '#ffffff',
      profileIdColor: 'rgba(255,255,255,0.85)',
    },
  },
  {
    name: 'オーシャン',
    emoji: '🌊',
    theme: {
      bg: '#f0f8ff',
      accent: '#0077b6',
      cardBg: '#ffffff',
      cardBorder: '#caf0f8',
      text: '#023e58',
      textMuted: '#4a8fa8',
      profileNameColor: '#ffffff',
      profileIdColor: 'rgba(255,255,255,0.85)',
    },
  },
  {
    name: 'サンド',
    emoji: '🏜️',
    theme: {
      bg: '#fdf6ec',
      accent: '#d4860a',
      cardBg: '#fffdf8',
      cardBorder: '#f0e0c0',
      text: '#3d2c0a',
      textMuted: '#8b6a30',
      profileNameColor: '#ffffff',
      profileIdColor: 'rgba(255,255,255,0.85)',
    },
  },
]

const THEME_FIELDS: { key: keyof HubTheme; label: string; desc: string }[] = [
  { key: 'bg',               label: 'ページ背景色',           desc: 'ページ全体の背景色' },
  { key: 'accent',           label: 'アクセントカラー',        desc: 'ボタン・リンク・バッジの色' },
  { key: 'cardBg',           label: 'カード背景色',            desc: 'コンテンツカードの背景' },
  { key: 'cardBorder',       label: 'カード枠線色',            desc: 'コンテンツカードの枠線' },
  { key: 'text',             label: 'メインテキスト',          desc: '見出しなど主要テキストの色' },
  { key: 'textMuted',        label: 'サブテキスト',            desc: '補足テキスト・件数などの色' },
  { key: 'profileNameColor', label: 'ハブタイトル色',          desc: 'カバー画像上のタイトル色' },
  { key: 'profileIdColor',   label: '@ID 色',                 desc: 'カバー画像上の@ユーザーID色' },
]

interface Props {
  hubId: string
  initialTheme: HubTheme
}

export function ThemeEditor({ hubId, initialTheme }: Props) {
  const supabase = createClient()
  const [theme, setTheme] = useState<HubTheme>(initialTheme)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  function handleChange(key: keyof HubTheme, value: string) {
    setTheme((prev) => ({ ...prev, [key]: value }))
  }

  function handleReset() {
    setTheme(DEFAULT_THEME)
  }

  async function handleSave() {
    setLoading(true)
    await supabase.from('hubs').update({ theme } as any).eq('id', hubId)
    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* 左カラム：色の設定 */}
      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-2xl p-6 border border-[#e4e7f5]"
          style={{ boxShadow: '0 1px 4px rgba(91,124,247,.06)' }}>
          <h2 className="font-bold text-[#1e2340] mb-1">プリセット</h2>
          <p className="text-xs text-[#9ca3af] mb-3">クリックで一括適用できます</p>
          <div className="grid grid-cols-3 gap-2 mb-6">
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => setTheme(preset.theme)}
                className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border border-[#e4e7f5] hover:border-[#c4b5fd] transition-all text-sm font-medium text-[#6b7280] hover:text-[#5b7cf7]"
                style={{ background: preset.theme.bg }}
              >
                <span className="text-xl">{preset.emoji}</span>
                <span className="text-xs" style={{ color: preset.theme.text }}>{preset.name}</span>
                <div className="flex gap-1">
                  {[preset.theme.accent, preset.theme.cardBg, preset.theme.bg].map((c, i) => (
                    <span key={i} className="w-3 h-3 rounded-full border border-black/10"
                      style={{ background: c }} />
                  ))}
                </div>
              </button>
            ))}
          </div>

          <h2 className="font-bold text-[#1e2340] mb-1">カスタムカラー</h2>
          <p className="text-xs text-[#9ca3af] mb-5">各項目の色を変更すると右側のプレビューにリアルタイムで反映されます</p>

          <div className="flex flex-col gap-4">
            {THEME_FIELDS.map(({ key, label, desc }) => (
              <div key={key} className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1e2340]">{label}</p>
                  <p className="text-xs text-[#9ca3af]">{desc}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* 現在色プレビュー */}
                  <div
                    className="w-8 h-8 rounded-lg border border-[#e4e7f5] flex-shrink-0"
                    style={{ background: theme[key] }}
                  />
                  <input
                    type="color"
                    value={(theme[key] || '').startsWith('rgba') ? '#ffffff' : (theme[key] || '#ffffff')}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className="w-10 h-10 rounded-lg border border-[#e4e7f5] cursor-pointer p-0.5 bg-white"
                    title={label}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-6 pt-5 border-t border-[#e4e7f5]">
            <button
              type="button"
              onClick={handleReset}
              className="text-sm text-[#6b7280] hover:text-[#1e2340] transition-colors px-3 py-2 rounded-lg hover:bg-[#f7f8ff]"
            >
              リセット
            </button>
            <div className="flex items-center gap-3">
              {saved && <span className="text-sm text-[#5b7cf7]">✓ 保存しました</span>}
              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className="px-5 py-2 bg-[#5b7cf7] text-white text-sm font-semibold rounded-xl hover:bg-[#4a6be6] transition-colors disabled:opacity-60"
              >
                {loading ? '保存中...' : '保存する'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 右カラム：ライブプレビュー */}
      <div className="lg:w-[420px] flex-shrink-0">
        <div className="bg-white rounded-2xl p-4 border border-[#e4e7f5]"
          style={{ boxShadow: '0 1px 4px rgba(91,124,247,.06)' }}>
          <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-3">プレビュー</p>

          {/* モックページ */}
          <div className="rounded-xl overflow-hidden border border-[#e4e7f5]" style={{ background: theme.bg }}>

            {/* カバー画像エリア */}
            <div
              className="relative w-full h-28"
              style={{ background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accent}99 50%, ${theme.accent}55 100%)` }}
            >
              <div className="absolute bottom-3 left-4 flex flex-col gap-1.5">
                {/* アバター */}
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg"
                  style={{ background: theme.accent, boxShadow: '0 2px 8px rgba(0,0,0,.2)' }}
                >
                  B
                </div>
                {/* タイトル・ID */}
                <div>
                  <p className="text-sm font-bold drop-shadow" style={{ color: theme.profileNameColor }}>
                    マイ発信ハブ
                  </p>
                  <p className="text-xs" style={{ color: theme.profileIdColor }}>
                    @username
                  </p>
                </div>
              </div>
            </div>

            {/* スタッツ */}
            <div className="px-4 py-3 flex gap-2">
              {['12 件', '4 個'].map((label) => (
                <div key={label} className="rounded-xl px-3 py-1.5 border"
                  style={{ background: theme.cardBg, borderColor: theme.cardBorder }}>
                  <p className="text-xs font-bold" style={{ color: theme.accent }}>{label}</p>
                  <p className="text-[10px]" style={{ color: theme.textMuted }}>コンテンツ</p>
                </div>
              ))}
            </div>

            {/* コンテンツカード3枚 */}
            <div className="px-4 pb-4 flex flex-col gap-2">
              {[
                { icon: '✏️', label: 'はてなブログ', count: 5 },
                { icon: '📝', label: 'note',          count: 4 },
                { icon: '▶️', label: 'YouTube',       count: 3 },
              ].map((card) => (
                <div key={card.label} className="rounded-xl border p-3"
                  style={{ background: theme.cardBg, borderColor: theme.cardBorder }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{card.icon}</span>
                      <span className="text-xs font-semibold" style={{ color: theme.text }}>
                        {card.label}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-white px-1.5 py-0.5 rounded-full"
                      style={{ background: theme.accent }}>
                      {card.count}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="h-2 rounded-full w-4/5" style={{ background: theme.cardBorder }} />
                    <div className="h-2 rounded-full w-3/5" style={{ background: theme.cardBorder }} />
                  </div>
                  <div className="mt-2">
                    <span className="text-[10px] font-medium border rounded px-2 py-0.5"
                      style={{ color: theme.accent, borderColor: theme.accent + '55' }}>
                      すべて見る →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
