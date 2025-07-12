import api from '@/lib/api';
import { DashboardStats } from '@/models/dashboard.models';

export const getDashboardStats = async (): Promise<DashboardStats> => {
    try {
        const response = await api.get<DashboardStats>('/dashboard/stats');
        return response.data;
    } catch (error: any) {
        console.error("Error al cargar las estadísticas del dashboard:", error);
        
        // Si el endpoint no existe (500), devolver datos por defecto
        if (error.response?.status === 500) {
            return {
                proximaClaseInfo: "No hay clases programadas",
                proximaTutoriaInfo: "No hay tutorías programadas",
                ingresosEsteMes: 0,
                calificacionPromedio: 0,
                tutoriasCompletadas: 0,
                tutoresDestacados: []
            };
        }
        
        throw new Error(error.response?.data?.message || "No se pudieron cargar los datos del dashboard.");
    }
};