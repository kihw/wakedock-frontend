import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ReactQueryProvider } from '@/lib/providers/react-query-provider';
import { ToastContainer } from '@/components/ui/toast-container';
import { Suspense } from 'react';
import { ErrorBoundary } from '@/components/error-boundary';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Optimisations Next.js 14+ pour v0.6.4
const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Optimise le chargement des fonts
  variable: '--font-inter', // CSS custom property
  preload: true
});

export const metadata: Metadata = {
  metadataBase: new URL('https://wakedock.com'),
  title: 'WakeDock - Docker Container Management',
  description: 'Modern Docker container management platform with real-time monitoring',
  keywords: ['docker', 'containers', 'management', 'monitoring', 'devops'],
  authors: [{ name: 'WakeDock Team', url: 'https://wakedock.com' }],
  creator: 'WakeDock Team',
  publisher: 'WakeDock',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/logo.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://wakedock.com',
    title: 'WakeDock - Docker Container Management',
    description: 'Modern Docker container management platform with real-time monitoring',
    siteName: 'WakeDock',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'WakeDock Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WakeDock - Docker Container Management',
    description: 'Modern Docker container management platform with real-time monitoring',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className={`${inter.className} bg-app full-height antialiased`} suppressHydrationWarning>
        <ErrorBoundary>
          <ReactQueryProvider>
            <Suspense fallback={<LoadingSpinner size="xl" text="Loading WakeDock..." />}>
              <div id="root" className="app-container">
                {children}
              </div>
            </Suspense>
            <ToastContainer />
          </ReactQueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}