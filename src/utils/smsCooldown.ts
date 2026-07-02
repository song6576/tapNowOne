/** 短信验证码发送冷却：60s 内同号码不可重复发送 */
const SMS_COOLDOWN_KEY = 'tapflow_sms_cooldown'
export const SMS_COOLDOWN_SECONDS = 60

interface SmsCooldownRecord {
  phone: string
  sentAt: number
}

export function normalizePhone(value: string): string {
  return value.replace(/[\s-]/g, '')
}

function readRecord(): SmsCooldownRecord | null {
  try {
    const raw = localStorage.getItem(SMS_COOLDOWN_KEY)
    if (!raw) return null
    return JSON.parse(raw) as SmsCooldownRecord
  } catch {
    return null
  }
}

export function getSmsCooldownRemaining(phone: string): number {
  const record = readRecord()
  if (!record || record.phone !== normalizePhone(phone)) return 0
  const elapsed = Math.floor((Date.now() - record.sentAt) / 1000)
  return Math.max(0, SMS_COOLDOWN_SECONDS - elapsed)
}

export function hasSmsSentForPhone(phone: string): boolean {
  const record = readRecord()
  return !!record && record.phone === normalizePhone(phone)
}

export function startSmsCooldown(phone: string): void {
  localStorage.setItem(
    SMS_COOLDOWN_KEY,
    JSON.stringify({ phone: normalizePhone(phone), sentAt: Date.now() } satisfies SmsCooldownRecord),
  )
}

export function getStoredSmsPhone(): string {
  return readRecord()?.phone ?? ''
}
