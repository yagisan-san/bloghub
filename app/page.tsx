import Link from 'next/link'

const FEATURES = [
  { icon: '⊞', title: 'グリッド表示',    desc: 'カード形式で記事を見やすく一覧表示' },
  { icon: '📂', title: 'カテゴリ表示',   desc: 'ジャンルごとに記事を整理して表示' },
  { icon: '📖', title: '読む順番',       desc: 'おすすめ順に読者を自然に誘導できる' },
  { icon: '🌳', title: 'ツリー構造',     desc: 'ブログ全体の構造を一目で把握できる' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f7f8ff]">

      {/* ナビ */}
      <header className="bg-white border-b border-[#e4e7f5]"
        style={{ boxShadow: '0 1px 4px rgba(91,124,247,.06)' }}>
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="flex items-center gap-2 text-lg font-bold text-[#5b7cf7]">
            <img src="/logo.png" alt="BlogHub" className="w-6 h-6 object-contain" />
            BlogHub
          </span>
          <div className="flex items-center gap-2">
            <Link href="/login"
              className="px-4 py-1.5 rounded-lg text-sm text-[#6b7280] hover:bg-[#f7f8ff] hover:text-[#1e2340] transition-colors font-medium">
              ログイン
            </Link>
            <Link href="/signup"
              className="px-4 py-1.5 rounded-lg text-sm bg-[#5b7cf7] text-white hover:bg-[#4a6bf5] transition-colors font-semibold">
              無料で始める
            </Link>
          </div>
        </div>
      </header>

      {/* ヒーロー */}
      <section className="text-center pt-20 pb-16 px-4"
        style={{ background: 'linear-gradient(140deg, #eef2ff 0%, #f7f8ff 50%, #f5f0ff 100%)' }}>
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-[22px] mb-6 bg-white"
          style={{ boxShadow: '0 8px 24px rgba(91,124,247,.2)' }}>
          <img src="/logo.png" alt="BlogHub" className="w-12 h-12 object-contain" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-[#1e2340] leading-tight mb-4">
          散らばった発信を、<br />
          ひとつのホームに。
        </h1>
        <p className="text-lg text-[#6b7280] max-w-xl mx-auto mb-8 leading-relaxed">
          無料ブログ・note・PDFなどをまとめて、<br />
          自分だけの発信ホームページを作れるサービスです。
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/signup"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-[#5b7cf7] text-white rounded-xl font-semibold text-base
              hover:bg-[#4a6bf5] transition-colors"
            style={{ boxShadow: '0 6px 20px rgba(91,124,247,.35)' }}>
            無料でアカウントを作る
          </Link>
          <Link href="/login"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-white text-[#5b7cf7] rounded-xl font-semibold text-base
              border border-[#e4e7f5] hover:border-[#c4b5fd] transition-colors">
            ログイン
          </Link>
        </div>
        <p className="text-xs text-[#9ca3af] mt-4">完全無料 · クレジットカード不要</p>
      </section>

      {/* 機能紹介 */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-[#1e2340] text-center mb-3">4つの表示で、発信を整理</h2>
        <p className="text-[#6b7280] text-center mb-10">読者に合わせた見せ方を選べます</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-white rounded-2xl p-6 border border-[#e4e7f5] text-center"
              style={{ boxShadow: '0 1px 4px rgba(91,124,247,.06)' }}>
              <span className="text-3xl">{f.icon}</span>
              <h3 className="font-bold text-[#1e2340] mt-3 mb-1">{f.title}</h3>
              <p className="text-sm text-[#6b7280] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* バリュープロポジション */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#e4e7f5] text-center"
          style={{ boxShadow: '0 4px 12px rgba(91,124,247,.1)' }}>
          <h2 className="text-2xl font-bold text-[#1e2340] mb-6">こんな人におすすめ</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-left max-w-xl mx-auto mb-8">
            {[
              '無料ブログで発信しているが記事が流れてしまう',
              'noteやPDFなど複数媒体に発信が散らばっている',
              'Xプロフィールに貼れる発信の入口が欲しい',
              'WordPressに移行する前に整理したい',
              '読者に読んでほしい順番で記事を並べたい',
              '自分の発信全体をサイトっぽく見せたい',
            ].map((t) => (
              <div key={t} className="flex items-start gap-2 text-sm text-[#6b7280]">
                <span className="text-[#5b7cf7] font-bold flex-shrink-0">✓</span>
                {t}
              </div>
            ))}
          </div>
          <Link href="/signup"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-[#5b7cf7] text-white rounded-xl font-semibold
              hover:bg-[#4a6bf5] transition-colors"
            style={{ boxShadow: '0 6px 20px rgba(91,124,247,.35)' }}>
            無料で発信ハブを作る →
          </Link>
        </div>
      </section>

      <footer className="text-center py-8 text-xs text-[#9ca3af] border-t border-[#e4e7f5]">
        © 2025 BlogHub · 完全無料
      </footer>
    </div>
  )
}
