import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { Toaster as SonnerToaster } from 'sonner'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ErrorBoundaryTestProbe } from './components/ErrorBoundaryTestProbe'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ErrorBoundary>
          <ErrorBoundaryTestProbe />
          <App />
        </ErrorBoundary>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        {/* Most pages (Projects, Team, Services, ...) call toast() from 'sonner'; without its
            Toaster mounted, their success and error messages were never shown. */}
        <SonnerToaster position="top-right" richColors closeButton />

      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
