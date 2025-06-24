// src/app/(platform)/mis-clases/page.tsx
"use client";

import { useEffect, useState, FormEvent, useCallback } from 'react';
import { SesionResponse } from '@/models/sesion.models';
import { EnlaceSesionRequest, EnlaceSesionResponse } from '@/models/enlace.models';
import { getMisClases} from '@/services/tutor.clases.service';
import { addEnlaces, deleteEnlace } from '@/services/enlace.service'; // Importa los servicios de enlace
import { useAuthStore } from '@/stores/auth.store';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink, faTrash, faPlus, faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';

// Componente para el Modal/Formulario de gestión de enlaces
const GestionarEnlaces = ({ sesion, onClose, onUpdate }: { sesion: SesionResponse, onClose: () => void, onUpdate: () => void }) => {
    const [enlaces, setEnlaces] = useState<EnlaceSesionResponse[]>(sesion.enlaces || []);
    const [nombre, setNombre] = useState('');
    const [enlace, setEnlace] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setEnlaces(sesion.enlaces || []);
    }, [sesion.enlaces]);

    const handleAddEnlace = async (e: FormEvent) => {
        e.preventDefault();
        if (!nombre.trim() || !enlace.trim()) {
            setError("Ambos campos son obligatorios.");
            return;
        }
        setIsSubmitting(true);
        setError(null);
        
        const nuevoEnlace: EnlaceSesionRequest = { nombre, enlace };

        try {
            await addEnlaces(sesion.id, [{ nombre, enlace }]);
            setNombre('');
            setEnlace('');
            onUpdate(); // Llama a la función del padre para refrescar la lista completa
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDeleteEnlace = async (enlaceId: number) => {
        if (!window.confirm("¿Estás seguro de eliminar este enlace?")) return;
        try {
            await deleteEnlace(sesion.id, enlaceId);
            onUpdate();
        } catch (err: any) {
            alert(err.message);
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg relative animate-fadeIn">
                <button onClick={onClose} className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-800">
                    <FontAwesomeIcon icon={faTimes} />
                </button>
                <h3 className="text-xl font-bold mb-4">Gestionar Enlaces para la sesión con {sesion.nombreEstudiante}</h3>
                
                {/* Lista de enlaces existentes */}
                <div className="space-y-2 mb-6 max-h-48 overflow-y-auto p-2 border rounded-md bg-gray-50">
                    {enlaces.length > 0 ? enlaces.map(link => (
                        <div key={link.id} className="flex justify-between items-center bg-white p-2 rounded shadow-sm">
                            <a href={link.enlace} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate" title={link.enlace}>{link.nombre}</a>
                            <button onClick={() => handleDeleteEnlace(link.id)} className="text-red-500 hover:text-red-700 ml-4 p-1 rounded-full hover:bg-red-100" title="Eliminar enlace">
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                        </div>
                    )) : <p className="text-gray-500 text-sm text-center">No hay enlaces añadidos.</p>}
                </div>

                {/* Formulario para añadir nuevo enlace */}
                {enlaces.length < 5 && (
                    <form onSubmit={handleAddEnlace} className="space-y-3 border-t pt-4">
                        <h4 className="font-semibold text-gray-800">Añadir Nuevo Enlace</h4>
                        <div>
                            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre del Enlace</label>
                            <input type="text" id="nombre" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Material de Clase" className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"/>
                        </div>
                        <div>
                            <label htmlFor="enlace" className="block text-sm font-medium text-gray-700">URL del Enlace</label>
                            <input type="url" id="enlace" value={enlace} onChange={e => setEnlace(e.target.value)} placeholder="https://..." className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"/>
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <button type="submit" disabled={isSubmitting || !nombre || !enlace} className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2">
                            {isSubmitting ? <FontAwesomeIcon icon={faSpinner} spin/> : <FontAwesomeIcon icon={faPlus} />}
                            <span>Añadir Enlace</span>
                        </button>
                    </form>
                )}
                 {enlaces.length >= 5 && <p className="text-center text-sm text-gray-500 mt-4">Has alcanzado el límite de 5 enlaces.</p>}
            </div>
        </div>
    );
};


export default function MisClasesPage() {
    const user = useAuthStore((state) => state.user);
    const [sesiones, setSesiones] = useState<(SesionResponse & { enlaces?: EnlaceSesionResponse[] })[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSesion, setSelectedSesion] = useState<SesionResponse & { enlaces?: EnlaceSesionResponse[] } | null>(null);

    const fetchClases = useCallback(() => {
        setLoading(true);
        getMisClases()
            .then(data => {
                const sortedData = data.sort((a, b) => new Date(a.horaInicial).getTime() - new Date(b.horaInicial).getTime());
                setSesiones(sortedData);
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchClases();
    }, [fetchClases]);
    
    if (user && user.rol !== 'TUTOR') {
        return <div className="text-center p-8"><h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1><p className="text-gray-600 mt-2">Esta página es solo para tutores.</p></div>;
    }
    
    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Mis Clases Programadas</h1>
            
            {loading && <p>Cargando clases...</p>}

            <div className="space-y-4">
                {sesiones.filter(s => s.tipoEstado === 'CONFIRMADO').map(sesion => (
                    <div key={sesion.id} className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
                        <div>
                            <p className="font-bold">Clase con {sesion.nombreEstudiante}</p>
                            <p className="text-sm text-gray-600">{new Date(sesion.horaInicial).toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' })}</p>
                        </div>
                        <button onClick={() => setSelectedSesion(sesion)} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                            <FontAwesomeIcon icon={faLink} /> Gestionar Enlaces
                        </button>
                    </div>
                ))}
                {!loading && sesiones.filter(s => s.tipoEstado === 'CONFIRMADO').length === 0 && (
                    <p className="text-center text-gray-500 p-8">No tienes clases confirmadas.</p>
                )}
            </div>

            {selectedSesion && (
                <GestionarEnlaces 
                    sesion={selectedSesion} 
                    onClose={() => setSelectedSesion(null)}
                    onUpdate={() => {
                        fetchClases(); // Refresca toda la lista para obtener los nuevos enlaces
                        setSelectedSesion(null);
                    }} 
                />
            )}
        </div>
    );
}