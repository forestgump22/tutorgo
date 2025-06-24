import { EnlaceSesionResponse } from "./enlace.models";

// Basado en tu ReservaTutoriaRequest del backend
export interface ReservaTutoriaRequest {
  tutorId: number;
  fecha: string;      // Formato "YYYY-MM-DD"
  horaInicio: string; // Formato "HH:mm:ss"
  horaFinal: string;  // Formato "HH:mm:ss"
}

// Basado en tu SesionResponse del backend
export interface SesionResponse {
  id: number;
  tutorId: number;
  nombreTutor: string;
  estudianteId: number;
  nombreEstudiante: string;
  fecha: string;           // "YYYY-MM-DD"
  horaInicial: string;     // "YYYY-MM-DD HH:mm:ss"
  horaFinal: string;       // "YYYY-MM-DD HH:mm:ss"
  tipoEstado: 'PENDIENTE' | 'CONFIRMADO';
  enlaces: EnlaceSesionResponse[];
  fueCalificada: boolean; // ***** CAMPO AÑADIDO *****
}

// Para simular la disponibilidad del tutor
export interface Disponibilidad {
    id: number;
    fecha: string;      // "YYYY-MM-DD"
    horaInicial: string; // "YYYY-MM-DD HH:mm:ss"
    horaFinal: string;   // "YYYY-MM-DD HH:mm:ss"
}

export interface ConfirmarPagoRequest {
  sesionId: number;
  metodoPago: 'TARJETA_CREDITO' | 'PAYPAL' | 'TRANSFERENCIA'; // Usamos tipos literales
}

