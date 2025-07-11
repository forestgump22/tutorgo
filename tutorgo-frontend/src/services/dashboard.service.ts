import api from '@/lib/api';
import { DashboardStats } from '@/models/dashboard.models';

export const getDashboardStats = async (): Promise<DashboardStats> => {
    try {
        const response = await api.get<DashboardStats>('/dashboard/stats');
        return response.data;
    } catch (error: any) {
        console.error("Error al cargar las estadísticas del dashboard:", error);
        throw new Error(error.response?.data?.message || "No se pudieron cargar los datos del dashboard.");
    }
};