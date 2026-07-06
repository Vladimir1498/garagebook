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
      <div className="flex flex-1 flex-col overflow-hidden relative z-0">
        <Header />
        <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 pb-20 lg:pb-8">
          <div className="mx-auto max-w-6xl page-enter">
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
