import api from '@/lib/api';
import { Tema } from '@/models/tema.models';

export const getAllTemas = async (): Promise<Tema[]> => {
  try {
    const response = await api.get<Tema[]>('/temas');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'No se pudo cargar la lista de temas.');
  }
}; 