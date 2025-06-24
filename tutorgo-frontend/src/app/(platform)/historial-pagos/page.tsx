// src/app/(platform)/historial-pagos/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { getHistorialPagos } from '@/services/pago.service';
import { PagoResponse } from '@/models/pago.models';
import { useAuthStore } from '@/stores/auth.store';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faReceipt, faArrowDown, faArrowUp, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

export default function HistorialPagosPage() {
    const user = useAuthStore((state) => state.user);
    const [pagos, setPagos] = useState<PagoResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        getHistorialPagos()
            .then(data => {
                // Ordenar por el ID del pago de forma descendente para mostrar el más reciente primero
                const sortedData = data.sort((a, b) => b.id - a.id);
                setPagos(sortedData);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);
    
    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Fecha no disponible';
        return new Date(dateString).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    };
    
    const formatCurrency = (amount: number) => `S/ ${amount.toFixed(2)}`;

    const getStatusClasses = (status: PagoResponse['tipoEstado']) => {
        switch (status) {
            case 'COMPLETADO': return 'bg-green-100 text-green-800';
            case 'PENDIENTE': return 'bg-yellow-100 text-yellow-800';
            case 'FALLIDO': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    
    // Vista de Carga
    if (loading) {
        return (
            <div className="text-center py-20 text-gray-500">
                <FontAwesomeIcon icon={faSpinner} spin size="3x" />
                <p className="mt-4 text-lg">Cargando historial de transacciones...</p>
            </div>
        );
    }

    // Vista de Error
    if (error) {
        return (
            <div className="text-center py-20 bg-red-50 text-red-700 rounded-lg max-w-2xl mx-auto p-8">
                 <FontAwesomeIcon icon={faExclamationTriangle} size="3x" />
                <h2 className="mt-4 text-2xl font-bold">Error al Cargar</h2>
                <p className="mt-2">{error}</p>
            </div>
        );
    }
    
    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Historial de Transacciones</h1>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Vista de Historial Vacío */}
                {pagos.length === 0 ? (
                    <div className="text-center py-16 px-6">
                        <FontAwesomeIcon icon={faReceipt} size="4x" className="text-gray-300" />
                        <h2 className="mt-4 text-xl font-semibold text-gray-700">Sin Transacciones</h2>
                        <p className="mt-2 text-gray-500">Aún no has realizado ni recibido ningún pago.</p>
                    </div>
                ) : (
                    // Vista de la Lista de Transacciones
                    <ul className="divide-y divide-gray-200">
                        {pagos.map(pago => {
                            const isGasto = user?.rol === 'ESTUDIANTE';
                            return (
                                <li key={pago.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${isGasto ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                            <FontAwesomeIcon icon={isGasto ? faArrowUp : faArrowDown} size="lg"/>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{pago.descripcion || `Sesión ID: ${pago.sesionId}`}</p>
                                            <p className="text-sm text-gray-500">
                                                {isGasto ? `Para: ${pago.nombreTutor}` : `De: ${pago.nombreEstudiante}`}
                                                <span className="mx-2">|</span>
                                                {formatDate(pago.fechaPago)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-bold text-lg ${isGasto ? 'text-red-600' : 'text-green-600'}`}>
                                            {isGasto ? '-' : '+'} {formatCurrency(pago.monto)}
                                        </p>
                                        <span className={`text-xs capitalize font-medium px-2 py-0.5 rounded-full ${getStatusClasses(pago.tipoEstado)}`}>
                                            {pago.tipoEstado.toLowerCase().replace('_', ' ')}
                                        </span>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}