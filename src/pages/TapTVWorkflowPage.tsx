/** TapTV 创作过程只读页：节点流程预览 + 克隆项目 */
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ReadonlyWorkflowCanvas } from '../components/taptv/ReadonlyWorkflowCanvas'
import { mockGetTapTVItem, mockGetTapTVWorkflow } from '../mock/api'
import type { TapTVItem } from '../mock/data'
import type { CanvasProject } from '../types'
import { useI18n } from '../store/langStore'

export function TapTVWorkflowPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useI18n()
  const w = t.taptv.workflow
  const [item, setItem] = useState<TapTVItem | null>(null)
  const [workflow, setWorkflow] = useState<CanvasProject | null>(null)

  useEffect(() => {
    if (!id) return
    Promise.all([mockGetTapTVItem(id), mockGetTapTVWorkflow(id)]).then(([it, wf]) => {
      setItem(it ?? null)
      setWorkflow(wf ?? null)
    })
  }, [id])

  if (!item || !workflow) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#050505] text-white/40">
        {t.taptv.detail.loading}
      </div>
    )
  }

  const handleClone = () => {
    const cloned: CanvasProject = {
      ...workflow,
      id: `clone-${Date.now()}`,
      name: item.title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    navigate('/canvas', { state: { project: cloned } })
  }

  return (
    <div className="taptv-workflow-page flex h-screen flex-col bg-[#050505]">
      <header className="taptv-workflow-header flex h-12 shrink-0 items-center justify-between gap-4 border-b border-white/[0.06] px-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link to={`/taptv/${item.id}`} className="ui-clickable shrink-0 text-white/45 hover:text-white/75" aria-label={t.taptv.detail.back}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <h1 className="truncate text-sm font-medium text-white/90">{item.title}</h1>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden text-xs text-white/35 sm:inline">{w.readonlyHint}</span>
          <button type="button" onClick={handleClone} className="taptv-clone-btn ui-clickable">
            {w.cloneProject}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </header>

      <ReadonlyWorkflowCanvas project={workflow} />
    </div>
  )
}
