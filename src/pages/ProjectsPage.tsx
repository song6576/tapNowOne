import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { mockListProjects } from '../mock/api'
import type { MockProject } from '../mock/data'
import { formatRelativeTime } from '../utils/time'

export function ProjectsPage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<MockProject[]>([])

  useEffect(() => { mockListProjects().then(setProjects) }, [])

  return (
    <main className="home-page flex-1 overflow-y-auto px-5 py-8 md:px-8">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">工作空间</h1>
            <p className="mt-1 text-sm text-white/40">管理你的所有创作项目</p>
          </div>
          <button
            type="button"
            className="home-primary-pill"
            onClick={() => navigate('/canvas')}
          >
            + 新建项目
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {projects.map((p) => (
            <Link key={p.id} to={`/canvas/${p.id}`} className="home-project-card overflow-hidden">
              <div className="aspect-video w-full" style={{ background: p.thumbnail ?? 'var(--tn-bg-hover)' }} />
              <div className="p-3">
                <h3 className="text-sm font-medium text-white/90">{p.name}</h3>
                <p className="mt-1 text-xs text-white/35">
                  编辑于 {formatRelativeTime(p.updatedAt)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
