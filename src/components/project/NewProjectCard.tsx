/** 新建项目卡片：居中 + 与文案，与工作空间项目卡同尺寸 */
import { memo } from 'react'

type Props = {
  label: string
  onClick: () => void
  /** home 仅首页/个人页；workspace 仅工作空间页 */
  variant?: 'home' | 'workspace'
}

function PlusIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  )
}

export const NewProjectCard = memo(function NewProjectCard({
  label,
  onClick,
  variant = 'workspace',
}: Props) {
  const isHome = variant === 'home'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`home-project-card home-project-card--new ui-clickable ${isHome ? 'home-project-card--new-home' : ''}`}
    >
      <span className="home-project-new-body">
        <span className="home-project-new-plus" aria-hidden>
          <PlusIcon size={isHome ? 24 : 22} />
        </span>
        <span className="home-project-new-label">{label}</span>
      </span>
    </button>
  )
})
