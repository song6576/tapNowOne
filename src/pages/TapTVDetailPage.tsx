import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { TopBar } from '../components/shell/TopBar'
import { mockGetTapTVItem } from '../mock/api'
import type { TapTVItem } from '../mock/data'

export function TapTVDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState<TapTVItem | null>(null)

  useEffect(() => {
    if (id) mockGetTapTVItem(id).then((r) => setItem(r ?? null))
  }, [id])

  if (!item) {
    return (
      <div className="flex h-full items-center justify-center text-[var(--tn-text-muted)]">
        Loading...
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <TopBar showCredits={false}>
        <Link to="/taptv" className="text-xs text-[var(--tn-text-muted)] hover:text-white">← TapTV</Link>
      </TopBar>
      <main className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col">
          <div className="flex-1" style={{ background: item.cover }} />
          <div className="border-t border-[var(--tn-border-subtle)] p-6">
            <h1 className="text-xl font-semibold">{item.title}</h1>
            <p className="mt-1 text-sm text-[var(--tn-text-muted)]">
              by @{item.author} · {item.nodeCount} nodes · ♡ {item.likes} · ⑂ {item.forks}
            </p>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                className="tn-btn tn-btn-primary"
                onClick={() => navigate('/canvas', { state: { forkFrom: item.id } })}
              >
                ⑂ Fork to Canvas
              </button>
              <button type="button" className="tn-btn tn-btn-ghost">♡ Like</button>
            </div>
          </div>
        </div>
        <aside className="w-80 shrink-0 overflow-y-auto border-l border-[var(--tn-border-subtle)] p-4">
          <h3 className="text-xs font-medium uppercase tracking-wider text-[var(--tn-text-muted)]">Workflow Preview</h3>
          <div className="mt-4 space-y-2">
            {['Script Node', 'Image ×3', 'Video ×3', 'Audio', 'Compose'].map((n, i) => (
              <div key={n} className="flex items-center gap-2 rounded-lg bg-[var(--tn-bg-panel)] px-3 py-2 text-xs text-[var(--tn-text-secondary)]">
                <span className="text-[var(--tn-text-muted)]">{i + 1}</span>
                {n}
              </div>
            ))}
          </div>
          <p className="mt-6 text-[10px] text-[var(--tn-text-muted)]">
            Fork this canvas to see exact nodes, prompts, and model settings.
          </p>
        </aside>
      </main>
    </div>
  )
}
