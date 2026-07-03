/** 首页 Hero：输入 prompt + 选模型，创建项目并带 initialPrompt 跳转画布 */
import { memo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ModelDropdown } from '../ui/ModelDropdown'
import { useI18n } from '../../store/langStore'
import { useWorkspaceStore } from '../../store/workspaceStore'

export const HeroPrompt = memo(function HeroPrompt() {
  const [prompt, setPrompt] = useState('')
  const [modelId, setModelId] = useState('kimi-2.6')
  const navigate = useNavigate()
  const { t } = useI18n()
  const createProject = useWorkspaceStore((s) => s.createProject)

  /** 创建工作空间项目并跳转画布，携带 initialPrompt 供 CanvasPage 生成分镜 */
  const submit = () => {
    const text = prompt.trim()
    const proj = createProject(null)
    navigate(`/canvas/${proj.id}`, {
      state: {
        initialPrompt: text || undefined,
        modelId,
        openAgentPanel: true,
      },
    })
  }

  return (
    <section className="w-full">
      <div className="mb-5 flex items-center justify-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/60">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        </span>
        <h1 className="text-[26px] font-semibold tracking-tight text-white md:text-[28px]">
          {t.home.heroTitle}
        </h1>
      </div>

      <div className="home-prompt-box group">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              submit()
            }
          }}
          placeholder={t.home.heroPlaceholder}
          rows={3}
          className="home-prompt-input"
        />
        <div className="home-prompt-toolbar">
          <ModelDropdown value={modelId} onChange={setModelId} />
          <div className="home-prompt-actions">
            <button
              type="button"
              className="home-prompt-icon-btn"
              title="语音输入"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" strokeLinecap="round" />
              </svg>
            </button>
            <span className="home-prompt-divider" aria-hidden />
            <button
              type="button"
              onClick={submit}
              className="home-prompt-submit ui-clickable"
              title="开始创作"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
})
