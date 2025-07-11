// src/services/reserva.service.ts
import api from '@/lib/api';
import { ReservaTutoriaRequest } from '@/models/sesion.models';
import { PagoResponse } from '@/models/pago.models';
import { ApiResponse } from '@/models/api.models';

export const iniciarProcesoDePago = async (reservaData: ReservaTutoriaRequest): Promise<PagoResponse> => {
    try {
        const response = await api.post<ApiResponse<PagoResponse>>('/reservas/iniciar-pago', reservaData);
        if (response.data && response.data.success) {
            return response.data.data;
        }
        throw new Error(response.data.message || 'La respuesta del servidor no fue la esperada.');
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'No se pudo iniciar la reserva.');
    }
};

export const confirmarPagoYCrearSesion = async (pagoId: number): Promise<PagoResponse> => {
    try {
        const response = await api.post<ApiResponse<PagoResponse>>(`/reservas/confirmar-pago/${pagoId}`);
        if (response.data && response.data.success) {
            return response.data.data;
        }
        throw new Error(response.data.message || 'La respuesta del servidor no fue la esperada.');
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'El pago no pudo ser confirmado.');
    }
};