import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'
import { HomePage } from './pages/HomePage'
import { TapTVPage } from './pages/TapTVPage'
import { TapTVDetailPage } from './pages/TapTVDetailPage'
import { ProjectsPage } from './pages/ProjectsPage'
import { CanvasPage } from './pages/CanvasPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Canvas 编辑器 — 全屏独立布局 */}
        <Route path="/canvas" element={<CanvasPage />} />
        <Route path="/canvas/:projectId" element={<CanvasPage />} />

        {/* 主应用页面 — 带侧边栏 */}
        <Route element={<AppLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/home/projects" element={<ProjectsPage />} />
          <Route path="/taptv" element={<TapTVPage />} />
          <Route path="/taptv/:id" element={<TapTVDetailPage />} />
        </Route>

        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
