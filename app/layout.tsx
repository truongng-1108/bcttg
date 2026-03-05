import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from "sonner"
import './globals.css'

const inter = Inter({ 
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter"
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin", "vietnamese"],
  variable: "--font-jetbrains"
});

export const metadata: Metadata = {
  title: 'Sổ Tay Điện Tử Giáo Dục Truyền Thống | Quản Trị Hệ Thống',
  description: 'Hệ thống quản trị Sổ Tay Điện Tử Giáo Dục Truyền Thống - Binh chủng Tăng Thiết Giáp - Quân đội Nhân dân Việt Nam',
  robots: 'noindex, nofollow',
    generator: 'v0.app'
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        {children}
        <Toaster richColors position="top-right" />
        <Analytics />
      </body>
    </html>
  )
}
