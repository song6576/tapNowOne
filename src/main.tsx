import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.tsx'
import { GOOGLE_CLIENT_ID } from './config'
import { useAuthStore } from './store/authStore'
import { useLangStore } from './store/langStore'
import { ToastContainer } from './components/ui/Toast'

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
