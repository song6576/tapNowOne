/** 前端 Mock 模式 — 默认 true，不接后端；接后端时设 VITE_USE_MOCK=false */
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

/** Google OAuth Client ID（登录页 Google 按钮） */
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined

