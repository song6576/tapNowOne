/**
 * 团队与 Tapies 余额：团队列表、切换、创建团队弹窗。
 */
import { create } from 'zustand'
import { generateUUID } from '../utils/uuid'

export type Team = {
  id: string
  name: string
  initial: string
  teamId?: string
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
    id: 'team-personal',
    name: `${userName}的团队`,
    initial,
    teamId: 'C131425042026iGM5Z0g',
  }
  const demo: Team = {
    id: 'team-demo',
    name: '幻城',
    initial: '幻',
    teamId: 'C131425042026demo01',
  }
  return { teams: [personal, demo], activeTeamId: personal.id, tapiesBalance: 6174 }
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

interface TeamStore extends PersistedTeams {
  createTeamModalOpen: boolean
  initializedFor: string | null
  init: (userName: string) => void
  openCreateTeamModal: () => void
  closeCreateTeamModal: () => void
  createTeam: (name: string) => Team
  switchTeam: (id: string) => void
  getActiveTeam: () => Team | undefined
}

export const useTeamStore = create<TeamStore>((set, get) => ({
  teams: [],
  activeTeamId: '',
  tapiesBalance: 0,
  createTeamModalOpen: false,
  initializedFor: null,

  init: (userName) => {
    if (get().initializedFor === userName) return
    const data = readTeams(userName)
    set({ ...data, initializedFor: userName })
  },

  openCreateTeamModal: () => set({ createTeamModalOpen: true }),
  closeCreateTeamModal: () => set({ createTeamModalOpen: false }),

  createTeam: (name) => {
    const trimmed = name.trim()
    const team: Team = {
      id: `team-${generateUUID().slice(0, 8)}`,
      name: trimmed.endsWith('的团队') ? trimmed : `${trimmed}的团队`,
      initial: trimmed[0]?.toUpperCase() ?? 'T',
      teamId: `C${Date.now().toString(36)}`,
    }
    set((s) => {
      const data = { teams: [...s.teams, team], activeTeamId: team.id, tapiesBalance: 0 }
      writeTeams({ ...data, tapiesBalance: s.tapiesBalance })
      return { ...data, createTeamModalOpen: false }
    })
    return team
  },

  switchTeam: (id) => {
    set((s) => {
      const data = { teams: s.teams, activeTeamId: id, tapiesBalance: s.tapiesBalance }
      writeTeams(data)
      return { activeTeamId: id }
    })
  },

  getActiveTeam: () => get().teams.find((t) => t.id === get().activeTeamId),
}))
