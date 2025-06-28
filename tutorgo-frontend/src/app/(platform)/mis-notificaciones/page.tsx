"use client";

import { useEffect, useState } from 'react';
import { getMisNotificaciones } from '@/services/notificacion.service';
import { Notificacion } from '@/models/notificacion.models';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function MisNotificacionesPage() {
    const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        getMisNotificaciones()
            .then(response => {
                if (Array.isArray(response)) {
                    setNotificaciones(response);
                } else {
                    setNotificaciones([]);
                }
            })
            .catch(err => {
                setError(err.message);
                setNotificaciones([]); // También seteamos un array vacío en caso de error
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const formatRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return `hace instantes`;
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `hace ${diffInMinutes} min`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `hace ${diffInHours} h`;
        const diffInDays = Math.floor(diffInHours / 24);
        return `hace ${diffInDays} día(s)`;
    };

    const getIconForType = (tipo: Notificacion['tipo']) => {
        return faBell;
    };

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Mis Notificaciones</h1>

            {loading && (
                <div className="text-center py-10 text-gray-500">
                    <FontAwesomeIcon icon={faSpinner} spin size="2x" />
                    <p className="mt-2">Cargando notificaciones...</p>
                </div>
            )}

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
            )}

            {!loading && !error && (
                <div className="space-y-4">
                    {notificaciones.length > 0 ? (
                        notificaciones.map(n => (
                            <div key={n.id} className="bg-white p-5 rounded-lg shadow-md flex items-start gap-4">
                                <div className="flex-shrink-0 bg-blue-100 text-blue-600 rounded-full h-10 w-10 flex items-center justify-center">
                                    <FontAwesomeIcon icon={getIconForType(n.tipo)} />
                                </div>
                                <div className="flex-grow">
                                    <div className="flex justify-between items-center">
                                        <h2 className="font-semibold text-gray-800">{n.titulo}</h2>
                                        <span className="text-xs text-gray-500">
                                            {formatRelativeTime(n.fechaCreacion)}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 mt-1">{n.texto}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-16 bg-gray-50 rounded-lg">
                             <p className="text-gray-500">No tienes notificaciones nuevas.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
