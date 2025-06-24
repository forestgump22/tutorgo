// src/app/(platform)/mis-tutorias/page.tsx
"use client";

import { useEffect, useState, useCallback, FormEvent } from 'react';
import { SesionResponse } from '@/models/sesion.models';
import { getMisTutorias, confirmarPago } from '@/services/sesion.service';
import { useAuthStore } from '@/stores/auth.store';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard, faSpinner, faLink, faTimes, faPencilAlt, faStar } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { ResenaRequest } from '@/models/resena.models';
import { crearResena } from '@/services/resena.service';

interface CalificarModalProps {
    sesionId: number;
    onClose: () => void;
    onResenaEnviada: (sesionId: number) => void;
}
const CalificarModal = ({ sesionId, onClose, onResenaEnviada }: CalificarModalProps) => {
    const [calificacion, setCalificacion] = useState(0);
    const [hoverCalificacion, setHoverCalificacion] = useState(0);
    const [comentario, setComentario] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (calificacion === 0) {
            setError("Debes seleccionar al menos una estrella.");
            return;
        }
        setIsSubmitting(true);
        setError(null);
        
        const resenaData: ResenaRequest = { calificacion, comentario };

        try {
            await crearResena(sesionId, resenaData);
            onResenaEnviada(sesionId);
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg relative animate-fadeIn">
                <button type="button" onClick={onClose} className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-800"><FontAwesomeIcon icon={faTimes} /></button>
                <h3 className="text-xl font-bold mb-4">Calificar Tutoría</h3>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tu calificación *</label>
                    <div className="flex items-center text-3xl text-gray-300">
                        {[1, 2, 3, 4, 5].map(star => (
                            <FontAwesomeIcon 
                                key={star} icon={faStar}
                                className={`cursor-pointer transition-colors ${(hoverCalificacion || calificacion) >= star ? 'text-yellow-400' : ''}`}
                                onMouseEnter={() => setHoverCalificacion(star)}
                                onMouseLeave={() => setHoverCalificacion(0)}
                                onClick={() => setCalificacion(star)}
                            />
                        ))}
                    </div>
                </div>
                <div className="mb-6">
                    <label htmlFor="comentario" className="block text-sm font-medium text-gray-700">Comentario (opcional)</label>
                    <textarea 
                        id="comentario" value={comentario} onChange={e => setComentario(e.target.value)}
                        rows={4} maxLength={500}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Comparte tu experiencia..."
                    />
                    <p className="text-xs text-right text-gray-500 mt-1">{comentario.length}/500</p>
                </div>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <button type="submit" disabled={isSubmitting || calificacion === 0} className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
                    {isSubmitting ? 'Enviando...' : 'Enviar Calificación'}
                </button>
            </form>
        </div>
    );
};

interface SesionCardProps {
    sesion: SesionResponse;
    onPagar: (sesionId: number) => void;
    onVerEnlaces: (sesion: SesionResponse) => void;
    onCalificar: (sesionId: number) => void;
    isPaying: boolean;
}

const SesionCard = ({ sesion, onPagar, onVerEnlaces, onCalificar, isPaying }: Omit<SesionCardProps, 'fueCalificada'>) => {
    const formatDate = (dateTimeString: string) => new Date(dateTimeString).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    const formatTime = (dateTimeString:string) => new Date(dateTimeString).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    const ahora = new Date();
    // La fecha del backend puede no tener la 'Z', así que la añadimos si es necesario para asegurar que se interprete como UTC
    const horaFinalSesion = new Date(sesion.horaFinal.endsWith('Z') ? sesion.horaFinal : sesion.horaFinal + 'Z');
    const sesionPasada = horaFinalSesion < ahora;
    
    return (
        <div className={`p-4 rounded-lg shadow-md flex flex-col sm:flex-row justify-between items-center gap-4 
            ${sesion.tipoEstado === 'PENDIENTE' ? 'bg-yellow-50 border-l-4 border-yellow-400' 
            : sesionPasada  ? 'bg-blue-50 border-l-4 border-blue-400' 
            : 'bg-green-50 border-l-4 border-green-500'}`}>
            <div>
                <p className="font-bold text-gray-800">Tutoría con {sesion.nombreTutor}</p>
                <p className="text-sm text-gray-600">{formatDate(sesion.horaInicial)}</p>
                <p className="text-sm text-gray-600">{formatTime(sesion.horaInicial)} - {formatTime(sesion.horaFinal)}</p>
            </div>
            <div className="w-full sm:w-auto flex-shrink-0">
                {sesion.tipoEstado === 'PENDIENTE' && (
                    <button onClick={() => onPagar(sesion.id)} disabled={isPaying} className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400">
                        {isPaying ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faCreditCard} />}
                        {isPaying ? 'Procesando...' : 'Pagar y Confirmar'}
                    </button>
                )}
                {sesion.tipoEstado === 'CONFIRMADO' && !sesionPasada && (
                    <button onClick={() => onVerEnlaces(sesion)} className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                        <FontAwesomeIcon icon={faLink} />
                        Ver Enlaces / Ingresar
                    </button>
                )}
                {/* ***** LÓGICA SIMPLIFICADA AQUÍ ***** */}
                {sesion.tipoEstado === 'CONFIRMADO' && sesionPasada && !sesion.fueCalificada && (
                     <button onClick={() => onCalificar(sesion.id)} className="w-full bg-yellow-500 ...">
                         <FontAwesomeIcon icon={faPencilAlt} /> Calificar Tutor
                     </button>
                )}
                 {sesion.tipoEstado === 'CONFIRMADO' && sesionPasada && sesion.fueCalificada && (
                     <span className="text-gray-500 font-semibold text-sm bg-gray-200 px-3 py-1 rounded-full">Calificada</span>
                 )}
            </div>
        </div>
    );
};


