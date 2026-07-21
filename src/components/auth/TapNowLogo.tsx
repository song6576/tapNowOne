/** TapNow Logo 组件 */
interface TapNowLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg'
  showText?: boolean
}

const sizes = {
  xs: { icon: 22, text: 'text-sm' },
  sm: { icon: 28, text: 'text-base' },
  md: { icon: 38, text: 'text-xl' },
  lg: { icon: 40, text: 'text-2xl' },
}

export function TapNowLogo({ size = 'md', showText = true }: TapNowLogoProps) {
  const { icon, text } = sizes[size]

  return (
    <div className="flex items-center gap-1.5">
      <img src="/tapnow-logo.webp" width={icon} height={icon} alt="" aria-hidden />
      {showText && (
        <span className={`${text} font-semibold tracking-tight text-white`}>TapNow</span>
      )}
    </div>
  )
}
