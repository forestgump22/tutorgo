import api from '@/lib/api';
import { ConfirmarPagoRequest, ReservaTutoriaRequest, SesionResponse, Disponibilidad } from '@/models/sesion.models';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface PagoApiResponse {
    success: boolean;
    message: string;
    data?: any;
}

export const getMisTutorias = async (): Promise<SesionResponse[]> => {
    try {
        const response = await api.get<SesionResponse[]>('/sesiones/mis-solicitudes');
        return response.data || [];
    } catch (error: any) {
        if (error.response?.status === 204) return [];
        throw new Error(error.response?.data?.message || "Error al obtener tus tutorías.");
    }
};

export const getSesionById = async (sesionId: number): Promise<SesionResponse> => {
  try {
    const misTutorias = await getMisTutorias();
    const sesion = misTutorias.find(s => s.id === sesionId);
    if (!sesion) {
      throw new Error("Sesión no encontrada o no te pertenece.");
    }
    return sesion;
  } catch (error: any) {
    throw new Error(error.message || "No se pudo cargar la información de la sesión.");
  }
};


export const reservarTutoria = async (reservaData: ReservaTutoriaRequest): Promise<SesionResponse> => {
  try {
    const response = await api.post<ApiResponse<SesionResponse>>('/sesiones', reservaData);
    
    if (response.data && response.data.success && response.data.data) {
        return response.data.data;
    } else {
        throw new Error(response.data.message || 'La respuesta del servidor no fue la esperada.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Ocurrió un error al procesar tu solicitud.');
  }
};


export const confirmarPago = async (pagoData: ConfirmarPagoRequest): Promise<string> => {
    try {
        const response = await api.post<PagoApiResponse>(`/sesiones/${pagoData.sesionId}/pagos`, pagoData);
        return response.data.message || "Pago procesado exitosamente.";
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "No se pudo procesar el pago.");
    }
};


export const getDisponibilidadTutor = async (tutorId: number): Promise<Disponibilidad[]> => {
  try {
    const response = await api.get<Disponibilidad[]>(`/tutores/${tutorId}/disponibilidades`);
    return response.data || [];
  } catch (error: any) {
    if (error.response?.status === 204) return [];
    throw new Error(error.response?.data?.message || "No se pudo cargar la disponibilidad del tutor.");
  }
};