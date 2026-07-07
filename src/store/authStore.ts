/** 认证状态：登录/注册/Google 登录、token 校验、登出 */
import { create } from 'zustand'
import { clearAuth, getStoredUser, setAuth, type User } from '../utils/auth'
import { createInFlight } from '../utils/inFlight'
import { resetAppBootstrap } from './appBootstrapState'
import { useProfileStore } from './profileStore'
import { PERSONAL_TEAM_ID, useTeamStore } from './teamStore'
import { useWorkspaceStore } from './workspaceStore'
import * as api from '../api/client'

const runAuthInit = createInFlight()

interface AuthStore {
  user: User | null
  loading: boolean
  initialized: boolean
  init: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  loginWithGoogle: (credential: string) => Promise<void>
  logout: () => void
  updateUser: (user: User) => void
  isLoggedIn: () => boolean
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: getStoredUser(),
  loading: false,
  initialized: false,

  /** 应用启动：有 token 则请求 /auth/me 校验，失败则清本地凭证 */
  init: async () => {
    if (get().initialized) return
    return runAuthInit(async () => {
      if (get().initialized) return

      const token = localStorage.getItem('tapflow_token')
      if (!token) {
        set({ initialized: true })
        return
      }
      try {
        const user = await api.fetchMe()
        set({ user })
        useProfileStore.getState().syncFromUser(user)
      } catch {
        clearAuth()
        set({ user: null })
      } finally {
        set({ initialized: true })
      }
    })
  },

  login: async (email, password) => {
    set({ loading: true })
    try {
      const { access_token, user } = await api.login(email, password)
      setAuth(access_token, user)
      set({ user })
      useProfileStore.getState().syncFromUser(user)
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
      useProfileStore.getState().syncFromUser(user)
    } finally {
      set({ loading: false })
    }
  },

  loginWithGoogle: async (credential) => {
    set({ loading: true })
    try {
      const { access_token, user } = await api.loginWithGoogle(credential)
      setAuth(access_token, user)
      set({ user })
      useProfileStore.getState().syncFromUser(user)
    } finally {
      set({ loading: false })
    }
  },

  logout: () => {
    clearAuth()
    set({ user: null, initialized: true })
    resetAppBootstrap()
    useTeamStore.setState({
      teams: [],
      activeTeamId: PERSONAL_TEAM_ID,
      tapiesBalance: 0,
      initializedFor: null,
      loading: false,
    })
    useWorkspaceStore.setState({
      folders: [],
      projects: [],
      initialized: false,
      loading: false,
      scopeTeamId: null,
    })
  },

  updateUser: (user) => {
    const token = localStorage.getItem('tapflow_token')
    if (token) setAuth(token, user)
    set({ user })
    useProfileStore.getState().syncFromUser(user)
  },

  isLoggedIn: () => !!get().user,
}))
