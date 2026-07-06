/** 项目卡片右上角菜单：打开 / 重命名 / 删除等 */
import { memo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HoverDropdown } from '../ui/HoverDropdown'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { InputDialog } from '../ui/InputDialog'
import { WorkspaceFolderPicker } from '../workspace/WorkspaceFolderPicker'
import { WorkspaceTeamPicker } from '../workspace/WorkspaceTeamPicker'
import { useI18n } from '../../store/langStore'
import { useToastStore } from '../../store/toastStore'
import { useWorkspaceStore, type WorkspaceProject } from '../../store/workspaceStore'

function MoreIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="12" cy="5" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="12" cy="19" r="1.8" />
    </svg>
  )
}

type MenuItemProps = {
  label: string
  onClick: () => void
  danger?: boolean
}

function MenuItem({ label, onClick, danger }: MenuItemProps) {
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

function MenuDivider() {
  return <div className="project-card-menu-divider" role="separator" />
}

export const ProjectCardMenu = memo(function ProjectCardMenu({
  project,
  onOpen,
  onEnterSelectMode,
  variant = 'overlay',
}: {
  project: WorkspaceProject
  onOpen?: () => void
  onEnterSelectMode?: (projectId: string) => void
  /** overlay=卡片悬浮角标；inline=列表行内按钮 */
  variant?: 'overlay' | 'inline'
}) {
  const navigate = useNavigate()
  const { t } = useI18n()
  const m = t.workspace.projectMenu
  const showToast = useToastStore((s) => s.showToast)
  const updateProject = useWorkspaceStore((s) => s.updateProject)
  const deleteProject = useWorkspaceStore((s) => s.deleteProject)

  const [open, setOpen] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [folderPickerOpen, setFolderPickerOpen] = useState(false)
  const [teamPickerOpen, setTeamPickerOpen] = useState(false)

  const closeMenu = () => setOpen(false)

  const handleOpen = () => {
    closeMenu()
    if (onOpen) {
      onOpen()
      return
    }
    navigate(`/canvas/${project.id}`)
  }

  const handleRename = () => {
    closeMenu()
    setRenameOpen(true)
  }

  const handleRenameConfirm = (name: string) => {
    void updateProject(project.id, { name }).then(() => {
      setRenameOpen(false)
      showToast({ type: 'success', message: m.renameSuccess })
    }).catch(() => {
      showToast({ type: 'info', message: m.comingSoon })
    })
  }

  const handleShare = async () => {
    closeMenu()
    const url = `${window.location.origin}/canvas/${project.id}`
    try {
      await navigator.clipboard.writeText(url)
      showToast({ type: 'success', message: m.shareCopied })
    } catch {
      showToast({ type: 'info', message: url })
    }
  }

  const handleMoveToFolder = () => {
    closeMenu()
    setFolderPickerOpen(true)
  }

  const handleMoveToFolderConfirm = (folderId: string | null) => {
    setFolderPickerOpen(false)
    void updateProject(project.id, { folderId }).then(() => {
      showToast({ type: 'success', message: m.moveToFolderSuccess })
    }).catch((err: unknown) => {
      showToast({
        type: 'info',
        message: err instanceof Error ? err.message : m.comingSoon,
      })
    })
  }

  const handleMoveToTeam = () => {
    closeMenu()
    setTeamPickerOpen(true)
  }

  const handleMoveToTeamConfirm = (teamId: string) => {
    setTeamPickerOpen(false)
    void updateProject(project.id, { teamId, folderId: null }).then(() => {
      showToast({ type: 'success', message: m.moveToTeamSuccess })
    }).catch((err: unknown) => {
      showToast({
        type: 'info',
        message: err instanceof Error ? err.message : m.comingSoon,
      })
    })
  }

  const handleSelect = () => {
    closeMenu()
    if (onEnterSelectMode) {
      onEnterSelectMode(project.id)
      return
    }
    showToast({ type: 'info', message: m.comingSoon })
  }

  const handleDelete = () => {
    closeMenu()
    setDeleteOpen(true)
  }

  const handleDeleteConfirm = () => {
    void deleteProject(project.id).then(() => {
      setDeleteOpen(false)
      showToast({ type: 'success', message: m.deleteSuccess })
    }).catch(() => {
      showToast({ type: 'info', message: m.comingSoon })
    })
  }

  const panel = (
    <div className="project-card-menu-panel ui-glass-panel">
      <MenuItem label={m.open} onClick={handleOpen} />
      <MenuItem label={m.rename} onClick={handleRename} />
      <MenuItem label={m.select} onClick={handleSelect} />
      <MenuDivider />
      <MenuItem label={m.moveTo} onClick={handleMoveToFolder} />
      <MenuItem label={m.shareLink} onClick={handleShare} />
      <MenuItem label={m.moveToTeam} onClick={handleMoveToTeam} />
      <MenuDivider />
      <MenuItem label={m.delete} onClick={handleDelete} danger />
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
        value={project.name}
        placeholder={m.renamePlaceholder}
        confirmLabel={m.confirm}
        cancelLabel={m.cancel}
        onCancel={() => setRenameOpen(false)}
        onConfirm={handleRenameConfirm}
      />

      <ConfirmDialog
        open={deleteOpen}
        title={m.deleteTitle}
        message={m.deleteMessage.replace('{name}', project.name)}
        confirmLabel={m.delete}
        cancelLabel={m.cancel}
        danger
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
      />

      <WorkspaceFolderPicker
        open={folderPickerOpen}
        onClose={() => setFolderPickerOpen(false)}
        onPick={handleMoveToFolderConfirm}
      />

      <WorkspaceTeamPicker
        open={teamPickerOpen}
        onClose={() => setTeamPickerOpen(false)}
        onPick={handleMoveToTeamConfirm}
      />
    </>
  )
})
