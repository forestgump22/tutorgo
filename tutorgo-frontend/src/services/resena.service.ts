// src/services/resena.service.ts
import api from '@/lib/api';
import { ResenaRequest, ResenaResponse } from '@/models/resena.models';

export const crearResena = async (sesionId: number, resenaData: ResenaRequest): Promise<ResenaResponse> => {
  try {
    const response = await api.post<ResenaResponse>(`/resenas/sesion/${sesionId}`, resenaData);
    return response.data;
  } catch (error: any) {
    // HU13 Escenarios 2 y 3 (Calificación fuera de rango, comentario largo) son manejados por el backend
    throw new Error(error.response?.data?.message || 'No se pudo enviar la reseña.');
  }
};