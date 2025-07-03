"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from 'next/navigation';
import { Disponibilidad, ReservaTutoriaRequest } from "@/models/sesion.models";
import { getDisponibilidadTutor, reservarTutoria } from "@/services/sesion.service";

export function ReservaTutoria({ tutorId, tarifaHora }: { tutorId: number, tarifaHora: number }) {
  const router = useRouter();
  const [disponibilidad, setDisponibilidad] = useState<Disponibilidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlock, setSelectedBlock] = useState<Disponibilidad | null>(null);
  const [horaInicio, setHoraInicio] = useState('');
  const [duracion, setDuracion] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isReserving, setIsReserving] = useState(false);

  useEffect(() => {
    getDisponibilidadTutor(tutorId)
      .then(data => setDisponibilidad(data))
      .catch((err) => setError(err.message || "No se pudo cargar la disponibilidad. Intenta recargar."))
      .finally(() => setLoading(false));
  }, [tutorId]);

  const opcionesHoraInicio = useMemo(() => {
    if (!selectedBlock) return [];
    
    const opciones = [];
    let horaActual = new Date(selectedBlock.horaInicial);
    const horaFinalBloque = new Date(selectedBlock.horaFinal);

    while (horaActual < horaFinalBloque) {
      opciones.push(horaActual.toTimeString().split(' ')[0]);
      horaActual.setHours(horaActual.getHours() + 1);
    }
    return opciones;
  }, [selectedBlock]);

  const precioTotal = useMemo(() => {
    return (tarifaHora || 0) * duracion;
  }, [tarifaHora, duracion]);

  const handleBlockSelect = (block: Disponibilidad) => {
    setSelectedBlock(block);
    setHoraInicio('');
    setDuracion(1);
    setError(null);
  };

  const handleReserve = async () => {
    if (!selectedBlock || !horaInicio) {
        setError("Por favor, selecciona una hora de inicio.");
        return;
    }
    setIsReserving(true);
    setError(null);

    const fecha = selectedBlock.fecha;
    const horaFinal = new Date(fecha + 'T' + horaInicio);
    horaFinal.setHours(horaFinal.getHours() + duracion);

    const reservaData: ReservaTutoriaRequest = {
      tutorId,
      fecha: fecha,
      horaInicio: horaInicio,
      horaFinal: horaFinal.toTimeString().split(' ')[0],
    };

    try {
      const sesionCreada = await reservarTutoria(reservaData);
      router.push(`/checkout/${sesionCreada.id}`);
    } catch (err: any) {
      setError(err.message);
      setIsReserving(false);
    } 
  };
  
  const formatDate = (dateString: string) => new Date(dateString + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  const formatTime = (dateTimeString: string) => new Date(dateTimeString).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="mt-10 bg-slate-50 p-6 rounded-lg border">
      <h2 className="text-2xl font-bold text-gray-800 border-b pb-3 mb-6">Reserva tu Tutoría</h2>

      {loading && <p>Cargando disponibilidad...</p>}
      
      <div className="space-y-3">
        <p className="font-semibold text-gray-700">1. Elige un día disponible:</p>
        {disponibilidad.length > 0 ? (
          disponibilidad.map(block => (
            <div key={block.id} 
                onClick={() => handleBlockSelect(block)}
                className={`p-4 border rounded-lg transition-all ${selectedBlock?.id === block.id ? 'bg-blue-600 text-white shadow-lg scale-105' : 'bg-white hover:bg-blue-50 cursor-pointer'}`}>
              <p className="font-bold">{formatDate(block.fecha)}</p>
              <p className="text-sm">Disponible de {formatTime(block.horaInicial)} a {formatTime(block.horaFinal)}</p>
            </div>
          ))
        ) : (
          !loading && <p className="text-gray-500 text-sm p-4 bg-gray-100 rounded-md">Este tutor no tiene horarios disponibles por el momento.</p>
        )}
      </div>

      {selectedBlock && (
        <div className="mt-8 pt-6 border-t animate-fadeIn">
          <p className="font-semibold text-gray-700 mb-4">2. Configura tu sesión para el {formatDate(selectedBlock.fecha)}:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-white p-4 rounded-lg shadow-inner">
            <div>
              <label htmlFor="horaInicio" className="block text-sm font-medium text-gray-700">Hora de inicio</label>
              <select id="horaInicio" value={horaInicio} onChange={e => setHoraInicio(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                <option value="" disabled>Selecciona una hora</option>
                {opcionesHoraInicio.map(hora => <option key={hora} value={hora}>{hora}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="duracion" className="block text-sm font-medium text-gray-700">Duración</label>
              <div className="flex items-center gap-2 mt-1">
                <button onClick={() => setDuracion(d => Math.max(1, d - 1))} className="px-3 py-1 border rounded-md">-</button>
                <span className="font-bold w-12 text-center">{duracion} {duracion > 1 ? 'horas' : 'hora'}</span>
                <button onClick={() => setDuracion(d => d + 1)} className="px-3 py-1 border rounded-md">+</button>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
            <p className="font-semibold text-gray-800">Resumen de tu reserva:</p>
            <p className="text-gray-700">Costo total estimado: <span className="font-bold text-lg">S/ {precioTotal.toFixed(2)}</span></p>

            <div className="min-h-[3rem] mt-4">
              {error && <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>}
            </div>

            <button onClick={handleReserve} disabled={isReserving || !horaInicio}
                    className="mt-2 w-full bg-green-600 text-white font-bold py-3 px-10 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
              {isReserving ? 'Procesando...' : 'Ir a Pagar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}