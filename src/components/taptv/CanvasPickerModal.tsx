/** 发布弹窗：选择个人/团队画布项目 */
import { useEffect, useMemo, useState } from 'react'
import { Modal } from '../ui/Modal'
import { TabBar } from '../ui/TabBar'
import { WorkspaceCoverThumb } from '../project/WorkspaceCoverThumb'
import { searchWorkspace } from '../../api/client'
import { useAuthStore } from '../../store/authStore'
import { useI18n } from '../../store/langStore'
import { PERSONAL_TEAM_ID, useTeamStore } from '../../store/teamStore'
import { pickWorkspaceCover } from '../../utils/workspaceCover'
import { formatRelativeTime } from '../../utils/time'

export type CanvasPickerValue = {
  id: string
  name: string
  thumbnail?: string
  updatedAt: string
}

type Tab = 'personal' | 'team'

type Props = {
  open: boolean
  onClose: () => void
  value?: CanvasPickerValue | null
  onSelect: (project: CanvasPickerValue) => void
}

function mapProject(p: { id: string; name: string; thumbnail?: string; updated_at?: string; updatedAt?: string }): CanvasPickerValue {
  return {
    id: p.id,
    name: p.name,
    thumbnail: p.thumbnail ?? pickWorkspaceCover(p.id),
    updatedAt: p.updatedAt ?? p.updated_at ?? new Date().toISOString(),
  }
}

export function CanvasPickerModal({ open, onClose, value, onSelect }: Props) {
  const { t } = useI18n()
  const cp = t.publish.canvasPicker
  const ws = t.workspace
  const [tab, setTab] = useState<Tab>('personal')
  const [loading, setLoading] = useState(false)
  const [projects, setProjects] = useState<CanvasPickerValue[]>([])

  const teams = useTeamStore((s) => s.teams)
  const initTeams = useTeamStore((s) => s.init)
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    if (open && user?.name) void initTeams(user.name)
  }, [open, user?.name, initTeams])

  const teamIds = useMemo(
    () => teams.filter((t) => !t.isPersonal && t.id !== PERSONAL_TEAM_ID).map((t) => t.id),
    [teams],
  )

  useEffect(() => {
    if (!open) return
    let cancelled = false

    const load = async () => {
      setLoading(true)
      try {
        if (!user) {
          if (!cancelled) setProjects([])
          return
        }

        if (tab === 'personal') {
          const result = await searchWorkspace({
            teamId: null,
            type: 'projects',
            sortBy: 'updatedAt',
            sortOrder: 'desc',
            flat: true,
          })
          if (!cancelled) {
            setProjects(result.projects.map(mapProject))
          }
          return
        }

        if (teamIds.length === 0) {
          if (!cancelled) setProjects([])
          return
        }

        const results = await Promise.all(
          teamIds.map((teamId) =>
            searchWorkspace({
              teamId,
              type: 'projects',
              sortBy: 'updatedAt',
              sortOrder: 'desc',
              flat: true,
            }),
          ),
        )
        const merged = new Map<string, CanvasPickerValue>()
        for (const result of results) {
          for (const p of result.projects) {
            merged.set(p.id, mapProject(p))
          }
        }
        if (!cancelled) {
          setProjects([...merged.values()])
        }
      } catch {
        if (!cancelled) setProjects([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => { cancelled = true }
  }, [open, tab, teamIds, user])

  const handlePick = (project: CanvasPickerValue) => {
    onSelect(project)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={cp.title} stacked>
      <TabBar<Tab>
        tabs={[
          { id: 'personal', label: ws.personal },
          { id: 'team', label: ws.team },
        ]}
        active={tab}
        onChange={setTab}
        className="canvas-picker-tabs mb-5"
      />

      {loading ? (
        <div className="canvas-picker-empty">{t.taptv.detail.loading}</div>
      ) : tab === 'team' && teamIds.length === 0 ? (
        <div className="canvas-picker-empty">{ws.empty}</div>
      ) : projects.length === 0 ? (
        <div className="canvas-picker-empty">{ws.empty}</div>
      ) : (
        <div className="canvas-picker-grid">
          {projects.map((project) => {
            const selected = value?.id === project.id
            return (
              <button
                key={project.id}
                type="button"
                onClick={() => handlePick(project)}
                className={`canvas-picker-card ui-clickable ${selected ? 'canvas-picker-card--selected' : ''}`}
              >
                <WorkspaceCoverThumb id={project.id} cover={project.thumbnail} density="card" />
                <div className="canvas-picker-card-footer">
                  <p className="canvas-picker-card-title">{project.name}</p>
                  <p className="canvas-picker-card-meta">
                    {cp.updatedAt} {formatRelativeTime(project.updatedAt)}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </Modal>
  )
}
