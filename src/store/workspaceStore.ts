/** 工作空间：文件夹/项目 CRUD，已登录时走云端 API，未登录降级 localStorage */
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
import { MOCK_PROJECTS } from '../mock/data'
import { getToken } from '../utils/auth'
import { pickWorkspaceCover } from '../utils/workspaceCover'
import { generateUUID } from '../utils/uuid'

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

const STORAGE_KEY = 'tapflow_workspace'

interface PersistedWorkspace {
  folders: WorkspaceFolder[]
  projects: WorkspaceProject[]
}

function nowIso() {
  return new Date().toISOString()
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

function seedWorkspace(): PersistedWorkspace {
  const folderId = 'f-default'
  const folder: WorkspaceFolder = {
    id: folderId,
    name: '未命名文件夹',
    parentId: null,
    createdAt: '2026-07-02T10:00:00Z',
    updatedAt: '2026-07-02T10:00:00Z',
    cover: pickWorkspaceCover(folderId),
  }
  const emptyFolder: WorkspaceFolder = {
    id: 'f-empty',
    name: '灵感素材',
    parentId: null,
    createdAt: '2026-07-02T12:00:00Z',
    updatedAt: '2026-07-02T12:00:00Z',
    cover: pickWorkspaceCover('f-empty'),
  }
  const projects: WorkspaceProject[] = MOCK_PROJECTS.map((p, i) => ({
    id: p.id,
    name: p.name,
    folderId: i < 2 ? folderId : null,
    createdAt: p.updatedAt,
    updatedAt: p.updatedAt,
    thumbnail: pickWorkspaceCover(p.id),
  }))
  projects.unshift({
    id: 'p-new',
    name: 'Untitled',
    folderId: null,
    createdAt: '2026-07-02T18:02:00Z',
    updatedAt: '2026-07-02T18:02:00Z',
    thumbnail: pickWorkspaceCover('p-new'),
  })
  return { folders: [folder, emptyFolder], projects }
}

function readStorage(): PersistedWorkspace {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as PersistedWorkspace
  } catch { /* ignore */ }
  return seedWorkspace()
}

function writeStorage(data: PersistedWorkspace) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
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
    if (get().initialized || get().loading) return
    set({ loading: true })
    try {
      if (getToken()) {
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
        return
      }
      const data = readStorage()
      set({ ...data, initialized: true, loading: false })
    } catch {
      const data = readStorage()
      set({ ...data, initialized: true, loading: false })
    }
  },

  reload: async () => {
    if (!getToken()) return
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
    const trimmed = name.trim() || '未命名文件夹'
    const teamId = get().scopeTeamId
    if (getToken()) {
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
    }
    const id = `f-${generateUUID().slice(0, 8)}`
    const folder: WorkspaceFolder = {
      id,
      name: trimmed,
      parentId,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      cover: pickWorkspaceCover(id),
    }
    set((s) => {
      const folders = [...s.folders, folder]
      writeStorage({ folders, projects: s.projects })
      return { folders }
    })
    return folder
  },

  renameFolder: async (id, name) => {
    if (getToken()) {
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
      return
    }
    set((s) => {
      const folders = s.folders.map((f) =>
        f.id === id ? { ...f, name, updatedAt: nowIso() } : f,
      )
      writeStorage({ folders, projects: s.projects })
      return { folders }
    })
  },

  deleteFolder: async (id) => {
    if (getToken()) {
      await apiDeleteFolder(id)
      if (get().lastSearchParams) {
        await get().refreshSearch()
        return
      }
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
      if (!getToken()) writeStorage({ folders, projects })
      return { folders, projects }
    })
  },

  createProject: async (folderId, name = 'Untitled') => {
    const teamId = get().scopeTeamId
    if (getToken()) {
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
    }
    const id = `p-${generateUUID().slice(0, 8)}`
    const project: WorkspaceProject = {
      id,
      name,
      folderId,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      thumbnail: pickWorkspaceCover(id),
    }
    set((s) => {
      const projects = [...s.projects, project]
      writeStorage({ folders: s.folders, projects })
      return { projects }
    })
    return project
  },

  getProject: (id) => get().projects.find((p) => p.id === id),

  updateProject: async (id, patch) => {
    const scopeTeamId = get().scopeTeamId
    if (getToken()) {
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
      return
    }
    set((s) => {
      const projects = s.projects.map((p) =>
        p.id === id ? { ...p, ...patch, updatedAt: patch.updatedAt ?? nowIso() } : p,
      )
      writeStorage({ folders: s.folders, projects })
      return { projects }
    })
  },

  moveProjectsToTeam: async (ids, teamId) => {
    await Promise.all(ids.map((id) => get().updateProject(id, { teamId, folderId: null })))
  },

  deleteProject: async (id) => {
    if (getToken()) {
      await deleteProjectCloud(id)
      if (get().lastSearchParams) {
        await get().refreshSearch()
        return
      }
    }
    set((s) => {
      const projects = s.projects.filter((p) => p.id !== id)
      if (!getToken()) writeStorage({ folders: s.folders, projects })
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
