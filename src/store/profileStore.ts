/**
 * 用户个人资料：简介、社交、地区等，localStorage 持久化。
 * 个人主页与账户管理弹窗共用此 store。
 */
import { create } from 'zustand'

export type AccountNavId =
  | 'subscription'
  | 'modelMarket'
  | 'recharge'
  | 'teamBenefits'
  | 'rewards'
  | 'billing'
  | 'usage'
  | 'personal'
  | 'team'
  | 'tutorials'
  | 'agentTutorials'

export type UserProfile = {
  bio: string
  socialLink: string
  country: string
  city: string
  profession: string
  showJoinDate: boolean
  bannerStyle: string
}

const STORAGE_KEY = 'tapflow_profile'

const DEFAULT_PROFILE: UserProfile = {
  bio: 'I am turning imagination into reality.',
  socialLink: '',
  country: '',
  city: '',
  profession: '',
  showJoinDate: true,
  bannerStyle: 'linear-gradient(135deg, #1a1a1e 0%, #2d2d35 50%, #1a1a1e 100%)',
}

function readProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...DEFAULT_PROFILE, ...JSON.parse(raw) as Partial<UserProfile> }
  } catch { /* ignore */ }
  return { ...DEFAULT_PROFILE }
}

function writeProfile(profile: UserProfile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
}

interface ProfileStore {
  profile: UserProfile
  accountModalOpen: boolean
  accountNav: AccountNavId
  init: () => void
  updateProfile: (patch: Partial<UserProfile>) => void
  openAccountModal: (nav?: AccountNavId) => void
  closeAccountModal: () => void
  setAccountNav: (nav: AccountNavId) => void
}

export const useProfileStore = create<ProfileStore>((set, get) => ({
  profile: { ...DEFAULT_PROFILE },
  accountModalOpen: false,
  accountNav: 'personal',

  init: () => {
    set({ profile: readProfile() })
  },

  updateProfile: (patch) => {
    const profile = { ...get().profile, ...patch }
    writeProfile(profile)
    set({ profile })
  },

  openAccountModal: (nav = 'personal') => {
    set({ accountModalOpen: true, accountNav: nav })
  },

  closeAccountModal: () => {
    set({ accountModalOpen: false })
  },

  setAccountNav: (nav) => {
    set({ accountNav: nav })
  },
}))
