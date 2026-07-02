/**
 * 根路由：GuestRoute 保护登录页，ProtectedRoute 保护业务页。
 * Canvas 为全屏布局，其余页面走 AppLayout（顶栏 + 内容）。
 */
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { GuestRoute, ProtectedRoute } from './components/auth/AuthRoutes'
import { AppLayout } from './layouts/AppLayout'
import { HomePage } from './pages/HomePage'
import { TapTVPage } from './pages/TapTVPage'
import { TapTVDetailPage } from './pages/TapTVDetailPage'
import { ProjectsPage } from './pages/ProjectsPage'
import { CanvasPage } from './pages/CanvasPage'
import { LoginPage } from './pages/LoginPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          {/* Canvas 编辑器 — 全屏独立布局 */}
          <Route path="/canvas" element={<CanvasPage />} />
          <Route path="/canvas/:projectId" element={<CanvasPage />} />

          {/* 主应用页面 — 顶部导航 */}
          <Route element={<AppLayout />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/home/projects" element={<ProjectsPage />} />
            <Route path="/taptv" element={<TapTVPage />} />
            <Route path="/taptv/:id" element={<TapTVDetailPage />} />
          </Route>

          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
