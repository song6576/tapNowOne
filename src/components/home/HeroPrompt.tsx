import { memo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AI_MODELS } from '../../mock/data'

export const HeroPrompt = memo(function HeroPrompt() {
  const [prompt, setPrompt] = useState('')
  const [model, setModel] = useState(AI_MODELS[0])
  const navigate = useNavigate()

  const submit = () => {
    const text = prompt.trim()
    navigate('/canvas', { state: { initialPrompt: text || undefined } })
  }

  return (
    <section className="mx-auto w-full max-w-[720px]">
      <div className="mb-6 flex items-center justify-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/60">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        </span>
        <h1 className="text-[26px] font-semibold tracking-tight text-white md:text-[28px]">
          今天要做点什么？
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
          placeholder="体验 Brains"
          rows={3}
          className="home-prompt-input"
        />
        <div className="flex items-center justify-end gap-2 px-4 pb-3">
          <div className="relative mr-auto">
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="home-model-select"
            >
              {AI_MODELS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <svg className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" strokeLinecap="round" />
            </svg>
          </div>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/40 transition hover:bg-white/5 hover:text-white/70"
            title="语音输入"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" strokeLinecap="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={submit}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            title="开始创作"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
})
