/** TapTV 详情：视频播放 + 互动 + 查看创作过程 */
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { mockGetTapTVItem } from '../mock/api'
import type { TapTVItem } from '../mock/data'
import { useI18n } from '../store/langStore'

export function TapTVDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useI18n()
  const d = t.taptv.detail
  const [item, setItem] = useState<TapTVItem | null>(null)

  useEffect(() => {
    if (id) mockGetTapTVItem(id).then((r) => setItem(r ?? null))
  }, [id])

  if (!item) {
    return (
      <div className="flex flex-1 items-center justify-center text-white/40">
        {d.loading}
      </div>
    )
  }

  return (
    <main className="taptv-detail-page flex-1 overflow-y-auto">
      <div className="home-section-pad py-6 md:py-8">
        <div className="home-wide-stack taptv-detail-shell">
          <div className="taptv-detail-player overflow-hidden rounded-2xl bg-black">
            <video
              className="aspect-video w-full bg-black object-contain"
              controls
              playsInline
              preload="metadata"
              src={item.videoUrl}
            >
              <track kind="captions" />
            </video>
          </div>

          <h1 className="taptv-detail-title mt-5 font-semibold leading-snug text-white">{item.title}</h1>

          <div className="taptv-detail-meta mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="taptv-detail-avatar">{item.authorAvatar}</span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{item.author}</p>
              </div>
              <button type="button" className="taptv-follow-btn ui-clickable shrink-0">
                + {d.follow}
              </button>
            </div>

            <div className="taptv-detail-actions flex flex-wrap items-center gap-2">
              <button type="button" className="taptv-stat-btn ui-clickable">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {item.likes}
              </button>
              <button type="button" className="taptv-stat-btn ui-clickable">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinejoin="round" />
                </svg>
                {item.favorites}
              </button>
              <button type="button" className="taptv-stat-btn ui-clickable">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {item.shares}
              </button>
              <button
                type="button"
                className="taptv-workflow-btn ui-clickable"
                onClick={() => navigate(`/taptv/${item.id}/workflow`)}
              >
                {d.viewWorkflow}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 17L17 7M17 7H7M17 7v10" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          {item.description && (
            <div className="mt-5 whitespace-pre-line text-sm leading-relaxed text-white/45">
              {item.description}
            </div>
          )}

          <Link to="/taptv" className="mt-8 inline-block text-sm text-white/35 transition hover:text-white/60">
            {d.browseAll}
          </Link>
        </div>
      </div>
    </main>
  )
}
