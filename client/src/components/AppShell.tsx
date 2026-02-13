import type { ReactNode } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MobileNav />
      <div className="flex">
        <aside className="hidden md:block w-72 shrink-0 border-r border-border h-[calc(100dvh-3.5rem)] sticky top-14">
          <Sidebar />
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}
