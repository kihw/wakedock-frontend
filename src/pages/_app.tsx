/**
 * Application principale Next.js 14+ SPA
 * Architecture SPA moderne avec hooks et composants optimisés
 */

import React from 'react'
import type { AppProps } from 'next/app'
import { AppWrapper } from '@/components/AppWrapper'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import '../styles/globals.css'

// Configuration React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (was cacheTime in v4)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <QueryClientProvider client={queryClient}>
            <AppWrapper>
                <Component {...pageProps} />
            </AppWrapper>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    )
}

export default MyApp
