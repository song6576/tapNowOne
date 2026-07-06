/** 文件夹卡片右上角菜单：打开 / 重命名 / 删除 */
import { memo, useState } from 'react'
import { HoverDropdown } from '../ui/HoverDropdown'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { InputDialog } from '../ui/InputDialog'
import { useI18n } from '../../store/langStore'
import { useToastStore } from '../../store/toastStore'
import { useWorkspaceStore, type WorkspaceFolder } from '../../store/workspaceStore'

function MoreIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="12" cy="5" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="12" cy="19" r="1.8" />
    </svg>
  )
}

function MenuItem({ label, onClick, danger }: { label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`project-card-menu-item ui-clickable ${danger ? 'project-card-menu-item--danger' : ''}`}
    >
      {label}
    </button>
  )
}

export const FolderCardMenu = memo(function FolderCardMenu({
  folder,
  onOpen,
  variant = 'overlay',
}: {
  folder: WorkspaceFolder
  onOpen?: () => void
  variant?: 'overlay' | 'inline'
}) {
  const { t } = useI18n()
  const m = t.workspace.folderMenu
  const showToast = useToastStore((s) => s.showToast)
  const renameFolder = useWorkspaceStore((s) => s.renameFolder)
  const deleteFolder = useWorkspaceStore((s) => s.deleteFolder)

  const [open, setOpen] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const closeMenu = () => setOpen(false)

  const handleOpen = () => {
    closeMenu()
    onOpen?.()
  }

  const handleRenameConfirm = (name: string) => {
    void renameFolder(folder.id, name).then(() => {
      setRenameOpen(false)
      showToast({ type: 'success', message: m.renameSuccess })
    }).catch((err: unknown) => {
      showToast({
        type: 'info',
        message: err instanceof Error && err.message ? err.message : m.error,
      })
    })
  }

  const handleDeleteConfirm = () => {
    void deleteFolder(folder.id).then(() => {
      setDeleteOpen(false)
      showToast({ type: 'success', message: m.deleteSuccess })
    }).catch((err: unknown) => {
      showToast({
        type: 'info',
        message: err instanceof Error && err.message ? err.message : m.error,
      })
    })
  }

  const panel = (
    <div className="project-card-menu-panel ui-glass-panel">
      <MenuItem label={m.open} onClick={handleOpen} />
      <MenuItem label={m.rename} onClick={() => { closeMenu(); setRenameOpen(true) }} />
      <div className="project-card-menu-divider" role="separator" />
      <MenuItem label={m.delete} onClick={() => { closeMenu(); setDeleteOpen(true) }} danger />
    </div>
  )

  return (
    <>
      <HoverDropdown
        mode="click"
        align="right"
        side="bottom"
        open={open}
        onOpenChange={setOpen}
        allowFlip
        className={`${variant === 'inline' ? '' : 'project-card-menu-wrap'} ${open ? 'project-card-menu-wrap--open' : ''}`}
        panelClassName="!bg-transparent !border-0 !shadow-none !backdrop-blur-none"
        trigger={
          <button
            type="button"
            className={`project-card-menu-trigger ui-clickable ${variant === 'inline' ? 'project-card-menu-trigger--inline' : ''}`}
            aria-label={m.open}
            aria-expanded={open}
            onClick={(e) => {
              e.stopPropagation()
              setOpen((prev) => !prev)
            }}
          >
            <MoreIcon />
          </button>
        }
      >
        {panel}
      </HoverDropdown>

      <InputDialog
        open={renameOpen}
        title={m.rename}
        value={folder.name}
        placeholder={m.renamePlaceholder}
        confirmLabel={m.confirm}
        cancelLabel={m.cancel}
        onCancel={() => setRenameOpen(false)}
        onConfirm={handleRenameConfirm}
      />

      <ConfirmDialog
        open={deleteOpen}
        title={m.deleteTitle}
        message={m.deleteMessage.replace('{name}', folder.name)}
        confirmLabel={m.delete}
        cancelLabel={m.cancel}
        danger
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  )
})
