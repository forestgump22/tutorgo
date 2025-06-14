package tutorgo.com.service;

import tutorgo.com.dto.request.EnlaceSesionRequestDTO;
import tutorgo.com.dto.response.EnlaceSesionResponseDTO;

import java.util.List;


public interface EnlaceSesionService
{
    List<EnlaceSesionResponseDTO> guardarEnlaces(Long sesionId, List<EnlaceSesionRequestDTO> enlaces, String emailTutor);

    List<EnlaceSesionResponseDTO> obtenerEnlacesPorSesion(Long sesionId);

    void eliminarEnlacePorId(Long enlaceId, String emailTutor);
}