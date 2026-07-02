/** 工作空间页：文件夹导航、搜索/筛选/排序、列表与网格视图 */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { TabBar } from '../components/ui/TabBar'
import { SearchInput } from '../components/ui/SearchInput'
import { WorkspaceFilterDropdown, type WorkspaceFilterState } from '../components/workspace/WorkspaceFilterDropdown'
import { WorkspaceListView, type WorkspaceRow } from '../components/workspace/WorkspaceListView'
import { useI18n } from '../store/langStore'
import {
  useWorkspaceStore,
  type WorkspaceFolder,
  type WorkspaceProject,
  type WorkspaceViewMode,
} from '../store/workspaceStore'
import { formatRelativeTime } from '../utils/time'

type WorkspaceTab = 'personal' | 'team'

function ProjectGridCard({
  project,
  editedAtLabel,
  onClick,
}: {
  project: WorkspaceProject
  editedAtLabel: string
  onClick: () => void
}) {
  return (
    <button type="button" onClick={onClick} className="home-project-card overflow-hidden text-left">
      <div className="aspect-video w-full" style={{ background: project.thumbnail ?? 'var(--tn-bg-hover)' }} />
      <div className="p-3">
        <h3 className="truncate text-sm font-medium text-white/90">{project.name}</h3>
        <p className="mt-1 text-xs text-white/35">
          {editedAtLabel} {formatRelativeTime(project.updatedAt)}
        </p>
      </div>
    </button>
  )
}

function FolderGridCard({
  folder,
  projectCount,
  onClick,
}: {
  folder: WorkspaceFolder
  projectCount: number
  onClick: () => void
}) {
  const { t } = useI18n()
  return (
    <button type="button" onClick={onClick} className="home-project-card overflow-hidden text-left">
      <div className="flex aspect-video w-full items-center justify-center bg-white/[0.03]">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-white/30">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      <div className="p-3">
        <h3 className="truncate text-sm font-medium text-white/90">{folder.name}</h3>
        <p className="mt-1 text-xs text-white/35">
          {projectCount} {t.workspace.projectCountUnit}
        </p>
      </div>
    </button>
  )
}

