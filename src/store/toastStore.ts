import { create } from 'zustand'

export type ToastType = 'info' | 'success' | 'error' | 'warning'

export interface ToastItem {
  id: string
  message: string
  type: ToastType
}

interface ToastStore {
  toasts: ToastItem[]
  showToast: (opts: { message: string; type?: ToastType; duration?: number }) => void
  dismiss: (id: string) => void
}

let toastId = 0

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],

  showToast: ({ message, type = 'info', duration = 3000 }) => {
    const id = String(++toastId)
    set({ toasts: [...get().toasts, { id, message, type }] })
    window.setTimeout(() => get().dismiss(id), duration)
  },

  dismiss: (id) => {
    set({ toasts: get().toasts.filter((t) => t.id !== id) })
  },
}))
