import api from '@/lib/api';
import { CentroEstudio } from '@/models/centroEstudio';

export const getAllCentrosEstudio = async (): Promise<CentroEstudio[]> => {
  try {
    const response = await api.get<CentroEstudio[]>('/centros-estudio');
    return response.data || [];
  } catch (error: any) {
    console.error("Error al cargar los centros de estudio:", error);
    throw new Error("No se pudieron cargar los centros de estudio.");
  }
};