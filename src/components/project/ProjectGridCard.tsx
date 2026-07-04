/** 项目网格卡片：缩略图 + 信息 + 悬浮菜单 */
import { memo } from 'react'
import { ProjectCardMenu } from './ProjectCardMenu'
import type { WorkspaceProject } from '../../store/workspaceStore'
import { formatRelativeTime } from '../../utils/time'

type Props = {
  project: WorkspaceProject
  editedAtLabel: string
  onOpen: () => void
  showTag?: string
}

export const ProjectGridCard = memo(function ProjectGridCard({
  project,
  editedAtLabel,
  onOpen,
  showTag,
}: Props) {
  return (
    <div className="home-project-card group relative text-left">
      <button type="button" onClick={onOpen} className="block w-full overflow-hidden rounded-[16px] text-left">
        <div
          className="home-project-thumb overflow-hidden"
          style={{ background: project.thumbnail ?? 'var(--tn-bg-hover)' }}
        >
          <div className="home-project-thumb-blur" style={{ background: project.thumbnail }} />
        </div>
        <div className="p-3">
          <h3 className="truncate text-sm font-medium text-white/90">{project.name}</h3>
          <p className="mt-1 text-xs text-white/35">
            {editedAtLabel} {formatRelativeTime(project.updatedAt)}
          </p>
          {showTag && (
            <span className="home-project-tag mt-3 inline-flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {showTag}
            </span>
          )}
        </div>
      </button>

      <div className="project-card-menu-anchor">
        <ProjectCardMenu project={project} onOpen={onOpen} />
      </div>
    </div>
  )
})
