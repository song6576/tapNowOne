/** 文件夹网格卡片：TapNow 文件夹外形叠层 + 右上角菜单 */
import { memo } from 'react'
import { FolderCardMenu } from './FolderCardMenu'
import { FolderStackPreview } from './FolderStackPreview'
import type { WorkspaceFolder } from '../../store/workspaceStore'
import { useI18n } from '../../store/langStore'
import { formatRelativeTime } from '../../utils/time'

type Props = {
  folder: WorkspaceFolder
  projectCount: number
  onOpen: () => void
}

export const FolderGridCard = memo(function FolderGridCard({ folder, projectCount, onOpen }: Props) {
  const { t } = useI18n()

  return (
    <div className="home-project-card home-project-card--folder group relative text-left">
      <button type="button" onClick={onOpen} className="flex w-full flex-col text-left">
        <FolderStackPreview id={folder.id} cover={folder.cover} />
        <div className="home-project-card-footer">
          <h3 className="home-project-card-title">{folder.name}</h3>
          <p className="home-project-card-meta">
            {t.home.editedAt} {formatRelativeTime(folder.updatedAt)}
            <span className="home-project-card-meta-sep">·</span>
            {projectCount} {t.workspace.projectCountUnit}
          </p>
        </div>
      </button>
      <div className="project-card-menu-anchor">
        <FolderCardMenu folder={folder} onOpen={onOpen} />
      </div>
    </div>
  )
})
