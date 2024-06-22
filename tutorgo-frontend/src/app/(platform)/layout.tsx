// src/app/(platform)/layout.tsx
import { Navbar } from "@/components/shared/Navbar"; // Ajusta la ruta si es necesario
import { Footer } from "@/components/shared/Footer"; // Ajusta la ruta si es necesario

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100"> {/* Fondo ligeramente diferente para la plataforma */}
      <Navbar isLoggedIn={true} /> {/* Indicamos que el usuario está logueado */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}