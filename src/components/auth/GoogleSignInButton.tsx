/** Google 登录：透明 overlay 覆盖官方按钮样式 */
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'

type Props = {
  label: string
  disabled?: boolean
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

export function GoogleSignInButton({ label, disabled, onSuccess, onError }: Props) {
  const handleSuccess = (response: CredentialResponse) => {
    if (!response.credential) {
      onError('Google 登录失败，未获取到凭证')
      return
    }
    onSuccess(response.credential)
  }

  return (
    <div className={`relative w-full ${disabled ? 'pointer-events-none opacity-50' : ''}`}>
      <div
        aria-hidden
        className="flex h-[52px] w-full items-center justify-center gap-3 rounded-full border border-white/20 bg-transparent text-[15px] text-white"
      >
        <GoogleIcon />
        {label}
      </div>
      <div className="absolute inset-0 overflow-hidden rounded-full opacity-[0.011]">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => onError('Google 登录失败')}
          useOneTap={false}
          theme="outline"
          size="large"
          shape="pill"
          width="400"
          text="continue_with"
        />
      </div>
    </div>
  )
}
