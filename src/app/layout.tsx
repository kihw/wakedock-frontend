import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ReactQueryProvider } from '@/lib/providers/react-query-provider';
import { ToastContainer } from '@/components/ui/toast-container';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'WakeDock - Docker Container Management',
  description: 'Modern Docker container management platform with real-time monitoring',
  keywords: ['docker', 'containers', 'management', 'monitoring', 'devops'],
  authors: [{ name: 'WakeDock Team', url: 'https://wakedock.com' }],
  creator: 'WakeDock Team',
  publisher: 'WakeDock',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ReactQueryProvider>
          <div id="root">
            {children}
          </div>
          <ToastContainer />
        </ReactQueryProvider>
      </body>
    </html>
  );
}