import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'

export const metadata: Metadata = {
  title: 'KRONOSPLAN',
  description: 'Al tempo giusto. Il contenuto giusto.',
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
  manifest: '/manifest.json',
  themeColor: '#1a365d',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'KRONOSPLAN',
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon-120x120.png?v=2', sizes: '120x120', type: 'image/png' },
      { url: '/apple-touch-icon-152x152.png?v=2', sizes: '152x152', type: 'image/png' },
      { url: '/apple-touch-icon-167x167.png?v=2', sizes: '167x167', type: 'image/png' },
      { url: '/apple-touch-icon-180x180.png?v=2', sizes: '180x180', type: 'image/png' },
      { url: '/apple-touch-icon.png?v=2', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it">
      <body>
        <Header />
        {children}
      </body>
    </html>
  )
}
