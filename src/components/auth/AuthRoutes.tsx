import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

function AuthLoading() {
  return (
    <div className="flex h-full min-h-screen items-center justify-center bg-black text-white/40">
      加载中...
    </div>
  )
}

/** 未登录用户访问受保护路由时，重定向到 /login */
export function ProtectedRoute() {
  const user = useAuthStore((s) => s.user)
  const initialized = useAuthStore((s) => s.initialized)
  const location = useLocation()

  if (!initialized) return <AuthLoading />

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }

  return <Outlet />
}

/** 已登录用户访问 /login 时，重定向到首页或原目标页 */
export function GuestRoute() {
  const user = useAuthStore((s) => s.user)
  const initialized = useAuthStore((s) => s.initialized)
  const location = useLocation()

  if (!initialized) return <AuthLoading />

  if (user) {
    const from = (location.state as { from?: string } | null)?.from
    const target = from && from !== '/login' ? from : '/home'
    return <Navigate to={target} replace />
  }

  return <Outlet />
}
