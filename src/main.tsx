import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.tsx'
import { GOOGLE_CLIENT_ID } from './config'
import { useAuthStore } from './store/authStore'
import { ToastContainer } from './components/ui/Toast'

function Bootstrap() {
  const init = useAuthStore((s) => s.init)

  useEffect(() => {
    void init()
  }, [init])

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
