// src/services/enlace.service.ts
import api from '@/lib/api';
import { EnlaceSesionRequest, EnlaceSesionResponse } from '@/models/enlace.models';

// Añadir uno o más enlaces a una sesión
// Tu backend espera una lista, así que enviamos un array.
export const addEnlaces = async (sesionId: number, enlaces: EnlaceSesionRequest[]): Promise<EnlaceSesionResponse[]> => {
  try {
    const response = await api.post<EnlaceSesionResponse[]>(`/sesiones/${sesionId}/enlaces`, enlaces);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'No se pudieron añadir los enlaces.');
  }
};

// Eliminar un enlace por su ID
export const deleteEnlace = async (sesionId: number, enlaceId: number): Promise<string> => {
    try {
        // Tu backend usa DELETE /sesiones/{sesionId}/enlaces/{id}, pero el sesionId en la ruta no es necesario si el enlaceId es único.
        // Lo mantenemos por si el backend lo requiere. La API de tu backend tiene DELETE /sesiones/{sesionId}/enlaces/{id}, pero el servicio solo usa el id del enlace.
        // Voy a seguir la ruta de tu EnlaceSesionController.
        const response = await api.delete(`/sesiones/${sesionId}/enlaces/${enlaceId}`);
        return response.data || "Enlace eliminado correctamente.";
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "No se pudo eliminar el enlace.");
    }
}