export function ProjectsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { t } = useI18n()
  const ws = t.workspace

  const init = useWorkspaceStore((s) => s.init)
  const folders = useWorkspaceStore((s) => s.folders)
  const projects = useWorkspaceStore((s) => s.projects)
  const createFolder = useWorkspaceStore((s) => s.createFolder)
  const createProject = useWorkspaceStore((s) => s.createProject)
  const countProjectsInFolder = useWorkspaceStore((s) => s.countProjectsInFolder)
  const getFolder = useWorkspaceStore((s) => s.getFolder)

  const [tab, setTab] = useState<WorkspaceTab>('personal')
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<WorkspaceViewMode>('list')
  const [filter, setFilter] = useState<WorkspaceFilterState>({
    typeFilter: 'all',
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  })

  const folderId = searchParams.get('folder') // ?folder=xxx 进入子文件夹
  const currentFolder = folderId ? getFolder(folderId) : null

  useEffect(() => { init() }, [init])

  useEffect(() => {
    if (folderId && !getFolder(folderId)) setSearchParams({})
  }, [folderId, getFolder, setSearchParams])

  const handleNewProject = () => {
    const proj = createProject(folderId)
    navigate(`/canvas/${proj.id}`, { state: { folderId, isNew: true } })
  }

  const handleNewFolder = () => {
    createFolder(folderId)
  }

  const openFolder = (id: string) => {
    setSearchParams({ folder: id })
  }

  const goRoot = () => {
    setSearchParams({})
  }

  /** 合并文件夹/项目行，应用搜索、类型筛选与排序 */
  const rows = useMemo(() => {
    const childFolders = folders.filter((f) => f.parentId === folderId)
    const childProjects = projects.filter((p) => p.folderId === folderId)
    const q = search.trim().toLowerCase()

    let folderRows: WorkspaceRow[] = childFolders.map((item) => ({
      kind: 'folder' as const,
      item,
      projectCount: countProjectsInFolder(item.id),
    }))
    let projectRows: WorkspaceRow[] = childProjects.map((item) => ({
      kind: 'project' as const,
      item,
    }))

    if (q) {
      folderRows = folderRows.filter((r) => r.item.name.toLowerCase().includes(q))
      projectRows = projectRows.filter((r) => r.item.name.toLowerCase().includes(q))
    }

    if (filter.typeFilter === 'folders') projectRows = []
    if (filter.typeFilter === 'projects') folderRows = []

    const sortKey = filter.sortBy
    const dir = filter.sortOrder === 'desc' ? -1 : 1
    const sortFn = (a: WorkspaceRow, b: WorkspaceRow) => {
      const aTime = new Date(a.item[sortKey]).getTime()
      const bTime = new Date(b.item[sortKey]).getTime()
      return (aTime - bTime) * dir
    }

    return [...folderRows.sort(sortFn), ...projectRows.sort(sortFn)]
  }, [folders, projects, folderId, search, filter, countProjectsInFolder])

  const itemCount = rows.length

  return (
    <main className="home-page flex-1 overflow-y-auto px-5 py-6 md:px-8">
      <div className="mx-auto max-w-[1200px]">
        {currentFolder ? (
          <div className="mb-4 flex items-center gap-2 text-sm">
            <button type="button" onClick={goRoot} className="ui-clickable text-white/45 hover:text-white/75">
              {ws.personal}
            </button>
            <span className="text-white/25">›</span>
            <span className="text-white/85">
              {currentFolder.name} ({itemCount})
            </span>
          </div>
        ) : (
          <div className="workspace-toolbar mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <TabBar<WorkspaceTab>
              tabs={[
                { id: 'personal', label: ws.personal },
                { id: 'team', label: ws.team },
              ]}
              active={tab}
              onChange={setTab}
            />
          </div>
        )}

        <div className="mb-6 flex flex-wrap items-center justify-end gap-2">
          <SearchInput value={search} onChange={setSearch} placeholder={ws.search} className="w-full sm:w-[200px]" />
          <WorkspaceFilterDropdown value={filter} onChange={setFilter} />
          <button
            type="button"
            className={`workspace-icon-btn ui-clickable ${viewMode === 'grid' ? 'workspace-icon-btn--active' : ''}`}
            title="Grid view"
            onClick={() => setViewMode('grid')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </button>
          <button
            type="button"
            className={`workspace-icon-btn ui-clickable ${viewMode === 'list' ? 'workspace-icon-btn--active' : ''}`}
            title="List view"
            onClick={() => setViewMode('list')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" strokeLinecap="round" />
            </svg>
          </button>
          <button type="button" className="workspace-icon-btn ui-clickable" title={ws.newFolder} onClick={handleNewFolder}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              <path d="M12 11v6M9 14h6" strokeLinecap="round" />
            </svg>
          </button>
          <button type="button" className="workspace-new-btn ui-clickable" onClick={handleNewProject}>
            + {ws.newProject}
          </button>
        </div>

        {tab === 'team' && !currentFolder ? (
          <div className="flex min-h-[240px] items-center justify-center rounded-2xl border border-dashed border-white/10 text-sm text-white/35">
            {ws.empty}
          </div>
        ) : viewMode === 'list' ? (
          rows.length === 0 ? (
            <div className="workspace-list-wrap flex min-h-[200px] items-center justify-center rounded-2xl border border-white/[0.08] text-sm text-white/35">
              {ws.empty}
            </div>
          ) : (
            <WorkspaceListView
              rows={rows}
              onOpenFolder={openFolder}
              onOpenProject={(id) => navigate(`/canvas/${id}`)}
            />
          )
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {rows.map((row) =>
              row.kind === 'folder' ? (
                <FolderGridCard
                  key={row.item.id}
                  folder={row.item}
                  projectCount={row.projectCount}
                  onClick={() => openFolder(row.item.id)}
                />
              ) : (
                <ProjectGridCard
                  key={row.item.id}
                  project={row.item}
                  editedAtLabel={t.home.editedAt}
                  onClick={() => navigate(`/canvas/${row.item.id}`)}
                />
              ),
            )}
          </div>
        )}
      </div>
    </main>
  )
}
