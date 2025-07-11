// src/app/(platform)/eliminar-cuenta/page.tsx
"use client";

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { deleteUserProfile } from '@/services/user.service';
import { deleteCookie } from 'cookies-next';
import Link from 'next/link';

export default function DeleteAccountPage() {
  const [password, setPassword] = useState(''); // Si el backend requiriera contraseña
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  // Función para abrir un modal de confirmación
  const handleConfirmClick = () => {
    // Usaremos el confirm nativo del navegador para simplicidad.
    // En una app real, usarías un componente modal (ej. de Shadcn/UI o Radix).
    const isConfirmed = window.confirm(
      "¿Estás absolutamente seguro?\n\nEsta acción es irreversible y eliminará todos tus datos de forma permanente."
    );

    if (isConfirmed) {
      handleDelete();
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      await deleteUserProfile(); // Llamada a la API
      
      // HU6 Escenario 1: Eliminación exitosa
      logout(); // Limpia el store de Zustand
      deleteCookie('token', { path: '/' }); // Elimina la cookie de autenticación
      
      // Redirige al login con un mensaje de éxito.
      // Usamos query params para pasar el mensaje a la página de login.
      router.push('/login?message=Tu cuenta ha sido eliminada exitosamente.');

    } catch (err: any) {
      // HU6 Escenario 2: Eliminación fallida
      setError(err.message || "No se pudo eliminar tu cuenta. Intenta nuevamente más tarde.");
      setLoading(false);
    }
    // No usamos finally porque en caso de éxito, el usuario es redirigido.
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Columna de Navegación */}
      <div className="md:col-span-1">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Configuración de Cuenta</h2>
          <nav className="flex flex-col space-y-2">
            <Link href="/perfil" className="text-gray-600 hover:bg-gray-100 p-2 rounded">Editar Perfil</Link>
            <Link href="/cambiar-contrasena" className="text-gray-600 hover:bg-gray-100 p-2 rounded">Cambiar Contraseña</Link>
            <Link href="/eliminar-cuenta" className="text-red-600 font-bold bg-red-50 p-2 rounded">Eliminar Cuenta</Link>
          </nav>
        </div>
      </div>

      {/* Columna Principal */}
      <div className="md:col-span-2">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
          <h1 className="text-2xl font-bold text-red-700 mb-4">Eliminar Cuenta</h1>
          
          <div className="space-y-4 text-gray-700">
            <p className="font-semibold">¡Atención! Esta acción es definitiva.</p>
            <p>
              Cuando elimines tu cuenta, toda tu información, incluyendo tu perfil, historial de tutorías, y cualquier otro dato asociado, será borrado permanentemente de nuestros sistemas.
            </p>
            <p>
              Esta acción no se puede deshacer. Si estás seguro de que deseas continuar, haz clic en el botón de abajo.
            </p>
          </div>
          
          <div className="mt-6">
            {/* Si necesitaras pedir la contraseña, la añadirías aquí */}
            {/* <div>
              <label htmlFor="password">Para confirmar, ingresa tu contraseña:</label>
              <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div> */}
          </div>

          {error && 
            <div className="p-3 my-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
              {error}
            </div>
          }

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleConfirmClick}
              disabled={loading}
              className="inline-flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-70"
            >
              {loading ? 'Eliminando...' : 'Eliminar mi cuenta permanentemente'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}