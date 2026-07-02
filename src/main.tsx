/**
 * 应用入口：挂载 React 根节点，初始化认证/语言，可选包裹 Google OAuth。
 */
import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.tsx'
import { GOOGLE_CLIENT_ID } from './config'
import { useAuthStore } from './store/authStore'
import { useLangStore } from './store/langStore'
import { ToastContainer } from './components/ui/Toast'

/** 启动时从 localStorage 恢复语言与登录态（有 token 则请求 /auth/me 校验） */
function Bootstrap() {
  const initAuth = useAuthStore((s) => s.init)
  const initLang = useLangStore((s) => s.init)

  useEffect(() => {
    initLang()
    void initAuth()
  }, [initAuth, initLang])

  return (
    <>
      <App />
      <ToastContainer />
    </>
  )
}

const clientId = GOOGLE_CLIENT_ID ?? ''

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {clientId ? (
      <GoogleOAuthProvider clientId={clientId}>
        <Bootstrap />
      </GoogleOAuthProvider>
    ) : (
      <Bootstrap />
    )}
  </StrictMode>,
)
