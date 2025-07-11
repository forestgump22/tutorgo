import api from '@/lib/api';
import { PagoResponse } from '@/models/pago.models';

export const getHistorialPagos = async (query?: string, estado?: string): Promise<PagoResponse[]> => {
  try {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (estado && estado !== 'all') params.append('estado', estado.toUpperCase());

    const response = await api.get<PagoResponse[]>(`/pagos/historial?${params.toString()}`);
    return response.data || [];
  } catch (error: any) {
    if (error.response?.status === 204) return [];
    throw new Error(error.response?.data?.message || "No se pudo cargar tu historial de pagos.");
  }
};

export const getPagoDetails = async (pagoId: number): Promise<PagoResponse> => {
    try {
        const response = await api.get<PagoResponse>(`/pagos/${pagoId}/details`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'No se pudieron obtener los detalles del pago.');
    }
};