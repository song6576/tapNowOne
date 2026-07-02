import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { useI18n } from '../../store/langStore'
import { useToastStore } from '../../store/toastStore'

interface PublishModalProps {
  open: boolean
  onClose: () => void
}

function UploadZone({ label, hint, aspect = 'video' }: { label?: string; hint: string; aspect?: 'video' | 'cover' | 'subtitle' }) {
  const aspectClass = aspect === 'cover' ? 'publish-upload--cover' : aspect === 'subtitle' ? 'publish-upload--subtitle' : 'publish-upload--video'
  return (
    <div className="publish-field">
      {label && (
        <label className="publish-label">
          {label}
          <span className="text-red-400">*</span>
        </label>
      )}
      <button type="button" className={`publish-upload ${aspectClass} ui-clickable`}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/30">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="mt-2 text-sm text-white/35">{hint}</span>
      </button>
    </div>
  )
}

export function PublishModal({ open, onClose }: PublishModalProps) {
  const { t } = useI18n()
  const p = t.publish
  const showToast = useToastStore((s) => s.showToast)
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')

  const handleSubmit = () => {
    showToast({ type: 'success', message: p.success })
    onClose()
    setTitle('')
    setDesc('')
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={p.title}
      subtitle={p.subtitle}
      wide
      footer={
        <>
          <button type="button" onClick={onClose} className="home-secondary-pill px-6">
            {p.cancel}
          </button>
          <button type="button" onClick={handleSubmit} className="home-primary-pill px-8">
            {p.submit}
          </button>
        </>
      }
    >
      <div className="publish-grid">
        <div className="space-y-5">
          <UploadZone label={p.uploadWork} hint={p.uploadHint} aspect="video" />
          <UploadZone label={p.uploadCover} hint={p.uploadHint} aspect="cover" />
        </div>
        <div className="space-y-5">
          <div className="publish-field">
            <label className="publish-label">
              {p.workName}
              <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, 80))}
                placeholder={p.workNamePlaceholder}
                className="publish-input"
              />
              <span className="publish-counter">{title.length}/80</span>
            </div>
          </div>
          <div className="publish-field">
            <label className="publish-label">{p.workDesc}</label>
            <div className="relative">
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value.slice(0, 500))}
                placeholder={p.workDescPlaceholder}
                rows={4}
                className="publish-input publish-textarea"
              />
              <span className="publish-counter">{desc.length}/500</span>
            </div>
          </div>
          <div className="publish-field">
            <label className="publish-label">{p.publicCanvas}</label>
            <button type="button" className="publish-canvas-btn ui-clickable">
              <span className="text-lg text-white/40">+</span>
              <span className="text-sm text-white/50">{p.selectCanvas}</span>
            </button>
          </div>
          <div className="publish-field">
            <label className="publish-label">
              {p.uploadSubtitle}
              <span className="ml-1 text-xs font-normal text-white/35">{p.subtitleHint}</span>
            </label>
            <UploadZone hint={p.uploadHint} aspect="subtitle" />
          </div>
        </div>
      </div>
    </Modal>
  )
}
