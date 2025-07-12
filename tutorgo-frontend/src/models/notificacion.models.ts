// src/models/notificacion.models.ts
export interface Notificacion {
  id: number;
  titulo: string;
  texto: string;
  tipo: string; // El tipo ahora es un string genérico
  fechaCreacion: string;
  leida: boolean; // Nuevo campo para marcar como leída
}

export interface NotificacionWebSocket {
  id: number;
  titulo: string;
  texto: string;
  tipo: string;
  fechaCreacion: string;
  leida: boolean;
}