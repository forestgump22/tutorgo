// src/app/(platform)/perfil/page.tsx
"use client";

import { useState, useEffect, FormEvent } from 'react';
import { useAuthStore } from '@/stores/auth.store'; // Corregido el import
import { UpdateUserProfileRequest } from '@/models/auth.models';
import { updateUserProfile } from '@/services/user.service';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, updateUser, isLoading } = useAuthStore((state) => ({
    user: state.user,
    updateUser: state.updateUser,
    isLoading: state.isLoading,
  }));

  const [nombre, setNombre] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Cuando el usuario del store se cargue, llena el formulario
  useEffect(() => {
    if (user) {
      setNombre(user.nombre);
      setFotoUrl(user.fotoUrl || '');
    }
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    // HU4 Escenario 2: Campos inválidos o vacíos
    if (!nombre.trim()) {
      setError("El nombre no puede estar vacío.");
      setLoading(false);
      return;
    }

    const profileData: UpdateUserProfileRequest = { nombre, fotoUrl };

    try {
      const updatedUser = await updateUserProfile(profileData);
      // HU4 Escenario 1: Perfil Actualizado con Éxito
      updateUser(updatedUser); // Actualiza el estado global en Zustand
      setSuccessMessage("Perfil actualizado correctamente.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center p-8">Cargando perfil...</div>;
  }

  if (!user) {
    return <div className="text-center p-8">No se pudo cargar la información del perfil.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Columna de Navegación */}
      <div className="md:col-span-1">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Configuración de Cuenta</h2>
          <nav className="flex flex-col space-y-2">
            <Link href="/perfil" className="text-blue-600 font-bold bg-blue-50 p-2 rounded">Editar Perfil</Link>
            {/* ***** ENLACE AÑADIDO ***** */}
            <Link href="/metodos-pago" className="text-gray-600 hover:bg-gray-100 p-2 rounded">Métodos de Pago</Link>
            <Link href="/cambiar-contrasena" className="text-gray-600 hover:bg-gray-100 p-2 rounded">Cambiar Contraseña</Link>
            <Link href="/eliminar-cuenta" className="text-red-600 hover:bg-red-50 p-2 rounded">Eliminar Cuenta</Link>
          </nav>
        </div>
      </div>

      {/* Columna Principal con el Formulario */}
      <div className="md:col-span-2">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Editar Perfil</h1>
          
          <div className="min-h-[3rem] mb-4">
            {successMessage && <div className="p-3 text-sm text-green-700 bg-green-100 rounded-lg">{successMessage}</div>}
            {error && <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center space-x-4">
              <img
                src={fotoUrl || `https://ui-avatars.com/api/?name=${nombre}&background=0D8ABC&color=fff&size=96`}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover"
              />
              <div className="flex-grow">
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                <input
                  type="text" id="nombre" name="nombre" value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label htmlFor="fotoUrl" className="block text-sm font-medium text-gray-700">URL de la Foto de Perfil</label>
              <input
                type="url" id="fotoUrl" name="fotoUrl" value={fotoUrl}
                onChange={(e) => setFotoUrl(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                <input
                    type="email" id="email" name="email" value={user.email}
                    disabled
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
                />
                 <p className="mt-1 text-xs text-gray-500">El correo electrónico no se puede cambiar.</p>
            </div>
            <div className="flex justify-end">
              <button
                type="submit" disabled={loading}
                className="inline-flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70"
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}