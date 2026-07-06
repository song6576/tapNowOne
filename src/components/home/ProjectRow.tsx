/** 首页最近项目：新建 + 最多 3 个项目卡片，链接到工作空间 */
import { memo, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ProjectGridCard } from '../project/ProjectGridCard'
import { NewProjectCard } from '../project/NewProjectCard'
import { useI18n } from '../../store/langStore'
import { useWorkspaceStore } from '../../store/workspaceStore'

export const ProjectRow = memo(function ProjectRow() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const projects = useWorkspaceStore((s) => s.projects)
  const createProject = useWorkspaceStore((s) => s.createProject)

  const recentProjects = useMemo(
    () => [...projects].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 3),
    [projects],
  )

  const handleNewProject = async () => {
    const proj = await createProject(null)
    navigate(`/canvas/${proj.id}`)
  }

  return (
    <section className="w-full">
      <div className="home-project-grid">
        <NewProjectCard variant="home" label={t.home.newProject} onClick={handleNewProject} />

        {recentProjects.map((p) => (
          <ProjectGridCard
            key={p.id}
            variant="home"
            project={p}
            editedAtLabel={t.home.editedAt}
            onOpen={() => navigate(`/canvas/${p.id}`)}
          />
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
