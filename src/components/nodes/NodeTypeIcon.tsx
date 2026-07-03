/** 节点类型图标（图3 风格） */
export function NodeTypeIcon({ type, className = 'h-10 w-10' }: { type: string; className?: string }) {
  const cls = `${className} text-white/25`
  switch (type) {
    case 'text':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 6h16M4 12h10M4 18h14" strokeLinecap="round" />
        </svg>
      )
    case 'image':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="9" cy="11" r="2" />
          <path d="M21 15l-5-5L8 18" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'video':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <path d="M10 9.5l5 3-5 3v-6z" fill="currentColor" stroke="none" className="text-white/30" />
        </svg>
      )
    case 'audio':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      )
    default:
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
        </svg>
      )
  }
}

export function NodeHeaderIcon({ type }: { type: string }) {
  const cls = 'h-3.5 w-3.5 shrink-0 text-white/50'
  switch (type) {
    case 'text':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 6h16M4 12h10M4 18h14" strokeLinecap="round" />
        </svg>
      )
    case 'image':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="9" cy="11" r="1.5" />
        </svg>
      )
    case 'video':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <path d="M10 10l4 2-4 2v-4z" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'audio':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18V5l10-2v13" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="6" cy="18" r="2.5" />
        </svg>
      )
    default:
      return null
  }
}
