import { useNavigate } from 'react-router-dom'
import { TopBar } from '../components/shell/TopBar'
import { SettingsDrawer } from '../components/shell/SettingsDrawer'
import { useState } from 'react'
import { mockGetTapTV } from '../mock/api'
import { useEffect } from 'react'
import type { TapTVItem } from '../mock/data'

export function HomePage() {
  const navigate = useNavigate()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [feed, setFeed] = useState<TapTVItem[]>([])

  useEffect(() => {
    mockGetTapTV().then(setFeed)
  }, [])

  return (
    <div className="flex h-full flex-col">
      <TopBar title="Home" onSettingsClick={() => setSettingsOpen(true)} />

      <main className="flex-1 overflow-y-auto">
        {/* Hero — TapNow 风格 */}
        <section className="border-b border-[var(--tn-border-subtle)] px-8 py-12">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Your Agentic Creative Canvas
            </h1>
            <p className="mx-auto mt-3 max-w-lg text-sm text-[var(--tn-text-muted)]">
              Node is the Vocabulary. Wire is the Logic. Canvas is the Universe.
            </p>
            <button
              type="button"
              className="tn-btn tn-btn-primary mt-8"
              onClick={() => navigate('/canvas')}
            >
              + Create New Canvas
            </button>
          </div>
        </section>

        {/* TapTV Feed preview */}
        <section className="px-8 py-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium">TapTV</h2>
              <p className="text-xs text-[var(--tn-text-muted)]">Fork, remix, evolve together</p>
            </div>
            <button type="button" className="tn-btn tn-btn-ghost text-xs" onClick={() => navigate('/taptv')}>
              View All →
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {feed.slice(0, 6).map((item) => (
              <button
                key={item.id}
                type="button"
                className="tn-card group overflow-hidden text-left"
                onClick={() => navigate(`/taptv/${item.id}`)}
              >
                <div className="aspect-video w-full" style={{ background: item.cover }} />
                <div className="p-3">
                  <h3 className="text-sm font-medium group-hover:text-white">{item.title}</h3>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-[var(--tn-text-muted)]">
                    <span>@{item.author}</span>
                    <span>♡ {item.likes} · ⑂ {item.forks}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      </main>

      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
