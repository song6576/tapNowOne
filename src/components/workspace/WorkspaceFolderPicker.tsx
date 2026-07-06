/** 选择目标文件夹（当前空间内移动项目） */
import { Portal } from '../ui/Portal'
import { useI18n } from '../../store/langStore'
import { useWorkspaceStore, type WorkspaceFolder } from '../../store/workspaceStore'

type Props = {
  open: boolean
  onClose: () => void
  onPick: (folderId: string | null) => void
}

export function WorkspaceFolderPicker({ open, onClose, onPick }: Props) {
  const { t } = useI18n()
  const sel = t.workspace.selection
  const m = t.workspace.projectMenu
  const folders = useWorkspaceStore((s) => s.folders)

  if (!open) return null

  const options = [
    { id: null as string | null, name: sel.rootFolder },
    ...folders.map((f: WorkspaceFolder) => ({ id: f.id, name: f.name })),
  ]

  return (
    <Portal>
      <div className="confirm-dialog-root fixed inset-0 z-[120] flex items-center justify-center p-4">
        <button type="button" className="account-modal-backdrop absolute inset-0" onClick={onClose} aria-label={m.cancel} />
        <div className="confirm-dialog-panel relative z-10 w-full max-w-[360px] rounded-2xl border border-white/10 bg-[#141416] p-5 shadow-2xl">
          <h2 className="text-base font-semibold text-white">{sel.pickFolder}</h2>
          <ul className="workspace-folder-picker mt-4 max-h-[280px] overflow-y-auto">
            {options.map((opt) => (
              <li key={opt.id ?? 'root'}>
                <button
                  type="button"
                  className="workspace-folder-picker__item ui-clickable"
                  onClick={() => onPick(opt.id)}
                >
                  {opt.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Portal>
  )
}
