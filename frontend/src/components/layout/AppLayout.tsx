import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'
import Header from './Header'
import MobileInstallBanner from '../pwa/MobileInstallBanner'
import PushPermissionPrompt from '../pwa/PushPermissionPrompt'
import CommandPalette from '../ui/CommandPalette'
import OfflineBanner from '../pwa/OfflineBanner'

export default function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-surface-50 dark:bg-surface-950">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 pb-20 md:p-8 md:pb-8">
          <div className="mx-auto max-w-7xl page-enter">
            <Outlet />
          </div>
        </main>
      </div>
      <MobileNav />
      <MobileInstallBanner />
      <PushPermissionPrompt />
      <CommandPalette />
      <OfflineBanner />
    </div>
  )
}
