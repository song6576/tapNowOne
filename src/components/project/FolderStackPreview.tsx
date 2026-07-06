/** 文件夹卡片预览：模糊背景 + 三层文件叠放 + 底部磨砂口袋（TapNow 风格） */
import { memo } from 'react'
import { pickFileAccents } from '../../utils/workspaceCover'
import { WorkspaceCoverBackground } from './WorkspaceCoverBackground'

type Props = {
  id: string
  cover?: string
}

export const FolderStackPreview = memo(function FolderStackPreview({ id, cover }: Props) {
  const accents = pickFileAccents(id)

  return (
    <div className="folder-stack-preview">
      <div className="folder-stack-preview__bg" aria-hidden>
        <WorkspaceCoverBackground id={id} cover={cover} density="card" overlay="folder" />
      </div>

      <div className="folder-stack-preview__files" aria-hidden>
        {accents.map((accent, i) => (
          <div key={i} className={`folder-stack-preview__file folder-stack-preview__file--${i}`}>
            <span className="folder-stack-preview__file-mark" style={{ background: accent }} />
          </div>
        ))}
      </div>

      <div className="folder-stack-preview__pocket" aria-hidden />
    </div>
  )
})
