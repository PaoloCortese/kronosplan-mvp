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
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
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
