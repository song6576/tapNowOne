import { Outlet } from 'react-router-dom'
import { HomeTopNav } from '../components/home/HomeTopNav'

/** TapNowOne 主应用壳：顶部导航 + 内容区 */
export function AppLayout() {
  return (
    <div className="relative flex h-full flex-col bg-black">
      <HomeTopNav />
      <div className="flex flex-1 flex-col overflow-hidden pt-[var(--tn-topbar-h)]">
        <Outlet />
      </div>
    </div>
  )
}
