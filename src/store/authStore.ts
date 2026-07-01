import { create } from 'zustand'
import { clearAuth, getStoredUser, setAuth, type User } from '../utils/auth'
import * as api from '../api/client'

interface AuthStore {
  user: User | null
  loading: boolean
  init: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  isLoggedIn: () => boolean
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: getStoredUser(),
  loading: false,

  init: async () => {
    const token = localStorage.getItem('tapflow_token')
    if (!token) return
    try {
      const user = await api.fetchMe()
      set({ user })
    } catch {
      clearAuth()
      set({ user: null })
    }
  },

  login: async (email, password) => {
    set({ loading: true })
    try {
      const { access_token, user } = await api.login(email, password)
      setAuth(access_token, user)
      set({ user })
    } finally {
      set({ loading: false })
    }
  },

  register: async (email, password, name) => {
    set({ loading: true })
    try {
      const { access_token, user } = await api.register(email, password, name)
      setAuth(access_token, user)
      set({ user })
    } finally {
      set({ loading: false })
    }
  },

  logout: () => {
    clearAuth()
    set({ user: null })
  },

  isLoggedIn: () => !!get().user,
}))
