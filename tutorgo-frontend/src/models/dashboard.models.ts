import { TutorSummary } from './tutor.models';

export interface DashboardStats {
    // Campos para Estudiante
    proximaTutoriaInfo?: string;
    tutoriasCompletadas?: number;
    tutoriasPendientes?: number;

    // Campos para Tutor
    proximaClaseInfo?: string;
    ingresosEsteMes?: number;
    calificacionPromedio?: number;
    estudiantesActivos?: number;
    
    // Campo para ambos
    tutoresDestacados: TutorSummary[];
}