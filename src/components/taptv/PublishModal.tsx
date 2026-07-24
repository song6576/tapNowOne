/** 发布到 TapTV 表单弹窗 */
import { useRef, useState } from 'react'
import { Modal } from '../ui/Modal'
import { CanvasPickerModal, type CanvasPickerValue } from './CanvasPickerModal'
import { publishTapTV, uploadProjectAsset } from '../../api/client'
import { useI18n } from '../../store/langStore'
import { useToastStore } from '../../store/toastStore'
import { WorkspaceCoverThumb } from '../project/WorkspaceCoverThumb'

interface PublishModalProps {
  open: boolean
  onClose: () => void
  onPublished?: () => void
}

function UploadZone({
  label,
  hint,
  aspect = 'video',
  previewUrl,
  onPick,
}: {
  label?: string
  hint: string
  aspect?: 'video' | 'cover' | 'subtitle'
  previewUrl?: string | null
  onPick: () => void
}) {
  const aspectClass =
    aspect === 'cover' ? 'publish-upload--cover' : aspect === 'subtitle' ? 'publish-upload--subtitle' : 'publish-upload--video'

  return (
    <div className="publish-field">
      {label && (
        <label className="publish-label">
          {label}
          <span className="text-red-400">*</span>
        </label>
      )}
      <button type="button" onClick={onPick} className={`publish-upload ${aspectClass} ui-clickable overflow-hidden`}>
        {previewUrl && aspect !== 'subtitle' ? (
          aspect === 'video' ? (
            <video src={previewUrl} className="h-full w-full object-cover" muted playsInline />
          ) : (
            <img src={previewUrl} alt="" className="h-full w-full object-cover" />
          )
        ) : (
          <>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/30">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="mt-2 text-sm text-white/35">{hint}</span>
          </>
        )}
      </button>
    </div>
  )
}

export function PublishModal({ open, onClose, onPublished }: PublishModalProps) {
  const { t } = useI18n()
  const p = t.publish
  const showToast = useToastStore((s) => s.showToast)
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [canvas, setCanvas] = useState<CanvasPickerValue | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [videoAssetId, setVideoAssetId] = useState<string | null>(null)
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [coverAssetId, setCoverAssetId] = useState<string | null>(null)
  const [subtitleUrl, setSubtitleUrl] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const videoInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const subtitleInputRef = useRef<HTMLInputElement>(null)

  const reset = () => {
    setTitle('')
    setDesc('')
    setCanvas(null)
    setVideoUrl(null)
    setVideoAssetId(null)
    setCoverUrl(null)
    setCoverAssetId(null)
    setSubtitleUrl(null)
  }

  const handleClose = () => {
    onClose()
    reset()
  }

  const uploadFile = async (file: File, kind: 'video' | 'cover' | 'subtitle') => {
    const saved = await uploadProjectAsset(file, canvas?.id)
    if (kind === 'video') {
      setVideoUrl(saved.url)
      setVideoAssetId(saved.asset_id ?? null)
    } else if (kind === 'cover') {
      setCoverUrl(saved.url)
      setCoverAssetId(saved.asset_id ?? null)
    }
    else setSubtitleUrl(saved.url)
  }

  const handleSubmit = async () => {
    const trimmed = title.trim()
    if (!trimmed) {
      showToast({ type: 'info', message: p.errors.titleRequired })
      return
    }
    if (!videoUrl) {
      showToast({ type: 'info', message: p.errors.videoRequired })
      return
    }
    if (!canvas) {
      showToast({ type: 'info', message: p.errors.canvasRequired })
      return
    }

    setSubmitting(true)
    try {
      const res = await publishTapTV({
        title: trimmed,
        description: desc.trim() || undefined,
        projectId: canvas.id,
        videoAssetId: videoAssetId ?? undefined,
        videoUrl: videoAssetId ? undefined : videoUrl,
        coverAssetId: coverAssetId ?? undefined,
        coverUrl: coverUrl ?? canvas.thumbnail,
        subtitleUrl: subtitleUrl ?? undefined,
      })
      showToast({ type: 'success', message: res.message || p.success })
      handleClose()
      onPublished?.()
    } catch (err) {
      showToast({ type: 'info', message: err instanceof Error ? err.message : p.errors.submitFailed })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        title={p.title}
        subtitle={p.subtitle}
        wide
        footer={
          <>
            <button type="button" onClick={handleClose} className="home-secondary-pill px-6" disabled={submitting}>
              {p.cancel}
            </button>
            <button type="button" onClick={() => void handleSubmit()} className="home-primary-pill px-8" disabled={submitting}>
              {submitting ? p.submitting : p.submit}
            </button>
          </>
        }
      >
        <input ref={videoInputRef} type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (file) void uploadFile(file, 'video').catch((err) => showToast({ type: 'info', message: err instanceof Error ? err.message : '上传失败' }))
        }} />
        <input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (file) void uploadFile(file, 'cover').catch((err) => showToast({ type: 'info', message: err instanceof Error ? err.message : '上传失败' }))
        }} />
        <input ref={subtitleInputRef} type="file" accept=".srt,text/plain,application/x-subrip" className="hidden" onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (file) void uploadFile(file, 'subtitle').catch((err) => showToast({ type: 'info', message: err instanceof Error ? err.message : '上传失败' }))
        }} />

        <div className="publish-grid">
          <div className="space-y-5">
            <UploadZone label={p.uploadWork} hint={p.uploadHint} aspect="video" previewUrl={videoUrl} onPick={() => videoInputRef.current?.click()} />
            <UploadZone label={p.uploadCover} hint={p.uploadHint} aspect="cover" previewUrl={coverUrl} onPick={() => coverInputRef.current?.click()} />
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
              {canvas ? (
                <button type="button" onClick={() => setPickerOpen(true)} className="publish-canvas-selected ui-clickable">
                  <div className="publish-canvas-selected-thumb">
                    <WorkspaceCoverThumb id={canvas.id} cover={canvas.thumbnail} density="list" />
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="truncate text-sm text-white/90">{canvas.name}</p>
                    <p className="text-xs text-white/35">{p.changeCanvas}</p>
                  </div>
                </button>
              ) : (
                <button type="button" onClick={() => setPickerOpen(true)} className="publish-canvas-btn ui-clickable">
                  <span className="text-lg text-white/40">+</span>
                  <span className="text-sm text-white/50">{p.selectCanvas}</span>
                </button>
              )}
            </div>
            <div className="publish-field">
              <label className="publish-label">
                {p.uploadSubtitle}
                <span className="ml-1 text-xs font-normal text-white/35">{p.subtitleHint}</span>
              </label>
              <UploadZone hint={subtitleUrl ? p.subtitleUploaded : p.uploadHint} aspect="subtitle" onPick={() => subtitleInputRef.current?.click()} />
            </div>
          </div>
        </div>
      </Modal>

      <CanvasPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        value={canvas}
        onSelect={setCanvas}
      />
    </>
  )
}
