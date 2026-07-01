import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopBar } from '../components/shell/TopBar'
import { SettingsDrawer } from '../components/shell/SettingsDrawer'
import { mockGetTapTV } from '../mock/api'
import type { TapTVItem } from '../mock/data'

export function TapTVPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState<TapTVItem[]>([])
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => { mockGetTapTV().then(setItems) }, [])

  return (
    <div className="flex h-full flex-col">
      <TopBar title="TapTV" onSettingsClick={() => setSettingsOpen(true)} />
      <main className="flex-1 overflow-y-auto p-6">
        <p className="mb-6 text-sm text-[var(--tn-text-muted)]">
          Explore canvases from creators worldwide. Fork any workflow to learn and remix.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className="tn-card overflow-hidden text-left"
              onClick={() => navigate(`/taptv/${item.id}`)}
            >
              <div className="aspect-[4/3] w-full" style={{ background: item.cover }} />
              <div className="p-3">
                <h3 className="text-sm font-medium">{item.title}</h3>
                <p className="mt-1 text-xs text-[var(--tn-text-muted)]">@{item.author} · {item.nodeCount} nodes</p>
                <div className="mt-2 flex gap-2">
                  {item.tags.map((t) => (
                    <span key={t} className="rounded-full bg-[var(--tn-bg-hover)] px-2 py-0.5 text-[10px] text-[var(--tn-text-muted)]">{t}</span>
                  ))}
                </div>
                <p className="mt-2 text-[10px] text-[var(--tn-text-muted)]">♡ {item.likes} · ⑂ {item.forks} forks</p>
              </div>
            </button>
          ))}
        </div>
      </main>
      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
