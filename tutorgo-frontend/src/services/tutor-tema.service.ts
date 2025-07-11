import api from '@/lib/api';
import { TutorTema } from '@/models/tema.models';

export const getTutorTemas = async (tutorId: number): Promise<TutorTema[]> => {
  try {
    const response = await api.get<TutorTema[]>(`/tutor-temas/${tutorId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'No se pudieron cargar los temas del tutor.');
  }
}; 