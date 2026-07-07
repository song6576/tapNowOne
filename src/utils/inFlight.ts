/** 合并同一时刻的重复 async 调用（StrictMode 双 mount、多组件同时 init） */
export function createInFlight() {
  let promise: Promise<void> | null = null

  return (runner: () => Promise<void>) => {
    if (promise) return promise
    promise = runner().finally(() => {
      promise = null
    })
    return promise
  }
}
