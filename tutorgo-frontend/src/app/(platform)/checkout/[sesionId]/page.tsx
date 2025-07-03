"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSesionById, confirmarPago } from '@/services/sesion.service'; // Necesitaremos estas nuevas funciones
import { SesionResponse } from '@/models/sesion.models';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faLock, faCheckCircle, faExclamationCircle, faCreditCard } from '@fortawesome/free-solid-svg-icons';

export default function CheckoutPage() {
    const params = useParams();
    const router = useRouter();
    const sesionId = Number(params.sesionId);

    const [sesion, setSesion] = useState<SesionResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [monto, setMonto] = useState(0);

    useEffect(() => {
        if (isNaN(sesionId)) {
            setError("ID de sesión inválido.");
            setLoading(false);
            return;
        }

        // Suponiendo que tenemos una función para obtener una sesión por ID
        // La crearemos en el servicio a continuación
        getSesionById(sesionId)
            .then(data => {
                setSesion(data);
                // Calcular el monto
                const inicio = new Date(data.horaInicial);
                const fin = new Date(data.horaFinal);
                const duracionHoras = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);
                // Asumimos que podemos obtener la tarifa del tutor de alguna forma, o la calculamos
                // Para simplificar, si no tenemos la tarifa, mostraremos un placeholder.
                // En un caso real, el DTO de SesionResponse debería incluir la tarifa/hora del tutor.
                // Por ahora, lo simulamos.
                const tarifaHora = 50; // ¡Simulación! Reemplazar con dato real.
                setMonto(duracionHoras * tarifaHora);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [sesionId]);

    const handleConfirmPayment = async () => {
        setProcessing(true);
        setError(null);
        try {
            await confirmarPago({ sesionId, metodoPago: 'TARJETA_CREDITO' });
            setSuccess(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="text-center p-10"><FontAwesomeIcon icon={faSpinner} spin size="3x" /></div>;
    
    if (success) {
        return (
            <div className="max-w-md mx-auto text-center bg-white p-8 rounded-lg shadow-lg mt-10">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-5xl mb-4" />
                <h1 className="text-2xl font-bold">¡Pago Exitoso!</h1>
                <p className="text-gray-600 mt-2">Tu tutoría ha sido confirmada. Puedes ver los detalles en tu sección de "Mis Tutorías".</p>
                <button 
                    onClick={() => router.push('/mis-tutorias')}
                    className="mt-6 w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700"
                >
                    Ir a Mis Tutorías
                </button>
            </div>
        );
    }

    if (error) return <div className="text-center p-10 bg-red-100 text-red-700 rounded-lg">{error}</div>;
    if (!sesion) return <div className="text-center p-10">No se encontraron los detalles de la sesión.</div>;
    
    // Si la sesión ya no está pendiente, muestra un mensaje de error.
    if (sesion.tipoEstado !== 'PENDIENTE') {
        return (
             <div className="max-w-md mx-auto text-center bg-white p-8 rounded-lg shadow-lg mt-10">
                <FontAwesomeIcon icon={faExclamationCircle} className="text-yellow-500 text-5xl mb-4" />
                <h1 className="text-2xl font-bold">Sesión Ya Procesada</h1>
                <p className="text-gray-600 mt-2">Esta sesión ya ha sido confirmada o procesada anteriormente.</p>
                <button 
                    onClick={() => router.push('/mis-tutorias')}
                    className="mt-6 w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700"
                >
                    Volver a Mis Tutorías
                </button>
            </div>
        )
    }

    return (
        <div className="max-w-lg mx-auto bg-white p-8 rounded-xl shadow-lg mt-10">
            <h1 className="text-3xl font-bold mb-2">Confirmar y Pagar</h1>
            <p className="text-gray-500 mb-6">Estás a un paso de reservar tu tutoría con <strong>{sesion.nombreTutor}</strong>.</p>

            <div className="bg-gray-50 p-4 rounded-lg mb-6 border">
                <h2 className="font-semibold text-lg">Resumen de la Tutoría</h2>
                <div className="mt-2 space-y-2 text-gray-700">
                    <p><strong>Fecha:</strong> {new Date(sesion.fecha + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p><strong>Hora:</strong> {new Date(sesion.horaInicial).toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})} - {new Date(sesion.horaFinal).toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})}</p>
                    <p className="text-2xl font-bold text-blue-600 mt-4">Total a Pagar: S/ {monto.toFixed(2)}</p>
                </div>
            </div>

            <div className="text-center">
                <button
                    onClick={handleConfirmPayment}
                    disabled={processing}
                    className="w-full bg-green-600 text-white font-bold py-3 px-10 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
                >
                    {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faCreditCard} />}
                    <span>{processing ? 'Procesando...' : `Pagar S/ ${monto.toFixed(2)} Ahora`}</span>
                </button>
                 <p className="text-xs text-gray-400 mt-2 flex items-center justify-center gap-1"><FontAwesomeIcon icon={faLock} /> Pago seguro (simulado).</p>
            </div>
        </div>
    );
}