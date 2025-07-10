'use client'

import { Poppins } from 'next/font/google'
import './globals.css'
import { useEffect } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { useAuthStore } from '@/stores/auth.store'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const hydrateAuth = useAuthStore((state) => state.hydrateAuth)

  useEffect(() => {
    hydrateAuth()
  }, [hydrateAuth])

  if (!googleClientId) {
    console.error(
      'Falta el ID de cliente de Google. Añade NEXT_PUBLIC_GOOGLE_CLIENT_ID a tu .env.local'
    )
    return (
      <html lang="es">
        <body className={`${poppins.className} flex flex-col min-h-screen`}>
          {children}
        </body>
      </html>
    )
  }

  return (
    <html lang="es">
      <body className={`${poppins.className} flex flex-col min-h-screen`}>
        <GoogleOAuthProvider clientId={googleClientId}>
          {children}
        </GoogleOAuthProvider>
      </body>
    </html>
  )
}
