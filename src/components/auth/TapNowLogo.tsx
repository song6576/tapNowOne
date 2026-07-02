interface TapNowLogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

const sizes = {
  sm: { icon: 22, text: 'text-sm' },
  md: { icon: 32, text: 'text-lg' },
  lg: { icon: 40, text: 'text-xl' },
}

export function TapNowLogo({ size = 'md', showText = true }: TapNowLogoProps) {
  const { icon, text } = sizes[size]

  return (
    <div className="flex items-center gap-2.5">
      <svg width={icon} height={icon} viewBox="0 0 40 40" fill="none" aria-hidden>
        <circle cx="14" cy="20" r="11" fill="#47bfff" fillOpacity="0.85" />
        <circle cx="22" cy="20" r="11" fill="#e879f9" fillOpacity="0.8" />
        <circle cx="30" cy="20" r="11" fill="#fbbf24" fillOpacity="0.85" />
      </svg>
      {showText && (
        <span className={`${text} font-semibold tracking-tight text-white`}>TapNow</span>
      )}
    </div>
  )
}
