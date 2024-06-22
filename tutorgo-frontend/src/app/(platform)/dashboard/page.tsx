// src/app/(platform)/dashboard/page.tsx
"use client";

import { useAuthStore } from "@/stores/auth.store";
import Link from 'next/link'; // Importar Link para una mejor navegación

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);

  if (isLoading && !user) {
    return <p>Cargando información del usuario...</p>; 
  }

  if (!user) {
    return <p>No se pudo cargar la información del usuario.</p>; 
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
        ¡Bienvenido al Dashboard, {user.nombre}!
      </h1>
      <p className="text-gray-600 mb-6">
        Este es tu panel de control personalizado en TutorGo.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">Tu Información</h2>
          <dl className="space-y-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Nombre:</dt>
              <dd className="text-gray-900">{user.nombre}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Correo:</dt>
              <dd className="text-gray-900">{user.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Rol:</dt>
              <dd className="text-gray-900 capitalize">{user.rol.toLowerCase()}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">Acciones Rápidas</h2>
          {user.rol === 'TUTOR' ? (
            <ul className="list-disc list-inside space-y-2 text-blue-600">
              <li><Link href="/mi-disponibilidad" className="hover:underline">Gestionar mi disponibilidad</Link></li>
              <li><Link href="/mis-clases" className="hover:underline">Ver mis clases programadas</Link></li>
              {/* ***** ENLACE AÑADIDO PARA EL TUTOR ***** */}
              <li><Link href="/historial-pagos" className="hover:underline">Ver mi historial de transacciones</Link></li>
            </ul>
          ) : ( // ESTUDIANTE
            <ul className="list-disc list-inside space-y-2 text-blue-600">
              <li><Link href="/buscar-tutores" className="hover:underline">Buscar un nuevo tutor</Link></li>
              <li><Link href="/mis-tutorias" className="hover:underline">Ver mis tutorías agendadas</Link></li>
              <li><Link href="/historial-pagos" className="hover:underline">Ver mi historial de pagos</Link></li>
            </ul>
          )}
        </div>
      </div>

      {/* Para depuración */}
      <div className="mt-10 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold text-gray-700">Datos del Store (para depuración):</h3>
        <pre className="mt-2 text-xs bg-gray-800 text-white p-4 rounded overflow-x-auto">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
    </div>
  );
}