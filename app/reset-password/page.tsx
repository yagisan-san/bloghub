'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('パスワードが一致しません')
      return
    }
    if (password.length < 8) {
      setError('パスワードは8文字以上で設定してください')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    setLoading(false)
    if (error) {
      setError('パスワードの更新に失敗しました。リンクの有効期限が切れている可能性があります。')
      return
    }

    router.push('/dashboard')
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
          <h2 className="text-lg font-bold text-[#1e2340] mb-2">新しいパスワードを設定</h2>
          <p className="text-sm text-[#6b7280] mb-6">8文字以上の新しいパスワードを入力してください。</p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="新しいパスワード"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8文字以上"
              minLength={8}
              required
            />
            <Input
              label="パスワード（確認）"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="もう一度入力"
              required
            />
            {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            <Button type="submit" loading={loading} className="w-full">
              パスワードを変更する
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
