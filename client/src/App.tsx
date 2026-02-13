import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AppShell } from '@/components/AppShell'
import { ChatPanel } from '@/components/ChatPanel'
import { ResultsDrawer } from '@/components/ResultsDrawer'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
})

export function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppShell>
          <ChatPanel />
        </AppShell>
        <ResultsDrawer />
        <Toaster />
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
