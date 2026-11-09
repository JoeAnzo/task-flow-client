import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {BrowserRouter} from 'react-router-dom'
import { QueryClient,QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './features/auth/context/AuthContext'


const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false}/>
    </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
