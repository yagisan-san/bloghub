'use client'

import { useEffect } from 'react'

export function ViewTracker({ hubId }: { hubId: string }) {
  useEffect(() => {
    const key = `bloghub_viewed_${hubId}`
    const last = localStorage.getItem(key)
    const now = Date.now()

    // 24時間以内に訪問済みならカウントしない
    if (last && now - parseInt(last) < 24 * 60 * 60 * 1000) return

    localStorage.setItem(key, String(now))

    fetch('/api/views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hubId }),
    }).catch(() => {})
  }, [hubId])

  return null
}
