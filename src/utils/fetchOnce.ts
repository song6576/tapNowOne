/**
 * 合并短时间内的重复请求（React StrictMode 双 mount、快速切换 Tab）
 * key 相同则复用同一 Promise，避免接口打两次。
 */
const inflight = new Map<string, Promise<unknown>>()

export function fetchOnce<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const existing = inflight.get(key)
  if (existing) return existing as Promise<T>
  const promise = fn().finally(() => {
    inflight.delete(key)
  })
  inflight.set(key, promise)
  return promise
}
