// src/app/(platform)/mi-disponibilidad/page.tsx
"use client";

import { useEffect, useState, FormEvent } from 'react';
import { Disponibilidad } from '@/models/sesion.models';
import { getMyDisponibilidad, addDisponibilidad, deleteDisponibilidad } from '@/services/disponibilidad.service';
import { useAuthStore } from '@/stores/auth.store';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function MiDisponibilidadPage() {
  const user = useAuthStore((state) => state.user);
  const [disponibilidades, setDisponibilidades] = useState<Disponibilidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [fecha, setFecha] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFinal, setHoraFinal] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDisponibilidades = () => {
    setLoading(true);
    getMyDisponibilidad()
      .then(data => {
        // Ordenar por fecha y hora
        const sortedData = data.sort((a, b) => new Date(a.horaInicial).getTime() - new Date(b.horaInicial).getTime());
        setDisponibilidades(sortedData);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDisponibilidades();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validación básica en el frontend
    if (new Date(`${fecha}T${horaFinal}`) <= new Date(`${fecha}T${horaInicio}`)) {
        setError("La hora de finalización debe ser posterior a la hora de inicio.");
        setIsSubmitting(false);
        return;
    }

    try {
      await addDisponibilidad({ fecha, horaInicio: `${horaInicio}:00`, horaFinal: `${horaFinal}:00` });
      fetchDisponibilidades(); // Refrescar la lista
      setFecha('');
      setHoraInicio('');
      setHoraFinal('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este horario? No podrás deshacer esta acción.")) return;
    
    try {
        await deleteDisponibilidad(id);
        setDisponibilidades(prev => prev.filter(d => d.id !== id));
    } catch (err: any) {
        alert(err.message); // Usamos un alert simple para errores de eliminación
    }
  }
  
  // Si el usuario no es un tutor, mostrar un mensaje de acceso denegado.
  if (user && user.rol !== 'TUTOR') {
      return (
          <div className="text-center p-8">
              <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
              <p className="text-gray-600 mt-2">Esta página es solo para tutores.</p>
          </div>
      );
  }
  
  const formatDate = (dateString: string) => new Date(dateString + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  const formatTime = (dateTimeString: string) => new Date(dateTimeString).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestionar mi Disponibilidad</h1>
      
      {/* Formulario para añadir nueva disponibilidad */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Añadir Nuevo Horario Disponible</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-1">
            <label htmlFor="fecha" className="block text-sm font-medium text-gray-700">Fecha</label>
            <input type="date" id="fecha" value={fecha} onChange={e => setFecha(e.target.value)} required 
                   className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"/>
          </div>
          <div className="md:col-span-1">
            <label htmlFor="horaInicio" className="block text-sm font-medium text-gray-700">Desde</label>
            <input type="time" id="horaInicio" value={horaInicio} onChange={e => setHoraInicio(e.target.value)} required 
                   className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"/>
          </div>
          <div className="md:col-span-1">
            <label htmlFor="horaFinal" className="block text-sm font-medium text-gray-700">Hasta</label>
            <input type="time" id="horaFinal" value={horaFinal} onChange={e => setHoraFinal(e.target.value)} required 
                   className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"/>
          </div>
          <button type="submit" disabled={isSubmitting} 
                  className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center">
            {isSubmitting ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Añadir Horario'}
          </button>
        </form>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      {/* Lista de disponibilidades existentes */}
      <div className="bg-white p-6 rounded-lg shadow-md">
         <h2 className="text-xl font-semibold mb-4 text-gray-700">Mis Horarios Disponibles</h2>
         {loading && <p className="text-center text-gray-500">Cargando mis horarios...</p>}
         {!loading && disponibilidades.length === 0 && <p className="text-center text-gray-500 p-4 bg-gray-50 rounded-md">No tienes horarios disponibles configurados.</p>}
         <div className="space-y-3">
             {disponibilidades.map(d => (
                 <div key={d.id} className="flex justify-between items-center p-3 border rounded-md bg-gray-50 hover:bg-gray-100">
                     <div>
                         <p className="font-semibold text-gray-800">{formatDate(d.fecha)}</p>
                         <p className="text-sm text-gray-600">{formatTime(d.horaInicial)} - {formatTime(d.horaFinal)}</p>
                     </div>
                     <button onClick={() => handleDelete(d.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors" title="Eliminar horario">
                         <FontAwesomeIcon icon={faTrash} />
                     </button>
                 </div>
             ))}
         </div>
      </div>
    </div>
  );
}