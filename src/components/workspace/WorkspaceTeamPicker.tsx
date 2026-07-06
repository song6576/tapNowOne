/** 选择目标团队（移动项目至团队） */
import { Portal } from '../ui/Portal'
import { useI18n } from '../../store/langStore'
import { PERSONAL_TEAM_ID, useTeamStore } from '../../store/teamStore'

type Props = {
  open: boolean
  onClose: () => void
  onPick: (teamId: string) => void
}

export function WorkspaceTeamPicker({ open, onClose, onPick }: Props) {
  const { t } = useI18n()
  const m = t.workspace.projectMenu
  const teams = useTeamStore((s) => s.teams).filter((team) => !team.isPersonal && team.id !== PERSONAL_TEAM_ID)

  if (!open) return null

  return (
    <Portal>
      <div className="confirm-dialog-root fixed inset-0 z-[120] flex items-center justify-center p-4">
        <button type="button" className="account-modal-backdrop absolute inset-0" onClick={onClose} aria-label={m.cancel} />
        <div className="confirm-dialog-panel relative z-10 w-full max-w-[360px] rounded-2xl border border-white/10 bg-[#141416] p-5 shadow-2xl">
          <h2 className="text-base font-semibold text-white">{m.pickTeamTitle}</h2>
          {teams.length === 0 ? (
            <p className="mt-4 text-sm text-white/45">{m.pickTeamEmpty}</p>
          ) : (
            <ul className="workspace-folder-picker mt-4 max-h-[280px] overflow-y-auto">
              {teams.map((team) => (
                <li key={team.id}>
                  <button
                    type="button"
                    className="workspace-folder-picker__item ui-clickable flex items-center gap-2.5"
                    onClick={() => onPick(team.id)}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/10 text-xs font-medium text-white/70">
                      {team.initial}
                    </span>
                    <span className="truncate">{team.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Portal>
  )
}
