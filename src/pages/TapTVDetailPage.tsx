/** TapTV 详情：展示作品信息，Fork 到画布 */
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
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
      <div className="flex flex-1 items-center justify-center text-white/40">
        加载中...
      </div>
    )
  }

  return (
    <main className="flex flex-1 overflow-hidden">
      <div className="flex flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-3">
          <Link to="/taptv" className="text-sm text-white/40 hover:text-white/70">← TapTV</Link>
        </div>
        <div className="flex-1" style={{ background: item.cover }} />
        <div className="border-t border-white/[0.06] p-6">
          <h1 className="text-xl font-semibold text-white">{item.title}</h1>
          <p className="mt-1 text-sm text-white/40">
            by @{item.author} · {item.nodeCount} nodes · ♡ {item.likes} · ⑂ {item.forks}
          </p>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              className="home-primary-pill"
              onClick={() => navigate('/canvas', { state: { forkFrom: item.id } })}
            >
              ⑂ Fork to Canvas
            </button>
            <button type="button" className="home-secondary-pill">♡ Like</button>
          </div>
        </div>
      </div>
      <aside className="hidden w-80 shrink-0 overflow-y-auto border-l border-white/[0.06] p-4 lg:block">
        <h3 className="text-xs font-medium uppercase tracking-wider text-white/35">Workflow Preview</h3>
        <div className="mt-4 space-y-2">
          {['Script Node', 'Image ×3', 'Video ×3', 'Audio', 'Compose'].map((n, i) => (
            <div key={n} className="flex items-center gap-2 rounded-lg bg-white/[0.04] px-3 py-2 text-xs text-white/60">
              <span className="text-white/30">{i + 1}</span>
              {n}
            </div>
          ))}
        </div>
      </aside>
    </main>
  )
}
