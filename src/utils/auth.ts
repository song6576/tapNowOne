/** 认证 localStorage：token、user 读写与 Authorization 头 */
const TOKEN_KEY = 'tapflow_token'
const USER_KEY = 'tapflow_user'

export type User = {
  id: string
  email: string
  name: string
  avatar_url?: string | null
  banner_url?: string | null
  bio?: string | null
  social_link?: string | null
  country?: string | null
  city?: string | null
  profession?: string | null
  show_join_date?: boolean
  created_at: string
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setAuth(token: string, user: User): void {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) as User : null
  } catch {
    return null
  }
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function authHeaders(): Record<string, string> {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}
