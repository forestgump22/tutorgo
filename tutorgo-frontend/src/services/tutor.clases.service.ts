// src/services/tutor.clases.service.ts
import api from '@/lib/api';
import { SesionResponse } from '@/models/sesion.models';
export { addEnlaces, deleteEnlace } from './enlace.service';

export const getMisClases = async (): Promise<SesionResponse[]> => {
    try {
        const response = await api.get<SesionResponse[]>('/sesiones/mis-clases');
        return response.data || [];
    } catch (error: any) {
        if (error.response?.status === 204) return [];
        throw new Error("Error al obtener tus clases programadas.");
    }
};