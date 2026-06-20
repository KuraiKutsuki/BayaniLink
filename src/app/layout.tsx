import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Bayanilink — Ligao City Emergency Reporting',
  description: 'Report emergencies in Ligao City, Albay. Fast, easy, and direct to CDRRMO.',
  keywords: ['Ligao City', 'emergency', 'report', 'CDRRMO', 'Albay', 'Philippines'],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-gray-950 font-sans antialiased min-h-screen">
        {children}
      </body>
    </html>
  )
}
