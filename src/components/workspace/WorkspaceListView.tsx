/** 工作空间列表视图：文件夹/项目行 */
import { ProjectCardMenu } from '../project/ProjectCardMenu'
import type { WorkspaceFolder, WorkspaceProject } from '../../store/workspaceStore'
import { useI18n } from '../../store/langStore'
import { formatDateTime, formatRelativeTime } from '../../utils/time'

export type WorkspaceRow =
  | { kind: 'folder'; item: WorkspaceFolder; projectCount: number }
  | { kind: 'project'; item: WorkspaceProject }

interface WorkspaceListViewProps {
  rows: WorkspaceRow[]
  onOpenFolder: (folderId: string) => void
  onOpenProject: (projectId: string) => void
}

function FolderPreview() {
  return (
    <div className="workspace-list-preview workspace-list-preview--folder">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/40">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    </div>
  )
}

export function WorkspaceListView({ rows, onOpenFolder, onOpenProject }: WorkspaceListViewProps) {
  const { t } = useI18n()
  const ws = t.workspace

  return (
    <div className="workspace-list-wrap overflow-hidden rounded-2xl border border-white/[0.08]">
      <table className="workspace-list w-full">
        <thead>
          <tr className="text-left text-xs text-white/35">
            <th className="px-4 py-3 font-normal">{ws.colPreview}</th>
            <th className="px-4 py-3 font-normal">{ws.colName}</th>
            <th className="px-4 py-3 font-normal">{ws.colType}</th>
            <th className="hidden px-4 py-3 font-normal md:table-cell">{ws.colContent}</th>
            <th className="hidden px-4 py-3 font-normal lg:table-cell">{ws.colCreated}</th>
            <th className="px-4 py-3 font-normal">{ws.colUpdated}</th>
            <th className="w-12 px-2 py-3" aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            if (row.kind === 'folder') {
              const { item, projectCount } = row
              return (
                <tr
                  key={`f-${item.id}`}
                  className="workspace-list-row ui-clickable"
                  onClick={() => onOpenFolder(item.id)}
                >
                  <td className="px-4 py-3"><FolderPreview /></td>
                  <td className="px-4 py-3 text-sm text-white/90">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-white/45">{ws.typeFolder}</td>
                  <td className="hidden px-4 py-3 text-sm text-white/45 md:table-cell">
                    {projectCount} {ws.projectCountUnit}
                  </td>
                  <td className="hidden px-4 py-3 text-sm text-white/45 lg:table-cell">
                    {formatDateTime(item.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-sm text-white/45">
                    {t.home.editedAt} {formatRelativeTime(item.updatedAt)}
                  </td>
                  <td className="px-2 py-3" />
                </tr>
              )
            }
            const { item } = row
            return (
                <tr
                  key={`p-${item.id}`}
                  className="workspace-list-row workspace-list-row--project group ui-clickable"
                  onClick={() => onOpenProject(item.id)}
                >
                <td className="px-4 py-3">
                  <div
                    className="workspace-list-preview"
                    style={{ background: item.thumbnail ?? 'var(--tn-bg-hover)' }}
                  />
                </td>
                <td className="px-4 py-3 text-sm text-white/90">{item.name}</td>
                <td className="px-4 py-3 text-sm text-white/45">{ws.typeProject}</td>
                <td className="hidden px-4 py-3 text-sm text-white/45 md:table-cell" />
                <td className="hidden px-4 py-3 text-sm text-white/45 lg:table-cell">
                  {formatDateTime(item.createdAt)}
                </td>
                <td className="px-4 py-3 text-sm text-white/45">
                  {t.home.editedAt} {formatRelativeTime(item.updatedAt)}
                </td>
                <td className="px-2 py-3" onClick={(e) => e.stopPropagation()}>
                  <ProjectCardMenu
                    project={item}
                    variant="inline"
                    onOpen={() => onOpenProject(item.id)}
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
