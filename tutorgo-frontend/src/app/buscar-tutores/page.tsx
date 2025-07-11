// src/app/buscar-tutores/page.tsx
import { TutorClientPage } from "./TutorClientPage";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";

// Suspense Boundary para manejar el streaming y la carga
import { Suspense } from "react";

function LoadingFallback() {
    return <div className="w-full text-center py-20">Cargando...</div>;
}

export default function SearchTutorsPageWrapper() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow">
        <Suspense fallback={<LoadingFallback />}>
          <TutorClientPage />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}