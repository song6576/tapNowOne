import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TopBar } from '../components/shell/TopBar'
import { SettingsDrawer } from '../components/shell/SettingsDrawer'
import { mockListProjects } from '../mock/api'
import type { MockProject } from '../mock/data'

export function ProjectsPage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<MockProject[]>([])
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => { mockListProjects().then(setProjects) }, [])

  return (
    <div className="flex h-full flex-col">
      <TopBar title="Projects" onSettingsClick={() => setSettingsOpen(true)}>
        <button type="button" className="tn-btn tn-btn-primary ml-4 text-xs" onClick={() => navigate('/canvas')}>
          + New
        </button>
      </TopBar>
      <main className="flex-1 overflow-y-auto p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {projects.map((p) => (
            <Link key={p.id} to={`/canvas/${p.id}`} className="tn-card overflow-hidden">
              <div className="aspect-video w-full" style={{ background: p.thumbnail ?? 'var(--tn-bg-hover)' }} />
              <div className="p-3">
                <h3 className="text-sm font-medium">{p.name}</h3>
                <p className="mt-1 text-[10px] text-[var(--tn-text-muted)]">
                  {new Date(p.updatedAt).toLocaleDateString('zh-CN')}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
