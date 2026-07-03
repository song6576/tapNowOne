/** TapTV 卡片：视频封面（16:9）+ 标题 + 作者 + 点赞 */
import { memo } from 'react'
import type { TapTVItem } from '../../mock/data'

interface TapTVCardProps {
  item: TapTVItem
  onClick?: () => void
}

export const TapTVCard = memo(function TapTVCard({ item, onClick }: TapTVCardProps) {
  return (
    <button type="button" onClick={onClick} className="taptv-card ui-clickable text-left">
      <div className="taptv-card-cover taptv-card-cover--video" style={{ background: item.cover }}>
        <div className="taptv-card-overlay">
          <div className="flex items-center gap-2">
            <span className="taptv-card-avatar">{item.authorAvatar}</span>
            <span className="text-xs text-white/80">{item.author}</span>
          </div>
          <div className="mt-2 flex items-end justify-between gap-2">
            <h3 className="line-clamp-2 text-sm font-medium text-white">{item.title}</h3>
            <span className="flex shrink-0 items-center gap-1 text-xs text-white/70">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {item.likes}
            </span>
          </div>
        </div>
      </div>
    </button>
  )
})
