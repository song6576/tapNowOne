/** 画布顶栏：Logo 菜单、可编辑项目名、修改时间；右上角积分 / 社区 / 分享下拉 */
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TapNowLogo } from '../auth/TapNowLogo'
import { useCanvasStore } from '../../store/canvasStore'
import { useI18n } from '../../store/langStore'
import { useTeamStore } from '../../store/teamStore'
import { useRelativeTime } from '../../hooks/useRelativeTime'
import { useToastStore } from '../../store/toastStore'

interface CanvasTopBarProps {
  projectName: string
  onProjectNameChange: (name: string) => void
  projectId?: string
  updatedAt?: string
  onNewProject?: () => void
  onDelete?: () => void
}

type ShareActionId = 'copyLink'

type ShareMenuItem = {
  id: ShareActionId
  label: string
  description: string
  /** 后续扩展：微信 / 海报等可放这里 */
  disabled?: boolean
}

export function CanvasTopBar({
  projectName,
  onProjectNameChange,
  projectId,
  updatedAt,
  onNewProject,
  onDelete,
}: CanvasTopBarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [draftName, setDraftName] = useState('')
  const navigate = useNavigate()
  const persist = useCanvasStore((s) => s.persist)
  const tapiesBalance = useTeamStore((s) => s.tapiesBalance)
  const showToast = useToastStore((s) => s.showToast)
  const { t } = useI18n()
  const c = t.canvas
  const nav = t.nav
  const share = c.shareMenu

  const displayName = projectName || c.untitled
  const relativeTime = useRelativeTime(updatedAt)
  const modifiedLabel = relativeTime
    ? `${c.lastModified} ${relativeTime}`
    : `${c.lastModified} ${c.justNow}`

  const shareItems = useMemo<ShareMenuItem[]>(
    () => [
      {
        id: 'copyLink',
        label: share.copyLink,
        description: share.copyLinkDesc,
      },
      // 后续可追加：{ id: 'wechat', label: share.wechat, description: share.wechatDesc }
    ],
    [share.copyLink, share.copyLinkDesc],
  )

  const closeMenu = () => setMenuOpen(false)
  const closeShare = () => setShareOpen(false)

  const shareUrl = projectId
    ? `${window.location.origin}/canvas/${projectId}`
    : window.location.href

  const handleShareAction = async (id: ShareActionId) => {
    if (id === 'copyLink') {
      try {
        await navigator.clipboard.writeText(shareUrl)
        showToast({ type: 'success', message: share.copied })
      } catch {
        showToast({ type: 'info', message: shareUrl })
      }
      closeShare()
    }
  }

  const startRename = () => {
    setDraftName(projectName || '')
    setRenaming(true)
  }

  const commitRename = () => {
    onProjectNameChange(draftName.trim() || c.untitled)
    setRenaming(false)
    persist()
  }

  return (
    <header className="canvas-topbar canvas-topbar--fig5 flex h-12 shrink-0 items-center justify-between px-4">
      <div className="canvas-topbar-left flex min-w-0 items-center gap-2.5">
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => {
              closeShare()
              setMenuOpen((open) => !open)
            }}
            className="canvas-topbar-logo-btn ui-clickable"
            aria-label={c.projectSection}
            aria-expanded={menuOpen}
          >
            <TapNowLogo size="xs" showText={false} />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={closeMenu} />
              <div className="canvas-project-menu ui-glass-panel absolute left-0 top-full z-40 mt-2 min-w-[220px] py-2">
                <button
                  type="button"
                  className="ui-clickable w-full px-4 py-2.5 text-left text-sm text-white/85 hover:bg-white/5"
                  onClick={() => { navigate('/home/projects'); closeMenu() }}
                >
                  {c.backToWorkspace}
                </button>
                <div className="my-1 border-t border-white/6" />
                <p className="px-4 py-1 text-[11px] text-white/35">{c.scenes}</p>
                <button type="button" className="ui-clickable w-full px-4 py-2.5 text-left text-sm text-white/75 hover:bg-white/5" onClick={() => { navigate('/taptv'); closeMenu() }}>
                  {nav.taptv}
                </button>
                <button type="button" className="ui-clickable w-full px-4 py-2.5 text-left text-sm text-white/40 hover:bg-white/5" onClick={closeMenu}>
                  {nav.arena}
                </button>
                <div className="my-1 border-t border-white/6" />
                <p className="px-4 py-1 text-[11px] text-white/35">{c.projectSection}</p>
                <button
                  type="button"
                  className="ui-clickable w-full px-4 py-2.5 text-left text-sm text-white/75 hover:bg-white/5"
                  onClick={() => { startRename(); closeMenu() }}
                >
                  {c.rename}
                </button>
                <button
                  type="button"
                  className="ui-clickable w-full px-4 py-2.5 text-left text-sm text-white/75 hover:bg-white/5"
                  onClick={() => { onNewProject?.(); closeMenu() }}
                >
                  {c.newProject}
                </button>
                <button
                  type="button"
                  className="ui-clickable w-full px-4 py-2.5 text-left text-sm text-red-400/90 hover:bg-white/5"
                  onClick={() => { onDelete?.(); closeMenu() }}
                >
                  {c.delete}
                </button>
              </div>
            </>
          )}
        </div>

        <div className="min-w-0">
          {renaming ? (
            <input
              autoFocus
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              className="canvas-topbar-title-input"
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                if (e.key === 'Escape') setRenaming(false)
              }}
            />
          ) : (
            <button
              type="button"
              onClick={startRename}
              className="canvas-topbar-title ui-clickable max-w-[min(280px,40vw)] truncate text-left text-sm font-medium text-white"
              title={displayName}
            >
              {displayName}
            </button>
          )}
          <p className="text-[11px] text-white/35">{modifiedLabel}</p>
        </div>
      </div>

      <div className="canvas-topbar-actions flex items-center gap-2">
        <div className="canvas-credits-pill" title="Tapies">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor" className="text-amber-400/90" aria-hidden>
            <path d="M6 1 11 6 6 11 1 6 6 1Z" />
          </svg>
          {tapiesBalance.toLocaleString()}
        </div>
        <button
          type="button"
          className="canvas-community-btn ui-clickable"
          onClick={() => navigate('/taptv')}
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
            <path d="M8 1.5 9.5 6 14 7.5 9.5 9 8 13.5 6.5 9 2 7.5 6.5 6 8 1.5Z" strokeLinejoin="round" />
          </svg>
          {c.community}
        </button>
        <div className="relative">
          <button
            type="button"
            className={`canvas-topbar-icon ui-clickable ${shareOpen ? 'is-active' : ''}`}
            title={c.share}
            aria-label={c.share}
            aria-expanded={shareOpen}
            onClick={() => {
              closeMenu()
              setShareOpen((open) => !open)
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {shareOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={closeShare} />
              <div
                className="canvas-share-menu ui-glass-panel absolute right-0 top-full z-40 mt-2 w-[260px] py-2"
                role="menu"
                aria-label={c.share}
              >
                <p className="canvas-share-menu-title">{share.title}</p>
                {shareItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="menuitem"
                    disabled={item.disabled}
                    className="canvas-share-menu-item ui-clickable"
                    onClick={() => void handleShareAction(item.id)}
                  >
                    <span className="canvas-share-menu-item-icon" aria-hidden>
                      <LinkIcon />
                    </span>
                    <span className="canvas-share-menu-item-text">
                      <span className="canvas-share-menu-item-label">{item.label}</span>
                      <span className="canvas-share-menu-item-desc">{item.description}</span>
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

function LinkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" strokeLinecap="round" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" strokeLinecap="round" />
    </svg>
  )
}
