package tutorgo.com.service;

import tutorgo.com.dto.request.ResenaRequestDTO;
import tutorgo.com.dto.response.ResenaResponseDTO;

public interface ResenaService {
    ResenaResponseDTO crearResena(Long sesionId, ResenaRequestDTO requestDTO, String emailEstudiante);
}