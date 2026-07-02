import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MOCK_PROJECTS, MOCK_USER } from '../../mock/data'
import { useCanvasStore } from '../../store/canvasStore'
import { useI18n } from '../../store/langStore'
import { SettingsDrawer } from './SettingsDrawer'
import { formatRelativeTime } from '../../utils/time'

interface CanvasTopBarProps {
  projectName: string
  onProjectNameChange: (name: string) => void
  projectId?: string
  updatedAt?: string
}

export function CanvasTopBar({ projectName, onProjectNameChange, projectId, updatedAt }: CanvasTopBarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const navigate = useNavigate()
  const persist = useCanvasStore((s) => s.persist)
  const exportVideo = useCanvasStore((s) => s.exportVideo)
  const exporting = useCanvasStore((s) => s.exporting)
  const { t } = useI18n()
  const c = t.canvas

  const modifiedLabel = updatedAt
    ? `${c.lastModified} ${formatRelativeTime(updatedAt)}`
    : `${c.lastModified} ${c.justNow}`

  const handleExport = async () => {
    try {
      const url = await exportVideo()
      alert(`Export ready (mock): ${url}`)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Export failed')
    }
  }

  return (
    <>
      <header className="canvas-topbar flex h-[var(--tn-topbar-h)] shrink-0 items-center gap-3 border-b border-[var(--tn-border-subtle)] bg-[var(--tn-bg-elevated)] px-4">
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="ui-clickable flex items-center gap-2 rounded-lg px-1 py-1"
          >
            <Link to="/home" onClick={(e) => e.stopPropagation()}>
              <img
                src="https://fe-assets.tapnow.top/ad9f65d36e96daf0fcd1ba59146601de8a241292/tap_logo.webp"
                alt="TapNow"
                className="h-5 w-5"
                onError={(e) => { (e.target as HTMLImageElement).alt = 'TN' }}
              />
            </Link>
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
              <div className="absolute left-0 top-full z-40 mt-1 w-56 rounded-lg border border-[var(--tn-border)] bg-[var(--tn-bg-panel)] py-1 shadow-xl">
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--tn-bg-hover)]"
                  onClick={() => { navigate('/canvas'); setMenuOpen(false) }}
                >
                  + New Project
                </button>
                <div className="my-1 border-t border-[var(--tn-border-subtle)]" />
                <p className="px-3 py-1 text-[10px] uppercase tracking-wider text-[var(--tn-text-muted)]">Recent</p>
                {MOCK_PROJECTS.slice(0, 4).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-[var(--tn-bg-hover)] ${p.id === projectId ? 'text-white' : 'text-[var(--tn-text-secondary)]'}`}
                    onClick={() => { navigate(`/canvas/${p.id}`); setMenuOpen(false) }}
                  >
                    {p.name}
                  </button>
                ))}
                <div className="my-1 border-t border-[var(--tn-border-subtle)]" />
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm text-[var(--tn-text-secondary)] hover:bg-[var(--tn-bg-hover)]"
                  onClick={() => { navigate('/home'); setMenuOpen(false) }}
                >
                  ← Back to Home
                </button>
              </div>
            </>
          )}
        </div>

        <div className="min-w-0">
          <input
            type="text"
            value={projectName}
            onChange={(e) => onProjectNameChange(e.target.value)}
            placeholder={c.untitled}
            className="block max-w-[220px] truncate bg-transparent text-sm font-medium text-white outline-none"
          />
          <p className="text-[11px] text-white/35">{modifiedLabel}</p>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button type="button" disabled={exporting} onClick={handleExport} className="canvas-topbar-btn hidden sm:inline-flex">
            {exporting ? '...' : 'Export'}
          </button>
          <button type="button" onClick={persist} className="canvas-topbar-btn hidden md:inline-flex">
            Save
          </button>
          <div className="canvas-credits-pill">
            <span>⚡</span>
            {MOCK_USER.credits.toLocaleString()}
          </div>
          <button type="button" className="canvas-community-btn ui-clickable">
            ✨ {c.community}
          </button>
          <button type="button" className="canvas-topbar-icon ui-clickable" title={c.share}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="canvas-topbar-icon ui-clickable"
          >
            ⚙
          </button>
        </div>
      </header>
      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  )
}
