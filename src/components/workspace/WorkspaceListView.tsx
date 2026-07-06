/** 工作空间列表视图：文件夹/项目行 */
import { ProjectCardMenu } from '../project/ProjectCardMenu'
import { FolderCardMenu } from '../project/FolderCardMenu'
import { WorkspaceCoverThumb } from '../project/WorkspaceCoverThumb'
import { WorkspaceSelectCheckbox } from './WorkspaceSelectCheckbox'
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
  selectMode?: boolean
  selectedIds?: Set<string>
  onToggleSelect?: (projectId: string) => void
  onEnterSelectMode?: (projectId: string) => void
}

function FolderPreview({ id, cover }: { id: string; cover?: string }) {
  return (
    <WorkspaceCoverThumb id={id} cover={cover} density="list" />
  )
}

export function WorkspaceListView({
  rows,
  onOpenFolder,
  onOpenProject,
  selectMode = false,
  selectedIds,
  onToggleSelect,
  onEnterSelectMode,
}: WorkspaceListViewProps) {
  const { t } = useI18n()
  const ws = t.workspace

  return (
    <div className="workspace-list-wrap overflow-hidden rounded-2xl border border-white/[0.08]">
      <table className="workspace-list w-full">
        <thead>
          <tr className="text-left text-xs text-white/35">
            {selectMode && <th className="w-10 px-3 py-3" aria-hidden />}
            <th className="px-4 py-3 font-normal">{ws.colPreview}</th>
            <th className="px-4 py-3 font-normal">{ws.colName}</th>
            <th className="px-4 py-3 font-normal">{ws.colType}</th>
            <th className="hidden px-4 py-3 font-normal md:table-cell">{ws.colContent}</th>
            <th className="hidden px-4 py-3 font-normal lg:table-cell">{ws.colCreated}</th>
            <th className="px-4 py-3 font-normal">{ws.colUpdated}</th>
            {!selectMode && <th className="w-12 px-2 py-3" aria-label="Actions" />}
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
                  {selectMode && <td className="px-3 py-3" />}
                  <td className="px-4 py-3"><FolderPreview id={item.id} cover={item.cover} /></td>
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
                  {!selectMode && (
                    <td className="px-2 py-3" onClick={(e) => e.stopPropagation()}>
                      <FolderCardMenu folder={item} variant="inline" onOpen={() => onOpenFolder(item.id)} />
                    </td>
                  )}
                  {selectMode && <td className="px-2 py-3" />}
                </tr>
              )
            }
            const { item } = row
            const selected = !!selectedIds?.has(item.id)
            return (
                <tr
                  key={`p-${item.id}`}
                  className={`workspace-list-row workspace-list-row--project group ui-clickable ${selectMode && selected ? 'workspace-list-row--selected' : ''}`}
                  onClick={() => {
                    if (selectMode) {
                      onToggleSelect?.(item.id)
                      return
                    }
                    onOpenProject(item.id)
                  }}
                >
                {selectMode && (
                  <td className="px-3 py-3">
                    <WorkspaceSelectCheckbox checked={selected} />
                  </td>
                )}
                <td className="px-4 py-3">
                  <WorkspaceCoverThumb id={item.id} cover={item.thumbnail} density="list" />
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
                {!selectMode && (
                  <td className="px-2 py-3" onClick={(e) => e.stopPropagation()}>
                    <ProjectCardMenu
                      project={item}
                      variant="inline"
                      onOpen={() => onOpenProject(item.id)}
                      onEnterSelectMode={onEnterSelectMode}
                    />
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
