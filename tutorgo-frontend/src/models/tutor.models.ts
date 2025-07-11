// src/models/tutor.models.ts

// Basado en tu TutorSummaryResponse del backend
export interface TutorSummary {
  tutorId: number;
  nombreUsuario: string;
  fotoUrlUsuario: string;
  rubro: string;
  estrellasPromedio: number;
  tarifaHora: number;
}

// Basado en tu PagedResponse<T> del backend
export interface PagedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface TutorProfile {
  id: number;
  nombreUsuario: string;
  fotoUrlUsuario: string;
  tarifaHora: number;
  rubro: string;
  bio: string;
  estrellasPromedio: number;
}