const VerEnlacesModal = ({ sesion, onClose }: { sesion: SesionResponse, onClose: () => void }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg relative animate-fadeIn">
                <button onClick={onClose} className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-800">
                    <FontAwesomeIcon icon={faTimes} />
                </button>
                <h3 className="text-xl font-bold mb-4">Materiales para la sesión con {sesion.nombreTutor}</h3>
                
                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {sesion.enlaces && sesion.enlaces.length > 0 ? (
                        sesion.enlaces.map(link => (
                            <a key={link.id} href={link.enlace} target="_blank" rel="noopener noreferrer" className="block bg-blue-50 p-3 rounded-md text-blue-700 font-semibold hover:bg-blue-100 transition-colors">
                                {link.nombre}
                            </a>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center py-4">
                            {/* HU12 Escenario 3 */}
                            El tutor aún no ha compartido el enlace o los materiales para esta sesión.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};



export default function MisTutoriasPage() {
    const user = useAuthStore((state) => state.user);
    const [sesiones, setSesiones] = useState<SesionResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [paymentStatus, setPaymentStatus] = useState<{ [key: number]: 'loading' | 'success' | 'error' }>({});
    const [paymentMessage, setPaymentMessage] = useState<string | null>(null);
    const [sesionSeleccionada, setSesionSeleccionada] = useState<SesionResponse | null>(null);
    const [sesionParaCalificar, setSesionParaCalificar] = useState<number | null>(null);
    const [sesionesCalificadas, setSesionesCalificadas] = useState<number[]>([]);

    const fetchSesiones = useCallback(() => {
        setLoading(true);
        getMisTutorias()
            .then(data => {
                const sortedData = data.sort((a, b) => new Date(b.horaInicial).getTime() - new Date(a.horaInicial).getTime());
                setSesiones(sortedData);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchSesiones();
    }, [fetchSesiones]);


    const handlePagar = async (sesionId: number) => {
        const metodoPago = 'TARJETA_CREDITO';
        
        setPaymentStatus(prev => ({ ...prev, [sesionId]: 'loading' }));
        setPaymentMessage(null);

        try {
            const message = await confirmarPago({ sesionId, metodoPago });
            setPaymentStatus(prev => ({ ...prev, [sesionId]: 'success' }));
            setPaymentMessage(message);

            setSesiones(prevSesiones => 
                prevSesiones.map(s => s.id === sesionId ? { ...s, tipoEstado: 'CONFIRMADO' } : s)
            );

        } catch (err: any) {
            setPaymentStatus(prev => ({ ...prev, [sesionId]: 'error' }));
            setPaymentMessage(err.message);
        }
    };
    
    if (user && user.rol !== 'ESTUDIANTE') {
        return (
            <div className="text-center p-8">
                <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
                <p className="text-gray-600 mt-2">Esta página es solo para estudiantes.</p>
            </div>
        );
    }
    
    const handleResenaEnviada = (sesionId: number) => {
        // Añade el ID a la lista de calificadas para actualizar la UI
        setSesionesCalificadas(prev => [...prev, sesionId]);
        alert("¡Gracias por tu calificación!"); // Mensaje simple de éxito
    };


    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Mis Tutorías</h1>
            
            <div className="min-h-[4rem]">
                {paymentMessage && (
                    <div className={`p-4 mb-4 text-sm rounded-lg ${Object.values(paymentStatus).some(s => s === 'error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {paymentMessage}
                    </div>
                )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                {loading && <p className="text-center text-gray-500 py-8">Cargando tus tutorías...</p>}
                {!loading && error && <p className="text-center text-red-600 py-8">{error}</p>}
                {!loading && !error && sesiones.length === 0 && (
                    <p className="text-center text-gray-500 p-8">Aún no has reservado ninguna tutoría.</p>
                )}

                <div className="space-y-4">
                    {sesiones.map(sesion => (
                        <SesionCard 
                            key={sesion.id} 
                            sesion={sesion} 
                            onPagar={handlePagar}
                            onVerEnlaces={setSesionSeleccionada}
                            onCalificar={setSesionParaCalificar}
                            isPaying={paymentStatus[sesion.id] === 'loading'}
                        />
                    ))}
                </div>
            </div>
            
            {sesionParaCalificar && (
                <CalificarModal 
                    sesionId={sesionParaCalificar}
                    onClose={() => setSesionParaCalificar(null)}
                    onResenaEnviada={handleResenaEnviada}
                />
            )}

            {/* Modal para Ver Enlaces (¡Esta parte podría faltar!) */}
            {sesionSeleccionada && (
                <VerEnlacesModal 
                    sesion={sesionSeleccionada}
                    onClose={() => setSesionSeleccionada(null)}
                />
            )}
        </div>
    );
}