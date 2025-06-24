// src/services/sesion.service.ts
import api from '@/lib/api';
import { ConfirmarPagoRequest, ReservaTutoriaRequest, SesionResponse, Disponibilidad } from '@/models/sesion.models';

// Interfaz para la respuesta de la API de reserva
interface ReservaApiResponse {
  success: boolean;
  message: string;
  data: SesionResponse;
}

// Interfaz para la respuesta de la API de pago
interface PagoApiResponse {
    success: boolean;
    message: string;
    data?: any; // El 'data' podría ser un objeto de pago
}

// --- FUNCIÓN PARA OBTENER MIS TUTORÍAS (HU10) ---
// Asegúrate de que esta función esté exportada
export const getMisTutorias = async (): Promise<SesionResponse[]> => {
    try {
        const response = await api.get<SesionResponse[]>('/sesiones/mis-solicitudes');
        return response.data || [];
    } catch (error: any) {
        if (error.response?.status === 204) return [];
        throw new Error("Error al obtener tus tutorías.");
    }
};

// --- FUNCIÓN PARA CONFIRMAR PAGO (HU10) ---
// Asegúrate de que esta función esté exportada
export const confirmarPago = async (pagoData: ConfirmarPagoRequest): Promise<string> => {
    try {
        const response = await api.post<PagoApiResponse>(`/sesiones/${pagoData.sesionId}/pagos`, pagoData);
        return response.data.message || "Pago procesado exitosamente.";
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "No se pudo procesar el pago.");
    }
};

// --- OTRAS FUNCIONES DEL SERVICIO ---

// Función para reservar una tutoría (HU8)
export const reservarTutoria = async (reservaData: ReservaTutoriaRequest): Promise<ReservaApiResponse> => {
  try {
    const response = await api.post<ReservaApiResponse>('/sesiones', reservaData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Ocurrió un error al procesar tu solicitud.');
  }
};

// Función para obtener la disponibilidad de un tutor
export const getDisponibilidadTutor = async (tutorId: number): Promise<Disponibilidad[]> => {
  try {
    const response = await api.get<Disponibilidad[]>(`/tutores/${tutorId}/disponibilidades`);
    return response.data || [];
  } catch (error: any) {
    if (error.response?.status === 204) return [];
    throw new Error("No se pudo cargar la disponibilidad del tutor.");
  }
};