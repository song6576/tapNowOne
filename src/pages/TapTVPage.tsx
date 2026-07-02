import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { mockGetTapTV } from '../mock/api'
import type { TapTVItem } from '../mock/data'

export function TapTVPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState<TapTVItem[]>([])

  useEffect(() => { mockGetTapTV().then(setItems) }, [])

  return (
    <main className="home-page flex-1 overflow-y-auto px-5 py-8 md:px-8">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-white">TapTV</h1>
          <p className="mt-1 text-sm text-white/40">探索全球创作者的 Canvas，Fork 任意工作流学习 remix</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className="home-project-card overflow-hidden text-left"
              onClick={() => navigate(`/taptv/${item.id}`)}
            >
              <div className="aspect-[4/3] w-full" style={{ background: item.cover }} />
              <div className="p-3">
                <h3 className="text-sm font-medium text-white/90">{item.title}</h3>
                <p className="mt-1 text-xs text-white/35">@{item.author} · {item.nodeCount} nodes</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {item.tags.map((t) => (
                    <span key={t} className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] text-white/45">{t}</span>
                  ))}
                </div>
                <p className="mt-2 text-[10px] text-white/35">♡ {item.likes} · ⑂ {item.forks} forks</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </main>
  )
}
