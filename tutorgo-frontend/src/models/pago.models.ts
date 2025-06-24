// src/models/pago.models.ts
export interface PagoResponse {
  id: number;
  tutorId: number;
  nombreTutor?: string; // Nombre para mostrar
  estudianteId: number;
  nombreEstudiante?: string; // Nombre para mostrar
  monto: number;
  comisionPlataforma: number;
  metodoPago: string;
  tipoEstado: 'COMPLETADO' | 'PENDIENTE' | 'FALLIDO';
  sesionId: number;
  fechaPago: string; // Formato ISO
  descripcion: string;
}

export interface MetodoPagoGuardado {
  id: string; // Usaremos un ID aleatorio o un timestamp
  tipo: 'Visa' | 'Mastercard' | 'Otro';
  ultimosCuatro: string;
  expiracion: string; // "MM/AA"
}

