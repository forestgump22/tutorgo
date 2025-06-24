// src/models/resena.models.ts

// Para la solicitud de crear una reseña
export interface ResenaRequest {
  calificacion: number;
  comentario?: string;
}

// Para la respuesta de la reseña creada
export interface ResenaResponse {
  id: number;
  calificacion: number;
  comentario: string;
}