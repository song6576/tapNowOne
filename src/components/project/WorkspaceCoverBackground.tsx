/** 卡片封面背景：culori 网格渐变 + BlurHash 占位 + 高斯模糊实图 */
import { memo, useState } from 'react'
import { Blurhash } from 'react-blurhash'
import {
  getWorkspaceBlurhash,
  getWorkspaceCoverUrl,
  isImageCover,
  pickCoverMeshGradient,
} from '../../utils/workspaceCover'

type Props = {
  id: string
  cover?: string
  density?: 'home' | 'card' | 'list'
  overlay?: 'default' | 'folder'
}

export const WorkspaceCoverBackground = memo(function WorkspaceCoverBackground({
  id,
  cover,
  density = 'card',
  overlay = 'default',
}: Props) {
  const url = getWorkspaceCoverUrl(id, cover)
  const image = isImageCover(url)
  const blurhash = getWorkspaceBlurhash(id, cover)
  const mesh = pickCoverMeshGradient(id)
  const [loaded, setLoaded] = useState(false)

  const blurClass =
    density === 'list' ? 'workspace-cover-blur-img--list' : 'workspace-cover-blur-img--card'

  if (!image) {
    return (
      <div className="workspace-cover-layers">
        <div className="workspace-cover-mesh" style={{ background: mesh }} aria-hidden />
        <div className="workspace-cover-gradient" style={{ background: url }} aria-hidden />
        <div
          className={`workspace-cover-overlay${overlay === 'folder' ? ' workspace-cover-overlay--folder' : ''}`}
          aria-hidden
        />
      </div>
    )
  }

  return (
    <div className={`workspace-cover-layers${loaded ? ' workspace-cover-layers--loaded' : ''}`}>
      <div className="workspace-cover-mesh" style={{ background: mesh }} aria-hidden />
      <div className="workspace-cover-blurhash" aria-hidden>
        <Blurhash
          hash={blurhash}
          width="100%"
          height="100%"
          resolutionX={density === 'list' ? 16 : 32}
          resolutionY={density === 'list' ? 10 : 20}
          punch={density === 'list' ? 0.7 : 0.9}
        />
      </div>
      <img
        className={`workspace-cover-blur-img ${blurClass}`}
        src={url}
        alt=""
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        aria-hidden
      />
      <div
        className={`workspace-cover-overlay${overlay === 'folder' ? ' workspace-cover-overlay--folder' : ''}`}
        aria-hidden
      />
    </div>
  )
})
