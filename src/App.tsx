/**
 * 根路由：GuestRoute 保护登录页，ProtectedRoute 保护业务页。
 * Canvas 为全屏布局，其余页面走 AppLayout（顶栏 + 内容）。
 */
import { lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { GuestRoute, ProtectedRoute } from './components/auth/AuthRoutes'
import { RouteBoundary } from './components/ui/RouteBoundary'

const AppLayout = lazy(() => import('./layouts/AppLayout').then((module) => ({ default: module.AppLayout })))
const HomePage = lazy(() => import('./pages/HomePage').then((module) => ({ default: module.HomePage })))
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((module) => ({ default: module.ProfilePage })))
const TapTVPage = lazy(() => import('./pages/TapTVPage').then((module) => ({ default: module.TapTVPage })))
const TapTVDetailPage = lazy(() => import('./pages/TapTVDetailPage').then((module) => ({ default: module.TapTVDetailPage })))
const TapTVWorkflowPage = lazy(() => import('./pages/TapTVWorkflowPage').then((module) => ({ default: module.TapTVWorkflowPage })))
const ProjectsPage = lazy(() => import('./pages/ProjectsPage').then((module) => ({ default: module.ProjectsPage })))
const CanvasPage = lazy(() => import('./pages/CanvasPage').then((module) => ({ default: module.CanvasPage })))
const LoginPage = lazy(() => import('./pages/LoginPage').then((module) => ({ default: module.LoginPage })))
const TeamJoinPage = lazy(() => import('./pages/TeamJoinPage').then((module) => ({ default: module.TeamJoinPage })))

export default function App() {
  return (
    <RouteBoundary>
      <BrowserRouter>
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            {/* Canvas 编辑器 — 全屏独立布局 */}
            <Route path="/canvas" element={<CanvasPage />} />
            <Route path="/canvas/:projectId" element={<CanvasPage />} />
            <Route path="/taptv/:id/workflow" element={<TapTVWorkflowPage />} />

            {/* 主应用页面 — 顶部导航 */}
            <Route element={<AppLayout />}>
              <Route path="/home" element={<HomePage />} />
              <Route path="/home/profile" element={<ProfilePage />} />
              <Route path="/home/projects" element={<ProjectsPage />} />
              <Route path="/taptv" element={<TapTVPage />} />
              <Route path="/taptv/:id" element={<TapTVDetailPage />} />
              <Route path="/team/join/:token" element={<TeamJoinPage />} />
            </Route>

            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </RouteBoundary>
  )
}
