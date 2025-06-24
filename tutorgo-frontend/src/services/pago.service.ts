// src/services/pago.service.ts
import api from '@/lib/api';
import { PagoResponse } from '@/models/pago.models';

export const getHistorialPagos = async (): Promise<PagoResponse[]> => {
  try {
    const response = await api.get<PagoResponse[]>('/pagos/historial');
    return response.data || [];
  } catch (error: any) {
    if (error.response?.status === 204) return [];
    throw new Error("No se pudo cargar tu historial de pagos.");
  }
};