/** Google 登录：自定义外观 + 透明官方按钮覆盖层接收点击 */
import { useEffect, useRef, useState } from 'react'
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'

type Props = {
  label: string
  disabled?: boolean
  /** 为 true 时拦截点击（例如未勾选协议） */
  blockInteraction?: boolean
  onBlockInteraction?: () => void
  onSuccess: (credential: string) => void
  onError: (message: string) => void
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.616z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
    </svg>
  )
}

export function GoogleSignInButton({
  label,
  disabled,
  blockInteraction,
  onBlockInteraction,
  onSuccess,
  onError,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [buttonWidth, setButtonWidth] = useState(320)
  const reportedLoadError = useRef(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const syncWidth = () => setButtonWidth(Math.max(Math.floor(el.offsetWidth), 200))
    syncWidth()

    const observer = new ResizeObserver(syncWidth)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (disabled) return

    const timer = window.setTimeout(() => {
      const iframe = containerRef.current?.querySelector('iframe')
      if (!iframe && !reportedLoadError.current) {
        reportedLoadError.current = true
        onError('无法加载 Google 登录服务，请检查网络或开启 VPN 后刷新页面')
      }
    }, 6000)

    return () => window.clearTimeout(timer)
  }, [disabled, onError])

  const handleSuccess = (response: CredentialResponse) => {
    if (!response.credential) {
      onError('Google 登录失败，未获取到凭证')
      return
    }
    onSuccess(response.credential)
  }

  return (
    <div
      ref={containerRef}
      className={`relative h-[52px] w-full ${disabled ? 'pointer-events-none opacity-50' : ''}`}
    >
      <div
        aria-hidden
        className="pointer-events-none flex h-full w-full items-center justify-center gap-3 rounded-full border border-white/20 bg-transparent text-[15px] text-white transition hover:border-white/35 hover:bg-white/[0.03]"
      >
        <GoogleIcon />
        {label}
      </div>
      <div className="google-signin-overlay absolute inset-0 z-10 overflow-hidden rounded-full opacity-[0.01]">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => onError('Google 登录失败，请确认网络可访问 Google')}
          useOneTap={false}
          theme="outline"
          size="large"
          shape="pill"
          width={String(buttonWidth)}
          text="continue_with"
          containerProps={{
            className: 'flex h-full w-full items-center justify-center',
            style: { height: '100%', width: '100%' },
          }}
        />
      </div>
      {blockInteraction && !disabled && (
        <button
          type="button"
          aria-label={label}
          className="absolute inset-0 z-20 cursor-pointer rounded-full border-0 bg-transparent p-0"
          onClick={onBlockInteraction}
        />
      )}
    </div>
  )
}
