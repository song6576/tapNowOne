/** 新建项目卡片：home=首页原样式，workspace=工作空间 TapNow 样式 */
import { memo } from 'react'

type Props = {
  label: string
  onClick: () => void
  /** home 仅首页/个人页；workspace 仅工作空间页 */
  variant?: 'home' | 'workspace'
}

export const NewProjectCard = memo(function NewProjectCard({
  label,
  onClick,
  variant = 'workspace',
}: Props) {
  if (variant === 'home') {
    return (
      <button
        type="button"
        onClick={onClick}
        className="home-project-card home-project-new ui-clickable overflow-hidden text-left"
      >
        <div className="home-project-thumb home-project-new-thumb">
          <span className="home-project-new-icon" aria-hidden>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
          </span>
        </div>
        <div className="home-project-new-footer">
          <h3 className="home-project-card-title">{label}</h3>
        </div>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="home-project-card home-project-card--new ui-clickable overflow-hidden text-left"
    >
      <div className="home-project-new-preview">
        <span className="home-project-new-icon home-project-new-icon--workspace" aria-hidden>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
        </span>
      </div>
      <div className="home-project-card-footer">
        <h3 className="home-project-card-title">{label}</h3>
      </div>
    </button>
  )
})
