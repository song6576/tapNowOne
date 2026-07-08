/** 项目网格卡片：home=首页原样式，workspace=工作空间 TapNow 样式 */
import { memo } from 'react'
import { ProjectCardMenu } from './ProjectCardMenu'
import { WorkspaceCoverThumb } from './WorkspaceCoverThumb'
import { WorkspaceSelectCheckbox } from '../workspace/WorkspaceSelectCheckbox'
import type { WorkspaceProject } from '../../store/workspaceStore'
import { formatRelativeTime } from '../../utils/time'

type Props = {
  project: WorkspaceProject
  editedAtLabel: string
  onOpen: () => void
  showTag?: string
  selectMode?: boolean
  selected?: boolean
  onToggleSelect?: () => void
  onEnterSelectMode?: (projectId: string) => void
  variant?: 'home' | 'workspace'
}

export const ProjectGridCard = memo(function ProjectGridCard({
  project,
  editedAtLabel,
  onOpen,
  showTag,
  selectMode = false,
  selected = false,
  onToggleSelect,
  onEnterSelectMode,
  variant = 'workspace',
}: Props) {
  const handleClick = () => {
    if (selectMode) {
      onToggleSelect?.()
      return
    }
    onOpen()
  }

  const isHome = variant === 'home'

  return (
    <div
      className={`home-project-card group relative text-left ${!isHome ? 'home-project-card--project' : ''} ${selectMode ? 'home-project-card--select-mode' : ''} ${selected ? 'home-project-card--selected' : ''}`}
    >
      <button
        type="button"
        onClick={handleClick}
        className={isHome ? 'block w-full overflow-hidden text-left' : 'flex w-full flex-col text-left'}
      >
        <WorkspaceCoverThumb id={project.id} cover={project.thumbnail} density={isHome ? 'home' : 'card'}>
          {selectMode && (
            <div className="workspace-select-checkbox-anchor">
              <WorkspaceSelectCheckbox checked={selected} />
            </div>
          )}
        </WorkspaceCoverThumb>

        {isHome ? (
          <div className="home-project-card-footer">
            <h3 className="home-project-card-title">{project.name}</h3>
            <p className="home-project-card-meta">
              {editedAtLabel} {formatRelativeTime(project.updatedAt)}
            </p>
            {showTag && (
              <span className="home-project-tag mt-2.5 inline-flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {showTag}
              </span>
            )}
          </div>
        ) : (
          <div className="home-project-card-footer">
            <h3 className="home-project-card-title">{project.name}</h3>
            <p className="home-project-card-meta">
              {editedAtLabel} {formatRelativeTime(project.updatedAt)}
            </p>
            {showTag && (
              <span className="home-project-tag mt-2.5 inline-flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {showTag}
              </span>
            )}
          </div>
        )}
      </button>

      {!selectMode && (
        <div className="project-card-menu-anchor">
          <ProjectCardMenu
            project={project}
            onOpen={onOpen}
            onEnterSelectMode={onEnterSelectMode}
          />
        </div>
      )}
    </div>
  )
})
