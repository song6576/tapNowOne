/** 工作空间：文件夹/项目 CRUD，所有持久化数据均来自后端/MySQL。 */
import { create } from 'zustand'
import {
  createFolder as apiCreateFolder,
  createProject as apiCreateProject,
  deleteFolder as apiDeleteFolder,
  deleteProjectCloud,
  listFolders,
  listProjects,
  patchProject,
  searchWorkspace,
  updateFolder as apiUpdateFolder,
  type FolderMeta,
  type ProjectMeta,
  type WorkspaceSearchParams,
} from '../api/client'
import { getToken } from '../utils/auth'
import { pickWorkspaceCover } from '../utils/workspaceCover'
import { createInFlight } from '../utils/inFlight'

export type WorkspaceFolder = {
  id: string
  name: string
  parentId: string | null
  createdAt: string
  updatedAt: string
  cover?: string
  projectCount?: number
}

export type WorkspaceProject = {
  id: string
  name: string
  folderId: string | null
  createdAt: string
  updatedAt: string
  thumbnail?: string
}

export type WorkspaceTypeFilter = 'all' | 'folders' | 'projects'
export type WorkspaceSortBy = 'updatedAt' | 'createdAt'
export type WorkspaceSortOrder = 'desc' | 'asc'
export type WorkspaceViewMode = 'grid' | 'list'

interface PersistedWorkspace {
  folders: WorkspaceFolder[]
  projects: WorkspaceProject[]
}

function mapFolder(f: FolderMeta): WorkspaceFolder {
  return {
    id: f.id,
    name: f.name,
    parentId: f.parent_id,
    createdAt: f.created_at,
    updatedAt: f.updated_at,
    projectCount: f.project_count,
  }
}

function mapProject(p: ProjectMeta): WorkspaceProject {
  return {
    id: p.id,
    name: p.name,
    folderId: p.folder_id ?? null,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
    thumbnail: p.thumbnail,
  }
}

function requireToken() {
  if (!getToken()) throw new Error('请先登录')
}

interface WorkspaceStore extends PersistedWorkspace {
  initialized: boolean
  loading: boolean
  scopeTeamId: string | null
  lastSearchParams: WorkspaceSearchParams | null
  activeFolder: WorkspaceFolder | null
  setScope: (teamId: string | null) => Promise<void>
  init: () => Promise<void>
  reload: () => Promise<void>
  search: (params: WorkspaceSearchParams) => Promise<void>
  refreshSearch: () => Promise<void>
  createFolder: (parentId: string | null, name: string) => Promise<WorkspaceFolder>
  renameFolder: (id: string, name: string) => Promise<void>
  deleteFolder: (id: string) => Promise<void>
  createProject: (folderId: string | null, name?: string) => Promise<WorkspaceProject>
  getProject: (id: string) => WorkspaceProject | undefined
  updateProject: (id: string, patch: Partial<Pick<WorkspaceProject, 'name' | 'updatedAt' | 'thumbnail' | 'folderId'>> & { teamId?: string | null }) => Promise<void>
  moveProjectsToTeam: (ids: string[], teamId: string) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  countProjectsInFolder: (folderId: string) => number
  getFolder: (id: string) => WorkspaceFolder | undefined
}

