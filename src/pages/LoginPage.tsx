/** 登录页：Google / 邮箱 / 手机验证码多步流程，需勾选协议 */
import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { TapNowLogo } from '../components/auth/TapNowLogo'
import { LanguageDropdown } from '../components/ui/LanguageDropdown'
import { useAuthStore } from '../store/authStore'
import { useI18n } from '../store/langStore'
import { useToastStore } from '../store/toastStore'
import { useSmsCooldown } from '../hooks/useSmsCooldown'
import { getStoredSmsPhone, hasSmsSentForPhone } from '../utils/smsCooldown'

type Step = 'main' | 'auth' // main=选方式；auth=邮箱密码第二步
type LoginMethod = 'email' | 'phone'

function EmailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="2" y="4" width="20" height="16" rx="2.5" />
      <path d="M2 7l10 7 10-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function isValidPhone(value: string): boolean {
  const cleaned = value.replace(/[\s-]/g, '')
  return /^1[3-9]\d{9}$/.test(cleaned)
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

export function LoginPage() {
  const [step, setStep] = useState<Step>('main')
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('email')
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [agreed, setAgreed] = useState(false)

  const { remaining: smsRemaining, canSend: canSendSms, triggerCooldown } = useSmsCooldown(phone)

  useEffect(() => {
    const storedPhone = getStoredSmsPhone()
    if (storedPhone && hasSmsSentForPhone(storedPhone)) {
      setPhone(storedPhone)
      setLoginMethod('phone')
    }
  }, [])

  const login = useAuthStore((s) => s.login)
  const register = useAuthStore((s) => s.register)
  const loading = useAuthStore((s) => s.loading)
  const showToast = useToastStore((s) => s.showToast)
  const navigate = useNavigate()
  const location = useLocation()

  const { t: messages } = useI18n()
  const t = messages.login

  /** 登录成功后回到 ProtectedRoute 记录的 from，否则 /home */
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

  const handleSendCode = () => {
    if (!agreed) {
      requireTerms()
      return
    }
    if (!isValidPhone(phone) || !canSendSms) return
    triggerCooldown()
    showToast({ type: 'success', message: t.codeSent })
  }

  const phoneValid = isValidPhone(phone)
  const smsSent = hasSmsSentForPhone(phone)
  const sendBtnLabel = smsRemaining > 0
    ? `${smsRemaining}s`
    : smsSent
      ? t.resendCode
      : t.sendCode

  const switchToPhone = () => {
    setLoginMethod('phone')
  }

  const switchToEmail = () => {
    setLoginMethod('email')
  }

  const outlineBtn =
    'ui-clickable flex h-[52px] w-full items-center justify-center gap-3 rounded-full border border-white/20 bg-transparent text-[16px] text-white transition hover:border-white/35 hover:bg-white/[0.03]'

  return (
    <div className="login-page relative min-h-screen overflow-auto bg-black text-white">
      <header className="fixed inset-x-0 top-0 z-10 flex items-center justify-between px-6 py-5 md:px-10">
        <TapNowLogo size="sm" />
        <LanguageDropdown />
      </header>

      <main className="flex min-h-screen items-center justify-center px-6 pb-12 pt-24">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 flex justify-center">
            <TapNowLogo size="lg" />
          </div>

          <h1 className="text-center text-[32px] font-semibold tracking-tight text-white">
            {t.title}
          </h1>
          <p className="mt-2 text-center text-[16px] text-white/45">
            {t.subtitle}
          </p>

          {step === 'main' && (
            <div className="mt-10 space-y-3">
              <button
                type="button"
                className={`${outlineBtn} opacity-60`}
                onClick={() => showToast({ type: 'info', message: t.comingSoon })}
              >
                <GoogleIcon />
                {t.google}
              </button>

              {loginMethod === 'email' ? (
                <button type="button" className={outlineBtn} onClick={switchToPhone}>
                  <PhoneIcon />
                  {t.phone}
                </button>
              ) : (
                <button type="button" className={outlineBtn} onClick={switchToEmail}>
                  <EmailIcon />
                  {t.emailBtn}
                </button>
              )}

              <div className="flex items-center gap-4 py-4">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-[15px] text-white/35">{t.or}</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              {loginMethod === 'email' ? (
                <form onSubmit={handleEmailContinue} className="login-method-panel space-y-4">
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
              ) : (
                <div className="login-method-panel space-y-4">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t.phonePlaceholder}
                    className="login-input"
                    inputMode="numeric"
                    autoComplete="tel"
                  />
                  {phoneValid && (
                    <div className="login-code-row">
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder={t.codePlaceholder}
                        className="login-code-input"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                      />
                      <button
                        type="button"
                        onClick={handleSendCode}
                        disabled={!canSendSms}
                        className="login-code-btn"
                      >
                        {sendBtnLabel}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 'auth' && (
            <div className="mt-10 space-y-4">
              <div className="flex items-center gap-2">
                <BackIconButton onClick={() => setStep('main')} title={t.back} />
              </div>

              <div className="rounded-full border border-white/15 px-4 py-3 text-[15px] text-white/70">
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
                className="ui-clickable w-full text-center text-[15px] text-white/45 hover:text-white/70"
              >
                {mode === 'login' ? t.switchRegister : t.switchLogin}
              </button>
            </div>
          )}

          {step === 'main' && (
            <label className="mt-8 flex cursor-pointer items-start gap-3 text-[14px] leading-relaxed text-white/40">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="login-terms-checkbox-input"
              />
              <span className={`login-terms-checkbox ${agreed ? 'is-checked' : ''}`} aria-hidden>
                {agreed && (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span>
                {t.terms}{' '}
                <a href="#" className="ui-clickable text-white/55 underline underline-offset-2 hover:text-white/75">{t.termsLink}</a>
                {' '}|{' '}
                <a href="#" className="ui-clickable text-white/55 underline underline-offset-2 hover:text-white/75">{t.community}</a>
                {' '}|{' '}
                <a href="#" className="ui-clickable text-white/55 underline underline-offset-2 hover:text-white/75">{t.privacy}</a>
              </span>
            </label>
          )}
        </div>
      </main>
    </div>
  )
}
