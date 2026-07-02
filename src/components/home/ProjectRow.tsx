import { memo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { MockProject } from '../../mock/data'
import { useI18n } from '../../store/langStore'
import { formatRelativeTime } from '../../utils/time'

const ProjectCard = memo(function ProjectCard({
  project,
  editedAtLabel,
}: {
  project: MockProject
  editedAtLabel: string
}) {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => navigate(`/canvas/${project.id}`)}
      className="home-project-card group text-left"
    >
      <div
        className="home-project-thumb"
        style={{ background: project.thumbnail ?? 'var(--tn-bg-hover)' }}
      >
        <div className="home-project-thumb-blur" style={{ background: project.thumbnail }} />
      </div>
      <div className="p-3">
        <h3 className="truncate text-sm font-medium text-white/90">{project.name}</h3>
        <p className="mt-1 text-xs text-white/35">
          {editedAtLabel} {formatRelativeTime(project.updatedAt)}
        </p>
        {project.tag && (
          <span className="home-project-tag mt-3 inline-flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {project.tag}
          </span>
        )}
      </div>
    </button>
  )
})

interface ProjectRowProps {
  projects: MockProject[]
}

export const ProjectRow = memo(function ProjectRow({ projects }: ProjectRowProps) {
  const navigate = useNavigate()
  const { t } = useI18n()

  return (
    <section className="mx-auto w-full max-w-[960px]">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <button
          type="button"
          onClick={() => navigate('/canvas')}
          className="home-project-card home-project-new flex flex-col items-center justify-center gap-2 py-10"
        >
          <span className="text-2xl text-white/50">+</span>
          <span className="text-sm text-white/50">{t.home.newProject}</span>
        </button>

        {projects.slice(0, 3).map((p) => (
          <ProjectCard key={p.id} project={p} editedAtLabel={t.home.editedAt} />
        ))}
      </div>

      <div className="mt-4 flex justify-end">
        <Link
          to="/home/projects"
          className="flex items-center gap-1 text-sm text-white/40 transition hover:text-white/70"
        >
          {t.home.allProjects}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </section>
  )
})