const runWorkspaceInit = createInFlight()

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  folders: [],
  projects: [],
  initialized: false,
  loading: false,
  scopeTeamId: null,
  lastSearchParams: null,
  activeFolder: null,

  setScope: async (teamId) => {
    set({ scopeTeamId: teamId, initialized: false })
    await get().reload()
  },

  init: async () => {
    if (get().initialized) return
    return runWorkspaceInit(async () => {
      if (get().initialized) return
      set({ loading: true })
      try {
        if (!getToken()) {
          set({ folders: [], projects: [], initialized: true, loading: false })
          return
        }
        const teamId = get().scopeTeamId
        const [foldersRaw, projectsRaw] = await Promise.all([
          listFolders(teamId),
          listProjects(teamId),
        ])
        set({
          folders: foldersRaw.map((f) => ({ ...mapFolder(f), cover: pickWorkspaceCover(f.id) })),
          projects: projectsRaw.map((p) => ({
            ...mapProject(p),
            thumbnail: p.thumbnail ?? pickWorkspaceCover(p.id),
          })),
          initialized: true,
          loading: false,
        })
      } catch {
        set({ folders: [], projects: [], initialized: true, loading: false })
      }
    })
  },

  reload: async () => {
    if (!getToken()) {
      set({ folders: [], projects: [], initialized: true, loading: false })
      return
    }
    set({ loading: true })
    try {
      const teamId = get().scopeTeamId
      const [foldersRaw, projectsRaw] = await Promise.all([
        listFolders(teamId),
        listProjects(teamId),
      ])
      set({
        folders: foldersRaw.map((f) => ({ ...mapFolder(f), cover: pickWorkspaceCover(f.id) })),
        projects: projectsRaw.map((p) => ({
          ...mapProject(p),
          thumbnail: p.thumbnail ?? pickWorkspaceCover(p.id),
        })),
        initialized: true,
        loading: false,
      })
    } catch {
      set({ loading: false })
    }
  },

  search: async (params) => {
    if (!getToken()) return
    set({ loading: true, lastSearchParams: params })
    try {
      const teamId = params.teamId !== undefined ? params.teamId : get().scopeTeamId
      const result = await searchWorkspace({ ...params, teamId })
      set({
        folders: result.folders.map((f) => ({ ...mapFolder(f), cover: pickWorkspaceCover(f.id) })),
        projects: result.projects.map((p) => ({
          ...mapProject(p),
          thumbnail: p.thumbnail ?? pickWorkspaceCover(p.id),
        })),
        activeFolder: result.current_folder
          ? { ...mapFolder(result.current_folder), cover: pickWorkspaceCover(result.current_folder.id) }
          : null,
        initialized: true,
        loading: false,
      })
    } catch {
      set({ loading: false })
    }
  },

  refreshSearch: async () => {
    const params = get().lastSearchParams
    if (params) await get().search(params)
  },

  createFolder: async (parentId, name) => {
    requireToken()
    const trimmed = name.trim() || '未命名文件夹'
    const teamId = get().scopeTeamId
    const row = await apiCreateFolder(trimmed, parentId, teamId)
    const folder: WorkspaceFolder = {
      ...mapFolder(row),
      cover: pickWorkspaceCover(row.id),
    }
    if (get().lastSearchParams) {
      await get().refreshSearch()
      return get().folders.find((f) => f.id === folder.id) ?? folder
    }
    set((s) => ({ folders: [...s.folders, folder] }))
    return folder
  },

  renameFolder: async (id, name) => {
    requireToken()
    const row = await apiUpdateFolder(id, { name })
    const folder = mapFolder(row)
    if (get().lastSearchParams) {
      await get().refreshSearch()
      return
    }
    set((s) => ({
      folders: s.folders.map((f) =>
        f.id === id ? { ...f, ...folder, cover: f.cover ?? pickWorkspaceCover(f.id) } : f,
      ),
    }))
  },

  deleteFolder: async (id) => {
    requireToken()
    await apiDeleteFolder(id)
    if (get().lastSearchParams) {
      await get().refreshSearch()
      return
    }
    set((s) => {
      const folder = s.folders.find((f) => f.id === id)
      const parentId = folder?.parentId ?? null
      const folders = s.folders
        .filter((f) => f.id !== id)
        .map((f) => (f.parentId === id ? { ...f, parentId } : f))
      const projects = s.projects.map((p) =>
        p.folderId === id ? { ...p, folderId: parentId } : p,
      )
      return { folders, projects }
    })
  },

  createProject: async (folderId, name = 'Untitled') => {
    requireToken()
    const teamId = get().scopeTeamId
    const row = await apiCreateProject(name, folderId, undefined, teamId)
    const project: WorkspaceProject = {
      ...mapProject(row),
      thumbnail: pickWorkspaceCover(row.id),
    }
    if (get().lastSearchParams) {
      await get().refreshSearch()
      return get().projects.find((p) => p.id === project.id) ?? project
    }
    set((s) => ({ projects: [project, ...s.projects] }))
    return project
  },

  getProject: (id) => get().projects.find((p) => p.id === id),

  updateProject: async (id, patch) => {
    requireToken()
    const scopeTeamId = get().scopeTeamId
    const apiPatch: Parameters<typeof patchProject>[1] = {}
    if (patch.name !== undefined) apiPatch.name = patch.name
    if (patch.thumbnail !== undefined) apiPatch.thumbnail = patch.thumbnail
    if (patch.folderId !== undefined) apiPatch.folderId = patch.folderId
    if (patch.teamId !== undefined) apiPatch.teamId = patch.teamId
    const row = await patchProject(id, apiPatch)
    const updated = mapProject(row)
    const movedOutOfScope =
      patch.teamId !== undefined && (row.team_id ?? null) !== scopeTeamId
    set((s) => ({
      projects: movedOutOfScope
        ? s.projects.filter((p) => p.id !== id)
        : s.projects.map((p) => (p.id === id ? { ...p, ...updated, ...patch } : p)),
    }))
  },

  moveProjectsToTeam: async (ids, teamId) => {
    await Promise.all(ids.map((id) => get().updateProject(id, { teamId, folderId: null })))
  },

  deleteProject: async (id) => {
    requireToken()
    await deleteProjectCloud(id)
    if (get().lastSearchParams) {
      await get().refreshSearch()
      return
    }
    set((s) => {
      const projects = s.projects.filter((p) => p.id !== id)
      return { projects }
    })
  },

  countProjectsInFolder: (folderId) =>
    get().projects.filter((p) => p.folderId === folderId).length,

  getFolder: (id) => {
    const hit = get().folders.find((f) => f.id === id)
    if (hit) return hit
    const active = get().activeFolder
    if (active?.id === id) return active
    return undefined
  },
}))
