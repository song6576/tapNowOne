/** 新建项目卡片：与项目卡片同尺寸，预览区白底圆形 + 号 */
import { memo } from 'react'

type Props = {
  label: string
  onClick: () => void
}

export const NewProjectCard = memo(function NewProjectCard({ label, onClick }: Props) {
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
      <div className="home-project-new-footer p-3">
        <h3 className="truncate text-sm font-medium text-white/90">{label}</h3>
      </div>
    </button>
  )
})
