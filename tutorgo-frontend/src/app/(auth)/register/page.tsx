"use client";

import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerUser } from '@/services/auth.service';
import { RegisterRequest, RoleName } from '@/models/auth.models';
import { CentroEstudio } from '@/models/centroEstudio';
import { getAllCentrosEstudio } from '@/services/centroEstudio.service';

export default function RegisterPage() {
  const [formData, setFormData] = useState<RegisterRequest>({
    nombre: '',
    email: '',
    password: '',
    rol: 'ESTUDIANTE',
    centroEstudioId: undefined,
    tarifaHora: undefined,
    rubro: '',
    bio: '',
    fotoUrl: '',
  });

  const [centrosEstudio, setCentrosEstudio] = useState<CentroEstudio[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchCentros = async () => {
      try {
        const data = await getAllCentrosEstudio();
        setCentrosEstudio(data);
      } catch (err) {
        setError("No se pudieron cargar los centros de estudio. Intenta recargar la página.");
      }
    };
    fetchCentros();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'tarifaHora' || name === 'centroEstudioId')
              ? (value === '' ? undefined : Number(value))
              : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (!formData.nombre.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError("Debe llenar todos los campos obligatorios (nombre, email, contraseña, rol).");
      setLoading(false);
      return;
    }
    if (formData.rol === 'TUTOR' && (!formData.tarifaHora || !formData.rubro?.trim())) {
      setError("Para tutores, la tarifa por hora y el rubro son obligatorios.");
      setLoading(false);
      return;
    }
    if (formData.rol === 'ESTUDIANTE' && !formData.centroEstudioId) {
      setError("Para estudiantes, seleccionar un centro de estudio es obligatorio.");
      setLoading(false);
      return;
    }

    try {
      const response = await registerUser(formData);
      setSuccessMessage(response.message || "¡Registro exitoso! Ahora puedes iniciar sesión.");
      
      setTimeout(() => {
        router.push('/login');
      }, 2500);

    } catch (err: any) {
      setError(err.message || "Ocurrió un error durante el registro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 py-12 px-4">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-xl shadow-xl">
        <h2 className="text-3xl font-extrabold text-center text-gray-900">
          Crear Cuenta en TutorGo
        </h2>
        
        {/* Contenedor de Mensajes */}
        <div className="min-h-[4rem]">
          {successMessage && (
            <div className="p-3 my-2 text-sm text-green-700 bg-green-100 rounded-lg animate-fadeIn" role="alert">
              {successMessage}
            </div>
          )}
          {error && (
            <div className="p-3 my-2 text-sm text-red-700 bg-red-100 rounded-lg animate-fadeIn" role="alert">
              {error}
            </div>
          )}
        </div>
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre Completo *</label>
            <input id="nombre" name="nombre" type="text" required value={formData.nombre} onChange={handleChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo Electrónico *</label>
            <input id="email" name="email" type="email" required value={formData.email} onChange={handleChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña *</label>
            <input id="password" name="password" type="password" required value={formData.password} onChange={handleChange}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
             <p className="mt-1 text-xs text-gray-500">Mínimo 8 caracteres.</p>
          </div>
          <div>
            <label htmlFor="rol" className="block text-sm font-medium text-gray-700">Quiero registrarme como *</label>
            <select id="rol" name="rol" value={formData.rol} onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
              <option value="ESTUDIANTE">Estudiante</option>
              <option value="TUTOR">Tutor</option>
            </select>
          </div>

          {formData.rol === 'ESTUDIANTE' && (
            <div className="animate-fadeIn">
              <label htmlFor="centroEstudioId" className="block text-sm font-medium text-gray-700">Centro de Estudio *</label>
              <select 
                id="centroEstudioId" 
                name="centroEstudioId" 
                value={formData.centroEstudioId || ''} 
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="" disabled>Selecciona tu centro de estudio</option>
                {centrosEstudio.map(centro => (
                  <option key={centro.id} value={centro.id}>
                    {centro.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

          {formData.rol === 'TUTOR' && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label htmlFor="tarifaHora" className="block text-sm font-medium text-gray-700">Tarifa por Hora (S/) *</label>
                <input id="tarifaHora" name="tarifaHora" type="number" min="0" step="1" value={formData.tarifaHora || ''} onChange={handleChange}
                       className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="rubro" className="block text-sm font-medium text-gray-700">Rubro o Especialidad Principal *</label>
                <input id="rubro" name="rubro" type="text" value={formData.rubro} onChange={handleChange}
                       className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Biografía Corta (opcional)</label>
                <textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} rows={3}
                       className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
            </div>
          )}
           <div>
              <label htmlFor="fotoUrl" className="block text-sm font-medium text-gray-700">URL de Foto de Perfil (opcional)</label>
              <input id="fotoUrl" name="fotoUrl" type="url" placeholder="https://ejemplo.com/imagen.png" value={formData.fotoUrl} onChange={handleChange}
                     className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>

          <div>
            <button
              type="submit" disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Registrando...' : 'Crear Cuenta'}
            </button>
          </div>
        </form>
        <p className="text-sm text-center text-gray-600">
          ¿Ya tienes una cuenta?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}