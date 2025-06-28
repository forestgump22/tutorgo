// src/app/layout.tsx
"use client"; // El RootLayout que usa hooks DEBE ser un client component

import { Poppins } from "next/font/google";
import "./globals.css";
import { useAuthStore } from "@/stores/auth.store"; // Ajusta la ruta si es necesario
import { useEffect } from "react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const hydrateAuth = useAuthStore((state) => state.hydrateAuth);

  useEffect(() => {
    hydrateAuth();
  }, [hydrateAuth]);

  return (
    <html lang="es">
      <body className={`${poppins.className} flex flex-col min-h-screen`}>
        {children}
      </body>
    </html>
  );
}