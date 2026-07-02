import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { HomeTopNav } from '../components/home/HomeTopNav'
import { UserMenuPanel } from '../components/home/UserMenuPanel'

/** TapNow 主应用壳：顶部导航 + 内容区 */
export function AppLayout() {
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  return (
    <div className="relative flex h-full flex-col bg-black">
      <HomeTopNav
        userMenuOpen={userMenuOpen}
        onUserMenuToggle={() => setUserMenuOpen((v) => !v)}
      />
      <UserMenuPanel open={userMenuOpen} onClose={() => setUserMenuOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden pt-[var(--tn-topbar-h)]">
        <Outlet />
      </div>
    </div>
  )
}
