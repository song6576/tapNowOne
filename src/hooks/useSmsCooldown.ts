import { useCallback, useEffect, useState } from 'react'
import {
  getSmsCooldownRemaining,
  normalizePhone,
  SMS_COOLDOWN_SECONDS,
  startSmsCooldown,
} from '../utils/smsCooldown'

export function useSmsCooldown(phone: string) {
  const normalized = normalizePhone(phone)
  const [remaining, setRemaining] = useState(() =>
    normalized ? getSmsCooldownRemaining(phone) : 0,
  )

  const refresh = useCallback(() => {
    setRemaining(normalized ? getSmsCooldownRemaining(phone) : 0)
  }, [phone, normalized])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    if (remaining <= 0) return
    const id = window.setInterval(refresh, 1000)
    return () => window.clearInterval(id)
  }, [remaining, refresh])

  const triggerCooldown = useCallback(() => {
    startSmsCooldown(phone)
    setRemaining(SMS_COOLDOWN_SECONDS)
  }, [phone])

  return {
    remaining,
    canSend: remaining <= 0 && !!normalized,
    triggerCooldown,
    refresh,
  }
}
