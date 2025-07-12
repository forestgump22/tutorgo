// src/services/reserva.service.ts
import api from '@/lib/api';
import { ReservaTutoriaRequest } from '@/models/sesion.models';
import { ConfirmarPagoRequest } from '@/models/sesion.models';
import { PagoResponse } from '@/models/pago.models';
import { ApiResponse } from '@/models/api.models';

export const iniciarProcesoDePago = async (sesionId: number, pagoData: ConfirmarPagoRequest): Promise<PagoResponse> => {
    try {
        const response = await api.post<ApiResponse<PagoResponse>>(`/sesiones/${sesionId}/pagos`, pagoData);
        if (response.data && response.data.success) {
            return response.data.data;
        }
        throw new Error(response.data.message || 'La respuesta del servidor no fue la esperada.');
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'No se pudo iniciar el pago.');
    }
};

export const confirmarPagoYCrearSesion = async (sesionId: number, stripeToken?: string): Promise<PagoResponse> => {
    try {
        // Create the payment confirmation request
        const pagoRequest = {
            sesionId: sesionId,
            token: stripeToken,
            metodoPago: 'TARJETA_CREDITO'
        };

        // Call the correct endpoint to process the payment
        const response = await api.post<ApiResponse<PagoResponse>>(
            `/sesiones/${sesionId}/pagos`,
            pagoRequest
        );
        
        if (response.data && response.data.success) {
            return response.data.data;
        }
        throw new Error(response.data.message || 'La respuesta del servidor no fue la esperada.');
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'El pago no pudo ser confirmado.');
    }
};