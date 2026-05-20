'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/onboarding')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(140deg, #eef2ff 0%, #f7f8ff 50%, #f5f0ff 100%)' }}>
      <div className="w-full max-w-[420px]">

        {/* ロゴ */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-[18px] mb-4 bg-white" style={{ boxShadow: "0 6px 20px rgba(91,124,247,.2)" }}>
            <img src="/logo.png" alt="BlogHub" className="w-full h-full object-contain p-1" />
          </div>
          <h1 className="text-2xl font-bold text-[#1e2340] mb-1">BlogHub</h1>
          <p className="text-sm font-semibold text-[#5b7cf7]">散らばった発信を、ひとつのホームに。</p>
        </div>

        {/* フォーム */}
        <div className="bg-white rounded-2xl p-8 border border-[#e4e7f5]"
          style={{ boxShadow: '0 12px 32px rgba(91,124,247,.12)' }}>
          <h2 className="text-lg font-bold text-[#1e2340] mb-6">新規登録</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="メールアドレス"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
            <Input
              label="パスワード"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8文字以上"
              autoComplete="new-password"
              minLength={8}
              required
              hint="8文字以上で設定してください"
            />
            {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            <Button type="submit" loading={loading} className="w-full mt-2">
              アカウントを作成
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-[#6b7280] mt-4">
          すでにアカウントをお持ちの方は{' '}
          <Link href="/login" className="text-[#5b7cf7] font-semibold hover:underline">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  )
}
