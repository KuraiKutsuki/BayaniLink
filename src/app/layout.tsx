import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import QuickDial from '@/components/QuickDial'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'BayaniLink — Ligao City Emergency Reporting',
  description: 'Report emergencies in Ligao City, Albay. Fast, easy, and direct to CDRRMO.',
  keywords: ['Ligao City', 'emergency', 'report', 'CDRRMO', 'Albay', 'Philippines'],
  icons: {
    icon: '/BayaniLink.png',
    apple: '/BayaniLink.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="bg-gray-50 dark:bg-gray-950 font-sans antialiased min-h-screen flex flex-col justify-between transition-colors duration-300">
        <ThemeProvider>
          <div className="flex-1 flex flex-col">
            <Navigation />
            <main className="flex-1">
              {children}
            </main>
          </div>
          <Footer />
          <QuickDial />
        </ThemeProvider>
      </body>
    </html>
  )
}
