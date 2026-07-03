import { useEffect, useState } from 'react'
import { formatRelativeTime } from '../utils/time'

/** 相对时间文案，定时刷新以便「刚刚」等及时更新 */
export function useRelativeTime(iso: string | undefined, tickMs = 30_000): string | null {
  const [, setTick] = useState(0)

  useEffect(() => {
    if (!iso) return
    const id = window.setInterval(() => setTick((n) => n + 1), tickMs)
    return () => window.clearInterval(id)
  }, [iso, tickMs])

  if (!iso) return null
  return formatRelativeTime(iso)
}
