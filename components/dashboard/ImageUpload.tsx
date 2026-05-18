'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, X } from 'lucide-react'

interface Props {
  bucket: 'avatars' | 'covers'
  currentUrl: string
  onUploaded: (url: string) => void
  label: string
  aspectRatio?: 'square' | 'wide'
}

export function ImageUpload({ bucket, currentUrl, onUploaded, label, aspectRatio = 'square' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError('5MB以下の画像を選択してください')
      return
    }

    setUploading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('ログインが必要です'); setUploading(false); return }

    const ext = file.name.split('.').pop()
    const path = `${user.id}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true })

    if (uploadError) {
      setError('アップロードに失敗しました: ' + uploadError.message)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)

    onUploaded(publicUrl)
    setUploading(false)
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-[#1e2340]">{label}</label>

      {/* プレビュー */}
      {currentUrl && (
        <div className="relative inline-block">
          <img
            src={currentUrl}
            alt="preview"
            className={`object-cover border border-[#e4e7f5] rounded-xl ${
              aspectRatio === 'wide' ? 'w-full h-24' : 'w-16 h-16'
            }`}
          />
          <button
            type="button"
            onClick={() => onUploaded('')}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <X size={11} />
          </button>
        </div>
      )}

      {/* アップロードボタン */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-[#e4e7f5] rounded-xl
          text-sm text-[#6b7280] hover:border-[#5b7cf7] hover:text-[#5b7cf7] transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed w-fit"
      >
        <Upload size={15} />
        {uploading ? 'アップロード中...' : '画像を選択'}
      </button>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  )
}
