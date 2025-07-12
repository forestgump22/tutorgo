import api from '@/lib/api';
import { Notificacion } from '@/models/notificacion.models';

export const getMisNotificaciones = async (): Promise<Notificacion[]> => {
  try {
    console.log('🔍 Intentando obtener notificaciones...');
    const response = await api.get<Notificacion[]>('/notificaciones/mis-notificaciones');
    console.log('✅ Notificaciones obtenidas:', response.data);
    return response.data || []; // Devuelve un array vacío si la respuesta no tiene cuerpo (ej. 204)
  } catch (error: any) {
    if (error.response?.status === 204) {
        console.log('📭 No hay notificaciones (204)');
        return [];
    }
    console.error("❌ Error al cargar notificaciones:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL
      }
    });
    throw new Error("No se pudieron cargar tus notificaciones.");
  }
};

// Nuevas funciones para funcionalidades avanzadas
export const marcarComoLeida = async (id: number): Promise<void> => {
  try {
    await api.put(`/notificaciones/${id}/marcar-leida`);
  } catch (error: any) {
    console.error("Error al marcar notificación como leída:", error);
    throw new Error("No se pudo marcar la notificación como leída.");
  }
};

export const marcarTodasComoLeidas = async (): Promise<void> => {
  try {
    await api.put('/notificaciones/marcar-todas-leidas');
  } catch (error: any) {
    console.error("Error al marcar todas las notificaciones como leídas:", error);
    throw new Error("No se pudieron marcar las notificaciones como leídas.");
  }
};

export const getContadorNoLeidas = async (): Promise<number> => {
  try {
    const response = await api.get<{ count: number }>('/notificaciones/contador-no-leidas');
    return response.data.count;
  } catch (error: any) {
    console.error("Error al obtener contador de notificaciones:", error);
    // Si el endpoint no existe (500), devolver 0
    if (error.response?.status === 500) {
      return 0;
    }
    return 0;
  }
};