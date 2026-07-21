/** 网格 / 列表视图切换（同一圆角容器内） */
import type { WorkspaceViewMode } from '../../store/workspaceStore'
import { useI18n } from '../../store/langStore'

type Props = {
  value: WorkspaceViewMode
  onChange: (mode: WorkspaceViewMode) => void
}

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function ListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" strokeLinecap="round" />
    </svg>
  )
}

export function WorkspaceViewToggle({ value, onChange }: Props) {
  const { t } = useI18n()
  return (
    <div className="workspace-view-toggle" role="group" aria-label={t.workspace.viewMode}>
      <button
        type="button"
        className={`workspace-view-toggle__btn ui-clickable ${value === 'grid' ? 'workspace-view-toggle__btn--active' : ''}`}
        title={t.workspace.gridView}
        aria-label={t.workspace.gridView}
        aria-pressed={value === 'grid'}
        onClick={() => onChange('grid')}
      >
        <GridIcon />
      </button>
      <button
        type="button"
        className={`workspace-view-toggle__btn ui-clickable ${value === 'list' ? 'workspace-view-toggle__btn--active' : ''}`}
        title={t.workspace.listView}
        aria-label={t.workspace.listView}
        aria-pressed={value === 'list'}
        onClick={() => onChange('list')}
      >
        <ListIcon />
      </button>
    </div>
  )
}
