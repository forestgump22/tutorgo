import api from '@/lib/api';
import { ConfirmarPagoRequest, ReservaTutoriaRequest, SesionResponse, Disponibilidad } from '@/models/sesion.models';

interface DisponibilidadRequest {
    fecha: string;      
    horaInicio: string; 
    horaFinal: string;  
}

export const getMyDisponibilidad = async (): Promise<Disponibilidad[]> => {
    try {
        const response = await api.get<Disponibilidad[]>('/tutores/me/disponibilidades');
        return response.data || [];
    } catch (error: any) {
        if (error.response?.status === 204) return [];
        throw new Error("Error al obtener mis disponibilidades.");
    }
};

export const addDisponibilidad = async (data: DisponibilidadRequest) => {
    try {
        const response = await api.post('/tutores/me/disponibilidades', data);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "No se pudo añadir la disponibilidad. Revisa si el horario se solapa con uno existente.");
    }
};

export const deleteDisponibilidad = async (id: number) => {
    try {
        const response = await api.delete(`/tutores/me/disponibilidades/${id}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "No se pudo eliminar la disponibilidad. Es posible que ya tenga sesiones reservadas.");
    }
}

export const getMisTutorias = async (): Promise<SesionResponse[]> => {
    try {
        const response = await api.get<SesionResponse[]>('/sesiones/mis-solicitudes');
        return response.data || [];
    } catch (error: any) {
        if (error.response?.status === 204) return [];
        throw new Error("Error al obtener tus tutorías.");
    }
};

export const confirmarPago = async (pagoData: ConfirmarPagoRequest): Promise<string> => {
    try {
        // Tu backend devuelve un ApiResponse, extraemos el mensaje de éxito.
        const response = await api.post(`/sesiones/${pagoData.sesionId}/pagos`, pagoData);
        return response.data.message || "Pago procesado exitosamente.";
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "No se pudo procesar el pago.");
    }
};