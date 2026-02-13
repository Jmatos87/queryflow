import { Menu, Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/stores/uiStore'

export function Header() {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center gap-3 px-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={toggleSidebar}
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <img src="/queryflow-logo.svg" alt="QueryFlow" className="h-8 w-8" />
          <h1 className="text-lg font-semibold">QueryFlow</h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto cursor-pointer"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
        >
          <Sun className="h-5 w-5 hidden dark:block" />
          <Moon className="h-5 w-5 block dark:hidden" />
        </Button>
      </div>
    </header>
  )
}
