'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setLoading(false)
    if (error) {
      setError('メールの送信に失敗しました。メールアドレスを確認してください。')
      return
    }
    setSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(140deg, #eef2ff 0%, #f7f8ff 50%, #f5f0ff 100%)' }}>
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-[18px] text-white text-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, #5b7cf7, #a78bfa)', boxShadow: '0 6px 20px rgba(91,124,247,.35)' }}>
            ✦
          </div>
          <h1 className="text-2xl font-bold text-[#1e2340] mb-1">BlogHub</h1>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-[#e4e7f5]"
          style={{ boxShadow: '0 12px 32px rgba(91,124,247,.12)' }}>
          {sent ? (
            <div className="text-center">
              <p className="text-4xl mb-4">📧</p>
              <h2 className="text-lg font-bold text-[#1e2340] mb-2">メールを送信しました</h2>
              <p className="text-sm text-[#6b7280] mb-6">
                {email} にパスワードリセット用のリンクを送りました。メールをご確認ください。
              </p>
              <Link href="/login" className="text-sm text-[#5b7cf7] font-semibold hover:underline">
                ログイン画面に戻る
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-bold text-[#1e2340] mb-2">パスワードを忘れた方</h2>
              <p className="text-sm text-[#6b7280] mb-6">
                登録したメールアドレスを入力してください。パスワードリセット用のリンクをお送りします。
              </p>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                  label="メールアドレス"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
                {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
                <Button type="submit" loading={loading} className="w-full">
                  リセットメールを送る
                </Button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-[#6b7280] mt-4">
          <Link href="/login" className="text-[#5b7cf7] font-semibold hover:underline">
            ← ログインに戻る
          </Link>
        </p>
      </div>
    </div>
  )
}
