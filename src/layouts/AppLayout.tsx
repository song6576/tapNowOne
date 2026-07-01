import { Outlet } from 'react-router-dom'
import { AppSidebar } from '../components/shell/AppSidebar'

/** TapNow 主应用壳：Home / TapTV / Projects 等页面共用 */
export function AppLayout() {
  return (
    <div className="flex h-full">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Outlet />
      </div>
    </div>
  )
}
