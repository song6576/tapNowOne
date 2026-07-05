/** 工作空间：文件夹/项目 CRUD，已登录时走云端 API，未登录降级 localStorage */
import { create } from 'zustand'
import {
  createFolder as apiCreateFolder,
  createProject as apiCreateProject,
  deleteProjectCloud,
  listFolders,
  listProjects,
  patchProject,
  updateFolder as apiUpdateFolder,
  type FolderMeta,
  type ProjectMeta,
} from '../api/client'
import { MOCK_PROJECTS } from '../mock/data'
import { getToken } from '../utils/auth'
import { generateUUID } from '../utils/uuid'

export type WorkspaceFolder = {
  id: string
  name: string
  parentId: string | null
  createdAt: string
  updatedAt: string
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
  }
  const emptyFolder: WorkspaceFolder = {
    id: 'f-empty',
    name: '未命名文件夹',
    parentId: null,
    createdAt: '2026-07-02T12:00:00Z',
    updatedAt: '2026-07-02T12:00:00Z',
  }
  const projects: WorkspaceProject[] = MOCK_PROJECTS.map((p, i) => ({
    id: p.id,
    name: p.name,
    folderId: i < 2 ? folderId : null,
    createdAt: p.updatedAt,
    updatedAt: p.updatedAt,
    thumbnail: p.thumbnail,
  }))
  projects.unshift({
    id: 'p-new',
    name: 'Untitled',
    folderId: null,
    createdAt: '2026-07-02T18:02:00Z',
    updatedAt: '2026-07-02T18:02:00Z',
    thumbnail: 'linear-gradient(135deg,#27272a 0%,#52525b 100%)',
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
  init: () => Promise<void>
  reload: () => Promise<void>
  createFolder: (parentId: string | null) => Promise<WorkspaceFolder>
  renameFolder: (id: string, name: string) => Promise<void>
  createProject: (folderId: string | null, name?: string) => Promise<WorkspaceProject>
  getProject: (id: string) => WorkspaceProject | undefined
  updateProject: (id: string, patch: Partial<Pick<WorkspaceProject, 'name' | 'updatedAt' | 'thumbnail' | 'folderId'>>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  countProjectsInFolder: (folderId: string) => number
  getFolder: (id: string) => WorkspaceFolder | undefined
}

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  folders: [],
  projects: [],
  initialized: false,
  loading: false,

  init: async () => {
    if (get().initialized || get().loading) return
    set({ loading: true })
    try {
      if (getToken()) {
        const [foldersRaw, projectsRaw] = await Promise.all([
          listFolders(),
          listProjects(),
        ])
        set({
          folders: foldersRaw.map(mapFolder),
          projects: projectsRaw.map(mapProject),
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
    if (!getToken() || get().loading) return
    set({ loading: true })
    try {
      const [foldersRaw, projectsRaw] = await Promise.all([
        listFolders(),
        listProjects(),
      ])
      set({
        folders: foldersRaw.map(mapFolder),
        projects: projectsRaw.map(mapProject),
        initialized: true,
        loading: false,
      })
    } catch {
      set({ loading: false })
    }
  },

  createFolder: async (parentId) => {
    if (getToken()) {
      const row = await apiCreateFolder(undefined, parentId)
      const folder = mapFolder(row)
      set((s) => ({ folders: [...s.folders, folder] }))
      return folder
    }
    const folder: WorkspaceFolder = {
      id: `f-${generateUUID().slice(0, 8)}`,
      name: '未命名文件夹',
      parentId,
      createdAt: nowIso(),
      updatedAt: nowIso(),
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
      set((s) => ({
        folders: s.folders.map((f) => (f.id === id ? folder : f)),
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

  createProject: async (folderId, name = 'Untitled') => {
    if (getToken()) {
      const row = await apiCreateProject(name, folderId)
      const project = mapProject(row)
      set((s) => ({ projects: [project, ...s.projects] }))
      return project
    }
    const project: WorkspaceProject = {
      id: `p-${generateUUID().slice(0, 8)}`,
      name,
      folderId,
      createdAt: nowIso(),
      updatedAt: nowIso(),
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
    if (getToken()) {
      const apiPatch: Parameters<typeof patchProject>[1] = {}
      if (patch.name !== undefined) apiPatch.name = patch.name
      if (patch.thumbnail !== undefined) apiPatch.thumbnail = patch.thumbnail
      if (patch.folderId !== undefined) apiPatch.folderId = patch.folderId
      const row = await patchProject(id, apiPatch)
      const updated = mapProject(row)
      set((s) => ({
        projects: s.projects.map((p) => (p.id === id ? { ...p, ...updated, ...patch } : p)),
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

  deleteProject: async (id) => {
    if (getToken()) {
      await deleteProjectCloud(id)
    }
    set((s) => {
      const projects = s.projects.filter((p) => p.id !== id)
      if (!getToken()) writeStorage({ folders: s.folders, projects })
      return { projects }
    })
  },

  countProjectsInFolder: (folderId) =>
    get().projects.filter((p) => p.folderId === folderId).length,

  getFolder: (id) => get().folders.find((f) => f.id === id),
}))
