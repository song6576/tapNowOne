/** 前端 Mock 模式 — 默认 true，不接后端；接后端时设 VITE_USE_MOCK=false */
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'
