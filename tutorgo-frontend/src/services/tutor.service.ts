// src/services/tutor.service.ts
import api from '@/lib/api';
import { PagedResponse, TutorSummary, TutorProfile } from '@/models/tutor.models'; // Asegúrate de importar TutorProfile

export const getAllTutors = async (params: URLSearchParams): Promise<PagedResponse<TutorSummary>> => {
  try {
    if (!params.has('page')) params.set('page', '0');
    if (!params.has('size')) params.set('size', '9');
    
    const response = await api.get<PagedResponse<TutorSummary>>(`/tutores?${params.toString()}`);
    return response.data;
  } catch (error: any) {
    console.error("Error al buscar tutores:", error);
    throw new Error(error.response?.data?.message || 'No se pudo cargar la lista de tutores.');
  }
};

export const getTutorProfileById = async (tutorId: number): Promise<TutorProfile> => {
  try {
    const response = await api.get<TutorProfile>(`/tutores/${tutorId}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching profile for tutor ${tutorId}:`, error);
    throw new Error(error.response?.data?.message || 'No se pudo cargar el perfil del tutor.');
  }
};

export const getFeaturedTutors = async (): Promise<TutorSummary[]> => {
  try {
    const params = new URLSearchParams({ sortBy: 'estrellasPromedio', sortDir: 'desc', size: '4' });
    const response = await api.get<PagedResponse<TutorSummary>>(`/tutores?${params.toString()}`);
    return response.data.content;
  } catch (error: any) {
    throw new Error("No se pudieron cargar los tutores destacados.");
  }
};

export const updateTutorBio = async (bio: string): Promise<void> => {
  try {
    await api.put('/tutores/me/bio', { bio });
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'No se pudo actualizar la biografía.');
  }
};