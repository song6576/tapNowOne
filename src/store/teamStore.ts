/**
 * 团队与 Tapies 余额：团队列表、切换、创建团队。
 */
import { create } from 'zustand'
import {
  createTeam as apiCreateTeam,
  listTeams as apiListTeams,
  switchActiveTeam as apiSwitchActiveTeam,
} from '../api/client'
import { getToken } from '../utils/auth'
import { createInFlight } from '../utils/inFlight'
import { useWorkspaceStore } from './workspaceStore'

export const PERSONAL_TEAM_ID = 'personal'

export type Team = {
  id: string
  name: string
  initial: string
  teamId?: string
  isPersonal?: boolean
  tapiesBalance?: number
  role?: string
  isOwner?: boolean
}

interface PersistedTeams {
  teams: Team[]
  activeTeamId: string
  tapiesBalance: number
}

function resolveBalance(activeTeamId: string, teams: Team[], personalBalance: number) {
  if (activeTeamId === PERSONAL_TEAM_ID) return personalBalance
  return teams.find((t) => t.id === activeTeamId)?.tapiesBalance ?? 0
}

interface TeamStore extends PersistedTeams {
  createTeamModalOpen: boolean
  initializedFor: string | null
  loading: boolean
  init: (userName: string, options?: { force?: boolean }) => Promise<void>
  openCreateTeamModal: () => void
  closeCreateTeamModal: () => void
  createTeam: (name: string) => Promise<Team>
  switchTeam: (id: string) => Promise<void>
  getActiveTeam: () => Team | undefined
  getActiveTeamScopeId: () => string | null
}

const runTeamInit = createInFlight()

export const useTeamStore = create<TeamStore>((set, get) => ({
  teams: [],
  activeTeamId: PERSONAL_TEAM_ID,
  tapiesBalance: 0,
  createTeamModalOpen: false,
  initializedFor: null,
  loading: false,

  init: async (userName, options) => {
    if (
      !options?.force &&
      get().initializedFor === userName &&
      get().teams.length > 0
    ) {
      return
    }

    return runTeamInit(async () => {
      if (
        !options?.force &&
        get().initializedFor === userName &&
        get().teams.length > 0
      ) {
        return
      }

      set({ loading: true })
      try {
        if (!getToken()) {
          set({ teams: [], tapiesBalance: 0, initializedFor: userName, loading: false })
          return
        }
        const res = await apiListTeams()
        const displayName = res.personal_name?.trim() || userName
        const personal: Team = {
          id: PERSONAL_TEAM_ID,
          name: `${displayName}的团队`,
          initial: displayName.trim()[0]?.toUpperCase() ?? 'T',
          isPersonal: true,
          tapiesBalance: res.personal_tapies_balance,
        }
        const teams: Team[] = [
          personal,
          ...res.teams.map((t) => ({
            id: t.id,
            name: t.name,
            initial: t.initial,
            teamId: t.public_id,
            tapiesBalance: t.tapies_balance,
            role: t.role,
            isOwner: t.is_owner,
          })),
        ]
        const activeTeamId = res.active_team_id ?? PERSONAL_TEAM_ID
        const tapiesBalance =
          activeTeamId === PERSONAL_TEAM_ID
            ? res.personal_tapies_balance
            : res.teams.find((t) => t.id === activeTeamId)?.tapies_balance ?? 0
        set({
          teams,
          activeTeamId,
          tapiesBalance,
          initializedFor: userName,
          loading: false,
        })
      } catch {
        set({ teams: [], tapiesBalance: 0, initializedFor: userName, loading: false })
      }
    })
  },

  openCreateTeamModal: () => set({ createTeamModalOpen: true }),
  closeCreateTeamModal: () => set({ createTeamModalOpen: false }),

  createTeam: async (name) => {
    if (!getToken()) throw new Error('请先登录')
    const trimmed = name.trim()
    const row = await apiCreateTeam(trimmed)
    const team: Team = {
      id: row.id,
      name: row.name,
      initial: row.initial,
      teamId: row.public_id,
      tapiesBalance: row.tapies_balance,
      role: row.role,
      isOwner: row.is_owner,
    }
    set((s) => {
      const teams = [...s.teams.filter((t) => t.id !== row.id), team]
      return {
        teams,
        activeTeamId: row.id,
        tapiesBalance: row.tapies_balance,
        createTeamModalOpen: false,
      }
    })
    await useWorkspaceStore.getState().setScope(row.id)
    return team
  },

  switchTeam: async (id) => {
    if (!getToken()) throw new Error('请先登录')
    const apiTeamId = id === PERSONAL_TEAM_ID ? null : id
    await apiSwitchActiveTeam(apiTeamId)
    set((s) => {
      const personalBalance = s.teams.find((t) => t.isPersonal)?.tapiesBalance ?? s.tapiesBalance
      const data = {
        teams: s.teams,
        activeTeamId: id,
        tapiesBalance: id === PERSONAL_TEAM_ID ? personalBalance : resolveBalance(id, s.teams, personalBalance),
      }
      return data
    })
    const res = await apiListTeams()
    set((s) => ({
      tapiesBalance:
        id === PERSONAL_TEAM_ID
          ? res.personal_tapies_balance
          : res.teams.find((t) => t.id === id)?.tapies_balance ?? 0,
      teams: s.teams.map((t) => {
        const remote = res.teams.find((r) => r.id === t.id)
        if (!remote) return t
        return { ...t, tapiesBalance: remote.tapies_balance }
      }),
    }))
    await useWorkspaceStore.getState().setScope(apiTeamId)
  },

  getActiveTeam: () => get().teams.find((t) => t.id === get().activeTeamId),

  getActiveTeamScopeId: () => {
    const id = get().activeTeamId
    return id === PERSONAL_TEAM_ID ? null : id
  },
}))
