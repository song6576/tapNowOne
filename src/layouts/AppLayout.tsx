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
    <div className="relative flex h-full flex-col bg-black">
      <HomeTopNav />
      <div className="flex flex-1 flex-col overflow-hidden pt-[var(--tn-topbar-h)]">
        <Suspense fallback={<RouteLoading compact />}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  )
}
