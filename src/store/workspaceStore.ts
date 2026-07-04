/** 工作空间：文件夹/项目 CRUD，localStorage 持久化（tapflow_workspace） */
import { create } from 'zustand'
import { MOCK_PROJECTS } from '../mock/data'
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

function seedWorkspace(): PersistedWorkspace {
  // 首次无 localStorage 数据时，用 mock 项目种子填充演示数据
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
  init: () => void
  createFolder: (parentId: string | null) => WorkspaceFolder
  renameFolder: (id: string, name: string) => void
  createProject: (folderId: string | null) => WorkspaceProject
  getProject: (id: string) => WorkspaceProject | undefined
  updateProject: (id: string, patch: Partial<Pick<WorkspaceProject, 'name' | 'updatedAt' | 'thumbnail' | 'folderId'>>) => void
  deleteProject: (id: string) => void
  countProjectsInFolder: (folderId: string) => number
  getFolder: (id: string) => WorkspaceFolder | undefined
}

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  folders: [],
  projects: [],
  initialized: false,

  init: () => {
    if (get().initialized) return
    const data = readStorage()
    set({ ...data, initialized: true })
  },

  /** 在当前 parentId 下新建文件夹，名称默认「未命名文件夹」 */
  createFolder: (parentId) => {
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

  renameFolder: (id, name) => {
    set((s) => {
      const folders = s.folders.map((f) =>
        f.id === id ? { ...f, name, updatedAt: nowIso() } : f,
      )
      writeStorage({ folders, projects: s.projects })
      return { folders }
    })
  },

  createProject: (folderId) => {
    const project: WorkspaceProject = {
      id: `p-${generateUUID().slice(0, 8)}`,
      name: 'Untitled',
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

  updateProject: (id, patch) => {
    set((s) => {
      const projects = s.projects.map((p) =>
        p.id === id ? { ...p, ...patch, updatedAt: patch.updatedAt ?? nowIso() } : p,
      )
      writeStorage({ folders: s.folders, projects })
      return { projects }
    })
  },

  deleteProject: (id) => {
    set((s) => {
      const projects = s.projects.filter((p) => p.id !== id)
      writeStorage({ folders: s.folders, projects })
      return { projects }
    })
  },

  countProjectsInFolder: (folderId) =>
    get().projects.filter((p) => p.folderId === folderId).length,

  getFolder: (id) => get().folders.find((f) => f.id === id),
}))
