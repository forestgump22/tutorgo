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

// ***** FUNCIÓN CORREGIDA/AÑADIDA AQUÍ *****
// Esta es la función que tu página de perfil necesita.
export const getTutorProfileById = async (tutorId: number): Promise<TutorProfile> => {
  try {
    const response = await api.get<TutorProfile>(`/tutores/${tutorId}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching profile for tutor ${tutorId}:`, error);
    throw new Error(error.response?.data?.message || 'No se pudo cargar el perfil del tutor.');
  }
};