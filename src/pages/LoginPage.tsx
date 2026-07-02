import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { TapNowLogo } from '../components/auth/TapNowLogo'
import { GoogleSignInButton } from '../components/auth/GoogleSignInButton'
import { LanguageDropdown, type AppLang } from '../components/ui/LanguageDropdown'
import { GOOGLE_CLIENT_ID } from '../config'
import { useAuthStore } from '../store/authStore'
import { useToastStore } from '../store/toastStore'

type Step = 'email' | 'auth' | 'phone'

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

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function BackIconButton({ onClick, title }: { onClick: () => void; title: string }) {
  return (
    <button type="button" onClick={onClick} className="login-back-btn" title={title} aria-label={title}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

const copy = {
  zh: {
    title: '登录或注册',
    subtitle: '让创意成真',
    google: '使用 Google 继续',
    phone: '使用手机号继续',
    or: '或',
    email: '电子邮件地址',
    continue: '继续',
    password: '密码',
    name: '昵称',
    back: '返回',
    switchLogin: '已有账号？登录',
    switchRegister: '没有账号？注册',
    terms: '注册即表示您同意我们的',
    termsLink: '服务条款',
    community: '社区准则',
    privacy: '隐私政策',
    phoneTitle: '手机号登录',
    phoneHint: '请输入手机号，我们将发送验证码（演示模式暂未接入）',
    phonePlaceholder: '手机号码',
    comingSoon: 'Google 登录即将上线',
    googleFailed: 'Google 登录失败',
    agreeTerms: '请先同意服务条款',
    loginSuccess: '登录成功',
    registerSuccess: '注册成功',
    authFailed: '操作失败',
  },
  en: {
    title: 'Log in or sign up',
    subtitle: 'Make creativity come true',
    google: 'Continue with Google',
    phone: 'Continue with phone',
    or: 'or',
    email: 'Email address',
    continue: 'Continue',
    password: 'Password',
    name: 'Display name',
    back: 'Back',
    switchLogin: 'Already have an account? Log in',
    switchRegister: "Don't have an account? Sign up",
    terms: 'By signing up, you agree to our',
    termsLink: 'Terms of Service',
    community: 'Community Guidelines',
    privacy: 'Privacy Policy',
    phoneTitle: 'Phone sign in',
    phoneHint: 'Enter your phone number to receive a code (demo only)',
    phonePlaceholder: 'Phone number',
    comingSoon: 'Google sign-in coming soon',
    googleFailed: 'Google sign-in failed',
    agreeTerms: 'Please agree to the terms first',
    loginSuccess: 'Signed in successfully',
    registerSuccess: 'Account created successfully',
    authFailed: 'Something went wrong',
  },
} as const

function getCopy(lang: AppLang) {
  return lang === 'en' ? copy.en : copy.zh
}

export function LoginPage() {
  const [lang, setLang] = useState<AppLang>('zh')
  const [step, setStep] = useState<Step>('email')
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [agreed, setAgreed] = useState(false)

  const login = useAuthStore((s) => s.login)
  const register = useAuthStore((s) => s.register)
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle)
  const loading = useAuthStore((s) => s.loading)
  const showToast = useToastStore((s) => s.showToast)
  const navigate = useNavigate()
  const location = useLocation()

  const t = getCopy(lang)

  const redirectAfterLogin = () => {
    const from = (location.state as { from?: string } | null)?.from
    navigate(from && from !== '/login' ? from : '/home', { replace: true })
  }

  const successAndRedirect = (message: string) => {
    showToast({ type: 'success', message })
    window.setTimeout(redirectAfterLogin, 600)
  }

  const requireTerms = () => {
    showToast({ type: 'warning', message: t.agreeTerms })
    return false
  }

  const handleGoogleSuccess = async (credential: string) => {
    if (!agreed) {
      requireTerms()
      return
    }
    try {
      await loginWithGoogle(credential)
      successAndRedirect(t.loginSuccess)
    } catch (err) {
      showToast({
        type: 'error',
        message: err instanceof Error ? err.message : t.googleFailed,
      })
    }
  }

  const handleEmailContinue = (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreed) {
      requireTerms()
      return
    }
    if (!email.trim()) return
    setStep('auth')
  }

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (mode === 'login') {
        await login(email, password)
        successAndRedirect(t.loginSuccess)
      } else {
        await register(email, password, name || email.split('@')[0])
        successAndRedirect(t.registerSuccess)
      }
    } catch (err) {
      showToast({
        type: 'error',
        message: err instanceof Error ? err.message : t.authFailed,
      })
    }
  }

  const outlineBtn =
    'flex h-[52px] w-full items-center justify-center gap-3 rounded-full border border-white/20 bg-transparent text-[15px] text-white transition hover:border-white/35 hover:bg-white/[0.03]'

  return (
    <div className="login-page relative min-h-screen overflow-auto bg-black text-white">
      <header className="fixed inset-x-0 top-0 z-10 flex items-center justify-between px-6 py-5 md:px-10">
        <TapNowLogo size="sm" />
        <LanguageDropdown value={lang} onChange={setLang} />
      </header>

      <main className="flex min-h-screen items-center justify-center px-6 pb-12 pt-24">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 flex justify-center">
            <TapNowLogo size="lg" />
          </div>

          <h1 className="text-center text-[28px] font-semibold tracking-tight text-white">
            {step === 'phone' ? t.phoneTitle : t.title}
          </h1>
          <p className="mt-2 text-center text-[15px] text-white/45">
            {step === 'phone' ? t.phoneHint : t.subtitle}
          </p>

          {step === 'email' && (
            <div className="mt-10 space-y-3">
              {GOOGLE_CLIENT_ID ? (
                <GoogleSignInButton
                  label={t.google}
                  disabled={loading}
                  onSuccess={handleGoogleSuccess}
                  onError={(message) => showToast({ type: 'error', message: message || t.googleFailed })}
                />
              ) : (
                <button
                  type="button"
                  className={outlineBtn}
                  onClick={() => showToast({ type: 'info', message: t.comingSoon })}
                >
                  <GoogleIcon />
                  {t.google}
                </button>
              )}
              <button
                type="button"
                className={outlineBtn}
                onClick={() => setStep('phone')}
              >
                <PhoneIcon />
                {t.phone}
              </button>

              <div className="flex items-center gap-4 py-4">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-sm text-white/35">{t.or}</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <form onSubmit={handleEmailContinue} className="space-y-4">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.email}
                  className="login-input"
                />
                <button
                  type="submit"
                  disabled={!email.trim()}
                  className="login-primary-btn"
                >
                  {t.continue}
                </button>
              </form>
            </div>
          )}

          {step === 'auth' && (
            <div className="mt-10 space-y-4">
              <div className="flex items-center gap-2">
                <BackIconButton onClick={() => setStep('email')} title={t.back} />
              </div>

              <div className="rounded-full border border-white/15 px-4 py-3 text-sm text-white/70">
                <span className="truncate">{email}</span>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {mode === 'register' && (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.name}
                    className="login-input"
                  />
                )}
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.password}
                  className="login-input"
                  autoFocus
                />

                <button type="submit" disabled={loading} className="login-primary-btn">
                  {loading ? '...' : t.continue}
                </button>
              </form>

              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="w-full text-center text-sm text-white/45 hover:text-white/70"
              >
                {mode === 'login' ? t.switchRegister : t.switchLogin}
              </button>
            </div>
          )}

          {step === 'phone' && (
            <div className="mt-10 space-y-4">
              <div className="flex items-center gap-2">
                <BackIconButton onClick={() => setStep('email')} title={t.back} />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t.phonePlaceholder}
                className="login-input"
              />
              <button
                type="button"
                disabled
                className="login-primary-btn opacity-50"
              >
                {t.continue}
              </button>
            </div>
          )}

          {step === 'email' && (
            <label className="mt-8 flex cursor-pointer items-start gap-3 text-[13px] leading-relaxed text-white/40">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="login-checkbox mt-0.5"
              />
              <span>
                {t.terms}{' '}
                <a href="#" className="text-white/55 underline underline-offset-2 hover:text-white/75">{t.termsLink}</a>
                {' '}|{' '}
                <a href="#" className="text-white/55 underline underline-offset-2 hover:text-white/75">{t.community}</a>
                {' '}|{' '}
                <a href="#" className="text-white/55 underline underline-offset-2 hover:text-white/75">{t.privacy}</a>
              </span>
            </label>
          )}
        </div>
      </main>
    </div>
  )
}
