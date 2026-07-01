import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MOCK_PROJECTS, MOCK_USER } from '../../mock/data'
import { useCanvasStore } from '../../store/canvasStore'
import { SettingsDrawer } from './SettingsDrawer'

interface CanvasTopBarProps {
  projectName: string
  onProjectNameChange: (name: string) => void
  projectId?: string
}

export function CanvasTopBar({ projectName, onProjectNameChange, projectId }: CanvasTopBarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const navigate = useNavigate()
  const persist = useCanvasStore((s) => s.persist)
  const exportVideo = useCanvasStore((s) => s.exportVideo)
  const exporting = useCanvasStore((s) => s.exporting)

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
      <header className="flex h-[var(--tn-topbar-h)] shrink-0 items-center gap-2 border-b border-[var(--tn-border-subtle)] bg-[var(--tn-bg-elevated)] px-3">
        {/* Project menu — TapNow 左上角 */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-[var(--tn-bg-hover)]"
          >
            <Link to="/home" onClick={(e) => e.stopPropagation()}>
              <img
                src="https://fe-assets.tapnow.top/ad9f65d36e96daf0fcd1ba59146601de8a241292/tap_logo.webp"
                alt="TapNow"
                className="h-5 w-5"
                onError={(e) => { (e.target as HTMLImageElement).alt = 'TN' }}
              />
            </Link>
            <span className="max-w-[140px] truncate font-medium">{projectName || 'Untitled'}</span>
            <span className="text-[var(--tn-text-muted)]">▾</span>
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
                {MOCK_PROJECTS.map((p) => (
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

        <input
          type="text"
          value={projectName}
          onChange={(e) => onProjectNameChange(e.target.value)}
          className="ml-2 max-w-[200px] rounded-md border border-transparent bg-transparent px-2 py-1 text-sm text-[var(--tn-text-secondary)] outline-none hover:border-[var(--tn-border)] focus:border-[var(--tn-border)] focus:text-white"
        />

        <div className="ml-auto flex items-center gap-2">
          <button type="button" disabled={exporting} onClick={handleExport} className="tn-btn tn-btn-ghost hidden text-[10px] sm:inline-flex disabled:opacity-50">
            {exporting ? 'Exporting...' : 'Export Video'}
          </button>
          <button type="button" onClick={persist} className="tn-btn tn-btn-ghost hidden text-[10px] md:inline-flex">
            Save
          </button>
          <div className="flex items-center gap-1 rounded-full bg-[var(--tn-bg-panel)] px-2.5 py-1 text-xs text-[var(--tn-text-secondary)]">
            <span className="text-[var(--tn-node-video)]">⚡</span>
            {MOCK_USER.credits.toLocaleString()}
          </div>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--tn-text-muted)] hover:bg-[var(--tn-bg-hover)]"
          >
            ⚙
          </button>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--tn-bg-hover)] text-[10px] font-medium">
            {MOCK_USER.name[0]}
          </div>
        </div>
      </header>
      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  )
}
