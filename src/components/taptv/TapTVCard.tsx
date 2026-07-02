import { memo } from 'react'
import type { TapTVItem } from '../../mock/data'

interface TapTVCardProps {
  item: TapTVItem
  onClick?: () => void
}

export const TapTVCard = memo(function TapTVCard({ item, onClick }: TapTVCardProps) {
  return (
    <button type="button" onClick={onClick} className="taptv-card ui-clickable text-left">
      <div className="taptv-card-cover" style={{ background: item.cover }}>
        <div className="taptv-card-overlay">
          <div className="flex items-center gap-2">
            <span className="taptv-card-avatar">{item.authorAvatar}</span>
            <span className="text-xs text-white/80">@{item.author}</span>
          </div>
          <div className="mt-2 flex items-end justify-between gap-2">
            <h3 className="line-clamp-2 text-sm font-medium text-white">{item.title}</h3>
            <span className="flex shrink-0 items-center gap-1 text-xs text-white/70">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinejoin="round" />
              </svg>
              {item.likes}
            </span>
          </div>
        </div>
      </div>
    </button>
  )
})
