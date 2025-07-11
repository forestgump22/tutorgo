// src/models/enlace.models.ts

// Para la solicitud de añadir un enlace
export interface EnlaceSesionRequest {
  nombre: string;
  enlace: string;
}

// Para la respuesta de un enlace ya creado
export interface EnlaceSesionResponse {
  id: number;
  nombre: string;
  enlace: string;
}