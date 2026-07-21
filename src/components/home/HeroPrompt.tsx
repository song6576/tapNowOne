/** 首页 Hero：输入 prompt + 选模型，创建项目并带 initialPrompt 跳转画布 */
import { memo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DEFAULT_AGENT_MODEL } from '../../types/aiModel'
import { ModelDropdown } from '../ui/ModelDropdown'
import { useI18n } from '../../store/langStore'
import { useWorkspaceStore } from '../../store/workspaceStore'

export const HeroPrompt = memo(function HeroPrompt() {
  const [prompt, setPrompt] = useState('')
  const [modelId, setModelId] = useState(DEFAULT_AGENT_MODEL)
  const [autoModel, setAutoModel] = useState(true)
  const navigate = useNavigate()
  const { t } = useI18n()
  const createProject = useWorkspaceStore((s) => s.createProject)

  /** 创建工作空间项目并跳转画布，携带 initialPrompt 供 CanvasPage 生成分镜 */
  const submit = async () => {
    const text = prompt.trim()
    const proj = await createProject(null)
    navigate(`/canvas/${proj.id}`, {
      state: {
        initialPrompt: text || undefined,
        modelId,
        autoModel,
        openAgentPanel: true,
      },
    })
  }

  return (
    <section className="w-full">
      <div className="mb-5 flex items-center justify-start gap-3">
        <span className="home-hero-badge">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        </span>
        <h1 className="text-[30px] font-semibold tracking-tight text-white md:text-[30px]">
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
          <div className="home-prompt-toolbar-spacer" aria-hidden />
          <div className="home-prompt-actions">
            <ModelDropdown
              value={modelId}
              onChange={setModelId}
              auto={autoModel}
              onAutoChange={setAutoModel}
              align="right"
            />
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
