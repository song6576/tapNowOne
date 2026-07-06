/** 工作空间多选底部操作栏 */
import { useState } from 'react'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { useI18n } from '../../store/langStore'
import { useToastStore } from '../../store/toastStore'
import { useWorkspaceStore } from '../../store/workspaceStore'
import { WorkspaceFolderPicker } from './WorkspaceFolderPicker'
import { WorkspaceTeamPicker } from './WorkspaceTeamPicker'

type Props = {
  selectedIds: string[]
  onClear: () => void
  onDone: () => void
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
    </svg>
  )
}

function FolderAddIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      <path d="M12 11v6M9 14h6" strokeLinecap="round" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" strokeLinecap="round" />
    </svg>
  )
}

export function WorkspaceSelectionBar({ selectedIds, onClear, onDone }: Props) {
  const { t } = useI18n()
  const sel = t.workspace.selection
  const showToast = useToastStore((s) => s.showToast)
  const moveProjectsToTeam = useWorkspaceStore((s) => s.moveProjectsToTeam)
  const updateProject = useWorkspaceStore((s) => s.updateProject)
  const deleteProject = useWorkspaceStore((s) => s.deleteProject)

  const [folderOpen, setFolderOpen] = useState(false)
  const [teamOpen, setTeamOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const countLabel = sel.selectedCount.replace('{count}', String(selectedIds.length))

  const handleMoveToFolder = async (folderId: string | null) => {
    setFolderOpen(false)
    setBusy(true)
    try {
      await Promise.all(selectedIds.map((id) => updateProject(id, { folderId })))
      showToast({ type: 'success', message: sel.moveSuccess })
      onDone()
    } catch {
      showToast({ type: 'info', message: t.workspace.projectMenu.comingSoon })
    } finally {
      setBusy(false)
    }
  }

  const handleMoveToTeam = async (teamId: string) => {
    setTeamOpen(false)
    setBusy(true)
    try {
      await moveProjectsToTeam(selectedIds, teamId)
      showToast({ type: 'success', message: t.workspace.projectMenu.moveToTeamSuccess })
      onDone()
    } catch (err: unknown) {
      showToast({
        type: 'info',
        message: err instanceof Error ? err.message : t.workspace.projectMenu.comingSoon,
      })
    } finally {
      setBusy(false)
    }
  }

  const handleDeleteConfirm = async () => {
    setDeleteOpen(false)
    setBusy(true)
    try {
      await Promise.all(selectedIds.map((id) => deleteProject(id)))
      showToast({ type: 'success', message: sel.deleteSuccess })
      onDone()
    } catch {
      showToast({ type: 'info', message: t.workspace.projectMenu.comingSoon })
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="workspace-selection-bar">
        <button type="button" className="workspace-selection-bar__close ui-clickable" onClick={onClear} aria-label={sel.cancel}>
          <CloseIcon />
        </button>
        <span className="workspace-selection-bar__count">{countLabel}</span>
        <div className="workspace-selection-bar__divider" />
        <div className="workspace-selection-bar__actions">
          <button
            type="button"
            className="workspace-selection-bar__action ui-clickable"
            title={sel.addToFolder}
            disabled={busy}
            onClick={() => setFolderOpen(true)}
          >
            <FolderAddIcon />
          </button>
          <button
            type="button"
            className="workspace-selection-bar__action ui-clickable"
            title={t.workspace.projectMenu.moveToTeam}
            disabled={busy}
            onClick={() => setTeamOpen(true)}
          >
            <UsersIcon />
          </button>
          <button
            type="button"
            className="workspace-selection-bar__action workspace-selection-bar__action--danger ui-clickable"
            title={sel.deleteSelected}
            disabled={busy}
            onClick={() => setDeleteOpen(true)}
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      <WorkspaceFolderPicker
        open={folderOpen}
        onClose={() => setFolderOpen(false)}
        onPick={(folderId) => void handleMoveToFolder(folderId)}
      />

      <WorkspaceTeamPicker
        open={teamOpen}
        onClose={() => setTeamOpen(false)}
        onPick={(teamId) => void handleMoveToTeam(teamId)}
      />

      <ConfirmDialog
        open={deleteOpen}
        title={sel.deleteTitle}
        message={sel.deleteMessage.replace('{count}', String(selectedIds.length))}
        confirmLabel={t.workspace.projectMenu.delete}
        cancelLabel={sel.cancel}
        danger
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => void handleDeleteConfirm()}
      />
    </>
  )
}
