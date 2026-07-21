/** 文件夹卡片预览：文件叠层 + 左侧标签的文件夹外形磨砂袋（TapNow） */
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

      {/* 磨砂袋身：左标签文件夹轮廓 */}
      <div className="folder-stack-preview__pocket" aria-hidden>
        <div className="folder-stack-preview__pocket-fill" />
        <svg
          className="folder-stack-preview__pocket-lip"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path
            d="M0,36 L0,5.5 C0,1.8 1.2,1.2 4.5,1.2 L32,1.2 C35,1.2 36.5,3.5 38,8.5 L41.5,29 C42.5,33.5 44.5,36 48,36 L100,36"
            fill="none"
            stroke="rgba(255,255,255,0.26)"
            strokeWidth="1.15"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  )
})
