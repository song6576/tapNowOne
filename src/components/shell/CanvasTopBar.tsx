/** 画布顶栏：项目名、菜单、保存、新建 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MOCK_USER } from '../../mock/data'
import { useCanvasStore } from '../../store/canvasStore'
import { useI18n } from '../../store/langStore'
import { formatRelativeTime } from '../../utils/time'

interface CanvasTopBarProps {
  projectName: string
  onProjectNameChange: (name: string) => void
  projectId?: string
  updatedAt?: string
  onNewProject?: () => void
  onDelete?: () => void
}

export function CanvasTopBar({
  projectName,
  onProjectNameChange,
  updatedAt,
  onNewProject,
  onDelete,
}: CanvasTopBarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const navigate = useNavigate()
  const persist = useCanvasStore((s) => s.persist)
  const { t } = useI18n()
  const c = t.canvas
  const nav = t.nav

  const displayName = projectName || c.untitled
  const modifiedLabel = updatedAt
    ? `${c.lastModified} ${formatRelativeTime(updatedAt)}`
    : `${c.lastModified} ${c.justNow}`

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="canvas-topbar canvas-topbar--fig5 flex h-12 shrink-0 items-center justify-between px-4">
      <div className="relative min-w-0">
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="ui-clickable text-left"
        >
          <p className="truncate text-sm font-medium text-white">{displayName}</p>
          <p className="text-[11px] text-white/35">{modifiedLabel}</p>
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={closeMenu} />
            <div className="canvas-project-menu ui-glass-panel absolute left-0 top-full z-40 mt-2 min-w-[220px] py-2">
              <button
                type="button"
                className="ui-clickable w-full px-4 py-2.5 text-left text-sm text-white/85 hover:bg-white/5"
                onClick={() => { navigate('/home/projects'); closeMenu() }}
              >
                {c.backToWorkspace}
              </button>
              <div className="my-1 border-t border-white/[0.06]" />
              <p className="px-4 py-1 text-[11px] text-white/35">{c.scenes}</p>
              <button type="button" className="ui-clickable w-full px-4 py-2.5 text-left text-sm text-white/75 hover:bg-white/5" onClick={() => { navigate('/taptv'); closeMenu() }}>
                {nav.taptv}
              </button>
              <button type="button" className="ui-clickable w-full px-4 py-2.5 text-left text-sm text-white/40 hover:bg-white/5" onClick={closeMenu}>
                {nav.arena}
              </button>
              <div className="my-1 border-t border-white/[0.06]" />
              <p className="px-4 py-1 text-[11px] text-white/35">{c.projectSection}</p>
              <button
                type="button"
                className="ui-clickable w-full px-4 py-2.5 text-left text-sm text-white/75 hover:bg-white/5"
                onClick={() => { setRenaming(true); closeMenu() }}
              >
                {c.rename}
              </button>
              <button
                type="button"
                className="ui-clickable w-full px-4 py-2.5 text-left text-sm text-white/75 hover:bg-white/5"
                onClick={() => { onNewProject?.(); closeMenu() }}
              >
                {c.newProject}
              </button>
              <button
                type="button"
                className="ui-clickable w-full px-4 py-2.5 text-left text-sm text-red-400/90 hover:bg-white/5"
                onClick={() => { onDelete?.(); closeMenu() }}
              >
                {c.delete}
              </button>
            </div>
          </>
        )}

        {renaming && (
          <div className="absolute left-0 top-full z-40 mt-2">
            <input
              autoFocus
              defaultValue={displayName}
              className="canvas-rename-input"
              onBlur={(e) => {
                onProjectNameChange(e.target.value.trim() || c.untitled)
                setRenaming(false)
                persist()
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                if (e.key === 'Escape') setRenaming(false)
              }}
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="canvas-credits-pill">
          <span className="text-amber-400/90">◆</span>
          {MOCK_USER.credits.toLocaleString()}
        </div>
        <button type="button" className="canvas-community-btn ui-clickable">
          ✦ {c.community}
        </button>
        <button type="button" className="canvas-topbar-icon ui-clickable" title={c.share}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </header>
  )
}
