package tutorgo.com.service;

import tutorgo.com.dto.response.SesionProgramadaResponseDTO;

public interface SesionProgramadaService {
    SesionProgramadaResponseDTO obtenerSesionProgramadaDelEstudianteAutenticado(String emailEstudiante);

}