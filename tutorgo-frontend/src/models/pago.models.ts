// src/models/pago.models.ts
export interface PagoResponse {
  id: number;
  tutorId: number;
  nombreTutor?: string;
  estudianteId: number;
  nombreEstudiante?: string;
  monto: number;
  comisionPlataforma: number;
  metodoPago: string;
  tipoEstado: 'COMPLETADO' | 'PENDIENTE' | 'FALLIDO';
  sesionId: number | null;
  fechaPago: string | null;
  descripcion: string;
}

export interface MetodoPagoGuardado {
  id: string; // Usaremos un ID aleatorio o un timestamp
  tipo: 'Visa' | 'Mastercard' | 'Otro';
  ultimosCuatro: string;
  expiracion: string; // "MM/AA"
}

