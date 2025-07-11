export interface Tema {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface TutorTema {
  id: number;
  tutorId: number;
  temaId: number;
  subtemas?: string[];
} 