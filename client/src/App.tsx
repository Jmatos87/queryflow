import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AppShell } from '@/components/AppShell'
import { FileUpload } from '@/components/FileUpload'
import { ChatPanel } from '@/components/ChatPanel'
import { ResultsDrawer } from '@/components/ResultsDrawer'
import { useDatasetStore } from '@/stores/datasetStore'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
})

function MainContent() {
  const activeDataset = useDatasetStore((s) => s.activeDataset)

  return activeDataset ? (
    <ChatPanel />
  ) : (
    <div className="flex flex-col items-center justify-center py-12 sm:py-20 p-4 sm:p-6">
      <h2 className="mb-2 text-2xl font-semibold">Welcome to QueryFlow</h2>
      <p className="mb-8 text-muted-foreground text-center max-w-md">
        Upload a CSV, JSON, or SQL file and ask questions about your data in
        plain English.
      </p>
      <FileUpload />
    </div>
  )
}

export function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppShell>
          <MainContent />
        </AppShell>
        <ResultsDrawer />
        <Toaster />
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
