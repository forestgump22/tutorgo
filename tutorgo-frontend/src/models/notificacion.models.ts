// src/models/notificacion.models.ts
export interface Notificacion {
  id: number;
  titulo: string;
  texto: string;
  tipo: string; // El tipo ahora es un string genérico
  fechaCreacion: string;
}