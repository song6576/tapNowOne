/** 项目封面：culori 渐变 + BlurHash + 高斯模糊氛围图 */
import { memo } from 'react'
import { WorkspaceCoverBackground } from './WorkspaceCoverBackground'

type Props = {
  id: string
  cover?: string
  /** home=首页 16:10；card=工作空间；list=列表行 */
  density?: 'home' | 'card' | 'list'
  children?: React.ReactNode
}

export const WorkspaceCoverThumb = memo(function WorkspaceCoverThumb({
  id,
  cover,
  density = 'card',
  children,
}: Props) {
  const densityClass =
    density === 'list'
      ? 'workspace-cover-thumb--list'
      : density === 'home'
        ? 'workspace-cover-thumb--home'
        : ''

  return (
    <div className={`workspace-cover-thumb ${densityClass}`}>
      <WorkspaceCoverBackground id={id} cover={cover} density={density} />
      {children}
    </div>
  )
})
