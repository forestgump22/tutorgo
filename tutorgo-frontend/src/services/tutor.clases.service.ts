// src/services/tutor.clases.service.ts
import api from '@/lib/api';
import { SesionResponse } from '@/models/sesion.models';
// Reutilizamos los servicios de enlaces aquí
export { addEnlaces, deleteEnlace } from './enlace.service';

// Tu backend no tiene un endpoint específico para que un tutor vea sus clases.
// Usaremos el de "mis-solicitudes" y filtraremos en el frontend.
// Lo ideal sería tener un endpoint GET /tutores/me/sesiones en el backend.
// Por ahora, simulamos este comportamiento.
export const getMisClases = async (): Promise<SesionResponse[]> => {
    try {
        // ***** LLAMADA AL NUEVO ENDPOINT *****
        const response = await api.get<SesionResponse[]>('/sesiones/mis-clases');
        return response.data || [];
    } catch (error: any) {
        if (error.response?.status === 204) return [];
        throw new Error("Error al obtener tus clases programadas.");
    }
};