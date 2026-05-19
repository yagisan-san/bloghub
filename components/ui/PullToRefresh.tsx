'use client'

import { ReactNode, useRef, useState } from 'react'

interface PullToRefreshProps {
  children: ReactNode
  onRefresh: () => Promise<void>
}

const THRESHOLD = 60

export function PullToRefresh({ children, onRefresh }: PullToRefreshProps) {
  const startYRef = useRef<number | null>(null)
  const [pullDistance, setPullDistance] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  function handleTouchStart(e: React.TouchEvent) {
    if (window.scrollY !== 0) return
    startYRef.current = e.touches[0].clientY
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (startYRef.current === null || window.scrollY !== 0) return
    const delta = e.touches[0].clientY - startYRef.current
    if (delta > 0) {
      setPullDistance(Math.min(delta, THRESHOLD * 1.5))
    }
  }

  async function handleTouchEnd() {
    if (startYRef.current === null) return
    startYRef.current = null

    if (pullDistance >= THRESHOLD && !refreshing) {
      setRefreshing(true)
      setPullDistance(0)
      try {
        await onRefresh()
      } finally {
        setRefreshing(false)
      }
    } else {
      setPullDistance(0)
    }
  }

  const showing = pullDistance > 10 || refreshing

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* インジケーター */}
      <div
        className={`flex items-center justify-center transition-all duration-200 overflow-hidden text-sm text-[#6b7280]`}
        style={{ height: showing ? (refreshing ? 48 : Math.max(pullDistance, 0)) : 0 }}
      >
        {refreshing ? (
          <span className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 border-2 border-[#5b7cf7] border-t-transparent rounded-full animate-spin" />
            更新中...
          </span>
        ) : pullDistance >= THRESHOLD ? (
          <span>離して更新</span>
        ) : (
          <span>↓ 引っ張って更新</span>
        )}
      </div>
      {children}
    </div>
  )
}
