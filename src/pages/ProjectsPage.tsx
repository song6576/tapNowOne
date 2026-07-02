import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TabBar } from '../components/ui/TabBar'
import { SearchInput } from '../components/ui/SearchInput'
import { mockListProjects } from '../mock/api'
import type { MockProject } from '../mock/data'
import { useI18n } from '../store/langStore'
import { formatRelativeTime } from '../utils/time'

type WorkspaceTab = 'personal' | 'team'

function ProjectGridCard({ project, editedAtLabel, onClick }: { project: MockProject; editedAtLabel: string; onClick: () => void }) {
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

export function ProjectsPage() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const ws = t.workspace
  const [projects, setProjects] = useState<MockProject[]>([])
  const [tab, setTab] = useState<WorkspaceTab>('personal')
  const [search, setSearch] = useState('')

  useEffect(() => { mockListProjects().then(setProjects) }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return projects
    return projects.filter((p) => p.name.toLowerCase().includes(q))
  }, [projects, search])

  return (
    <main className="home-page flex-1 overflow-y-auto px-5 py-6 md:px-8">
      <div className="mx-auto max-w-[1200px]">
        <div className="workspace-toolbar mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <TabBar<WorkspaceTab>
            tabs={[
              { id: 'personal', label: ws.personal },
              { id: 'team', label: ws.team },
            ]}
            active={tab}
            onChange={setTab}
          />
          <div className="flex flex-wrap items-center gap-2">
            <SearchInput value={search} onChange={setSearch} placeholder={ws.search} className="w-full sm:w-[200px]" />
            <button type="button" className="workspace-filter-btn ui-clickable">
              {ws.showAll}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6" strokeLinecap="round" />
              </svg>
            </button>
            <button type="button" className="workspace-icon-btn ui-clickable" title="Grid view">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </button>
            <button type="button" className="workspace-icon-btn ui-clickable" title="Folders">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            </button>
            <button type="button" className="workspace-new-btn ui-clickable" onClick={() => navigate('/canvas')}>
              + {ws.newProject}
            </button>
          </div>
        </div>

        {tab === 'team' ? (
          <div className="flex min-h-[240px] items-center justify-center rounded-2xl border border-dashed border-white/10 text-sm text-white/35">
            {ws.empty}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <button
              type="button"
              onClick={() => navigate('/canvas')}
              className="home-project-card home-project-new flex flex-col items-center justify-center gap-2 py-16"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-xl text-white/50">+</span>
              <span className="text-sm text-white/50">{ws.newProject}</span>
            </button>
            {filtered.map((p) => (
              <ProjectGridCard
                key={p.id}
                project={p}
                editedAtLabel={t.home.editedAt}
                onClick={() => navigate(`/canvas/${p.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
