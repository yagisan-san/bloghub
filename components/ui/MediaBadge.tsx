import { ContentType } from '@/types/database'

const BADGE_CONFIG: Record<ContentType, { label: string; bg: string; text: string; border: string }> = {
  hatena:      { label: 'はてなブログ', bg: '#E0F2FE', text: '#0369A1', border: '#BAE6FD' },
  note:        { label: 'note',        bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7' },
  pdf:         { label: 'PDF',         bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5' },
  notion:      { label: 'Notion',      bg: '#F3F4F6', text: '#1F2937', border: '#D1D5DB' },
  youtube:     { label: 'YouTube',     bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5' },
  spreadsheet: { label: 'スプレッドシート', bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7' },
  booth:       { label: 'BOOTH',       bg: '#FCE7F3', text: '#9D174D', border: '#F9A8D4' },
  other:       { label: 'その他',      bg: '#F3F4F6', text: '#6B7280', border: '#E5E7EB' },
}

interface MediaBadgeProps {
  type: ContentType
  size?: 'sm' | 'xs'
}

export function MediaBadge({ type, size = 'sm' }: MediaBadgeProps) {
  const config = BADGE_CONFIG[type] ?? BADGE_CONFIG.other
  const px = size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'
  return (
    <span
      className={`inline-block font-semibold rounded-full border leading-tight ${px}`}
      style={{ background: config.bg, color: config.text, borderColor: config.border }}
    >
      {config.label}
    </span>
  )
}
