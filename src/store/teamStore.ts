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
import { generateUUID } from '../utils/uuid'
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

const STORAGE_KEY = 'tapflow_teams'

interface PersistedTeams {
  teams: Team[]
  activeTeamId: string
  tapiesBalance: number
}

function seedTeams(userName: string): PersistedTeams {
  const initial = userName.trim()[0]?.toUpperCase() ?? 'T'
  const personal: Team = {
    id: PERSONAL_TEAM_ID,
    name: `${userName}的团队`,
    initial,
    isPersonal: true,
  }
  return { teams: [personal], activeTeamId: PERSONAL_TEAM_ID, tapiesBalance: 0 }
}

function readTeams(userName: string): PersistedTeams {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as PersistedTeams
  } catch { /* ignore */ }
  return seedTeams(userName)
}

function writeTeams(data: PersistedTeams) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
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
        if (getToken()) {
          const res = await apiListTeams()
          const displayName = res.personal_name?.trim() || userName
          const personal: Team = {
            id: PERSONAL_TEAM_ID,
            name: `${displayName}的团队`,
            initial: displayName.trim()[0]?.toUpperCase() ?? 'T',
            isPersonal: true,
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
          teams[0] = { ...personal, tapiesBalance: res.personal_tapies_balance }
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
          return
        }
        const data = readTeams(userName)
        set({ ...data, initializedFor: userName, loading: false })
      } catch {
        const data = readTeams(userName)
        set({ ...data, initializedFor: userName, loading: false })
      }
    })
  },

  openCreateTeamModal: () => set({ createTeamModalOpen: true }),
  closeCreateTeamModal: () => set({ createTeamModalOpen: false }),

  createTeam: async (name) => {
    const trimmed = name.trim()
    const formattedName = trimmed.endsWith('的团队') ? trimmed : `${trimmed}的团队`
    if (getToken()) {
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
        const next = {
          teams,
          activeTeamId: row.id,
          tapiesBalance: row.tapies_balance,
          createTeamModalOpen: false,
        }
        writeTeams({ teams, activeTeamId: row.id, tapiesBalance: row.tapies_balance })
        return next
      })
      await useWorkspaceStore.getState().setScope(row.id)
      return team
    }
    const team: Team = {
      id: `team-${generateUUID().slice(0, 8)}`,
      name: formattedName,
      initial: trimmed[0]?.toUpperCase() ?? 'T',
      teamId: `C${Date.now().toString(36)}`,
    }
    set((s) => {
      const data = { teams: [...s.teams, team], activeTeamId: team.id, tapiesBalance: 0 }
      writeTeams({ ...data, tapiesBalance: s.tapiesBalance })
      return { ...data, createTeamModalOpen: false }
    })
    await useWorkspaceStore.getState().setScope(team.id)
    return team
  },

  switchTeam: async (id) => {
    const apiTeamId = id === PERSONAL_TEAM_ID ? null : id
    if (getToken()) {
      await apiSwitchActiveTeam(apiTeamId)
    }
    set((s) => {
      const personalBalance = s.teams.find((t) => t.isPersonal)?.tapiesBalance ?? s.tapiesBalance
      const data = {
        teams: s.teams,
        activeTeamId: id,
        tapiesBalance: id === PERSONAL_TEAM_ID ? personalBalance : resolveBalance(id, s.teams, personalBalance),
      }
      if (!getToken()) writeTeams(data)
      return data
    })
    if (getToken()) {
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
    }
    await useWorkspaceStore.getState().setScope(apiTeamId)
  },

  getActiveTeam: () => get().teams.find((t) => t.id === get().activeTeamId),

  getActiveTeamScopeId: () => {
    const id = get().activeTeamId
    return id === PERSONAL_TEAM_ID ? null : id
  },
}))
