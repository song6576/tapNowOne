/** 工作空间页：文件夹导航、搜索/筛选/排序、列表与网格视图 */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { TabBar } from '../components/ui/TabBar'
import { SearchInput } from '../components/ui/SearchInput'
import { InputDialog } from '../components/ui/InputDialog'
import { WorkspaceFilterDropdown, type WorkspaceFilterState } from '../components/workspace/WorkspaceFilterDropdown'
import { WorkspaceListView, type WorkspaceRow } from '../components/workspace/WorkspaceListView'
import { WorkspaceSelectionBar } from '../components/workspace/WorkspaceSelectionBar'
import { WorkspaceViewToggle } from '../components/workspace/WorkspaceViewToggle'
import { ProjectGridCard } from '../components/project/ProjectGridCard'
import { FolderGridCard } from '../components/project/FolderGridCard'
import { NewProjectCard } from '../components/project/NewProjectCard'
import { useI18n } from '../store/langStore'
import {
  useWorkspaceStore,
  type WorkspaceViewMode,
} from '../store/workspaceStore'
import { PERSONAL_TEAM_ID, useTeamStore } from '../store/teamStore'
import { useAuthStore } from '../store/authStore'

type WorkspaceTab = 'personal' | 'team'

export function ProjectsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { t } = useI18n()
  const ws = t.workspace

  const init = useWorkspaceStore((s) => s.init)
  const searchWorkspaceItems = useWorkspaceStore((s) => s.search)
  const setScope = useWorkspaceStore((s) => s.setScope)
  const folders = useWorkspaceStore((s) => s.folders)
  const projects = useWorkspaceStore((s) => s.projects)
  const createFolder = useWorkspaceStore((s) => s.createFolder)
  const createProject = useWorkspaceStore((s) => s.createProject)
  const countProjectsInFolder = useWorkspaceStore((s) => s.countProjectsInFolder)
  const getFolder = useWorkspaceStore((s) => s.getFolder)
  const loading = useWorkspaceStore((s) => s.loading)

  const [tab, setTab] = useState<WorkspaceTab>('personal')
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<WorkspaceViewMode>('grid')
  const [filter, setFilter] = useState<WorkspaceFilterState>({
    typeFilter: 'all',
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  })
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const [folderDialogOpen, setFolderDialogOpen] = useState(false)

  const activeTeamId = useTeamStore((s) => s.activeTeamId)
  const isLoggedIn = Boolean(useAuthStore((s) => s.user))

  const folderId = searchParams.get('folder')
  const currentFolder = folderId ? getFolder(folderId) : null

  useEffect(() => {
    if (!isLoggedIn) void init()
  }, [init, isLoggedIn])

  useEffect(() => {
    if (!isLoggedIn) return
    if (tab === 'team' && activeTeamId === PERSONAL_TEAM_ID && !folderId) return

    const timer = window.setTimeout(() => {
      void searchWorkspaceItems({
        teamId: tab === 'team' ? activeTeamId : null,
        parentId: folderId,
        q: search,
        type: filter.typeFilter,
        sortBy: filter.sortBy,
        sortOrder: filter.sortOrder,
      })
    }, search.trim() ? 300 : 0)

    return () => window.clearTimeout(timer)
  }, [
    isLoggedIn,
    tab,
    activeTeamId,
    folderId,
    search,
    filter,
    searchWorkspaceItems,
  ])

  useEffect(() => {
    if (tab === 'personal') {
      void setScope(null)
      return
    }
    if (activeTeamId === PERSONAL_TEAM_ID) {
      useWorkspaceStore.setState({ folders: [], projects: [], initialized: true, scopeTeamId: null })
      return
    }
    void setScope(activeTeamId)
  }, [tab, activeTeamId, setScope])

  useEffect(() => {
    if (folderId && !getFolder(folderId)) setSearchParams({})
  }, [folderId, getFolder, setSearchParams])

  useEffect(() => {
    setSelectMode(false)
    setSelectedIds(new Set())
  }, [folderId])

  const handleNewProject = async () => {
    const proj = await createProject(folderId)
    navigate(`/canvas/${proj.id}`, { state: { folderId, isNew: true, openAgentPanel: true } })
  }

  const handleCreateFolder = async (name: string) => {
    await createFolder(folderId, name)
    setFolderDialogOpen(false)
  }

  const openFolder = (id: string) => {
    setSearchParams({ folder: id })
  }

  const goRoot = () => {
    setSearchParams({})
  }

  const exitSelectMode = () => {
    setSelectMode(false)
    setSelectedIds(new Set())
  }

  const enterSelectMode = (projectId: string) => {
    setSelectMode(true)
    setSelectedIds(new Set([projectId]))
  }

  const toggleSelect = (projectId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(projectId)) next.delete(projectId)
      else next.add(projectId)
      if (next.size === 0) setSelectMode(false)
      return next
    })
  }

  const rows = useMemo(() => {
    if (isLoggedIn) {
      const folderRows: WorkspaceRow[] = folders.map((item) => ({
        kind: 'folder' as const,
        item,
        projectCount: item.projectCount ?? countProjectsInFolder(item.id),
      }))
      const projectRows: WorkspaceRow[] = projects.map((item) => ({
        kind: 'project' as const,
        item,
      }))
      return [...folderRows, ...projectRows]
    }

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
  }, [isLoggedIn, folders, projects, folderId, search, filter, countProjectsInFolder])

  const itemCount = rows.length

  return (
    <main className={`home-page workspace-page flex-1 overflow-y-auto px-5 py-5 md:px-8 md:py-6 ${selectMode ? 'home-page--select-mode' : ''}`}>
      <div className="workspace-content">
        <div className="workspace-page-toolbar mb-6">
          <div className="workspace-page-toolbar__row">
            <div className="workspace-page-toolbar__start">
              {currentFolder ? (
                <div className="flex items-center gap-2 text-sm">
                  <button type="button" onClick={goRoot} className="ui-clickable text-white/45 hover:text-white/75">
                    {ws.personal}
                  </button>
                  <span className="text-white/25">›</span>
                  <span className="text-white/85">
                    {currentFolder.name} ({itemCount})
                  </span>
                </div>
              ) : (
                <TabBar<WorkspaceTab>
                  tabs={[
                    { id: 'personal', label: ws.personal },
                    { id: 'team', label: ws.team },
                  ]}
                  active={tab}
                  onChange={setTab}
                  className="workspace-page-tab-bar"
                />
              )}
            </div>

            <div className="workspace-page-toolbar__actions">
              <SearchInput value={search} onChange={setSearch} placeholder={ws.search} className="w-full sm:w-50" />
              <WorkspaceFilterDropdown value={filter} onChange={setFilter} />
              <WorkspaceViewToggle value={viewMode} onChange={setViewMode} />
              {!selectMode && (
                <>
                  <button type="button" className="workspace-icon-btn ui-clickable" title={ws.newFolder} aria-label={ws.newFolder} onClick={() => setFolderDialogOpen(true)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                      <path d="M12 11v6M9 14h6" strokeLinecap="round" />
                    </svg>
                  </button>
                  <button type="button" className="workspace-new-btn ui-clickable" onClick={handleNewProject}>
                    + {ws.newProject}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="workspace-grid-skeleton" role="status" aria-label={t.routeState.loading}>
            {Array.from({ length: 8 }, (_, index) => <span key={index} />)}
          </div>
        ) : tab === 'team' && activeTeamId === PERSONAL_TEAM_ID && !currentFolder ? (
          <div className="flex min-h-60 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/10 text-sm text-white/35">
            <span>{ws.empty}</span>
          </div>
        ) : viewMode === 'list' ? (
          rows.length === 0 ? (
            <div className="workspace-list-wrap workspace-empty-state">
              <span>{ws.empty}</span>
              <button type="button" className="workspace-new-btn ui-clickable" onClick={() => void handleNewProject()}>
                + {ws.newProject}
              </button>
            </div>
          ) : (
            <WorkspaceListView
              rows={rows}
              onOpenFolder={openFolder}
              onOpenProject={(id) => navigate(`/canvas/${id}`)}
              selectMode={selectMode}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              onEnterSelectMode={enterSelectMode}
            />
          )
        ) : (
          <div className="workspace-project-grid">
            {!selectMode && <NewProjectCard variant="workspace" label={ws.newProject} onClick={handleNewProject} />}
            {rows.map((row) =>
              row.kind === 'folder' ? (
                <FolderGridCard
                  key={row.item.id}
                  folder={row.item}
                  projectCount={row.projectCount}
                  onOpen={() => openFolder(row.item.id)}
                />
              ) : (
                <ProjectGridCard
                  key={row.item.id}
                  project={row.item}
                  editedAtLabel={t.home.editedAt}
                  onOpen={() => navigate(`/canvas/${row.item.id}`)}
                  selectMode={selectMode}
                  selected={selectedIds.has(row.item.id)}
                  onToggleSelect={() => toggleSelect(row.item.id)}
                  onEnterSelectMode={enterSelectMode}
                />
              ),
            )}
          </div>
        )}
      </div>

      {selectMode && selectedIds.size > 0 && (
        <WorkspaceSelectionBar
          selectedIds={[...selectedIds]}
          onClear={exitSelectMode}
          onDone={exitSelectMode}
        />
      )}

      <InputDialog
        open={folderDialogOpen}
        title={ws.newFolder}
        value=""
        placeholder={ws.folderNamePlaceholder}
        confirmLabel={ws.folderMenu.confirm}
        cancelLabel={ws.folderMenu.cancel}
        onCancel={() => setFolderDialogOpen(false)}
        onConfirm={handleCreateFolder}
      />
    </main>
  )
}
