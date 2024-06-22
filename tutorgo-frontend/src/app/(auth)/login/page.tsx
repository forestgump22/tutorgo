// src/app/(auth)/login/page.tsx
"use client";

import { useState, FormEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setCookie } from 'cookies-next';
import { useAuthStore } from '@/stores/auth.store';
import { loginUser } from '@/services/auth.service';
import { LoginRequest } from '@/models/auth.models';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // Nuevo estado para mensajes de éxito
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    // Leer el mensaje de la URL cuando el componente se carga
    const message = searchParams.get('message');
    if (message) {
      setSuccessMessage(message);
    }
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const credentials: LoginRequest = { email, password };

    try {
      const response = await loginUser(credentials);
      
      // 1. Guarda el token en una cookie (mejor para Next.js)
      setCookie('token', response.accessToken, {
        path: '/',
        maxAge: 60 * 60 * 24, // 1 día
        // secure: process.env.NODE_ENV === 'production', // Habilitar en producción
        // sameSite: 'strict',
      });

      // 2. Actualiza el estado global con la información del usuario
      setAuth(response.accessToken, response.user);

      // 3. Redirige al dashboard
      router.push('/dashboard');
      router.refresh(); // Refresca para que el middleware/layout re-evalúe

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-3xl font-extrabold text-center text-gray-900">
          Iniciar Sesión en TutorGo
        </h2>

        {/* Mostrar mensajes de éxito o error */}
        <div className="min-h-[3rem]">
          {successMessage && <div className="p-3 text-sm text-green-700 bg-green-100 rounded-lg">{successMessage}</div>}
          {error && <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>}
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Correo Electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
            >
              {loading ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>
          </div>
        </form>
        <p className="text-sm text-center text-gray-600">
          ¿No tienes una cuenta?{' '}
          <a href="/register" className="font-medium text-blue-600 hover:text-blue-500">
            Regístrate
          </a>
        </p>
      </div>
    </div>
  );
}