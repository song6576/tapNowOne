import { Suspense, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { HomeTopNav } from '../components/home/HomeTopNav'
import { RouteLoading } from '../components/ui/RouteBoundary'
import { bootstrapAppShell } from '../store/appBootstrap'

/** TapNow 主应用壳：顶部导航 + 内容区 + 一次性数据 bootstrap */
export function AppLayout() {
  useEffect(() => {
    void bootstrapAppShell()
  }, [])

  return (
    <div className="relative flex h-full flex-col bg-[var(--home-bg,#0c0c11)]">
      <HomeTopNav />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <Suspense fallback={<RouteLoading compact />}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  )
}
