import api from '@/lib/api';
import { Notificacion } from '@/models/notificacion.models';

export const getMisNotificaciones = async (): Promise<Notificacion[]> => {
  try {
    const response = await api.get<Notificacion[]>('/notificaciones/mis-notificaciones');
    return response.data || []; // Devuelve un array vacío si la respuesta no tiene cuerpo (ej. 204)
  } catch (error: any) {
    if (error.response?.status === 204) {
        return [];
    }
    console.error("Error al cargar notificaciones:", error);
    throw new Error("No se pudieron cargar tus notificaciones.");
  }
};